async function fetchUsers() {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      const tbody = document.querySelector('#users-table tbody');
      tbody.innerHTML = '';
      data.users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td><button onclick="deleteUser(${user.id})">❌</button></td>
        `;
        tbody.appendChild(row);
      });
    }
async function fetchAudit() {
      const res = await fetch('/api/admin/auditlog');
      const data = await res.json();
      const tbody = document.querySelector('#audit-log tbody');
      tbody.innerHTML = '';
      data.logs.forEach(log => {
        console.log(log);
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${log.id}</td>
          <td>${log.user_id}</td>
          <td>${log.action}</td>
          <td>${log.table_name}</td>
          <td>${log.record_id}</td>
          <td>${log.action_time}</td>
        `;
        tbody.appendChild(row);
      });
    }

    function logout() {
      document.cookie = "auth=false; path=/; Max-Age=0";
      document.cookie = "userId=; path=/; Max-Age=0";
      document.cookie = "role=; path=/; Max-Age=0";
      location.href = '/login.html';
    }

    window.onload = () => {
    fetchUsers();
    fetchAudit();
  };


    async function deleteUser(userId) {
  if (!confirm("Sigur vrei sa stergi acest utilizator?")) return;

  const res = await fetch(`/api/admin/users`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: userId })
  });

  if (res.ok) {
    alert("Utilizator sters!");
    fetchUsers(); 
  } else {
    const msg = await res.text();
    alert("Eroare: " + msg);
  }
}