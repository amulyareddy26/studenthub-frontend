const user = Auth.require(["ADMIN", "FACULTY"]);
renderLayout("dashboard.html");
if (user.role !== "ADMIN") $("addBtn").remove();

(async () => {
  try {
    const d = await api("/api/dashboard");
    $("kStudents").textContent = d.totalStudents;
    $("kDepartments").textContent = d.totalDepartments;
    $("kUsers").textContent = d.totalUsers;
    new Chart($("deptChart"), {
      type: "bar",
      data: {
        labels: d.departmentSummary.map((x) => x.departmentCode),
        datasets: [{ label: "Students", data: d.departmentSummary.map((x) => x.studentCount), backgroundColor: "#4f46e5", borderRadius: 6 }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
    });
    $("recentRows").innerHTML = d.recentStudents.length
      ? d.recentStudents.map((s) => `<tr><td>${esc(s.rollNo)}</td><td><a href="student-details.html?id=${s.studentId}">${esc(s.name)}</a></td><td>${esc(s.departmentCode)}</td><td>${s.year}</td></tr>`).join("")
      : `<tr><td colspan="4" class="text-center text-muted">No students yet</td></tr>`;
  } catch (e) { toast(e.message, "danger"); }
})();