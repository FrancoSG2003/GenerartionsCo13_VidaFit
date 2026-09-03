document.addEventListener(
    'DOMContentLoaded',
    function () {
        const contenedorProductos =
            document.getElementById(
                'contenedor-productos'
            );

        const filtroPrecio =
            document.getElementById(
                'filtro-precio'
            );

        const precioSeleccionado =
            document.getElementById(
                'precio-seleccionado'
            );

        const contadorCatalogo =
            document.getElementById(
                'contador-catalogo'
            );

        const mensajeSinResultados =
            document.getElementById(
                'mensaje-sin-resultados'
            );

        const selectorOrden =
            document.getElementById(
                'orden-productos'
            );

        const botonCuadricula =
            document.getElementById(
                'boton-cuadricula'
            );

        const botonLista =
            document.getElementById(
                'boton-lista'
            );

        const columnasProductos =
            Array.from(
                document.querySelectorAll(
                    '.producto-columna'
                )
            );

        const filtrosCategoria =
            Array.from(
                document.querySelectorAll(
                    '.filtro-categoria'
                )
            );

        const filtrosMarca =
            Array.from(
                document.querySelectorAll(
                    '.filtro-marca'
                )
            );

        const filtrosDisponibilidad =
            Array.from(
                document.querySelectorAll(
                    '.filtro-disponibilidad'
                )
            );

        const botonesFavorito =
            document.querySelectorAll(
                '.boton-favorito'
            );

        function obtenerSeleccionados(
            filtros
        ) {
            return filtros
                .filter(function (filtro) {
                    return filtro.checked;
                })
                .map(function (filtro) {
                    return filtro.value;
                });
        }

        function obtenerTarjeta(columna) {
            return columna.querySelector(
                '.producto-card'
            );
        }

        function ordenarProductos() {
            const tipoOrden =
                selectorOrden.value;

            const columnasOrdenadas =
                [...columnasProductos];

            columnasOrdenadas.sort(
                function (columnaA, columnaB) {
                    const productoA =
                        obtenerTarjeta(columnaA);

                    const productoB =
                        obtenerTarjeta(columnaB);

                    const precioA =
                        Number(
                            productoA.dataset.precio
                        );

                    const precioB =
                        Number(
                            productoB.dataset.precio
                        );

                    const ventasA =
                        Number(
                            productoA.dataset.ventas
                        );

                    const ventasB =
                        Number(
                            productoB.dataset.ventas
                        );

                    const valoracionA =
                        Number(
                            productoA.dataset.valoracion
                        );

                    const valoracionB =
                        Number(
                            productoB.dataset.valoracion
                        );

                    const posicionA =
                        Number(
                            columnaA.dataset
                                .posicionOriginal
                        );

                    const posicionB =
                        Number(
                            columnaB.dataset
                                .posicionOriginal
                        );

                    if (
                        tipoOrden ===
                        'precio-asc'
                    ) {
                        return precioA - precioB;
                    }

                    if (
                        tipoOrden ===
                        'precio-desc'
                    ) {
                        return precioB - precioA;
                    }

                    if (
                        tipoOrden ===
                        'valoracion'
                    ) {
                        if (
                            valoracionB !==
                            valoracionA
                        ) {
                            return (
                                valoracionB -
                                valoracionA
                            );
                        }

                        return ventasB - ventasA;
                    }

                    if (
                        tipoOrden ===
                        'ventas'
                    ) {
                        if (
                            ventasB !== ventasA
                        ) {
                            return ventasB - ventasA;
                        }

                        return posicionA - posicionB;
                    }

                    return posicionA - posicionB;
                }
            );

            columnasOrdenadas.forEach(
                function (columna) {
                    contenedorProductos
                        .appendChild(columna);
                }
            );
        }

        function aplicarFiltros() {
            const precioMaximo =
                Number(filtroPrecio.value);

            const categoriasSeleccionadas =
                obtenerSeleccionados(
                    filtrosCategoria
                );

            const marcasSeleccionadas =
                obtenerSeleccionados(
                    filtrosMarca
                );

            const disponibilidadesSeleccionadas =
                obtenerSeleccionados(
                    filtrosDisponibilidad
                );

            let cantidadVisible = 0;

            columnasProductos.forEach(
                function (columna) {
                    const producto =
                        obtenerTarjeta(columna);

                    const categoria =
                        producto.dataset.categoria;

                    const precio =
                        Number(
                            producto.dataset.precio
                        );

                    const marca =
                        producto.dataset.marca;

                    const stock =
                        Number(
                            producto.dataset.stock
                        );

                    const disponibilidad =
                        stock > 0
                            ? 'true'
                            : 'false';

                    const cumplePrecio =
                        precio <= precioMaximo;

                    const cumpleCategoria =
                        categoriasSeleccionadas
                            .length === 0 ||
                        categoriasSeleccionadas
                            .includes(categoria);

                    const cumpleMarca =
                        marcasSeleccionadas
                            .length === 0 ||
                        marcasSeleccionadas
                            .includes(marca);

                    const cumpleDisponibilidad =
                        disponibilidadesSeleccionadas
                            .length === 0 ||
                        disponibilidadesSeleccionadas
                            .includes(
                                disponibilidad
                            );

                    const mostrar =
                        cumplePrecio &&
                        cumpleCategoria &&
                        cumpleMarca &&
                        cumpleDisponibilidad;

                    columna.classList.toggle(
                        'd-none',
                        !mostrar
                    );

                    if (mostrar) {
                        cantidadVisible++;
                    }
                }
            );

            contadorCatalogo.textContent =
                `Mostrando ${cantidadVisible} ` +
                `de ${columnasProductos.length} productos`;

            mensajeSinResultados.style.display =
                cantidadVisible === 0
                    ? 'block'
                    : 'none';
        }

        function actualizarCatalogo() {
            ordenarProductos();
            aplicarFiltros();
        }

        function activarVistaCuadricula() {
            contenedorProductos.className =
                'row row-cols-1 row-cols-sm-2 ' +
                'row-cols-md-3 row-cols-lg-4 g-4';

            columnasProductos.forEach(
                function (columna) {
                    columna.className =
                        columna.classList.contains(
                            'd-none'
                        )
                            ? 'col producto-columna d-none'
                            : 'col producto-columna';

                    const tarjeta =
                        obtenerTarjeta(columna);

                    tarjeta.classList.remove(
                        'vista-lista',
                        'flex-md-row'
                    );
                }
            );

            botonCuadricula.classList.add(
                'active'
            );

            botonLista.classList.remove(
                'active'
            );

            botonCuadricula.setAttribute(
                'aria-pressed',
                'true'
            );

            botonLista.setAttribute(
                'aria-pressed',
                'false'
            );
        }

        function activarVistaLista() {
            contenedorProductos.className =
                'row g-3';

            columnasProductos.forEach(
                function (columna) {
                    columna.className =
                        columna.classList.contains(
                            'd-none'
                        )
                            ? 'col-12 producto-columna d-none'
                            : 'col-12 producto-columna';

                    const tarjeta =
                        obtenerTarjeta(columna);

                    tarjeta.classList.add(
                        'vista-lista',
                        'flex-md-row'
                    );
                }
            );

            botonLista.classList.add(
                'active'
            );

            botonCuadricula.classList.remove(
                'active'
            );

            botonLista.setAttribute(
                'aria-pressed',
                'true'
            );

            botonCuadricula.setAttribute(
                'aria-pressed',
                'false'
            );
        }

        filtroPrecio.addEventListener(
            'input',
            function () {
                const precio =
                    Number(filtroPrecio.value);

                precioSeleccionado.textContent =
                    '$' +
                    precio.toLocaleString(
                        'es-CO'
                    );

                aplicarFiltros();
            }
        );

        filtrosCategoria.forEach(
            function (filtro) {
                filtro.addEventListener(
                    'change',
                    aplicarFiltros
                );
            }
        );

        filtrosMarca.forEach(
            function (filtro) {
                filtro.addEventListener(
                    'change',
                    aplicarFiltros
                );
            }
        );

        filtrosDisponibilidad.forEach(
            function (filtro) {
                filtro.addEventListener(
                    'change',
                    aplicarFiltros
                );
            }
        );

        selectorOrden.addEventListener(
            'change',
            actualizarCatalogo
        );

        botonCuadricula.addEventListener(
            'click',
            activarVistaCuadricula
        );

        botonLista.addEventListener(
            'click',
            activarVistaLista
        );

        botonesFavorito.forEach(
            function (boton) {
                boton.addEventListener(
                    'click',
                    function () {
                        const icono =
                            boton.querySelector(
                                'i'
                            );

                        const seleccionado =
                            boton.getAttribute(
                                'aria-pressed'
                            ) === 'true';

                        boton.setAttribute(
                            'aria-pressed',
                            String(!seleccionado)
                        );

                        icono.classList.toggle(
                            'bi-heart',
                            seleccionado
                        );

                        icono.classList.toggle(
                            'bi-heart-fill',
                            !seleccionado
                        );

                        boton.classList.toggle(
                            'text-danger',
                            !seleccionado
                        );

                        boton.classList.toggle(
                            'text-dark',
                            seleccionado
                        );
                    }
                );
            }
        );

        actualizarCatalogo();
    }
);