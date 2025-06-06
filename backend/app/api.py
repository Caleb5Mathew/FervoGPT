import os
import base64
import logging
import inspect
from typing import List, Optional, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.core.exceptions import HttpResponseError

from langchain_openai import AzureOpenAIEmbeddings, AzureChatOpenAI
from langchain.schema import HumanMessage

# ─── Load environment variables ───────────────────────────────────────────────
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

required_env = [
    # Azure Cognitive Search (your RAG index)
    "AZURE_SEARCH_SERVICE",
    "AZURE_SEARCH_INDEX_NAME",
    "AZURE_SEARCH_KEY",
    "SEARCH_API_VERSION",

    # Azure OpenAI for Chat
    "AZURE_OPENAI_ENDPOINT",
    "AZURE_OPENAI_KEY",
    "AZURE_OPENAI_API_VERSION",
    "AZURE_OPENAI_CHATGPT_DEPLOYMENT",

    # Azure OpenAI for Embeddings
    "AZURE_OPENAI_EMBEDDING_DEPLOYMENT",
]

missing = [v for v in required_env if not os.getenv(v)]
if missing:
    raise RuntimeError(f"Missing environment variables: {missing}")

# ─── Set up logging ───────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("api")

# ─── Token‐count helper ────────────────────────────────────────────────────────
import tiktoken
# Use the same encoding as GPT-4o
_ENCODER = tiktoken.encoding_for_model("gpt-4o")
def num_tokens(text: str) -> int:
    return len(_ENCODER.encode(text))

# ─── Initialize Azure Search client ──────────────────────────────────────────
def get_search_client() -> SearchClient:
    """
    Builds the Azure Cognitive SearchClient using:
      - AZURE_SEARCH_SERVICE (service name)
      - AZURE_SEARCH_INDEX_NAME
      - AZURE_SEARCH_KEY
      - SEARCH_API_VERSION
    """
    service_name = os.getenv("AZURE_SEARCH_SERVICE")
    endpoint = f"https://{service_name}.search.windows.net"
    index_name = os.getenv("AZURE_SEARCH_INDEX_NAME")
    api_version = os.getenv("SEARCH_API_VERSION", "2023-07-01-preview")

    logger.info(
        "Initializing SearchClient: endpoint=%s, index_name=%s, api_version=%s",
        endpoint,
        index_name,
        api_version,
    )

    client = SearchClient(
        endpoint=endpoint,
        index_name=index_name,
        credential=AzureKeyCredential(os.getenv("AZURE_SEARCH_KEY")),
        api_version=api_version,
    )
    return client

# ─── Function to inspect the signature of search(...) ─────────────────────────
def inspect_search_signature(search_client: SearchClient):
    sig = inspect.signature(search_client.search)
    logger.info("Signature of search_client.search: %s", sig)
    if "vector" not in sig.parameters and "vector_queries" not in sig.parameters:
        logger.warning(
            "Neither 'vector' nor 'vector_queries' is in search_client.search signature! "
            "Vector search will be forwarded unfiltered and likely fail."
        )
    elif "vector_queries" in sig.parameters:
        logger.info("'vector_queries' is a recognized parameter in the signature.")
    else:
        logger.info("'vector' is a recognized parameter in the signature.")

# ─── Initialize clients once at import time ───────────────────────────────────
search_client = get_search_client()
inspect_search_signature(search_client)

