async function fetchJSON(url, options) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  return res.status === 204 ? null : res.json();
}

function rowTemplate(c) {
  return `<tr data-id="${c.id}">
    <td>${c.id}</td>
    <td><input value="${c.nombre || ""}" class="inp-nombre" /></td>
    <td><input value="${c.email || ""}" class="inp-email" /></td>
    <td><input value="${c.telefono || ""}" class="inp-telefono" /></td>
    <td class="actions">
      <button class="btn-update">Actualizar</button>
      <button class="btn-delete">Eliminar</button>
    </td>
  </tr>`;
}

async function loadClientes() {
  const tbody = document.querySelector("#clientes-table tbody");
  tbody.innerHTML = "<tr><td colspan='5'>Cargando...</td></tr>";
  try {
    const data = await fetchJSON(`${API_BASE}/clientes`);
    tbody.innerHTML = data.map(rowTemplate).join("");
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan='5'>Error: ${e.message}</td></tr>`;
  }
}

document.getElementById("refresh").addEventListener("click", loadClientes);

document.getElementById("create-form").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  try {
    await fetchJSON(`${API_BASE}/clientes`, {
      method: "POST",
      body: JSON.stringify({ nombre, email, telefono })
    });
    ev.target.reset();
    await loadClientes();
  } catch (e) {
    alert("No se pudo crear: " + e.message);
  }
});

document.querySelector("#clientes-table").addEventListener("click", async (ev) => {
  const tr = ev.target.closest("tr[data-id]");
  if (!tr) return;
  const id = tr.dataset.id;
  if (ev.target.classList.contains("btn-delete")) {
    if (!confirm("¿Eliminar cliente #" + id + "?")) return;
    try {
      await fetchJSON(`${API_BASE}/clientes/` + id, { method: "DELETE" });
      await loadClientes();
    } catch (e) {
      alert("No se pudo eliminar: " + e.message);
    }
  } else if (ev.target.classList.contains("btn-update")) {
    const nombre = tr.querySelector(".inp-nombre").value.trim();
    const email = tr.querySelector(".inp-email").value.trim();
    const telefono = tr.querySelector(".inp-telefono").value.trim();
    try {
      await fetchJSON(`${API_BASE}/clientes/` + id, {
        method: "PUT",
        body: JSON.stringify({ nombre, email, telefono })
      });
      await loadClientes();
    } catch (e) {
      alert("No se pudo actualizar: " + e.message);
    }
  }
});

// Arranque
loadClientes();
