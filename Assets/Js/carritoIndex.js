// carritoIndex.js - Adaptado a tu estructura HTML exacta
document.addEventListener('DOMContentLoaded', () => {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Selectores basados exactamente en tu HTML
    const contadorCarrito = document.querySelector('.carrito-contador');
    const contenedorProductos = document.querySelector('#contenedorProductosCarrito');
    const carritoVacio = document.querySelector('#carritoVacio');
    const cantidadTotal = document.querySelector('#cantidadTotalProductos');
    const precioTotal = document.querySelector('#precioTotalCarrito');
    const btnVaciar = document.querySelector('#btnVaciarCarrito');
    const btnFinalizar = document.querySelector('#btnFinalizarCompra');
    const plantilla = document.querySelector('#plantillaProductoCarrito');

    renderizarCarrito();

    // Evento para agregar productos desde las cards del index
    document.addEventListener('click', (e) => {
        const btnAgregar = e.target.closest('.btn-agregar-carrito');
        if (!btnAgregar) return;

        const card = btnAgregar.closest('.card');
        if (!card) return;

        const tituloElement = card.querySelector('.card-title');
        const imagenElement = card.querySelector('img');
        if (!tituloElement || !imagenElement) return;

        const producto = {
            id: tituloElement.textContent.trim(),
            nombre: tituloElement.textContent.trim(),
            precio: parseFloat(btnAgregar.dataset.precio) || 0,
            imagen: imagenElement.getAttribute('src'),
            cantidad: 1
        };

        const index = carrito.findIndex(item => item.id === producto.id);
        if (index !== -1) {
            carrito[index].cantidad += 1;
        } else {
            carrito.push(producto);
        }

        guardarYActualizar();

        Swal.fire({
            icon: 'success',
            title: '¡Agregado!',
            text: `${producto.nombre} se añadió al carrito`,
            timer: 1200,
            showConfirmButton: false
        });
    });

    function guardarYActualizar() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
    }

    function renderizarCarrito() {
        // 1. Actualizar contador del navbar (el número rojo de la bolsa)
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        if (contadorCarrito) {
            contadorCarrito.textContent = totalItems;
        }

        if (!contenedorProductos) return;

        // 2. Limpiar contenedor lateral
        contenedorProductos.innerHTML = '';

        if (carrito.length === 0) {
            if (carritoVacio) carritoVacio.classList.remove('d-none');
            if (cantidadTotal) cantidadTotal.textContent = '0';
            if (precioTotal) precioTotal.textContent = '$0';
            if (btnVaciar) btnVaciar.disabled = true;
            if (btnFinalizar) btnFinalizar.disabled = true;
            return;
        }

        if (carritoVacio) carritoVacio.classList.add('d-none');
        if (btnVaciar) btnVaciar.disabled = false;
        if (btnFinalizar) btnFinalizar.disabled = false;

        let subtotalGeneral = 0;
        let totalUnidades = 0;

        // 3. Pintar usando tu <template>
        carrito.forEach((item, index) => {
            const subtotalItem = item.precio * item.cantidad;
            subtotalGeneral += subtotalItem;
            totalUnidades += item.cantidad;

            const clone = plantilla.content.cloneNode(true);
            const article = clone.querySelector('article');
            article.dataset.id = item.id;

            clone.querySelector('.producto-imagen-carrito').src = item.imagen;
            clone.querySelector('.producto-imagen-carrito').alt = item.nombre;
            clone.querySelector('.producto-nombre').textContent = item.nombre;
            clone.querySelector('.producto-precio').textContent = `$${item.precio.toLocaleString()}`;
            clone.querySelector('.producto-cantidad').textContent = item.cantidad;
            clone.querySelector('.producto-subtotal').textContent = `$${subtotalItem.toLocaleString()}`;

            // Botones de cantidad dentro del carrito lateral
            clone.querySelector('.btnAumentarCantidad').addEventListener('click', () => {
                carrito[index].cantidad++;
                guardarYActualizar();
            });

            clone.querySelector('.btnDisminuirCantidad').addEventListener('click', () => {
                if (carrito[index].cantidad > 1) {
                    carrito[index].cantidad--;
                } else {
                    carrito.splice(index, 1);
                }
                guardarYActualizar();
            });

            clone.querySelector('.btnEliminarProducto').addEventListener('click', () => {
                carrito.splice(index, 1);
                guardarYActualizar();
            });

            contenedorProductos.appendChild(clone);
        });

        if (cantidadTotal) cantidadTotal.textContent = totalUnidades;
        if (precioTotal) precioTotal.textContent = `$${subtotalGeneral.toLocaleString()}`;
    }

    // Botón vaciar carrito general
    if (btnVaciar) {
        btnVaciar.addEventListener('click', () => {
            carrito = [];
            guardarYActualizar();
        });
    }
});