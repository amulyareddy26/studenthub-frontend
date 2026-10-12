const isMe = qs("me") === "1";
const user = Auth.require(isMe ? ["STUDENT"] : ["ADMIN", "FACULTY"]);
renderLayout(isMe ? "student-details.html?me=1" : "students.html");
const isAdmin = user.role === "ADMIN";
const canManage = user.role === "ADMIN" || user.role === "FACULTY";
const recModal = new bootstrap.Modal($("recordModal"));
let student = null, records = [];

if (!canManage) { $("recAddBtn").remove(); $("recActHead").remove(); }

async function init() {
  try {
    student = isMe ? await api("/api/students/me") : await api("/api/students/" + qs("id"));
    records = isMe ? await api("/api/academic-records/me") : await api("/api/academic-records?studentId=" + student.studentId);
    renderProfile();
    renderRecords();
  } catch (e) {
    toast(e.message, "danger");
    $("profile").innerHTML = `<div class="alert alert-warning">${esc(e.message)}</div>`;
  }
}

function renderProfile() {
  const s = student;
  $("profile").innerHTML = `<div class="card p-4"><div class="d-flex flex-wrap align-items-center gap-3">
      <div class="avatar">${esc(s.name.charAt(0).toUpperCase())}</div>
      <div class="flex-grow-1">
        <h4 class="mb-0 fw-bold">${esc(s.name)}</h4>
        <div class="text-muted">${esc(s.rollNo)} &middot; <span class="badge bg-primary">${esc(s.departmentCode)}</span> Year ${s.year}</div>
      </div>
      <div class="d-flex gap-2">
        ${!isMe ? `<a href="students.html" class="btn btn-outline-secondary">Back</a>` : ""}
        ${isAdmin ? `<a href="student-form.html?id=${s.studentId}" class="btn btn-outline-primary"><i class="bi bi-pencil"></i> Edit</a>
        <button class="btn btn-outline-danger" onclick="removeStudent()"><i class="bi bi-trash"></i> Delete</button>` : ""}
      </div></div></div>`;
  $("contact").innerHTML = `<p class="mb-1"><i class="bi bi-envelope"></i> ${esc(s.email)}</p>
      <p class="mb-1"><i class="bi bi-telephone"></i> ${esc(s.phone)}</p><p class="mb-0"><i class="bi bi-person"></i> ${esc(s.gender)}</p>`;
  $("academic").innerHTML = `<p class="mb-1"><b>Department:</b> ${esc(s.departmentName)}</p>
      <p class="mb-1"><b>Year:</b> ${s.year}</p><p class="mb-0"><b>Roll No:</b> ${esc(s.rollNo)}</p>`;
  $("history").innerHTML = `<p class="mb-1"><b>Created:</b> ${fmtDate(s.createdAt)}</p><p class="mb-0"><b>Last updated:</b> ${fmtDate(s.updatedAt)}</p>`;
}

function renderRecords() {
  const avg = records.length ? (records.reduce((a, r) => a + r.cgpa, 0) / records.length).toFixed(2) : "-";
  $("recSummary").textContent = records.length ? `Average CGPA: ${avg}` : "";
  const cols = canManage ? 5 : 4;
  $("recRows").innerHTML = records.length ? records.map((r) => `<tr>
      <td>Sem ${r.semester}</td><td>${r.cgpa}</td><td>${r.attendance}</td><td>${esc(r.remarks || "-")}</td>
      ${canManage ? `<td class="text-nowrap"><button class="btn btn-sm btn-outline-primary" onclick="openRecord(${r.recordId})"><i class="bi bi-pencil"></i></button>
      <button class="btn btn-sm btn-outline-danger" onclick="removeRecord(${r.recordId})"><i class="bi bi-trash"></i></button></td>` : ""}</tr>`).join("")
    : `<tr><td colspan="${cols}" class="text-center text-muted py-3">No academic records yet</td></tr>`;
}

function openRecord(id) {
  const r = id ? records.find((x) => x.recordId === id) : null;
  $("recordId").value = r ? r.recordId : "";
  $("semester").value = r ? r.semester : "";
  $("cgpa").value = r ? r.cgpa : "";
  $("attendance").value = r ? r.attendance : "";
  $("remarks").value = r ? r.remarks || "" : "";
  $("recTitle").textContent = r ? "Edit Academic Record" : "Add Academic Record";
  $("recordForm").classList.remove("was-validated");
  recModal.show();
}

async function saveRecord() {
  const form = $("recordForm");
  if (!form.checkValidity()) { form.classList.add("was-validated"); return; }
  const id = $("recordId").value;
  const body = {
    studentId: student.studentId, semester: Number($("semester").value), cgpa: Number($("cgpa").value),
    attendance: Number($("attendance").value), remarks: $("remarks").value.trim()
  };
  try {
    if (id) await api("/api/academic-records/" + id, { method: "PUT", body });
    else await api("/api/academic-records", { method: "POST", body });
    recModal.hide();
    toast("Record saved");
    records = await api("/api/academic-records?studentId=" + student.studentId);
    renderRecords();
  } catch (e) { toast(e.message, "danger"); }
}

async function removeRecord(id) {
  if (!confirm("Delete this record?")) return;
  try {
    await api("/api/academic-records/" + id, { method: "DELETE" });
    toast("Record deleted");
    records = records.filter((r) => r.recordId !== id);
    renderRecords();
  } catch (e) { toast(e.message, "danger"); }
}

async function removeStudent() {
  if (!confirm("Delete this student and all their records?")) return;
  try {
    await api("/api/students/" + student.studentId, { method: "DELETE" });
    toast("Student deleted");
    setTimeout(() => (location.href = "students.html"), 700);
  } catch (e) { toast(e.message, "danger"); }
}

init();