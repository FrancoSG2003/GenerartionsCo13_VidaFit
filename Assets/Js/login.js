document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const emailInput = document.getElementById("email").value.trim();
        const passwordInput = document.getElementById("password").value;

        if (!emailInput || !passwordInput) {
            alert("Error: Por favor, complete todos los campos.");
            return;
        }

        const usuariosGuardados = JSON.parse(localStorage.getItem("usuarios")) || [];
        const usuarioUnico = JSON.parse(localStorage.getItem("usuarioRegistrado"));

        let usuarioEncontrado = null;

        if (usuariosGuardados.length > 0) {
            usuarioEncontrado = usuariosGuardados.find(
                u => u.email === emailInput && u.contraseña === passwordInput
            );
        } else if (usuarioUnico) {
            if (usuarioUnico.email === emailInput && usuarioUnico.contraseña === passwordInput) {
                usuarioEncontrado = usuarioUnico;
            }
        }

        if (usuarioEncontrado) {
            alert("¡Inicio de sesión exitoso! Bienvenido de nuevo, " + (usuarioEncontrado.nombreCompleto || "Usuario"));
            localStorage.setItem("usuarioSesionActiva", JSON.stringify(usuarioEncontrado));
            window.location.href = "index.html";
        } else {
            alert("Error: Nombre de usuario (email) o contraseña inválidos.");
        }
    });
});