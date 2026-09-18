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

    // Validamos que el formulario exista antes de asignar el evento submit
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombreInput = document.getElementById("nombre");
            const apellidoInput = document.getElementById("apellido");
            const telefonoInput = document.getElementById("telefono");
            const emailInput = document.getElementById("email");
            const confirmarContraseñaInput = document.getElementById("InputConfirmarContraseña");

            const nombre = nombreInput ? nombreInput.value.trim() : "";
            const apellido = apellidoInput ? apellidoInput.value.trim() : "";
            const telefono = telefonoInput ? telefonoInput.value.trim() : "";
            const email = emailInput ? emailInput.value.trim() : "";
            const contraseña = inputContraseña ? inputContraseña.value : "";
            const confirmarContraseña = confirmarContraseñaInput ? confirmarContraseñaInput.value : "";

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
    }
});