document.addEventListener("DOMContentLoaded", () => {
    const zonaUsuario = document.getElementById("zonaUsuario");
    const usuarioSesionActiva = JSON.parse(localStorage.getItem("usuarioSesionActiva"));

    console.log(usuarioSesionActiva);

    if (usuarioSesionActiva && zonaUsuario) {
        // Validamos si el usuario es Administrador o Cliente
        const esAdmin = usuarioSesionActiva.rol === "admin";

        zonaUsuario.innerHTML = `
            <div class="dropdown">
                <button
                    class="btn nav-link ingreso-link dropdown-toggle d-flex align-items-center gap-2"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <i class="bi ${esAdmin ? 'bi-shield-lock-fill text-primary' : 'bi-person-circle'}"></i>
                    Hola, ${usuarioSesionActiva.nombre} ${usuarioSesionActiva.apellido}
                </button>

                <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                    ${esAdmin ? `
                        <li>
                            <a class="dropdown-item fw-bold text-primary" href="admin.html">
                                <i class="bi bi-speedometer2 me-2"></i> Panel Admin
                            </a>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                    ` : `
                        <li>
                            <a class="dropdown-item" href="#">
                                <i class="bi bi-person-circle me-2"></i> Mi perfil
                            </a>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                    `}

                    <li>
                        <button class="dropdown-item text-danger" id="cerrarSesion">
                            <i class="bi bi-box-arrow-right me-2"></i> Cerrar sesión
                        </button>
                    </li>
                </ul>
            </div>
        `;

        // Evento para cerrar sesión
        const cerrarSesion = document.getElementById("cerrarSesion");

        cerrarSesion?.addEventListener("click", () => {
            Swal.fire({
                title: "¿Cerrar sesión?",
                text: "¿Estás seguro que deseas cerrar tu sesión?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#22C55E",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí, cerrar sesión",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    // Limpiamos la sesión del usuario (y de paso el userRole si lo usas en otra parte)
                    localStorage.removeItem("usuarioSesionActiva");
                    localStorage.removeItem("userRole");

                    Swal.fire({
                        title: "¡Sesión cerrada!",
                        text: "Has cerrado la sesión correctamente",
                        icon: "success",
                        confirmButtonText: "Continuar",
                        confirmButtonColor: "#22C55E"
                    }).then(() => {
                        window.location.href = "index.html";
                    });
                }
            });
        });
    }
});