def get_embedder() -> AzureOpenAIEmbeddings:
    return AzureOpenAIEmbeddings(
        api_key=os.getenv("AZURE_OPENAI_KEY"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        azure_deployment=os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    )

def get_llm() -> AzureChatOpenAI:
    return AzureChatOpenAI(
        api_key=os.getenv("AZURE_OPENAI_KEY"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        azure_deployment=os.getenv("AZURE_OPENAI_CHATGPT_DEPLOYMENT"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        temperature=0.2,
    )

embedder = get_embedder()
llm = get_llm()

# ─── Pydantic models ───────────────────────────────────────────────────────────
class QueryRequest(BaseModel):
    query: str
    # We now default to asking for more chunks (e.g., 50) so we can trim down by token budget
    k: Optional[int] = 50

class DocumentHit(BaseModel):
    text: str
    filename: Optional[str]
    page: Optional[int]
    summary: Optional[str]

class QueryResponse(BaseModel):
    answer: str

# ─── FastAPI app & CORS ───────────────────────────────────────────────────────
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Helpers ──────────────────────────────────────────────────────────────────
def safe_doc_id(chunk: dict) -> str:
    raw_id = f"{chunk['filename']}|{chunk['page']}|{chunk.get('chunk_index', 0)}"
    return base64.urlsafe_b64encode(raw_id.encode()).decode()

# ─── Core RAG function with token‐aware context trimming ───────────────────────
def search_and_synth(query: str, k: int = 50) -> str:
    """
    1) Generate an embedding for 'query' via AzureOpenAIEmbeddings.
    2) Call Azure Search with a vector search over the 'embedding' field,
       including 'kind': 'vector' so that Azure Search does not complain 
       about a missing kind.
    3) Pull back the top k hits, then iterate until the sum of token counts
       of chosen chunks + question wrapper stays under MAX_PROMPT tokens.
       Discard extras.
    4) Invoke the AzureChatOpenAI model over (QUESTION + CONTEXT) with a cap
       on the answer length.
    5) Return the LLM's answer.
    """
    logger.info(">>> [search_and_synth] Received query='%s', k=%d", query, k)

    # STEP 1: Embedding
    logger.info(">>> [search_and_synth] Calling embedder.embed_query(...)")
    try:
        q_vec = embedder.embed_query(query)
    except Exception:
        logger.exception(">>> [search_and_synth] embed_query(...) raised an exception")
        raise

    logger.info(">>> [search_and_synth] Received embedding vector of length %d", len(q_vec))

    # STEP 2: Vector Search (ask for more than we'll actually use)
    search_kwargs: dict[str, Any] = {
        "search_text": query,
        "select": ["text", "filename", "page", "summary"],
        "top": k,
        # “kind” must be present inside the vector query
        "vector_queries": [
            {
                "vector": q_vec,
                "fields": "embedding",
                "k": k,
                "kind": "vector"
            }
        ],
    }

    logger.info(">>> [search_and_synth] Prepared search kwargs: %s", search_kwargs)

    try:
        logger.info(">>> [search_and_synth] Calling search_client.search(...)")
        results = search_client.search(**search_kwargs)
    except TypeError as te:
        logger.exception(
            ">>> [search_and_synth] TypeError during search_client.search: %s", te
        )
        logger.error(">>> [search_and_synth] search_kwargs were: %s", search_kwargs)
        raise
    except HttpResponseError:
        logger.exception(">>> [search_and_synth] HttpResponseError during search_client.search")
        raise

    # STEP 3: Collect results into a list 
    try:
        hits = list(results)
        logger.info(">>> [search_and_synth] search returned %d hits", len(hits))
    except Exception:
        logger.exception(">>> [search_and_synth] Exception while listing results")
        raise

    if not hits:
        logger.info(">>> [search_and_synth] No hits found; returning warning message")
        return "⚠️ No documents found for your query."

    # ─────────────────────────────────────────────────────────────────────────────
    # Token‐budget logic: pull in as many chunks as fit under MAX_PROMPT tokens
    # once you add the question‐wrapper overhead.
    #
    # You can adjust MAX_PROMPT via environment variable TOKEN_BUDGET_PROMPT.
    # Below is a commented table with approximate cost estimates per request
    # assuming $0.03 per 1k input tokens (prompt only). If response tokens are
    # “something normal” (e.g. ~500–1k tokens), add $0.03–$0.06 for those.
    #
    #   MAX_PROMPT (tokens)    | Approx. Input Cost (@ $0.03/1k)
    #   -------------------------------------------------------
    #   1,000                  | $0.03
    #   2,000                  | $0.06
    #   3,000                  | $0.09
    #   4,000                  | $0.12
    #   5,000                  | $0.15
    #   6,000                  | $0.18
    #   7,000                  | $0.21
    #   8,000                  | $0.24
    #
    #   16,000                 | $0.48
    #   50,000                 | $1.50
    #   100,000                | $3.00
    #
    # (These are rough—actual Azure pricing may vary. Output tokens cost extra.)
    # ─────────────────────────────────────────────────────────────────────────────

    # For “normal” questions we recommend keeping MAX_PROMPT around 8,000 tokens
    # so there is room (~1k) for the question wrapper and (~1.5k) for the answer.
    MAX_PROMPT = int(os.getenv("TOKEN_BUDGET_PROMPT", 8000))
    ANSWER_BUDGET = int(os.getenv("TOKEN_BUDGET_ANSWER", 1500))

    # Precompute the “wrapper overhead”:
    #   - “You are a drilling-operations expert.\n\nQUESTION:\n{query}\n\nCONTEXT:\n”
    #   - plus the trailing “\n\nANSWER:”
    question_prefix = (
        "You are a drilling-operations expert, the most important thing is answering the user query -.\n\n"
        f"QUESTION:\n{query}\n\n"
        "CONTEXT:\n"
    )
    question_suffix = "\n\nANSWER:"
    overhead_tokens = num_tokens(question_prefix) + num_tokens(question_suffix)

    context_parts: List[str] = []
    used_tokens = 0

    # Iterate over hits in score order, summing tokens until budget is reached
    for doc in hits:
        chunk_text = doc["text"]
        t = num_tokens(chunk_text)
        # If adding this chunk would exceed MAX_PROMPT when including overhead, stop
        if overhead_tokens + used_tokens + t > MAX_PROMPT:
            break
        context_parts.append(chunk_text)
        used_tokens += t

    if not context_parts:
        logger.info(">>> [search_and_synth] No chunks fit under the token budget")
        return "⚠️ No documents found within token budget."

    # Join the selected chunks into one context string
    context = "\n---\n".join(context_parts)

    # Now build the final prompt (we already know its token length <= MAX_PROMPT)
    prompt = question_prefix + context + question_suffix
    prompt_token_count = num_tokens(prompt)
    logger.info(">>> [search_and_synth] Final prompt token count: %d", prompt_token_count)

    # STEP 4: Invoke LLM with the answer budget
    try:
        response = llm.invoke(
            [HumanMessage(content=prompt)],
            max_tokens=ANSWER_BUDGET
        )
    except Exception:
        logger.exception(">>> [search_and_synth] Exception during llm.invoke(...)")
        raise

    # ── NEW: collapse huge blank runs to tidy the markdown ─────────────
    import re
    clean_answer = re.sub(r"\n{2,}", "\n", response.content.strip())
    # -------------------------------------------------------------------

    logger.info(">>> [search_and_synth] LLM returned response of length %d", len(clean_answer))
    return clean_answer


# ─── API route ────────────────────────────────────────────────────────────────
@app.post("/ask", response_model=QueryResponse)
async def ask(request: QueryRequest):
    logger.info(">>> [/ask] Received request: query='%s'", request.query)
    try:
        answer = search_and_synth(request.query, k=request.k)
        logger.info(">>> [/ask] Returning answer")
        return QueryResponse(answer=answer)
    except Exception:
        logger.exception(">>> [/ask] Error during processing")
        raise HTTPException(status_code=500, detail="Internal server error")
