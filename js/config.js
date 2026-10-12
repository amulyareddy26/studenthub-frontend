// Backend URL (no trailing slash).
// Local development -> http://localhost:8080
// After deploying on Render, replace with your Render URL, e.g. https://studenthub-api.onrender.com
const isLocal = window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1" ||
                window.location.hostname === "";
const API_BASE_URL = isLocal ? "http://localhost:8080" : "https://REPLACE-WITH-YOUR-RENDER-URL.onrender.com";
