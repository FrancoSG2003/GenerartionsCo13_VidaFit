const filtroPrecio = document.getElementById('filtro-precio');
const precioSeleccionado = document.getElementById('precio-seleccionado');

function filtrarPorPrecio() {
    const precioMaximo = Number(filtroPrecio.value);
    const productos = document.querySelectorAll('.producto-card');

    productos.forEach(producto => {
        const precioProducto = Number(producto.dataset.precio);

        producto.parentElement.classList.toggle(
            'd-none',
            precioProducto > precioMaximo
        );
    });
}

filtroPrecio.addEventListener('input', () => {
    const precioMaximo = Number(filtroPrecio.value);

    precioSeleccionado.textContent =
        `$${precioMaximo.toLocaleString('es-CO')}`;

    filtrarPorPrecio();
});