document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('form[action*="formsubmit.co"]');

    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
    
        e.preventDefault();

        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');

        // Validaciones básicas de campos vacíos
        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();

        if (!name || !email || !message) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, llena los campos requeridos (Nombre, Email y Mensaje).',
                confirmButtonColor: '#212529'
            });
            return;
        }

        // confirmamos para enviar los datos
        const confirmResult = await Swal.fire({
            title: '¿Confirmas el envío?',
            text: 'Tu mensaje será enviado al equipo de VidaFit.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, enviar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#212529',
            cancelButtonColor: '#6c757d',
            reverseButtons: true
        });

        // Si el usuario cancela se detiene la función
        if (!confirmResult.isConfirmed) return;

        // Boton cargando
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enviando...`;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Alerta de éxito
                await Swal.fire({
                    icon: 'success',
                    title: '¡Mensaje enviado!',
                    text: 'Gracias por contactarnos. Te responderemos muy pronto.',
                    confirmButtonColor: '#212529'
                });

                // Limpiar formulario
                form.reset();
            } else {
                throw new Error('Respuesta del servidor no fue OK');
            }
        } catch (error) {
            // Alerta de error si falla la conexión
            Swal.fire({
                icon: 'error',
                title: 'Error al enviar',
                text: 'Ocurrió un problema al enviar tu mensaje. Inténtalo de nuevo más tarde.',
                confirmButtonColor: '#212529'
            });
        } finally {
            // Restaurar el botón a su estado original
            submitButton.disabled = false;
            submitButton.innerHTML = 'Enviar Mensaje';
        }
    });
});
// Preguntas frecuentes
document.addEventListener('DOMContentLoaded', () => {
    const botonesPreguntas = document.querySelectorAll('.boton-pregunta');

    if (botonesPreguntas.length === 0) return;

    function obtenerRespuesta(boton) {
        const idRespuesta = boton.getAttribute('aria-controls');

        return document.getElementById(idRespuesta);
    }

    function cambiarIcono(boton, estaAbierta) {
        const icono = boton.querySelector('.icono-pregunta');

        if (!icono) return;

        icono.classList.toggle('bi-plus-lg', !estaAbierta);
        icono.classList.toggle('bi-dash-lg', estaAbierta);
    }

    function cerrarPregunta(boton) {
        const respuesta = obtenerRespuesta(boton);

        if (!respuesta) return;

        boton.setAttribute('aria-expanded', 'false');
        respuesta.hidden = true;
        cambiarIcono(boton, false);
    }

    function abrirPregunta(boton) {
        const respuesta = obtenerRespuesta(boton);

        if (!respuesta) return;

        boton.setAttribute('aria-expanded', 'true');
        respuesta.hidden = false;
        cambiarIcono(boton, true);
    }

    function cambiarEstadoPregunta(botonSeleccionado) {
        const estaAbierta =
            botonSeleccionado.getAttribute('aria-expanded') === 'true';

        botonesPreguntas.forEach((boton) => {
            cerrarPregunta(boton);
        });

        if (!estaAbierta) {
            abrirPregunta(botonSeleccionado);
        }
    }

    botonesPreguntas.forEach((boton) => {
        boton.addEventListener('click', () => {
            cambiarEstadoPregunta(boton);
        });
    });
});