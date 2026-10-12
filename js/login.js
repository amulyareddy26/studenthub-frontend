function goHome(u) { location.href = u.role === "STUDENT" ? "student-details.html?me=1" : "dashboard.html"; }
if (Auth.token() && Auth.user()) goHome(Auth.user());

$("togglePwd").onclick = () => { const p = $("password"); p.type = p.type === "password" ? "text" : "password"; };
$("showRegister").onclick = (e) => { e.preventDefault(); $("loginBox").classList.add("d-none"); $("registerBox").classList.remove("d-none"); };
$("showLogin").onclick = (e) => { e.preventDefault(); $("registerBox").classList.add("d-none"); $("loginBox").classList.remove("d-none"); };

$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!e.target.checkValidity()) { e.target.classList.add("was-validated"); return; }
  $("loginBtn").disabled = true;
  $("loginError").classList.add("d-none");
  try {
    const data = await api("/api/auth/login", { method: "POST", body: { username: $("username").value.trim(), password: $("password").value } });
    Auth.save(data);
    goHome(data);
  } catch (err) {
    $("loginError").textContent = err.message;
    $("loginError").classList.remove("d-none");
  }
  $("loginBtn").disabled = false;
});

$("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!e.target.checkValidity()) { e.target.classList.add("was-validated"); return; }
  try {
    const r = await api("/api/auth/register", { method: "POST", body: { username: $("regRoll").value.trim(), password: $("regPassword").value } });
    toast(r.message);
    $("showLogin").click();
    $("username").value = $("regRoll").value.trim();
  } catch (err) { toast(err.message, "danger"); }
});