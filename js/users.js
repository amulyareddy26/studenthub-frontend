const me = Auth.require(["ADMIN"]);
renderLayout("users.html");
const modal = new bootstrap.Modal($("userModal"));
let list = [];

async function load() {
  try { list = await api("/api/users"); render(); }
  catch (e) { toast(e.message, "danger"); }
}

function render() {
  $("rows").innerHTML = list.map((u) => `<tr>
      <td class="fw-semibold">${esc(u.username)}</td><td><span class="badge bg-secondary">${esc(u.role)}</span></td>
      <td><span class="badge ${u.status === "ACTIVE" ? "bg-success" : "bg-danger"}">${esc(u.status)}</span></td><td>${fmtDate(u.createdAt)}</td>
      <td class="text-nowrap"><button class="btn btn-sm btn-outline-primary" onclick="openUser(${u.userId})"><i class="bi bi-pencil"></i></button>
      ${u.username !== me.username ? `<button class="btn btn-sm btn-outline-danger" onclick="removeUser(${u.userId})"><i class="bi bi-trash"></i></button>` : ""}</td></tr>`).join("");
}

function openUser(id) {
  const u = id ? list.find((x) => x.userId === id) : null;
  $("userId").value = u ? u.userId : "";
  $("uName").value = u ? u.username : "";
  $("uPassword").value = "";
  $("uPassword").required = !u;
  $("pwdHint").textContent = u ? "(leave blank to keep current)" : "";
  $("uRole").value = u ? u.role : "STUDENT";
  $("uStatus").value = u ? u.status : "ACTIVE";
  $("userTitle").textContent = u ? "Edit User" : "Add User";
  $("userForm").classList.remove("was-validated");
  modal.show();
}

async function saveUser() {
  const form = $("userForm");
  if (!form.checkValidity()) { form.classList.add("was-validated"); return; }
  const id = $("userId").value;
  const body = { username: $("uName").value.trim(), role: $("uRole").value, status: $("uStatus").value };
  if ($("uPassword").value) body.password = $("uPassword").value;
  try {
    if (id) await api("/api/users/" + id, { method: "PUT", body });
    else await api("/api/users", { method: "POST", body });
    modal.hide(); toast("User saved"); load();
  } catch (e) { toast(e.message, "danger"); }
}

async function removeUser(id) {
  if (!confirm("Delete this user?")) return;
  try { await api("/api/users/" + id, { method: "DELETE" }); toast("User deleted"); load(); }
  catch (e) { toast(e.message, "danger"); }
}

load();