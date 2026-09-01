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

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const telefono = document.getElementById("telefono").value.trim()
        const email = document.getElementById("email").value.trim();
        const contraseña = inputContraseña.value;
        const confirmarContraseña = document.getElementById("InputConfirmarContraseña").value;

        if (!nombre || !apellido || !telefono || !email || !contraseña || !confirmarContraseña) {
            alert("Error: Todos los campos son obligatorios.");
            return;
        }

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            alert("Error: Por favor, introduce un correo electrónico válido.");
            return;
        }

        const regexTelefono = /^[0-9]{7,15}$/;
        if (!regexTelefono.test(telefono)) {
            alert("Error: El número de teléfono no es válido (introduce solo números, entre 7 y 15 dígitos).");
            return;
        }

        if (contraseña !== confirmarContraseña) {
            alert("Error: Las contraseñas no coinciden.");
            return;
        }


        const usuarioObjeto = {
            nombre: nombre,
            apellido: apellido,
            telefono: telefono,
            email: email,
            contraseña: contraseña
        };

        const usuariosGuardados = JSON.parse(localStorage.getItem("usuarios")) || [];

        const existe = usuariosGuardados.some(u => u.email === email);
        if (existe) {
            console.log("8. Usuario ya existe");
            alert("Error: Este correo electrónico ya está registrado.");
            return;
        }

        usuariosGuardados.push(usuarioObjeto);
        localStorage.setItem("usuarios", JSON.stringify(usuariosGuardados));
        console.log("Usuarios guardados:", usuariosGuardados);
        localStorage.setItem("usuarioRegistrado", JSON.stringify(usuarioObjeto));


        Swal.fire({
        title: "¡Registro validado y guardado con éxito!",
        icon: "success",
        draggable: true
        }).then(() => {
            form.reset();
            window.location.href = "Login.html";
        });
    });

});