// Backend URL (no trailing slash)
const isLocal = window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1" ||
                window.location.hostname === "";

const API_BASE_URL = isLocal
    ? "http://localhost:8080"
    : "https://https://studenthub-backend-1-i43r.onrender.com";
