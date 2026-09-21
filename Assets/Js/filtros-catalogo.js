document.addEventListener('DOMContentLoaded', function () {
    const contenedorProductos = document.getElementById('contenedor-productos');
    const filtroPrecio = document.getElementById('filtro-precio');
    const precioSeleccionado = document.getElementById('precio-seleccionado');
    const contadorCatalogo = document.getElementById('contador-catalogo');
    const mensajeSinResultados = document.getElementById('mensaje-sin-resultados');
    const selectorOrden = document.getElementById('orden-productos');
    const botonCuadricula = document.getElementById('boton-cuadricula');
    const botonLista = document.getElementById('boton-lista');

    let columnasProductos = [];
    let filtrosCategoria = [];
    let filtrosMarca = [];
    let filtrosDisponibilidad = [];

    // Carga o actualiza las referencias a los elementos del DOM dinámicos
    function reobtenerNodosDOM() {
        columnasProductos = Array.from(document.querySelectorAll('.producto-columna'));
        filtrosCategoria = Array.from(document.querySelectorAll('.filtro-categoria'));
        filtrosMarca = Array.from(document.querySelectorAll('.filtro-marca'));
        filtrosDisponibilidad = Array.from(document.querySelectorAll('.filtro-disponibilidad'));

        enlazarEventosFavoritos();
    }

    function obtenerSeleccionados(filtros) {
        return filtros
            .filter(filtro => filtro.checked)
            .map(filtro => filtro.value.trim().toLowerCase());
    }

    function obtenerTarjeta(columna) {
        return columna.querySelector('.producto-card');
    }

    function ordenarProductos() {
        if (!selectorOrden || columnasProductos.length === 0) return;

        const tipoOrden = selectorOrden.value;
        const columnasOrdenadas = [...columnasProductos];

        columnasOrdenadas.sort(function (columnaA, columnaB) {
            const productoA = obtenerTarjeta(columnaA);
            const productoB = obtenerTarjeta(columnaB);

            if (!productoA || !productoB) return 0;

            const precioA = Number(productoA.dataset.precio || 0);
            const precioB = Number(productoB.dataset.precio || 0);
            const ventasA = Number(productoA.dataset.ventas || 0);
            const ventasB = Number(productoB.dataset.ventas || 0);
            const valoracionA = Number(productoA.dataset.valoracion || 0);
            const valoracionB = Number(productoB.dataset.valoracion || 0);
            const posicionA = Number(columnaA.dataset.posicionOriginal || 0);
            const posicionB = Number(columnaB.dataset.posicionOriginal || 0);

            if (tipoOrden === 'precio-asc') return precioA - precioB;
            if (tipoOrden === 'precio-desc') return precioB - precioA;
            if (tipoOrden === 'valoracion') {
                if (valoracionB !== valoracionA) return valoracionB - valoracionA;
                return ventasB - ventasA;
            }
            if (tipoOrden === 'ventas') {
                if (ventasB !== ventasA) return ventasB - ventasA;
                return posicionA - posicionB;
            }

            return posicionA - posicionB;
        });

        columnasOrdenadas.forEach(columna => contenedorProductos.appendChild(columna));
    }

    function aplicarFiltros() {
        const precioMaximo = filtroPrecio ? Number(filtroPrecio.value) : Infinity;

        const categoriasSeleccionadas = obtenerSeleccionados(filtrosCategoria);
        const marcasSeleccionadas = obtenerSeleccionados(filtrosMarca);
        const disponibilidadesSeleccionadas = obtenerSeleccionados(filtrosDisponibilidad);

        let cantidadVisible = 0;

        columnasProductos.forEach(function (columna) {
            const producto = obtenerTarjeta(columna);
            if (!producto) return;

            const categoria = (producto.dataset.categoria || '').trim().toLowerCase();
            const precio = Number(producto.dataset.precio || 0);
            const marca = (producto.dataset.marca || '').trim().toLowerCase();
            const stock = Number(producto.dataset.stock || 0);
            const disponibilidad = stock > 0 ? 'true' : 'false';

            const cumplePrecio = precio <= precioMaximo;
            const cumpleCategoria = categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(categoria);
            const cumpleMarca = marcasSeleccionadas.length === 0 || marcasSeleccionadas.includes(marca);
            const cumpleDisponibilidad = disponibilidadesSeleccionadas.length === 0 || disponibilidadesSeleccionadas.includes(disponibilidad);

            const mostrar = cumplePrecio && cumpleCategoria && cumpleMarca && cumpleDisponibilidad;

            columna.classList.toggle('d-none', !mostrar);

            if (mostrar) cantidadVisible++;
        });

        if (contadorCatalogo) {
            contadorCatalogo.textContent = `Mostrando ${cantidadVisible} de ${columnasProductos.length} productos`;
        }

        if (mensajeSinResultados) {
            mensajeSinResultados.style.display = cantidadVisible === 0 ? 'block' : 'none';
        }
    }

    function actualizarCatalogo() {
        ordenarProductos();
        aplicarFiltros();
    }

    function enlazarEventosFavoritos() {
        const botonesFavorito = document.querySelectorAll('.boton-favorito');
        botonesFavorito.forEach(function (boton) {
            // Reemplazar nodo para limpiar eventos escuchados anteriormente
            const nuevoBoton = boton.cloneNode(true);
            boton.parentNode.replaceChild(nuevoBoton, boton);

            nuevoBoton.addEventListener('click', function () {
                const icono = nuevoBoton.querySelector('i');
                const seleccionado = nuevoBoton.getAttribute('aria-pressed') === 'true';

                nuevoBoton.setAttribute('aria-pressed', String(!seleccionado));
                if (icono) {
                    icono.classList.toggle('bi-heart', seleccionado);
                    icono.classList.toggle('bi-heart-fill', !seleccionado);
                }
                nuevoBoton.classList.toggle('text-danger', !seleccionado);
                nuevoBoton.classList.toggle('text-dark', seleccionado);
            });
        });
    }

    // Delegación global para eventos change en checkboxes (escucha incluso elementos inyectados)
    document.addEventListener('change', function (evento) {
        if (
            evento.target.classList.contains('filtro-categoria') ||
            evento.target.classList.contains('filtro-marca') ||
            evento.target.classList.contains('filtro-disponibilidad')
        ) {
            aplicarFiltros();
        }
    });

    if (filtroPrecio) {
        filtroPrecio.addEventListener('input', function () {
            const precio = Number(filtroPrecio.value);
            if (precioSeleccionado) {
                precioSeleccionado.textContent = '$' + precio.toLocaleString('es-CO');
            }
            aplicarFiltros();
        });
    }

    if (selectorOrden) {
        selectorOrden.addEventListener('change', actualizarCatalogo);
    }

    // Escucha la señal del script mostrar-catalogo.js
    document.addEventListener('productosCatalogoCargados', function () {
        reobtenerNodosDOM();
        actualizarCatalogo();
    });
});