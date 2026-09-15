document.addEventListener("DOMContentLoaded", () => {
    const verContraseña = document.getElementById("verContraseña");
    const passwordInput = document.getElementById("password");

    if (verContraseña && passwordInput) {
        verContraseña.addEventListener("click", () => {
            const isPassword = passwordInput.getAttribute("type") === "password";
            passwordInput.setAttribute("type", isPassword ? "text" : "password");

            verContraseña.classList.toggle("bi-eye");
            verContraseña.classList.toggle("bi-eye-slash");
        });
    }

    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById("email").value.trim();
        const passwordValue = passwordInput.value;

        if (!emailInput || !passwordValue) {
            Swal.fire("Error", "Por favor, complete todos los campos.", "error");
            return;
        }

        // Mapeo adaptado a LoginDTO (correo, contrasena)
        const datosLogin = {
            correo: emailInput,
            contrasena: passwordValue
        };

        try {
            const response = await fetch("https://backend-vidafit.onrender.com/api/usuarios/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosLogin)
            });

            if (response.status === 401) {
                throw new Error("Nombre de usuario (email) o contraseña inválidos.");
            }

            if (!response.ok) {
                throw new Error("Error al conectar con el servidor de autenticación.");
            }

            const usuarioEncontrado = await response.json(); // Devuelve UsuarioResponseDTO

            // Extraer el primer rol del arreglo o asignar un rol por defecto
            const rolPrincipal = usuarioEncontrado.roles && usuarioEncontrado.roles.length > 0
                ? usuarioEncontrado.roles[0]
                : "USER";

            Swal.fire({
                icon: "success",
                title: "¡Inicio de sesión exitoso!",
                text: "Bienvenido de nuevo, " + usuarioEncontrado.nombre,
                confirmButtonText: "Continuar"
            }).then(() => {
                // Guardar la información devuelta por la API para mantener la sesión activa
                localStorage.setItem("usuarioSesionActiva", JSON.stringify(usuarioEncontrado));
                localStorage.setItem("userRole", rolPrincipal);
                window.location.href = "index.html";
            });

        } catch (error) {
            console.error("Error en la petición de login:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "No se pudo autenticar con el servidor.",
                confirmButtonText: "Intentar nuevamente"
            });
        }
    });
});