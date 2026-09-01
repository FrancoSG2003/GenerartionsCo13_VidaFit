document.addEventListener("DOMContentLoaded", () => {

    const zonaUsuario = document.getElementById("zonaUsuario");

    const usuarioSesionActiva =
        JSON.parse(localStorage.getItem("usuarioSesionActiva"));

    console.log(usuarioSesionActiva);

    if (usuarioSesionActiva) {

    zonaUsuario.innerHTML = `
        <div class="dropdown">

            <button
                class="btn nav-link ingreso-link dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false">

                Bienvenido, ${usuarioSesionActiva.nombre} ${usuarioSesionActiva.apellido}

            </button>

            <ul class="dropdown-menu dropdown-menu-end">

                <li>
                    <a class="dropdown-item" href="#">
                        <i class="bi bi-person-circle"></i>
                        Mi perfil
                    </a>
                </li>

                <li>
                    <hr class="dropdown-divider">
                </li>

                <li>
                    <button class="dropdown-item" id="cerrarSesion">
                        <i class="bi bi-box-arrow-right"></i>
                        Cerrar sesión
                    </button>
                </li>

            </ul>

        </div>
        `;


        const cerrarSesion = document.getElementById("cerrarSesion");

        cerrarSesion.addEventListener("click", () => {

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

                    localStorage.removeItem("usuarioSesionActiva");

                    Swal.fire({
                        title: "¡Sesión cerrada!",
                        text: "Has cerrado la sesión correctamente",
                        icon: "success",
                        confirmButtonText: "Continuar"
                    }).then(() => {

                        window.location.href = "index.html";

                    });

                }

            });

    });
}
});



