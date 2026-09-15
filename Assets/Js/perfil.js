document.addEventListener("DOMContentLoaded", () => {
    // Configuración de endpoints mapeados a DireccionController y UsuarioController
    const BASE_URL = "https://backend-vidafit.onrender.com/api";
    const ENDPOINTS = {
        DIRECCIONES_USUARIO: (usuarioId) => `${BASE_URL}/direcciones/usuario/${usuarioId}`,
        DIRECCIONES: `${BASE_URL}/direcciones`,
        DIRECCION_POR_ID: (id) => `${BASE_URL}/direcciones/${id}`,
        USUARIO_POR_ID: (id) => `${BASE_URL}/usuarios/${id}`
    };

    // Obtención de la sesión del usuario en LocalStorage (Solo para identificación)
    const usuarioSesion = JSON.parse(localStorage.getItem("usuarioSesionActiva"));

    if (!usuarioSesion || !usuarioSesion.id) {
        window.location.href = "Login.html";
        return;
    }

    // Modal Instance
    const modalElement = document.getElementById("modalDireccion");
    const modalDireccion = modalElement ? new bootstrap.Modal(modalElement) : null;

    // Elementos DOM - Usuario
    const sidebarNombre = document.getElementById("profileSidebarNombre");
    const sidebarEmail = document.getElementById("profileSidebarEmail");
    const inputNombre = document.getElementById("perfilNombre");
    const inputApellido = document.getElementById("perfilApellido");
    const inputEmail = document.getElementById("perfilEmail");
    const inputTelefono = document.getElementById("perfilTelefono");
    const inputPassword = document.getElementById("perfilPassword");

    // Elementos DOM - Formulario Dirección Modal
    const formDireccion = document.getElementById("perfilDireccionForm");
    const inputId = document.getElementById("direccionId");
    const inputDireccionExacta = document.getElementById("direccionCalle");
    const inputBarrio = document.getElementById("direccionEtiqueta");
    const inputComuna = document.getElementById("direccionNotas");
    const inputCiudad = document.getElementById("direccionCiudad");
    const inputDepartamento = document.getElementById("direccionCodigoPostal");

    const btnNuevaDireccion = document.getElementById("btnNuevaDireccion");
    const contenedorDirecciones = document.getElementById("listaDirecciones");

    // Arreglo local en memoria sólo para pintado dinámico de UI
    let direccionesUsuario = [];

    function cargarDatosPerfil() {
        sidebarNombre.textContent = `${usuarioSesion.nombre || ''} ${usuarioSesion.apellido || ''}`.trim() || "Usuario";
        sidebarEmail.textContent = usuarioSesion.email || "";

        inputNombre.value = usuarioSesion.nombre || "";
        inputApellido.value = usuarioSesion.apellido || "";
        inputEmail.value = usuarioSesion.email || "";
        inputTelefono.value = usuarioSesion.telefono || "";

        obtenerDireccionesBackend();
    }

    // Consume @GetMapping("/usuario/{usuarioId}")
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
                    <p class="text-muted mt-2 mb-0">No tienes direcciones guardadas en la base de datos.</p>
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
                        <i class="bi bi-building me-1"></i>${dir.ciudad || ''} ${dir.departamento ? '- ' + dir.departamento : ''}
                    </p>
                    ${dir.comuna ? `<p class="text-muted small mb-0"><i class="bi bi-geo me-1"></i>Comuna/Sector: ${dir.comuna}</p>` : ''}
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
        formDireccion.reset();
        inputId.value = "";
        document.getElementById("modalDireccionLabel").textContent = "Agregar Dirección";
        modalDireccion.show();
    });

    function abrirModalEditar(id) {
        const dir = direccionesUsuario.find(d => d.id === id);
        if (!dir) return;

        inputId.value = dir.id;
        inputDireccionExacta.value = dir.direccionExacta || "";
        inputBarrio.value = dir.barrio || "";
        inputComuna.value = dir.comuna || "";
        inputCiudad.value = dir.ciudad || "";
        inputDepartamento.value = dir.departamento || "";

        document.getElementById("modalDireccionLabel").textContent = "Editar Dirección";
        modalDireccion.show();
    }

    // Consume @PostMapping y @PutMapping("/{id}")
    formDireccion?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = inputId.value ? Number(inputId.value) : null;

        const payload = {
            userId: usuarioSesion.id,
            direccionExacta: inputDireccionExacta.value.trim(),
            barrio: inputBarrio.value.trim(),
            comuna: inputComuna.value.trim(),
            ciudad: inputCiudad.value.trim(),
            departamento: inputDepartamento.value.trim()
        };

        const url = id ? ENDPOINTS.DIRECCION_POR_ID(id) : ENDPOINTS.DIRECCIONES;
        const method = id ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Error al guardar en el servidor.");

            modalDireccion.hide();
            await obtenerDireccionesBackend();

            Swal.fire({
                icon: 'success',
                title: id ? '¡Dirección actualizada!' : '¡Dirección guardada!',
                timer: 1500,
                showConfirmButton: false
            });

        } catch (error) {
            console.error("Error al guardar la dirección:", error);
            Swal.fire("Error", "No se pudo persitir la dirección en la base de datos.", "error");
        }
    });

    // Consume @DeleteMapping("/{id}")
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
                    const response = await fetch(ENDPOINTS.DIRECCION_POR_ID(id), {
                        method: "DELETE"
                    });

                    if (!response.ok) {
                        throw new Error("No se puede eliminar la dirección porque está asociada a un pedido activo.");
                    }

                    await obtenerDireccionesBackend();
                    Swal.fire('Eliminada', 'La dirección fue eliminada con éxito.', 'success');

                } catch (error) {
                    console.error("Error al eliminar la dirección:", error);
                    Swal.fire("Error", error.message || "No se pudo eliminar la dirección.", "error");
                }
            }
        });
    }

    // Actualizar datos del usuario
    document.getElementById("perfilDatosForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombreCompleto = `${inputNombre.value.trim()} ${inputApellido.value.trim()}`.trim();

        const payloadUsuario = {
            nombre: nombreCompleto,
            correo: inputEmail.value.trim(),
            contrasena: inputPassword.value.trim() !== "" ? inputPassword.value.trim() : null
        };

        try {
            const response = await fetch(ENDPOINTS.USUARIO_POR_ID(usuarioSesion.id), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadUsuario)
            });

            if (!response.ok) throw new Error("Error al actualizar la información personal.");

            const usuarioActualizado = await response.json();

            usuarioSesion.nombre = inputNombre.value.trim();
            usuarioSesion.apellido = inputApellido.value.trim();
            usuarioSesion.email = usuarioActualizado.correo || usuarioSesion.email;
            localStorage.setItem("usuarioSesionActiva", JSON.stringify(usuarioSesion));

            Swal.fire({
                icon: 'success',
                title: '¡Datos actualizados!',
                text: 'La información del usuario se actualizó correctamente.',
                confirmButtonColor: '#22C55E'
            }).then(() => location.reload());

        } catch (error) {
            console.error("Error al actualizar datos personales:", error);
            Swal.fire("Error", "No se pudieron actualizar los datos del usuario.", "error");
        }
    });

    cargarDatosPerfil();
});