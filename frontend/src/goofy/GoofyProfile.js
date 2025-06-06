// src/GoofyProfile.js
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './GoofyProfile.css';

const AVATARS = {
  Jiamin: '/Jiamin.png', Isabel: '/Isabel.png', Caleb: '/Caleb.png',
  Elliot: '/Elliot.png', Brittany: '/Brittney.png', Kareem: '/Kareem.png',
  'John Eric': '/John_Eric.png', Talie: '/Talie.png', Carlos: '/Carlos.png',
};

const VAR_URL      = 'https://api.openai.com/v1/images/variations';
const BACKEND_EDIT = `${process.env.REACT_APP_API_URL}/api/goofy-edit`;
const API_KEY      = process.env.REACT_APP_OPENAI_API_KEY;

const PROPS = [
  'rubber chicken','disco ball','slice of pizza','giant rubber duck',
  'fire-breathing dragon','unicycle','birthday cake','giant taco',
  'jetpack','juggling clown','circus tent','rainbow parachute',
  'spaceship','dinosaur toy',
];

const b64ToBlob = (b64, m='image/png') =>
  new Blob([Uint8Array.from(atob(b64), c=>c.charCodeAt(0))], { type:m });

const blobToB64 = blob =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onloadend = () => res(r.result.split(',', 2)[1]);
    r.onerror   = rej;
    r.readAsDataURL(blob);
  });

const buildPrompt = (style, goofy) => {
  const tier =
    goofy<=20 ? 'a gentle whimsy' :
    goofy<=50 ? 'a playful cartoon chaos' :
    goofy<=80 ? 'outrageous slapstick mayhem' :
                'full-on surreal fever-dream insanity';

  const extras = [...PROPS].sort(()=>0.5-Math.random())
                           .slice(0, 3 + Math.floor(goofy/50));

  return [
    'Keep only the face exactly as in the reference.',
    `Render in ${style} style with ${tier}.`,
    `Include: ${extras.join(', ')}.`,
    'Combine everything into one absurd scene.',
  ].join(' ');
};

const makeMask = async goofy => {
  const size   = 1024;
  const radius = Math.max(256, size*0.4*(1-goofy/150));
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx    = canvas.getContext('2d');

  ctx.fillStyle = 'white';
  ctx.fillRect(0,0,size,size);
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(size/2, size/2, radius, 0, Math.PI*2);
  ctx.fill();

  return new Promise(r => canvas.toBlob(b=>r(b), 'image/png'));
};

