const user = Auth.require(["ADMIN", "FACULTY"]);
renderLayout("departments.html");
const isAdmin = user.role === "ADMIN";
const modal = new bootstrap.Modal($("depModal"));
let list = [];
if (!isAdmin) { $("addBtn").remove(); $("actHead").remove(); }

async function load() {
  try { list = await api("/api/departments"); render(); }
  catch (e) { toast(e.message, "danger"); }
}

function render() {
  $("rows").innerHTML = list.length ? list.map((d) => `<tr>
      <td><span class="badge bg-primary">${esc(d.departmentCode)}</span></td><td>${esc(d.departmentName)}</td><td>${d.studentCount}</td>
      ${isAdmin ? `<td class="text-nowrap"><button class="btn btn-sm btn-outline-primary" onclick="openDep(${d.departmentId})"><i class="bi bi-pencil"></i></button>
      <button class="btn btn-sm btn-outline-danger" onclick="removeDep(${d.departmentId})"><i class="bi bi-trash"></i></button></td>` : ""}</tr>`).join("")
    : `<tr><td colspan="4" class="text-center text-muted py-3">No departments</td></tr>`;
}

function openDep(id) {
  const d = id ? list.find((x) => x.departmentId === id) : null;
  $("depId").value = d ? d.departmentId : "";
  $("depCode").value = d ? d.departmentCode : "";
  $("depName").value = d ? d.departmentName : "";
  $("depTitle").textContent = d ? "Edit Department" : "Add Department";
  $("depForm").classList.remove("was-validated");
  modal.show();
}

async function saveDep() {
  const form = $("depForm");
  if (!form.checkValidity()) { form.classList.add("was-validated"); return; }
  const id = $("depId").value;
  const body = { departmentCode: $("depCode").value.trim(), departmentName: $("depName").value.trim() };
  try {
    if (id) await api("/api/departments/" + id, { method: "PUT", body });
    else await api("/api/departments", { method: "POST", body });
    modal.hide(); toast("Department saved"); load();
  } catch (e) { toast(e.message, "danger"); }
}

async function removeDep(id) {
  if (!confirm("Delete this department?")) return;
  try { await api("/api/departments/" + id, { method: "DELETE" }); toast("Department deleted"); load(); }
  catch (e) { toast(e.message, "danger"); }
}

load();