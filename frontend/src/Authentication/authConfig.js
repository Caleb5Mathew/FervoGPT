export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_AD_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_AD_TENANT_ID}`,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,  // now http://localhost:3000/auth
  },
  cache: { cacheLocation: "sessionStorage" },
};

export const loginRequest = {
  scopes: ["openid", "profile", "User.Read"]
};
