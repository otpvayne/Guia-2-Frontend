async function fetchJSON(url, options) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.status === 204 ? null : res.json();
}

function fmt(v) {
  if (v == null) return "";
  return String(v);
}

function rowTemplate(c) {
  const created = c.creado_en ? new Date(c.creado_en).toLocaleString() : "";
  return `<tr>
    <td>${fmt(c.id)}</td>
    <td>${fmt(c.nombre)}</td>
    <td>${fmt(c.email)}</td>
    <td>${fmt(c.telefono)}</td>
    <td>${created}</td>
  </tr>`;
}

async function loadClientes() {
  const tbody = document.querySelector("#clientes-table tbody");
  const listMsg = document.getElementById("list-msg");
  tbody.innerHTML = "<tr><td colspan='5'>Cargando...</td></tr>";
  listMsg.textContent = "";
  try {
    const data = await fetchJSON(`${API_BASE}/api/clientes`);
    if (!Array.isArray(data)) throw new Error("Respuesta inesperada del servidor");
    tbody.innerHTML = data.map(rowTemplate).join("") || "<tr><td colspan='5'>Sin registros</td></tr>";
  } catch (e) {
    tbody.innerHTML = "<tr><td colspan='5'>Error al cargar</td></tr>";
    listMsg.textContent = e.message;
    listMsg.className = "msg error";
  }
}

document.getElementById("refresh").addEventListener("click", loadClientes);

document.getElementById("create-form").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const msg = document.getElementById("create-msg");
  msg.textContent = "";
  try {
    await fetchJSON(`${API_BASE}/api/clientes`, {
      method: "POST",
      body: JSON.stringify({ nombre, email, telefono })
    });
    ev.target.reset();
    msg.textContent = "Cliente creado correctamente.";
    msg.className = "msg success";
    await loadClientes();
  } catch (e) {
    msg.textContent = e.message;
    msg.className = "msg error";
  }
});

// Arranque
loadClientes();
