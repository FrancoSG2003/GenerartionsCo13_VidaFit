document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        const ADMIN_EMAIL = "vidafitproyect@gmail.com";
        const ADMIN_PASS = "ClaveVidaFit";

        if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
            e.preventDefault();
            e.stopImmediatePropagation(); // Evita que login.js se ejecute después

            const adminUser = {
                nombre: "Administrador",
                apellido: "VidaFit",
                email: ADMIN_EMAIL,
                rol: "admin"
            };

            // Guarda la sesión 
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('usuarioSesionActiva', JSON.stringify(adminUser));

            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido Administrador!',
                text: 'Accediendo al panel...',
                timer: 1200,
                showConfirmButton: false
            }).then(() => {
                window.location.href = 'dashboardAdmin.html';
            });
        }
    }, true);
});