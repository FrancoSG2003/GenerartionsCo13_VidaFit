const filtroPrecio = document.getElementById('filtro-precio');
const precioSeleccionado = document.getElementById('precio-seleccionado');
const filtrosMarca = document.querySelectorAll('.filtro-marca');

function obtenerMarcasSeleccionadas() {
    return Array.from(filtrosMarca)
        .filter(filtro => filtro.checked)
        .map(filtro => filtro.value);
}

function aplicarFiltros() {
    const precioMaximo = Number(filtroPrecio.value);
    const marcasSeleccionadas = obtenerMarcasSeleccionadas();
    const productos = document.querySelectorAll('.producto-card');

    productos.forEach(producto => {
        const precioProducto = Number(producto.dataset.precio);
        const marcaProducto = producto.dataset.marca;

        const cumplePrecio = precioProducto <= precioMaximo;
        const cumpleMarca =
            marcasSeleccionadas.length === 0 ||
            marcasSeleccionadas.includes(marcaProducto);

        producto.parentElement.classList.toggle(
            'd-none',
            !(cumplePrecio && cumpleMarca)
        );
    });
}

filtroPrecio.addEventListener('input', () => {
    const precioMaximo = Number(filtroPrecio.value);

    precioSeleccionado.textContent =
        `$${precioMaximo.toLocaleString('es-CO')}`;

    aplicarFiltros();
});

filtrosMarca.forEach(filtro => {
    filtro.addEventListener('change', aplicarFiltros);
});