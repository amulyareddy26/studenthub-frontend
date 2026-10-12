const user = Auth.require(["ADMIN", "FACULTY"]);
renderLayout("students.html");
const isAdmin = user.role === "ADMIN";
let page = 0, timer;
if (!isAdmin) $("addBtn").remove();

["fDept", "fYear", "fGender", "fSort"].forEach((id) => $(id).addEventListener("change", () => { page = 0; load(); }));
$("fSearch").addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => { page = 0; load(); }, 300); });
$("resetBtn").onclick = () => {
  ["fSearch", "fDept", "fYear", "fGender"].forEach((id) => ($(id).value = ""));
  $("fSort").selectedIndex = 0; page = 0; load();
};

async function init() {
  try {
    const deps = await api("/api/departments");
    $("fDept").innerHTML = `<option value="">All Departments</option>` +
      deps.map((d) => `<option value="${d.departmentId}">${esc(d.departmentCode)}</option>`).join("");
  } catch (e) { toast(e.message, "danger"); }
  load();
}

async function load() {
  const [sortBy, direction] = $("fSort").value.split("|");
  const p = new URLSearchParams({ page, size: 10, sortBy, direction });
  [["search", "fSearch"], ["departmentId", "fDept"], ["year", "fYear"], ["gender", "fGender"]].forEach(([k, id]) => {
    const v = $(id).value.trim();
    if (v) p.set(k, v);
  });
  try { render(await api("/api/students?" + p.toString())); }
  catch (e) { toast(e.message, "danger"); }
}

function render(r) {
  $("rows").innerHTML = r.content.length ? r.content.map((s) => `<tr>
      <td>${esc(s.rollNo)}</td><td class="fw-semibold">${esc(s.name)}</td><td>${esc(s.email)}</td><td>${esc(s.phone)}</td>
      <td><span class="badge bg-primary-subtle text-primary">${esc(s.departmentCode)}</span></td><td>${s.year}</td><td>${esc(s.gender)}</td>
      <td class="text-nowrap">
        <a class="btn btn-sm btn-outline-secondary" href="student-details.html?id=${s.studentId}" title="View"><i class="bi bi-eye"></i></a>
        ${isAdmin ? `<a class="btn btn-sm btn-outline-primary" href="student-form.html?id=${s.studentId}" title="Edit"><i class="bi bi-pencil"></i></a>
        <button class="btn btn-sm btn-outline-danger" onclick="removeStudent(${s.studentId})" title="Delete"><i class="bi bi-trash"></i></button>` : ""}
      </td></tr>`).join("")
    : `<tr><td colspan="8" class="text-center text-muted py-4">No students found</td></tr>`;

  const from = r.totalElements ? r.page * r.size + 1 : 0;
  const to = Math.min((r.page + 1) * r.size, r.totalElements);
  $("info").textContent = `Showing ${from}-${to} of ${r.totalElements}`;

  let html = `<li class="page-item ${r.page === 0 ? "disabled" : ""}"><a class="page-link" href="#" onclick="go(${r.page - 1});return false">Prev</a></li>`;
  for (let i = 0; i < r.totalPages; i++) {
    if (i === 0 || i === r.totalPages - 1 || Math.abs(i - r.page) <= 2) {
      html += `<li class="page-item ${i === r.page ? "active" : ""}"><a class="page-link" href="#" onclick="go(${i});return false">${i + 1}</a></li>`;
    }
  }
  html += `<li class="page-item ${r.page >= r.totalPages - 1 ? "disabled" : ""}"><a class="page-link" href="#" onclick="go(${r.page + 1});return false">Next</a></li>`;
  $("pager").innerHTML = html;
}

function go(p) { page = p; load(); }

async function removeStudent(id) {
  if (!confirm("Delete this student and all their academic records?")) return;
  try { await api("/api/students/" + id, { method: "DELETE" }); toast("Student deleted"); load(); }
  catch (e) { toast(e.message, "danger"); }
}

init();