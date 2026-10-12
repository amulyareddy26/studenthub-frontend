const $ = (id) => document.getElementById(id);
const qs = (name) => new URLSearchParams(location.search).get(name);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = (v) => (v ? new Date(v).toLocaleString() : "-");

const Auth = {
  save(data) {
    localStorage.setItem("sh_token", data.token);
    localStorage.setItem("sh_user", JSON.stringify({ username: data.username, role: data.role }));
  },
  token() { return localStorage.getItem("sh_token"); },
  user() { try { return JSON.parse(localStorage.getItem("sh_user")); } catch (e) { return null; } },
  clear() { localStorage.removeItem("sh_token"); localStorage.removeItem("sh_user"); },
  require(roles) {
    const u = this.user();
    if (!this.token() || !u) { location.href = "login.html"; throw new Error("Not logged in"); }
    if (roles && !roles.includes(u.role)) { location.href = "404.html"; throw new Error("Not allowed"); }
    return u;
  },
  logout() { this.clear(); location.href = "login.html"; }
};

async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (Auth.token()) headers["Authorization"] = "Bearer " + Auth.token();
  let res;
  try {
    res = await fetch(API_BASE_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch (e) {
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  if (res.status === 401 && !path.startsWith("/api/auth/")) { Auth.logout(); throw new Error("Session expired"); }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
  if (!res.ok) {
    let msg = (data && data.message) || "Request failed (" + res.status + ")";
    if (data && data.fieldErrors) msg = Object.values(data.fieldErrors).join(", ");
    throw new Error(msg);
  }
  return data;
}

function toast(message, type = "success") {
  let box = document.getElementById("toastBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "toastBox";
    box.className = "toast-container position-fixed top-0 end-0 p-3";
    box.style.zIndex = 2000;
    document.body.appendChild(box);
  }
  const el = document.createElement("div");
  el.className = `toast align-items-center text-bg-${type} border-0`;
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${esc(message)}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  box.appendChild(el);
  const t = new bootstrap.Toast(el, { delay: 3500 });
  t.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());
}