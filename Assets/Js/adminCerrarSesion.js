document.getElementById('btnCerrarSesionAdmin')?.addEventListener('click', () => {
            Swal.fire({
                title: '¿Cerrar sesión de administrador?',
                text: 'Serás redirigido a la página principal.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('usuarioSesionActiva');
                    localStorage.removeItem('userRole');
                    window.location.href = 'index.html';
                }
            });
        });