document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "https://backend-vidafit.onrender.com/api";
    const ENDPOINTS = {
        DIRECCIONES_USUARIO: (usuarioId) => `${BASE_URL}/direcciones/usuario/${usuarioId}`,
        DIRECCIONES: `${BASE_URL}/direcciones`,
        DIRECCION_POR_ID: (id) => `${BASE_URL}/direcciones/${id}`,
        USUARIO_POR_ID: (id) => `${BASE_URL}/usuarios/${id}`
    };

    const usuarioSesion = JSON.parse(localStorage.getItem("usuarioSesionActiva"));

    if (!usuarioSesion || !usuarioSesion.id) {
        window.location.href = "Login.html";
        return;
    }

    const modalElement = document.getElementById("modalDireccion");
    const modalDireccion = modalElement ? new bootstrap.Modal(modalElement) : null;

    // Elementos DOM - Datos Usuario
    const sidebarNombre = document.getElementById("profileSidebarNombre");
    const sidebarEmail = document.getElementById("profileSidebarEmail");
    const inputNombre = document.getElementById("perfilNombre");
    const inputApellido = document.getElementById("perfilApellido");
    const inputEmail = document.getElementById("perfilEmail");
    const inputTelefono = document.getElementById("perfilTelefono");
    const inputPassword = document.getElementById("perfilPassword");

    // Elementos DOM - Formulario Dirección (Sincronizados con el DTO/Modelo)
    const formDireccion = document.getElementById("perfilDireccionForm");
    const inputId = document.getElementById("direccionId");
    const inputDireccionExacta = document.getElementById("direccionExacta");
    const inputBarrio = document.getElementById("barrio");
    const inputComuna = document.getElementById("comuna");
    const inputCiudad = document.getElementById("ciudad");
    const inputDepartamento = document.getElementById("departamento");

    const btnNuevaDireccion = document.getElementById("btnNuevaDireccion");
    const contenedorDirecciones = document.getElementById("listaDirecciones");

    let direccionesUsuario = [];

    function cargarDatosPerfil() {
        if (sidebarNombre) sidebarNombre.textContent = `${usuarioSesion.nombre || ''} ${usuarioSesion.apellido || ''}`.trim() || "Usuario";
        if (sidebarEmail) sidebarEmail.textContent = usuarioSesion.email || "";

        if (inputNombre) inputNombre.value = usuarioSesion.nombre || "";
        if (inputApellido) inputApellido.value = usuarioSesion.apellido || "";
        if (inputEmail) inputEmail.value = usuarioSesion.email || "";
        if (inputTelefono) inputTelefono.value = usuarioSesion.telefono || "";

        obtenerDireccionesBackend();
    }

    async function obtenerDireccionesBackend() {
        try {
            const response = await fetch(ENDPOINTS.DIRECCIONES_USUARIO(usuarioSesion.id));
            if (!response.ok) throw new Error("Error al obtener las direcciones.");

            direccionesUsuario = await response.json();
            renderizarDirecciones();
        } catch (error) {
            console.error("Error al obtener direcciones:", error);
            if (contenedorDirecciones) {
                contenedorDirecciones.innerHTML = `
                    <div class="col-12 text-center py-4">
                        <p class="text-danger">No se pudieron cargar las direcciones desde el servidor.</p>
                    </div>`;
            }
        }
    }

    function renderizarDirecciones() {
        if (!contenedorDirecciones) return;
        contenedorDirecciones.innerHTML = "";

        if (direccionesUsuario.length === 0) {
            contenedorDirecciones.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-geo-alt text-muted fs-1"></i>
                    <p class="text-muted mt-2 mb-0">No tienes direcciones guardadas en tu cuenta.</p>
                </div>`;
            return;
        }

        direccionesUsuario.forEach(dir => {
            const col = document.createElement("div");
            col.className = "col-md-6";
            col.innerHTML = `
                <div class="card h-100 border rounded-4 p-3 shadow-sm position-relative">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-dark rounded-pill">
                            ${dir.barrio ? 'Barrio: ' + dir.barrio : 'Dirección'}
                        </span>
                        <div>
                            <button class="btn btn-sm btn-link text-dark p-0 me-2 btn-editar" data-id="${dir.id}">
                                <i class="bi bi-pencil-square fs-6"></i>
                            </button>
                            <button class="btn btn-sm btn-link text-danger p-0 btn-eliminar" data-id="${dir.id}">
                                <i class="bi bi-trash fs-6"></i>
                            </button>
                        </div>
                    </div>
                    <p class="fw-bold mb-1">${dir.direccionExacta || ''}</p>
                    <p class="text-muted small mb-1">
                        <i class="bi bi-building me-1"></i>${dir.ciudad || ''}${dir.departamento ? ', ' + dir.departamento : ''}
                    </p>
                    ${dir.comuna ? `<p class="text-muted small mb-0"><i class="bi bi-geo me-1"></i>Sector/Comuna: ${dir.comuna}</p>` : ''}
                </div>
            `;
            contenedorDirecciones.appendChild(col);
        });

        asignarEventosDirecciones();
    }

    function asignarEventosDirecciones() {
        document.querySelectorAll(".btn-editar").forEach(btn => {
            btn.addEventListener("click", () => abrirModalEditar(Number(btn.dataset.id)));
        });

        document.querySelectorAll(".btn-eliminar").forEach(btn => {
            btn.addEventListener("click", () => eliminarDireccionBackend(Number(btn.dataset.id)));
        });
    }

    btnNuevaDireccion?.addEventListener("click", () => {
        formDireccion?.reset();
        if (inputId) inputId.value = "";
        const labelModal = document.getElementById("modalDireccionLabel");
        if (labelModal) labelModal.textContent = "Agregar Dirección";
        modalDireccion?.show();
    });

    function abrirModalEditar(id) {
        const dir = direccionesUsuario.find(d => d.id === id);
        if (!dir) return;

        if (inputId) inputId.value = dir.id;
        if (inputDireccionExacta) inputDireccionExacta.value = dir.direccionExacta || "";
        if (inputBarrio) inputBarrio.value = dir.barrio || "";
        if (inputComuna) inputComuna.value = dir.comuna || "";
        if (inputCiudad) inputCiudad.value = dir.ciudad || "";
        if (inputDepartamento) inputDepartamento.value = dir.departamento || "";

        const labelModal = document.getElementById("modalDireccionLabel");
        if (labelModal) labelModal.textContent = "Editar Dirección";
        modalDireccion?.show();
    }

    formDireccion?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = inputId?.value ? Number(inputId.value) : null;

        const payload = {
            usuarioId: usuarioSesion.id,
            direccionExacta: inputDireccionExacta?.value ? inputDireccionExacta.value.trim() : "",
            barrio: inputBarrio?.value ? inputBarrio.value.trim() : "",
            comuna: inputComuna?.value ? inputComuna.value.trim() : "",
            ciudad: inputCiudad?.value ? inputCiudad.value.trim() : "",
            departamento: inputDepartamento?.value ? inputDepartamento.value.trim() : ""
        };

        const url = id ? ENDPOINTS.DIRECCION_POR_ID(id) : ENDPOINTS.DIRECCIONES;
        const method = id ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Error al procesar la solicitud.");

            modalDireccion?.hide();
            await obtenerDireccionesBackend();

            Swal.fire({
                icon: 'success',
                title: id ? '¡Dirección actualizada!' : '¡Dirección registrada!',
                timer: 1500,
                showConfirmButton: false
            });

        } catch (error) {
            console.error("Error al guardar la dirección:", error);
            Swal.fire("Error", "No se pudo guardar la dirección en el servidor.", "error");
        }
    });

    function eliminarDireccionBackend(id) {
        Swal.fire({
            title: '¿Eliminar dirección?',
            text: 'Esta acción borrará el registro de la base de datos.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(ENDPOINTS.DIRECCION_POR_ID(id), { method: "DELETE" });

                    if (!response.ok) throw new Error("No se pudo eliminar la dirección.");

                    await obtenerDireccionesBackend();
                    Swal.fire('Eliminada', 'La dirección fue eliminada con éxito.', 'success');

                } catch (error) {
                    console.error("Error al eliminar la dirección:", error);
                    Swal.fire("Error", "No se pudo eliminar la dirección del servidor.", "error");
                }
            }
        });
    }

    document.getElementById("perfilDatosForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombreVal = inputNombre?.value ? inputNombre.value.trim() : "";
        const apellidoVal = inputApellido?.value ? inputApellido.value.trim() : "";
        const emailVal = inputEmail?.value ? inputEmail.value.trim() : "";
        const passwordVal = inputPassword?.value ? inputPassword.value.trim() : "";

        const nombreCompleto = `${nombreVal} ${apellidoVal}`.trim();

        const payloadUsuario = {
            nombre: nombreCompleto,
            correo: emailVal,
            contrasena: passwordVal !== "" ? passwordVal : null
        };

        try {
            const response = await fetch(ENDPOINTS.USUARIO_POR_ID(usuarioSesion.id), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadUsuario)
            });

            if (!response.ok) throw new Error("Error al actualizar información personal.");

            const usuarioActualizado = await response.json();

            usuarioSesion.nombre = nombreVal;
            usuarioSesion.apellido = apellidoVal;
            usuarioSesion.email = usuarioActualizado.correo || usuarioSesion.email;
            localStorage.setItem("usuarioSesionActiva", JSON.stringify(usuarioSesion));

            Swal.fire({
                icon: 'success',
                title: '¡Datos actualizados!',
                text: 'Información del usuario actualizada con éxito.',
                confirmButtonColor: '#22C55E'
            }).then(() => location.reload());

        } catch (error) {
            console.error("Error al actualizar datos personales:", error);
            Swal.fire("Error", "No se pudieron actualizar los datos personales.", "error");
        }
    });

    cargarDatosPerfil();
});