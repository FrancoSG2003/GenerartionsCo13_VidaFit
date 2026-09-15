document.addEventListener("DOMContentLoaded", () => {
    // Obtener la sesión activa
    const usuarioSesion = JSON.parse(localStorage.getItem("usuarioSesionActiva"));

    // Redirigir si no hay sesión activa
    if (!usuarioSesion) {
        window.location.href = "Login.html";
        return;
    }

    // Inicializar array de direcciones si no existe en la sesión
    if (!usuarioSesion.direcciones) {
        usuarioSesion.direcciones = [];
        // Si tenía una dirección en el formato antiguo, se migra al nuevo formato
        if (usuarioSesion.direccion && usuarioSesion.direccion.calle) {
            usuarioSesion.direcciones.push({
                id: Date.now(),
                etiqueta: "Principal",
                calle: usuarioSesion.direccion.calle,
                ciudad: usuarioSesion.direccion.ciudad,
                codigoPostal: usuarioSesion.direccion.codigoPostal,
                notas: usuarioSesion.direccion.notas,
                predeterminada: true
            });
            delete usuarioSesion.direccion;
        }
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
    const inputEtiqueta = document.getElementById("direccionEtiqueta");
    const inputCalle = document.getElementById("direccionCalle");
    const inputCiudad = document.getElementById("direccionCiudad");
    const inputCodigoPostal = document.getElementById("direccionCodigoPostal");
    const inputNotas = document.getElementById("direccionNotas");
    const checkPredeterminada = document.getElementById("direccionPredeterminada");
    const btnNuevaDireccion = document.getElementById("btnNuevaDireccion");
    const contenedorDirecciones = document.getElementById("listaDirecciones");

    // Cargar datos en el perfil
    function cargarDatosPerfil() {
        sidebarNombre.textContent = `${usuarioSesion.nombre || ''} ${usuarioSesion.apellido || ''}`.trim() || "Usuario";
        sidebarEmail.textContent = usuarioSesion.email || "";

        inputNombre.value = usuarioSesion.nombre || "";
        inputApellido.value = usuarioSesion.apellido || "";
        inputEmail.value = usuarioSesion.email || "";
        inputTelefono.value = usuarioSesion.telefono || "";

        renderizarDirecciones();
    }

    // Guardar en LocalStorage y Sincronizar
    function guardarEnStorage(usuarioActualizado) {
        localStorage.setItem("usuarioSesionActiva", JSON.stringify(usuarioActualizado));

        const listaUsuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const index = listaUsuarios.findIndex(u => u.email === usuarioActualizado.email);

        if (index !== -1) {
            listaUsuarios[index] = { ...listaUsuarios[index], ...usuarioActualizado };
            localStorage.setItem("usuarios", JSON.stringify(listaUsuarios));
        }
    }

    // Renderizar tarjetas de direcciones en la UI
    function renderizarDirecciones() {
        if (!contenedorDirecciones) return;
        contenedorDirecciones.innerHTML = "";

        if (usuarioSesion.direcciones.length === 0) {
            contenedorDirecciones.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-geo-alt text-muted fs-1"></i>
                    <p class="text-muted mt-2 mb-0">No tienes direcciones guardadas.</p>
                </div>`;
            return;
        }

        usuarioSesion.direcciones.forEach(dir => {
            const col = document.createElement("div");
            col.className = "col-md-6";
            col.innerHTML = `
                <div class="card h-100 border rounded-4 p-3 shadow-sm position-relative ${dir.predeterminada ? 'border-dark bg-light' : ''}">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge ${dir.predeterminada ? 'bg-dark' : 'bg-secondary'} rounded-pill">
                            ${dir.etiqueta || 'Dirección'} ${dir.predeterminada ? '(Predeterminada)' : ''}
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
                    <p class="fw-bold mb-1">${dir.calle}</p>
                    <p class="text-muted small mb-1"><i class="bi bi-building me-1"></i>${dir.ciudad} ${dir.codigoPostal ? '- ' + dir.codigoPostal : ''}</p>
                    ${dir.notas ? `<p class="text-muted small mb-2"><i class="bi bi-info-circle me-1"></i>${dir.notas}</p>` : ''}
                    
                    ${!dir.predeterminada ? `
                        <button class="btn btn-sm btn-outline-dark rounded-pill mt-auto align-self-start btn-marcar-predeterminada" data-id="${dir.id}">
                            Marcar como predeterminada
                        </button>
                    ` : ''}
                </div>
            `;
            contenedorDirecciones.appendChild(col);
        });

        asignarEventosDirecciones();
    }

    // Eventos Editar, Eliminar y Seleccionar Predeterminada
    function asignarEventosDirecciones() {
        document.querySelectorAll(".btn-editar").forEach(btn => {
            btn.addEventListener("click", () => abrirModalEditar(Number(btn.dataset.id)));
        });

        document.querySelectorAll(".btn-eliminar").forEach(btn => {
            btn.addEventListener("click", () => eliminarDireccion(Number(btn.dataset.id)));
        });

        document.querySelectorAll(".btn-marcar-predeterminada").forEach(btn => {
            btn.addEventListener("click", () => marcarPredeterminada(Number(btn.dataset.id)));
        });
    }

    // Limpiar modal y abrir
    btnNuevaDireccion?.addEventListener("click", () => {
        formDireccion.reset();
        inputId.value = "";
        document.getElementById("modalDireccionLabel").textContent = "Agregar Dirección";
        checkPredeterminada.checked = usuarioSesion.direcciones.length === 0;
        modalDireccion.show();
    });

    // Abrir Modal con datos para editar
    function abrirModalEditar(id) {
        const dir = usuarioSesion.direcciones.find(d => d.id === id);
        if (!dir) return;

        inputId.value = dir.id;
        inputEtiqueta.value = dir.etiqueta || "";
        inputCalle.value = dir.calle || "";
        inputCiudad.value = dir.ciudad || "";
        inputCodigoPostal.value = dir.codigoPostal || "";
        inputNotas.value = dir.notas || "";
        checkPredeterminada.checked = !!dir.predeterminada;

        document.getElementById("modalDireccionLabel").textContent = "Editar Dirección";
        modalDireccion.show();
    }

    // Guardar (Agregar / Editar) Dirección desde Modal
    formDireccion?.addEventListener("submit", (e) => {
        e.preventDefault();

        const id = inputId.value ? Number(inputId.value) : Date.now();
        const esPredeterminada = checkPredeterminada.checked;

        if (esPredeterminada) {
            usuarioSesion.direcciones.forEach(d => d.predeterminada = false);
        }

        const nuevaDireccion = {
            id: id,
            etiqueta: inputEtiqueta.value.trim(),
            calle: inputCalle.value.trim(),
            ciudad: inputCiudad.value.trim(),
            codigoPostal: inputCodigoPostal.value.trim(),
            notas: inputNotas.value.trim(),
            predeterminada: esPredeterminada || usuarioSesion.direcciones.length === 0
        };

        const index = usuarioSesion.direcciones.findIndex(d => d.id === id);
        if (index !== -1) {
            usuarioSesion.direcciones[index] = nuevaDireccion;
        } else {
            usuarioSesion.direcciones.push(nuevaDireccion);
        }

        guardarEnStorage(usuarioSesion);
        modalDireccion.hide();
        renderizarDirecciones();

        Swal.fire({
            icon: 'success',
            title: '¡Dirección guardada!',
            timer: 1500,
            showConfirmButton: false
        });
    });

    // Marcar como predeterminada
    function marcarPredeterminada(id) {
        usuarioSesion.direcciones.forEach(d => {
            d.predeterminada = (d.id === id);
        });
        guardarEnStorage(usuarioSesion);
        renderizarDirecciones();
    }

    // Eliminar Dirección
    function eliminarDireccion(id) {
        Swal.fire({
            title: '¿Eliminar dirección?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33'
        }).then((result) => {
            if (result.isConfirmed) {
                usuarioSesion.direcciones = usuarioSesion.direcciones.filter(d => d.id !== id);

                // Si se eliminó la predeterminada y quedan direcciones, hacer la primera la predeterminada
                if (usuarioSesion.direcciones.length > 0 && !usuarioSesion.direcciones.some(d => d.predeterminada)) {
                    usuarioSesion.direcciones[0].predeterminada = true;
                }

                guardarEnStorage(usuarioSesion);
                renderizarDirecciones();

                Swal.fire('Eliminada', 'La dirección ha sido eliminada.', 'success');
            }
        });
    }

    // Guardar Información Personal
    document.getElementById("perfilDatosForm")?.addEventListener("submit", (e) => {
        e.preventDefault();

        usuarioSesion.nombre = inputNombre.value.trim();
        usuarioSesion.apellido = inputApellido.value.trim();
        usuarioSesion.telefono = inputTelefono.value.trim();

        if (inputPassword.value.trim() !== "") {
            usuarioSesion.password = inputPassword.value.trim();
        }

        guardarEnStorage(usuarioSesion);

        Swal.fire({
            icon: 'success',
            title: '¡Datos actualizados!',
            text: 'Tu información personal se ha guardado correctamente.',
            confirmButtonColor: '#22C55E'
        }).then(() => location.reload());
    });

    // Inicializar
    cargarDatosPerfil();
});