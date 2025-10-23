function apiUrl(path) {
  // Construye URL segura: https://host + path (evita duplicados)
  try {
    const base = new URL(API_BASE);
    return new URL(path, base.origin).toString();
  } catch {
    return (API_BASE.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, ''));
  }
}

async function fetchJSON(url, options) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.status === 204 ? null : res.json();
}

function fmt(v) { return v == null ? "" : String(v); }

function rowView(c) {
  const created = c.creado_en ? new Date(c.creado_en).toLocaleString() : "";
  return `<tr data-id="${c.id}" data-mode="view">
    <td>${fmt(c.id)}</td>
    <td class="col-nombre">${fmt(c.nombre)}</td>
    <td class="col-email">${fmt(c.email)}</td>
    <td class="col-telefono">${fmt(c.telefono)}</td>
    <td>${created}</td>
    <td class="actions">
      <button class="btn-edit">Editar</button>
      <button class="btn-delete">Eliminar</button>
    </td>
  </tr>`;
}

function rowEdit(c) {
  const created = c.creado_en ? new Date(c.creado_en).toLocaleString() : "";
  return `<tr data-id="${c.id}" data-mode="edit">
    <td>${fmt(c.id)}</td>
    <td><input class="inline inp-nombre" value="${fmt(c.nombre)}" /></td>
    <td><input class="inline inp-email"  value="${fmt(c.email)}" /></td>
    <td><input class="inline inp-telefono" value="${fmt(c.telefono)}" /></td>
    <td>${created}</td>
    <td class="actions">
      <button class="btn-save">Guardar</button>
      <button class="btn-cancel">Cancelar</button>
      <button class="btn-delete">Eliminar</button>
    </td>
  </tr>`;
}

async function loadClientes() {
  const tbody = document.querySelector("#clientes-table tbody");
  const listMsg = document.getElementById("list-msg");
  tbody.innerHTML = "<tr><td colspan='6'>Cargando...</td></tr>";
  listMsg.textContent = "";
  try {
    const data = await fetchJSON(apiUrl('/api/clientes'));
    if (!Array.isArray(data)) throw new Error("Respuesta inesperada del servidor");
    tbody.innerHTML = data.map(rowView).join("") || "<tr><td colspan='6'>Sin registros</td></tr>";
  } catch (e) {
    tbody.innerHTML = "<tr><td colspan='6'>Error al cargar</td></tr>";
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
    await fetchJSON(apiUrl('/api/clientes'), {
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

document.querySelector("#clientes-table").addEventListener("click", async (ev) => {
  const tr = ev.target.closest("tr[data-id]");
  if (!tr) return;
  const id = tr.dataset.id;

  if (ev.target.classList.contains("btn-edit")) {
    // Cambia a modo edición
    const c = {
      id,
      nombre: tr.querySelector(".col-nombre").textContent,
      email: tr.querySelector(".col-email").textContent,
      telefono: tr.querySelector(".col-telefono").textContent
    };
    tr.outerHTML = rowEdit(c);
  }

  else if (ev.target.classList.contains("btn-cancel")) {
    // Volver a modo view sin guardar: recarga
    await loadClientes();
  }

  else if (ev.target.classList.contains("btn-save")) {
    // PUT /api/clientes/:id
    const nombre = tr.querySelector(".inp-nombre").value.trim();
    const email = tr.querySelector(".inp-email").value.trim();
    const telefono = tr.querySelector(".inp-telefono").value.trim();
    try {
      await fetchJSON(apiUrl(`/api/clientes/${id}`), {
        method: "PUT",
        body: JSON.stringify({ nombre, email, telefono })
      });
      await loadClientes();
    } catch (e) {
      alert("No se pudo actualizar: " + e.message);
    }
  }

  else if (ev.target.classList.contains("btn-delete")) {
    if (!confirm(`¿Eliminar cliente #${id}?`)) return;
    try {
      await fetchJSON(apiUrl(`/api/clientes/${id}`), { method: "DELETE" });
      await loadClientes();
    } catch (e) {
      alert("No se pudo eliminar: " + e.message);
    }
  }
});

// Arranque
loadClientes();
