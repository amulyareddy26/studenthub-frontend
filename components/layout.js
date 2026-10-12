function renderLayout(active) {
  const user = Auth.user();
  const links = [
    { href: "dashboard.html", icon: "bi-speedometer2", label: "Dashboard", roles: ["ADMIN", "FACULTY"] },
    { href: "students.html", icon: "bi-people", label: "Students", roles: ["ADMIN", "FACULTY"] },
    { href: "departments.html", icon: "bi-building", label: "Departments", roles: ["ADMIN", "FACULTY"] },
    { href: "users.html", icon: "bi-person-gear", label: "Users / Roles", roles: ["ADMIN"] },
    { href: "reports.html", icon: "bi-file-earmark-bar-graph", label: "Reports", roles: ["ADMIN", "FACULTY"] },
    { href: "student-details.html?me=1", icon: "bi-person-badge", label: "My Profile", roles: ["STUDENT"] }
  ].filter((l) => l.roles.includes(user.role));

  $("sidebar").innerHTML =
    `<div class="brand"><i class="bi bi-mortarboard-fill"></i> StudentHub</div>` +
    links.map((l) => `<a href="${l.href}" class="${active === l.href ? "active" : ""}"><i class="bi ${l.icon}"></i>${l.label}</a>`).join("");

  $("topbar").innerHTML =
    `<button class="btn btn-light d-lg-none" id="menuBtn"><i class="bi bi-list"></i></button>
     <span class="fw-semibold d-none d-lg-block">Student Database &amp; Academic Management</span>
     <div class="d-flex align-items-center gap-2 ms-auto">
       <span class="badge bg-secondary">${esc(user.role)}</span><span>${esc(user.username)}</span>
       <button class="btn btn-outline-danger btn-sm" onclick="Auth.logout()"><i class="bi bi-box-arrow-right"></i> Logout</button>
     </div>`;
  $("menuBtn").onclick = () => $("sidebar").classList.toggle("open");
}