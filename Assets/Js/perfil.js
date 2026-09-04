document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtener la sesión activa
    const usuarioSesion = JSON.parse(localStorage.getItem("usuarioSesionActiva"));

    // Redirigir si no hay sesión activa
    if (!usuarioSesion) {
        window.location.href = "Login.html";
        return;
    }

    // 2. Elementos del DOM
    const sidebarNombre = document.getElementById("profileSidebarNombre");
    const sidebarEmail = document.getElementById("profileSidebarEmail");

    const inputNombre = document.getElementById("perfilNombre");
    const inputApellido = document.getElementById("perfilApellido");
    const inputEmail = document.getElementById("perfilEmail");
    const inputTelefono = document.getElementById("perfilTelefono");
    const inputPassword = document.getElementById("perfilPassword");

    const inputCalle = document.getElementById("direccionCalle");
    const inputCiudad = document.getElementById("direccionCiudad");
    const inputCodigoPostal = document.getElementById("direccionCodigoPostal");
    const inputNotas = document.getElementById("direccionNotas");

    // 3. Cargar datos guardados en la interfaz
    function cargarDatosPerfil() {
        sidebarNombre.textContent = `${usuarioSesion.nombre || ''} ${usuarioSesion.apellido || ''}`.trim() || "Usuario";
        sidebarEmail.textContent = usuarioSesion.email || "";

        inputNombre.value = usuarioSesion.nombre || "";
        inputApellido.value = usuarioSesion.apellido || "";
        inputEmail.value = usuarioSesion.email || "";
        inputTelefono.value = usuarioSesion.telefono || "";

        // Cargar Dirección si existe
        if (usuarioSesion.direccion) {
            inputCalle.value = usuarioSesion.direccion.calle || "";
            inputCiudad.value = usuarioSesion.direccion.ciudad || "";
            inputCodigoPostal.value = usuarioSesion.direccion.codigoPostal || "";
            inputNotas.value = usuarioSesion.direccion.notas || "";
        }
    }

    // 4. Función centralizada para guardar y sincronizar con localStorage
    function guardarEnStorage(usuarioActualizado) {
        // Actualizar sesión activa
        localStorage.setItem("usuarioSesionActiva", JSON.stringify(usuarioActualizado));

        // Sincronizar en la lista general de usuarios
        const listaUsuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const index = listaUsuarios.findIndex(u => u.email === usuarioActualizado.email);

        if (index !== -1) {
            listaUsuarios[index] = { ...listaUsuarios[index], ...usuarioActualizado };
            localStorage.setItem("usuarios", JSON.stringify(listaUsuarios));
        }
    }

    // 5. Guardar Información Personal
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

    // 6. Guardar Dirección de Envío
    document.getElementById("perfilDireccionForm")?.addEventListener("submit", (e) => {
        e.preventDefault();

        usuarioSesion.direccion = {
            calle: inputCalle.value.trim(),
            ciudad: inputCiudad.value.trim(),
            codigoPostal: inputCodigoPostal.value.trim(),
            notas: inputNotas.value.trim()
        };

        guardarEnStorage(usuarioSesion);

        Swal.fire({
            icon: 'success',
            title: '¡Dirección guardada!',
            text: 'Tu dirección de envío se ha actualizado.',
            confirmButtonColor: '#22C55E'
        });
    });

    // Inicializar
    cargarDatosPerfil();
});