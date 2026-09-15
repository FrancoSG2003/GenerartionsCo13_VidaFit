document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registroForm");
    const btnVerContraseña = document.getElementById("verContraseña");
    const inputContraseña = document.getElementById("Inputcontraseña");

    if (btnVerContraseña && inputContraseña) {
        btnVerContraseña.addEventListener("click", () => {
            const tipo = inputContraseña.getAttribute("type") === "password" ? "text" : "password";
            inputContraseña.setAttribute("type", tipo);
            btnVerContraseña.classList.toggle("bi-eye");
            btnVerContraseña.classList.toggle("bi-eye-slash");
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const email = document.getElementById("email").value.trim();
        const contraseña = inputContraseña.value;
        const confirmarContraseña = document.getElementById("InputConfirmarContraseña").value;

        if (!nombre || !apellido || !telefono || !email || !contraseña || !confirmarContraseña) {
            Swal.fire("Error", "Todos los campos son obligatorios.", "error");
            return;
        }

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            Swal.fire("Error", "Por favor, introduce un correo electrónico válido.", "error");
            return;
        }

        const regexTelefono = /^[0-9]{7,15}$/;
        if (!regexTelefono.test(telefono)) {
            Swal.fire("Error", "El número de teléfono no es válido (introduce solo números, entre 7 y 15 dígitos).", "error");
            return;
        }

        if (contraseña !== confirmarContraseña) {
            Swal.fire("Error", "Las contraseñas no coinciden.", "error");
            return;
        }

        // Mapeo adaptado a UsuarioRequestDTO (nombre, correo, contrasena)
        const usuarioObjeto = {
            nombre: `${nombre} ${apellido}`,
            correo: email,
            contrasena: contraseña
        };

        try {
            const response = await fetch("https://backend-vidafit.onrender.com/api/usuarios", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(usuarioObjeto)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const mensajeError = errorData?.message || "Ocurrió un error al registrar el usuario en el servidor.";
                throw new Error(mensajeError);
            }

            const usuarioCreado = await response.json();

            Swal.fire({
                title: "¡Registro exitoso!",
                text: `Bienvenido/a ${usuarioCreado.nombre}`,
                icon: "success",
                draggable: true
            }).then(() => {
                form.reset();
                window.location.href = "Login.html";
            });

        } catch (error) {
            console.error("Error en la petición de registro:", error);
            Swal.fire("Error", error.message || "No se pudo conectar con el servidor.", "error");
        }
    });
});