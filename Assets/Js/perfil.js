document.addEventListener("DOMContentLoaded", () => {
    // 1. Validar sesión activa (Si no hay sesión, expulsa al Login)
    const usuarioSesionActiva = JSON.parse(localStorage.getItem("usuarioSesionActiva"));

    if (!usuarioSesionActiva) {
        window.location.href = "Login.html";
        return;
    }

    // 2. Elementos del DOM
    const sidebarNombre = document.getElementById("profileSidebarNombre");
    const sidebarEmail = document.getElementById("profileSidebarEmail");

    const perfilDatosForm = document.getElementById("perfilDatosForm");
    const inputNombre = document.getElementById("perfilNombre");
    const inputApellido = document.getElementById("perfilApellido");
    const inputEmail = document.getElementById("perfilEmail");
    const inputTelefono = document.getElementById("perfilTelefono");
    const inputPassword = document.getElementById("perfilPassword");

    // 3. Cargar los datos del usuario en la vista
    function cargarDatos() {
        // Nombre del sidebar
        if (sidebarNombre) {
            sidebarNombre.textContent = `${usuarioSesionActiva.nombre || ''} ${usuarioSesionActiva.apellido || ''}`.trim() || "Usuario";
        }
        
        // Email del sidebar
        if (sidebarEmail) {
            sidebarEmail.textContent = usuarioSesionActiva.email || "";
        }

        // Formulario de datos personales
        if (inputNombre) inputNombre.value = usuarioSesionActiva.nombre || "";
        if (inputApellido) inputApellido.value = usuarioSesionActiva.apellido || "";
        if (inputEmail) inputEmail.value = usuarioSesionActiva.email || "";
        if (inputTelefono) inputTelefono.value = usuarioSesionActiva.telefono || "";
    }

    // 4. Guardar cambios del formulario de Información Personal
    if (perfilDatosForm) {
        perfilDatosForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Actualizar el objeto en memoria
            usuarioSesionActiva.nombre = inputNombre.value.trim();
            usuarioSesionActiva.apellido = inputApellido.value.trim();
            usuarioSesionActiva.telefono = inputTelefono.value.trim();

            if (inputPassword && inputPassword.value.trim() !== "") {
                usuarioSesionActiva.password = inputPassword.value.trim();
            }

            // Guardar cambios en el localStorage de la sesión
            localStorage.setItem("usuarioSesionActiva", JSON.stringify(usuarioSesionActiva));

            // Actualizar también en la lista global de usuarios registrados
            const usuariosGuardados = JSON.parse(localStorage.getItem("usuarios")) || [];
            const index = usuariosGuardados.findIndex(u => u.email === usuarioSesionActiva.email);

            if (index !== -1) {
                usuariosGuardados[index] = { ...usuariosGuardados[index], ...usuarioSesionActiva };
                localStorage.setItem("usuarios", JSON.stringify(usuariosGuardados));
            }

            // Notificación al usuario
            if (typeof Swal !== "undefined") {
                Swal.fire({
                    title: "¡Datos actualizados!",
                    text: "Tu información personal se ha guardado correctamente.",
                    icon: "success",
                    confirmButtonColor: "#22C55E"
                }).then(() => {
                    window.location.reload(); // Recarga para refrescar el menú lateral y la Navbar
                });
            } else {
                alert("Datos actualizados correctamente.");
                window.location.reload();
            }
        });
    }

    // Ejecutar la carga de datos
    cargarDatos();
});