export default function GoofyProfile({ name, onBack }) {
  const [style,  setStyle ] = useState('Cartoon');
  const [goofy,  setGoofy ] = useState(50);
  const [busy,   setBusy  ] = useState(false);
  const [imgURL, setImg   ] = useState(null);
  const [modal,  setModal ] = useState(false);
  const urlRef = useRef(null);

  useEffect(()=>()=>urlRef.current && URL.revokeObjectURL(urlRef.current),[]);

  const avatar = AVATARS[name] || '/ferv.png';

  const generate = async () => {
    setBusy(true); setImg(null);
    try {
      const avatarBlob = await (await fetch(avatar)).blob();
      const fd = new FormData();
      fd.append('model','dall-e-2');
      fd.append('image', avatarBlob, 'avatar.png');
      fd.append('n','1');
      fd.append('size','1024x1024');
      fd.append('response_format','b64_json');
      const vRes = await fetch(VAR_URL,{
        method :'POST',
        headers:{ Authorization:`Bearer ${API_KEY}` },
        body   : fd,
      });
      if(!vRes.ok) throw new Error(`Variation ${vRes.status}`);
      const variationB64 = (await vRes.json()).data[0].b64_json;

      const maskB64 = await blobToB64(await makeMask(goofy));
      const prompt  = buildPrompt(style, goofy);

      const pRes = await fetch(BACKEND_EDIT,{
        method :'POST',
        headers:{ 'Content-Type':'application/json' },
        body   : JSON.stringify({
          variation_b64: variationB64,
          mask_b64     : maskB64,
          prompt,
          n   : 1,
          size: '1024x1024',
        })
      });
      if(!pRes.ok){
        const txt = await pRes.text();
        throw new Error(`Proxy ${pRes.status}: ${txt}`);
      }
      const { b64 } = await pRes.json();
      const blob = b64ToBlob(b64);
      const url  = URL.createObjectURL(blob);
      urlRef.current && URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;
      setImg(url);

    } catch(err) {
      console.error(err);
      alert(`Generation failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="goofy-profile">
      <header className="profile-header">
        <button className="back-link" onClick={onBack}>← Back</button>
        <div className="avatar-ring">
          <img src={avatar} alt={name} className="profile-photo"/>
        </div>
        <h2 className="profile-name">{name}</h2>
      </header>

      <div className="profile-controls controls-grid">
        <div className="style-selector">
          <span>Style:</span>
          {['Cartoon','Realistic','Kids Book','Collage'].map(s=>(
            <button
              key={s}
              className={`style-pill ${style===s?'active':''}`}
              onClick={()=>setStyle(s)}
            >{s}</button>
          ))}
        </div>

        <div className="goofiness-slider">
          <label htmlFor="goofy-range">
            Goofiness:&nbsp;<span className="goofy-value">{goofy}%</span>
          </label>
          <input
            id="goofy-range"
            className="goofy-slider"
            type="range" min="0" max="100"
            value={goofy}
            onChange={e=>setGoofy(+e.target.value)}
          />
        </div>

        <div className="generate-btn-wrapper">
          <button
            className="generate-btn"
            onClick={generate}
            disabled={busy}
          >
            {busy ? '' : 'Goof-ify!'}
          </button>
        </div>
      </div>

      <div className="preview-gallery centered-preview">
        {busy && !imgURL && <div className="image-skeleton" />}
        {imgURL && (
          <img
            src={imgURL}
            alt={`Goofy ${name}`}
            className="preview-image"
            onClick={()=>setModal(true)}
          />
        )}
        {!busy && !imgURL && (
          <p className="empty-state">
            Hit <strong>Goof-ify!</strong> to unleash the chaos
          </p>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <button className="modal-close" onClick={()=>setModal(false)}>×</button>
          <img
            src={imgURL}
            alt="Enlarged goofy"
            className="modal-image"
            onClick={e=>e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

GoofyProfile.propTypes = {
  name : PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};




// // src/GoofyProfile.js
// import React, { useState, useRef, useEffect } from 'react';
// import PropTypes from 'prop-types';
// import './GoofyProfile.css';

// // ---------------------------------------------------------------------------
// // Static data
// // ---------------------------------------------------------------------------
// const AVATARS = {
//   Jiamin: '/Jiamin.png',
//   Isabel: '/Isabel.png',
//   Caleb: '/Caleb.png',
//   Elliot: '/Elliot.png',
//   Brittany: '/Brittney.png',
//   Kareem: '/Kareem.png',
//   'John Eric': '/John_Eric.png',
//   Talie: '/Talie.png',
//   Carlos: '/Carlos.png',
// };

// const VAR_URL = 'https://api.openai.com/v1/images/variations';
// const BACKEND_EDIT = '/api/goofy-edit'; // proxy endpoint
// const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// const PROPS = [
//   'rubber chicken', 'disco ball', 'slice of pizza', 'giant rubber duck',
//   'fire-breathing dragon', 'unicycle', 'birthday cake', 'giant taco',
//   'jetpack', 'juggling clown', 'circus tent', 'rainbow parachute',
//   'spaceship', 'dinosaur toy',
// ];

// // ---------------------------------------------------------------------------
// // Utility helpers
// // ---------------------------------------------------------------------------
// const b64ToBlob = (b64, mime = 'image/png') =>
//   new Blob([Uint8Array.from(atob(b64), c => c.charCodeAt(0))], { type: mime });

// const blobToB64 = blob =>
//   new Promise((res, rej) => {
//     const r = new FileReader();
//     r.onloadend = () => res(r.result.split(',', 2)[1]);
//     r.onerror = rej;
//     r.readAsDataURL(blob);
//   });

// const buildRandomPrompt = (style, goofy) => {
//   const tier =
//     goofy <= 20 ? 'a gentle whimsy'
//       : goofy <= 50 ? 'a playful cartoon chaos'
//         : goofy <= 80 ? 'outrageous slapstick mayhem'
//           : 'full-on surreal fever-dream insanity';

//   const shuffled = PROPS.sort(() => 0.5 - Math.random());
//   const chosen = shuffled.slice(0, 3 + Math.floor((goofy / 100) * 2));

//   return [
//     'Keep only the face exactly as in the reference.',
//     `Render in ${style} style with ${tier}.`,
//     `Include: ${chosen.join(', ')}.`,
//     'Combine everything into one absurd scene.',
//   ].join(' ');
// };

// const makeCircleMask = async goofy => {
//   const size = 1024;
//   const c = document.createElement('canvas');
//   c.width = c.height = size;
//   const ctx = c.getContext('2d');
//   ctx.fillStyle = 'white';
//   ctx.fillRect(0, 0, size, size);
//   const r = size * 0.4 * (1 - goofy / 150);
//   ctx.beginPath();
//   ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
//   ctx.fillStyle = 'black';
//   ctx.fill();
//   return new Promise(res => c.toBlob(b => res(b), 'image/png'));
// };

// // ---------------------------------------------------------------------------
// // Component
// // ---------------------------------------------------------------------------
// export default function GoofyProfile({ name, onBack }) {
//   const [style, setStyle] = useState('Cartoon');
//   const [goofy, setGoofy] = useState(50);
//   const [loading, setLoading] = useState(false);
//   const [previewUrl, setPreviewUrl] = useState(null);

//   // modal state
//   const [isModalOpen, setModalOpen] = useState(false);

//   const prevUrlRef = useRef(null);
//   useEffect(() => () => prevUrlRef.current && URL.revokeObjectURL(prevUrlRef.current), []);

//   const avatarUrl = AVATARS[name] || '/ferv.png';

//   // -------------------------------------------------------------------------
//   // Generation handler
//   // -------------------------------------------------------------------------
//   const handleGenerate = async () => {
//     setLoading(true); setPreviewUrl(null);
//     try {
//       // avatar blob
//       const avatarBlob = await (await fetch(avatarUrl)).blob();

//       // variation call
//       const vf = new FormData();
//       vf.append('model', 'dall-e-2');
//       vf.append('image', avatarBlob, 'avatar.png');
//       vf.append('n', '1');
//       vf.append('size', '1024x1024');
//       vf.append('response_format', 'b64_json');
//       const vRes = await fetch(VAR_URL, {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${API_KEY}` },
//         body: vf,
//       });
//       if (!vRes.ok) throw new Error(`Variation ${vRes.status}`);
//       const variationB64 = (await vRes.json()).data[0].b64_json;

//       // mask
//       const maskB64 = await blobToB64(await makeCircleMask(goofy));

//       // prompt
//       const prompt = buildRandomPrompt(style, goofy);

//       // backend proxy
//       const pRes = await fetch(BACKEND_EDIT, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           variation_b64: variationB64,
//           mask_b64: maskB64,
//           prompt,
//           n: 1,
//           size: '1024x1024',
//         }),
//       });
//       if (!pRes.ok) throw new Error(`Proxy ${pRes.status}`);
//       const finalB64 = (await pRes.json()).b64;

//       // show
//       const blob = b64ToBlob(finalB64);
//       const objURL = URL.createObjectURL(blob);
//       if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
//       prevUrlRef.current = objURL;
//       setPreviewUrl(objURL);
//     } catch (e) {
//       console.error(e);
//       alert(`Generation failed: ${e.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // -------------------------------------------------------------------------
//   // UI
//   // -------------------------------------------------------------------------
//   return (
//     <section className="goofy-profile">
//       {/* header */}
//       <header className="profile-header">
//         <button className="back-btn" onClick={onBack}>← Back</button>
//         <img src={avatarUrl} alt={name} className="profile-photo" />
//         <h2 className="profile-name">{name}</h2>
//       </header>

//       {/* controls */}
//       <div className="profile-controls">
//         <div className="style-selector">
//           <span>Style:</span>
//           {['Cartoon', 'Realistic', 'Kids Book', 'Collage'].map(s => (
//             <button
//               key={s}
//               className={`style-pill ${style === s ? 'active' : ''}`}
//               onClick={() => setStyle(s)}
//             >{s}</button>
//           ))}
//         </div>

//         <div className="goofiness-slider">
//           <label htmlFor="goofy-range">Goofiness: {goofy}%</label>
//           <input
//             id="goofy-range"
//             type="range"
//             min="0" max="100"
//             value={goofy}
//             onChange={e => setGoofy(+e.target.value)}
//           />
//         </div>

//         <button
//           className="generate-btn"
//           onClick={handleGenerate}
//           disabled={loading}
//         >
//           {loading ? 'Generating…' : 'Generate Goofy Image'}
//         </button>
//       </div>

//       {/* preview */}
//       <div className="preview-gallery">
//         {previewUrl
//           ? (
//             <img
//               src={previewUrl}
//               alt={`Goofy ${name}`}
//               className="preview-image"
//               onClick={() => setModalOpen(true)}
//               style={{ cursor: 'zoom-in' }}
//             />
//           )
//           : !loading && <p>No image yet—click Generate!</p>}
//       </div>

//       {/* modal for enlarged view */}
//       {isModalOpen && (
//         <div
//           className="modal-overlay"
//           onClick={() => setModalOpen(false)}
//           style={{
//             position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             zIndex: 1000,
//           }}
//         >
//           <img
//             src={previewUrl}
//             alt="Enlarged goofy"
//             style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px' }}
//             onClick={e => e.stopPropagation()} // prevent closing when clicking image
//           />
//         </div>
//       )}
//     </section>
//   );
// }

// GoofyProfile.propTypes = {
//   name: PropTypes.string.isRequired,
//   onBack: PropTypes.func.isRequired,
// };
