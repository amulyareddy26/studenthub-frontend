Auth.require(["ADMIN"]);
renderLayout("students.html");
const editId = qs("id");

(async () => {
  try {
    const deps = await api("/api/departments");
    $("departmentId").innerHTML = `<option value="">Select department</option>` +
      deps.map((d) => `<option value="${d.departmentId}">${esc(d.departmentCode)} - ${esc(d.departmentName)}</option>`).join("");
    if (editId) {
      $("formTitle").textContent = "Edit Student";
      const s = await api("/api/students/" + editId);
      $("rollNo").value = s.rollNo; $("name").value = s.name; $("gender").value = s.gender;
      $("email").value = s.email; $("phone").value = s.phone;
      $("departmentId").value = s.departmentId; $("year").value = s.year;
    }
  } catch (e) { toast(e.message, "danger"); }
})();

$("studentForm").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  if (!ev.target.checkValidity()) { ev.target.classList.add("was-validated"); return; }
  const body = {
    rollNo: $("rollNo").value.trim(), name: $("name").value.trim(), gender: $("gender").value,
    email: $("email").value.trim(), phone: $("phone").value.trim(),
    departmentId: Number($("departmentId").value), year: Number($("year").value)
  };
  $("saveBtn").disabled = true;
  try {
    if (editId) await api("/api/students/" + editId, { method: "PUT", body });
    else await api("/api/students", { method: "POST", body });
    toast("Student saved successfully");
    setTimeout(() => (location.href = "students.html"), 800);
  } catch (e) {
    toast(e.message, "danger");
    $("saveBtn").disabled = false;
  }
});