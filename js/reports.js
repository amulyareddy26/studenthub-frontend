Auth.require(["ADMIN", "FACULTY"]);
renderLayout("reports.html");

(async () => {
  try {
    const rows = await api("/api/reports/department-summary");
    $("rows").innerHTML = rows.map((r) => `<tr><td><span class="badge bg-primary">${esc(r.departmentCode)}</span></td><td>${esc(r.departmentName)}</td><td>${r.studentCount}</td></tr>`).join("");
    $("totalCount").textContent = rows.reduce((a, r) => a + r.studentCount, 0);
  } catch (e) { toast(e.message, "danger"); }
})();

async function exportCsv() {
  try {
    const r = await api("/api/students?size=1000&sortBy=rollNo&direction=asc");
    const q = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
    const head = ["Roll No", "Name", "Email", "Phone", "Gender", "Year", "Department"];
    const lines = [head.map(q).join(",")].concat(
      r.content.map((s) => [s.rollNo, s.name, s.email, s.phone, s.gender, s.year, s.departmentName].map(q).join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (e) { toast(e.message, "danger"); }
}