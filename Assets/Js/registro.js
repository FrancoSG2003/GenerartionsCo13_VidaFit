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
        e.preventDefault(); // Evita que se recargue la página por defecto


        const nombreCompleto = document.getElementById("nombreCompleto").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const email = document.getElementById("email").value.trim();
        const contraseña = inputContraseña.value;
        const confirmarContraseña = document.getElementById("InputConfirmarContraseña").value;


        if (!nombreCompleto || !telefono || !email || !contraseña || !confirmarContraseña) {
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
            nombreCompleto: nombreCompleto,
            telefono: telefono,
            email: email,
            contraseña: contraseña
        };


        console.log("Objeto JSON del usuario creado con éxito:", usuarioObjeto);
        console.log(JSON.stringify(usuarioObjeto, null, 2));

        alert("¡Registro validado con éxito!.");


        form.reset();
    });
});