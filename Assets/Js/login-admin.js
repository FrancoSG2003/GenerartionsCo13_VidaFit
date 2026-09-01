document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', (e) => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Cambia las credenciales de prueba por las de tu proyecto
        const ADMIN_EMAIL = "admin@vidafit.com";
        const ADMIN_PASS = "ClaveVidaFit";

        if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
            e.preventDefault(); // Evita que se ejecute la acción por defecto del formulario

            // Guarda el rol en localStorage para la sesión
            localStorage.setItem('userRole', 'admin');

            // Redirección directa a la vista de administrador
            window.location.href = 'dashboardAdmin.html';
        }
        // Si no es admin, no hacemos e.preventDefault(), permitiendo que el script de tu compañero maneje el resto.
    });
});