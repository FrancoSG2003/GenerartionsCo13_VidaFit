const filtroPrecio = document.getElementById('filtro-precio');
const precioSeleccionado = document.getElementById('precio-seleccionado');
const filtrosMarca = document.querySelectorAll('.filtro-marca');
const filtrosDisponibilidad = document.querySelectorAll('.filtro-disponibilidad');

function obtenerMarcasSeleccionadas() {
    return Array.from(filtrosMarca)
        .filter(filtro => filtro.checked)
        .map(filtro => filtro.value);
}

function obtenerDisponibilidadesSeleccionadas() {
    return Array.from(filtrosDisponibilidad)
        .filter(filtro => filtro.checked)
        .map(filtro => filtro.value);
}

function aplicarFiltros() {
    const precioMaximo = Number(filtroPrecio.value);
    const marcasSeleccionadas = obtenerMarcasSeleccionadas();
    const disponibilidadesSeleccionadas = obtenerDisponibilidadesSeleccionadas();
    const productos = document.querySelectorAll('.producto-card');

    productos.forEach(producto => {
        const precioProducto = Number(producto.dataset.precio);
        const marcaProducto = producto.dataset.marca;
        const disponibilidadProducto = producto.dataset.stock;

        const cumplePrecio = precioProducto <= precioMaximo;

        const cumpleMarca =
            marcasSeleccionadas.length === 0 ||
            marcasSeleccionadas.includes(marcaProducto);

        const cumpleDisponibilidad =
            disponibilidadesSeleccionadas.length === 0 ||
            disponibilidadesSeleccionadas.includes(disponibilidadProducto);

        producto.parentElement.classList.toggle(
            'd-none',
            !(cumplePrecio && cumpleMarca && cumpleDisponibilidad)
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

filtrosDisponibilidad.forEach(filtro => {
    filtro.addEventListener('change', aplicarFiltros);
});