document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "https://backend-vidafit.onrender.com/api";
    const ENDPOINTS = {
        DIRECCIONES_USUARIO: (id) => `${BASE_URL}/direcciones/usuario/${id}`,
        DIRECCIONES: `${BASE_URL}/direcciones`,
        DIRECCION_POR_ID: (id) => `${BASE_URL}/direcciones/${id}`,
        USUARIO_POR_ID: (id) => `${BASE_URL}/usuarios/${id}`
    };

    const usuarioSesion = JSON.parse(localStorage.getItem("usuarioSesionActiva"));

    if (!usuarioSesion?.id) {
        window.location.href = "Login.html";
        return;
    }

    const modalElement = document.getElementById("modalDireccion");
    const modalDireccion = modalElement ? new bootstrap.Modal(modalElement) : null;

    // Agrupación de Elementos DOM
    const els = {
        sidebarNombre: document.getElementById("profileSidebarNombre"),
        sidebarEmail: document.getElementById("profileSidebarEmail"),
        nombre: document.getElementById("perfilNombre"),
        apellido: document.getElementById("perfilApellido"),
        email: document.getElementById("perfilEmail"),
        telefono: document.getElementById("perfilTelefono"),
        password: document.getElementById("perfilPassword"),
        formDir: document.getElementById("perfilDireccionForm"),
        dirId: document.getElementById("direccionId"),
        dirExacta: document.getElementById("direccionExacta"),
        barrio: document.getElementById("barrio"),
        comuna: document.getElementById("comuna"),
        ciudad: document.getElementById("ciudad"),
        depto: document.getElementById("departamento"),
        btnNuevaDir: document.getElementById("btnNuevaDireccion"),
        contenedorDir: document.getElementById("listaDirecciones"),
        formDatos: document.getElementById("perfilDatosForm")
    };

    let direccionesUsuario = [];

    const cargarDatosPerfil = () => {
        const { nombre = "", apellido = "", email = "", telefono = "" } = usuarioSesion;
        
        if (els.sidebarNombre) els.sidebarNombre.textContent = `${nombre} ${apellido}`.trim() || "Usuario";
        if (els.sidebarEmail) els.sidebarEmail.textContent = email;

        if (els.nombre) els.nombre.value = nombre;
        if (els.apellido) els.apellido.value = apellido;
        if (els.email) els.email.value = email;
        if (els.telefono) els.telefono.value = telefono;

        obtenerDireccionesBackend();
    };

    const obtenerDireccionesBackend = async () => {
        try {
            const response = await fetch(ENDPOINTS.DIRECCIONES_USUARIO(usuarioSesion.id));
            if (!response.ok) throw new Error("Error al obtener las direcciones.");

            direccionesUsuario = await response.json();

            // --- SINCRONIZACIÓN CON LOCALSTORAGE ---
            if (direccionesUsuario?.length > 0) {
                localStorage.setItem("direccionId", direccionesUsuario[0].id);
            } else {
                localStorage.removeItem("direccionId");
            }

            renderizarDirecciones();
        } catch (error) {
            console.error("Error al obtener direcciones:", error);
            if (els.contenedorDir) {
                els.contenedorDir.innerHTML = `<div class="col-12 text-center py-4"><p class="text-danger">No se pudieron cargar las direcciones desde el servidor.</p></div>`;
            }
        }
    };

    const renderizarDirecciones = () => {
        if (!els.contenedorDir) return;

        if (!direccionesUsuario.length) {
            els.contenedorDir.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-geo-alt text-muted fs-1"></i>
                    <p class="text-muted mt-2 mb-0">No tienes direcciones guardadas en tu cuenta.</p>
                </div>`;
            return;
        }

        els.contenedorDir.innerHTML = direccionesUsuario.map(dir => `
            <div class="col-md-6">
                <div class="card h-100 border rounded-4 p-3 shadow-sm position-relative">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-dark rounded-pill">${dir.barrio ? 'Barrio: ' + dir.barrio : 'Dirección'}</span>
                        <div>
                            <button class="btn btn-sm btn-link text-dark p-0 me-2 btn-editar" data-id="${dir.id}"><i class="bi bi-pencil-square fs-6"></i></button>
                            <button class="btn btn-sm btn-link text-danger p-0 btn-eliminar" data-id="${dir.id}"><i class="bi bi-trash fs-6"></i></button>
                        </div>
                    </div>
                    <p class="fw-bold mb-1">${dir.direccionExacta || ''}</p>
                    <p class="text-muted small mb-1"><i class="bi bi-building me-1"></i>${dir.ciudad || ''}${dir.departamento ? ', ' + dir.departamento : ''}</p>
                    ${dir.comuna ? `<p class="text-muted small mb-0"><i class="bi bi-geo me-1"></i>Sector/Comuna: ${dir.comuna}</p>` : ''}
                </div>
            </div>
        `).join('');

        document.querySelectorAll(".btn-editar").forEach(btn => btn.addEventListener("click", (e) => abrirModalEditar(Number(e.currentTarget.dataset.id))));
        document.querySelectorAll(".btn-eliminar").forEach(btn => btn.addEventListener("click", (e) => eliminarDireccionBackend(Number(e.currentTarget.dataset.id))));
    };

    els.btnNuevaDir?.addEventListener("click", () => {
        els.formDir?.reset();
        if (els.dirId) els.dirId.value = "";
        const labelModal = document.getElementById("modalDireccionLabel");
        if (labelModal) labelModal.textContent = "Agregar Dirección";
        modalDireccion?.show();
    });

    const abrirModalEditar = (id) => {
        const dir = direccionesUsuario.find(d => d.id === id);
        if (!dir) return;

        if (els.dirId) els.dirId.value = dir.id;
        if (els.dirExacta) els.dirExacta.value = dir.direccionExacta || "";
        if (els.barrio) els.barrio.value = dir.barrio || "";
        if (els.comuna) els.comuna.value = dir.comuna || "";
        if (els.ciudad) els.ciudad.value = dir.ciudad || "";
        if (els.depto) els.depto.value = dir.departamento || "";

        const labelModal = document.getElementById("modalDireccionLabel");
        if (labelModal) labelModal.textContent = "Editar Dirección";
        modalDireccion?.show();
    };

    els.formDir?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const rawId = els.dirId?.value?.trim();
        const id = (rawId && !isNaN(rawId) && Number(rawId) > 0) ? Number(rawId) : null;

        const payload = {
            userId: usuarioSesion.id,
            direccionExacta: els.dirExacta?.value?.trim() || "",
            barrio: els.barrio?.value?.trim() || "",
            comuna: els.comuna?.value?.trim() || "",
            ciudad: els.ciudad?.value?.trim() || "",
            departamento: els.depto?.value?.trim() || ""
        };

        try {
            const response = await fetch(id ? ENDPOINTS.DIRECCION_POR_ID(id) : ENDPOINTS.DIRECCIONES, {
                method: id ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Error al procesar la solicitud.");

            modalDireccion?.hide();
            await obtenerDireccionesBackend(); // Esto refresca la lista y sincroniza el localStorage

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

    const eliminarDireccionBackend = (id) => {
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
    };

    els.formDatos?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = els.nombre?.value?.trim() || "";
        const apellido = els.apellido?.value?.trim() || "";
        const password = els.password?.value?.trim() || "";

        const payloadUsuario = {
            nombre: `${nombre} ${apellido}`.trim(),
            correo: els.email?.value?.trim() || "",
            contrasena: password || null
        };

        try {
            const response = await fetch(ENDPOINTS.USUARIO_POR_ID(usuarioSesion.id), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadUsuario)
            });

            if (!response.ok) throw new Error("Error al actualizar información personal.");

            const usuarioActualizado = await response.json();

            // Actualizar datos locales
            Object.assign(usuarioSesion, { 
                nombre, 
                apellido, 
                email: usuarioActualizado.correo || usuarioSesion.email 
            });
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