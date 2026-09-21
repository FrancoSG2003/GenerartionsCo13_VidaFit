/*
 * Dashboard de VidaFit conectado al backend.
 *
 * Consulta pedidos, productos y categorías.
 * No crea, modifica ni elimina registros.
 *
 * Las ventas corresponden a pedidos ENTREGADO.
 */

(async () => {
    "use strict";

    if (window.VidaFitEsAdmin !== true) {
        return;
    }

    const API_BASE = window.VidaFitApiAdmin;

    const obtener = id => document.getElementById(id);

    const formatoMoneda = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    });

    const formatoNumero = new Intl.NumberFormat("es-CO", {
        maximumFractionDigits: 1
    });

    const moneda = valor => formatoMoneda.format(valor);
    const numero = valor => formatoNumero.format(valor);

    const colores = [
        "#2563eb",
        "#16a085",
        "#8b5cf6",
        "#f59e0b",
        "#ec4899",
        "#64748b"
    ];

    const estadosPermitidos = new Set([
        "CREADO",
        "RECIBIDO",
        "EN_PROCESO",
        "EN_CAMINO",
        "ENTREGADO",
        "PENDIENTE"
    ]);

    let pedidos = [];
    let resultadoActual = null;
    let periodoAplicado = null;

    function escapar(valor) {
        const caracteres = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return String(valor).replace(
            /[&<>"']/g,
            caracter => caracteres[caracter]
        );
    }

    function fechaValida(valor) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
            return false;
        }

        const tiempo = Date.parse(valor);

        return (
            !Number.isNaN(tiempo) &&
            new Date(tiempo).toISOString().slice(0, 10) === valor
        );
    }

    function fechaHoy() {
        const partes = new Intl.DateTimeFormat("es-CO", {
            timeZone: "America/Bogota",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).formatToParts(new Date());

        const valor = tipo => {
            return partes.find(parte => parte.type === tipo).value;
        };

        return `${valor("year")}-${valor("month")}-${valor("day")}`;
    }

    function mostrarFecha(fecha) {
        return new Date(
            fecha + "T12:00:00Z"
        ).toLocaleDateString("es-CO", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "UTC"
        });
    }

    function bloquearFiltros(bloquear) {
        document.querySelectorAll(
            "#formularioFiltros input, " +
            "#formularioFiltros select, " +
            "#formularioFiltros button"
        ).forEach(elemento => {
            elemento.disabled = bloquear;
        });
    }

    function mostrarError(mensaje) {
        obtener("mensajeError").textContent = mensaje;
        obtener("mensajeError").hidden = false;
        obtener("resultados").hidden = true;
        obtener("btnReporte").disabled = true;

        resultadoActual = null;
        periodoAplicado = null;
    }

    async function consultarLista(ruta, signal) {
        const respuesta = await fetch(API_BASE + ruta, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            cache: "no-store",
            signal
        });

        if (!respuesta.ok) {
            throw new Error(
                `La consulta ${ruta} respondió con HTTP ` +
                respuesta.status + "."
            );
        }

        let datos;

        try {
            datos = await respuesta.json();
        } catch (error) {
            if (error.name === "AbortError") {
                throw error;
            }

            throw new Error(
                `La consulta ${ruta} no devolvió JSON válido.`
            );
        }

        if (!Array.isArray(datos)) {
            throw new Error(
                `La consulta ${ruta} no devolvió una lista válida.`
            );
        }

        return datos;
    }

    /*
     * Convierte las respuestas del backend al formato utilizado
     * por los cálculos y las gráficas.
     */
    function prepararPedidos(
        pedidosBackend,
        productosBackend,
        categoriasBackend,
        usuariosBackend
    ) {
        const usuariosPorId = new Map(usuariosBackend.map(usuario => [String(usuario.id), usuario]));
        const productosPorId = new Map();
        const categoriasPorId = new Map();

        for (const producto of productosBackend) {
            if (
                producto.id == null ||
                productosPorId.has(String(producto.id))
            ) {
                throw new Error(
                    "La lista de productos contiene identificadores inválidos."
                );
            }

            productosPorId.set(String(producto.id), producto);
        }

        for (const categoria of categoriasBackend) {
            if (
                categoria.id == null ||
                categoriasPorId.has(String(categoria.id))
            ) {
                throw new Error(
                    "La lista de categorías contiene identificadores inválidos."
                );
            }

            categoriasPorId.set(String(categoria.id), categoria);
        }

        const pedidosVistos = new Set();

        return pedidosBackend.map(pedido => {
            const fecha = typeof pedido.fechaPedido === "string"
                ? pedido.fechaPedido.slice(0, 10)
                : "";

            const estado = String(pedido.estado || "")
                .trim()
                .toUpperCase();

            if (
                pedido.id == null ||
                pedido.usuarioId == null ||
                pedidosVistos.has(String(pedido.id)) ||
                !fechaValida(fecha) ||
                !estadosPermitidos.has(estado) ||
                !Array.isArray(pedido.detalles)
            ) {
                throw new Error(
                    `El pedido ${pedido.id ?? "sin ID"} contiene ` +
                    "datos incompletos, duplicados o un estado no reconocido."
                );
            }

            if (
                estado === "ENTREGADO" &&
                pedido.detalles.length === 0
            ) {
                throw new Error(
                    `El pedido entregado ${pedido.id} no tiene detalles. ` +
                    "No se pueden calcular sus ventas."
                );
            }

            pedidosVistos.add(String(pedido.id));

            const detallesVistos = new Set();

            const detalles = pedido.detalles.map(detalle => {
                if (
                    detalle.id == null ||
                    detalle.productoId == null ||
                    String(detalle.pedidoId) !== String(pedido.id) ||
                    detallesVistos.has(String(detalle.id)) ||
                    detalle.cantidad == null ||
                    detalle.precioUnitario == null ||
                    detalle.cantidad === "" ||
                    detalle.precioUnitario === ""
                ) {
                    throw new Error(
                        `El pedido ${pedido.id} tiene un detalle inválido.`
                    );
                }

                detallesVistos.add(String(detalle.id));

                const cantidad = Number(detalle.cantidad);
                const precioUnitario = Number(detalle.precioUnitario);
                const centavos = Math.round(precioUnitario * 100);

                if (
                    !Number.isSafeInteger(cantidad) ||
                    cantidad <= 0 ||
                    !Number.isFinite(precioUnitario) ||
                    precioUnitario < 0 ||
                    !Number.isSafeInteger(centavos * cantidad)
                ) {
                    throw new Error(
                        `El pedido ${pedido.id} tiene una cantidad ` +
                        "o un precio inválido."
                    );
                }

                const producto = productosPorId.get(
                    String(detalle.productoId)
                );

                const categoria = producto?.categoriaId != null
                    ? categoriasPorId.get(String(producto.categoriaId))
                    : null;

                return {
                    productoId: String(detalle.productoId),
                    nombre: producto?.nombre ||
                        `Producto #${detalle.productoId}`,
                    categoria: categoria?.nombre || "Sin categoría",
                    cantidad,
                    precioUnitario
                };
            });

            return {
                id: pedido.id,
                clienteId: String(pedido.usuarioId),
                clienteNombre: usuariosPorId.get(String(pedido.usuarioId))?.nombre || `Cliente #${pedido.usuarioId}`,
                clienteCorreo: usuariosPorId.get(String(pedido.usuarioId))?.correo || "",
                fechaCompleta: pedido.fechaPedido,
                fecha,
                estado,
                detalles
            };
        });
    }

    async function cargarPedidos() {
        const controlador = new AbortController();

        const temporizador = setTimeout(() => {
            controlador.abort();
        }, 60000);

        try {
            const [
                pedidosBackend,
                productosBackend,
                categoriasBackend,
                usuariosBackend
            ] = await Promise.all([
                consultarLista("/pedidos", controlador.signal),
                consultarLista("/productos", controlador.signal),
                consultarLista("/categorias", controlador.signal),
                consultarLista("/usuarios", controlador.signal)
            ]);

            return prepararPedidos(
                pedidosBackend,
                productosBackend,
                categoriasBackend,
                usuariosBackend
            );

        } catch (error) {
            if (error.name === "AbortError") {
                throw new Error(
                    "El backend no respondió en 60 segundos. " +
                    "Espera un momento y recarga la página."
                );
            }

            if (error instanceof TypeError) {
                throw new Error(
                    "No fue posible conectar con el backend. " +
                    "Comprueba tu conexión y que el servicio esté disponible."
                );
            }

            throw error;

        } finally {
            clearTimeout(temporizador);
            controlador.abort();
        }
    }

    /*
     * Los cálculos monetarios se realizan en centavos.
     */
    function importeDetalle(detalle) {
        return Math.round(detalle.precioUnitario * 100) *
            detalle.cantidad;
    }

    function totalPedido(pedido) {
        return pedido.detalles.reduce(
            (suma, detalle) => suma + importeDetalle(detalle),
            0
        ) / 100;
    }

    function calcular(desde, hasta) {
        if (
            !fechaValida(desde) ||
            !fechaValida(hasta) ||
            desde > hasta
        ) {
            throw new Error(
                "La fecha Desde debe ser anterior o igual a Hasta."
            );
        }

        const cantidadDias =
            (Date.parse(hasta) - Date.parse(desde)) / 86400000;

        if (cantidadDias > 3660) {
            throw new Error(
                "Selecciona un período de máximo 10 años."
            );
        }

        const pedidosPeriodo = pedidos.filter(pedido => {
            return pedido.fecha >= desde && pedido.fecha <= hasta;
        });

        const ventas = pedidosPeriodo.filter(
            pedido => pedido.estado === "ENTREGADO"
        );

        const productosAgrupados = new Map();
        const categoriasAgrupadas = new Map();
        const diasAgrupados = new Map();

        for (
            let tiempo = Date.parse(desde);
            tiempo <= Date.parse(hasta);
            tiempo += 86400000
        ) {
            const fecha = new Date(tiempo)
                .toISOString()
                .slice(0, 10);

            diasAgrupados.set(fecha, {
                fecha,
                pedidos: 0,
                unidades: 0,
                centavos: 0
            });
        }

        let totalCentavos = 0;
        let unidades = 0;

        for (const pedido of ventas) {
            const dia = diasAgrupados.get(pedido.fecha);
            dia.pedidos++;

            for (const detalle of pedido.detalles) {
                const importe = importeDetalle(detalle);

                totalCentavos += importe;

                if (!Number.isSafeInteger(totalCentavos)) {
                    throw new Error(
                        "El total supera el rango numérico permitido."
                    );
                }

                unidades += detalle.cantidad;
                dia.centavos += importe;
                dia.unidades += detalle.cantidad;

                if (!productosAgrupados.has(detalle.productoId)) {
                    productosAgrupados.set(detalle.productoId, {
                        nombre: detalle.nombre,
                        categoria: detalle.categoria,
                        unidades: 0,
                        centavos: 0
                    });
                }

                const producto = productosAgrupados.get(
                    detalle.productoId
                );

                producto.unidades += detalle.cantidad;
                producto.centavos += importe;

                const acumulado =
                    categoriasAgrupadas.get(detalle.categoria) || 0;

                categoriasAgrupadas.set(
                    detalle.categoria,
                    acumulado + importe
                );
            }
        }

        const ranking = [...productosAgrupados.values()]
            .map(producto => ({
                ...producto,
                ingresos: producto.centavos / 100
            }))
            .sort((a, b) => {
                return (
                    b.unidades - a.unidades ||
                    b.ingresos - a.ingresos ||
                    a.nombre.localeCompare(b.nombre)
                );
            });

        const categorias = [...categoriasAgrupadas]
            .map(([nombre, centavos]) => ({
                nombre,
                ingresos: centavos / 100,
                porcentaje: totalCentavos > 0
                    ? centavos / totalCentavos * 100
                    : 0
            }))
            .sort((a, b) => b.ingresos - a.ingresos);

        const dias = [...diasAgrupados.values()].map(dia => ({
            fecha: dia.fecha,
            pedidos: dia.pedidos,
            unidades: dia.unidades,
            ingresos: dia.centavos / 100,
            promedio: dia.pedidos > 0
                ? dia.centavos / 100 / dia.pedidos
                : 0
        }));

        const ingresos = totalCentavos / 100;

        const recientes = pedidosPeriodo
            .map(pedido => ({
                ...pedido,
                total: totalPedido(pedido)
            }))
            .sort((a, b) => {
                return (
                    a.clienteNombre.localeCompare(b.clienteNombre, "es", { sensitivity: "base" }) ||
                    a.clienteId.localeCompare(b.clienteId, undefined, { numeric: true }) ||
                    b.fechaCompleta.localeCompare(a.fechaCompleta) ||
                    String(b.id).localeCompare(
                        String(a.id),
                        undefined,
                        { numeric: true }
                    )
                );
            });

        return {
            ingresos,
            unidades,
            cantidadPedidos: ventas.length,
            promedio: ventas.length > 0
                ? ingresos / ventas.length
                : 0,
            pendientes: pedidosPeriodo.filter(
                pedido => pedido.estado !== "ENTREGADO"
            ).length,
            clientes: new Set(
                ventas.map(pedido => pedido.clienteId)
            ).size,
            productosVendidos: ranking.length,
            ranking,
            categorias,
            dias,
            recientes
        };
    }

    function dibujarRanking(ranking) {
        if (ranking.length === 0) {
            return `
                <div class="vf-empty">
                    <i class="bi bi-box-seam fs-2 d-block mb-2"></i>
                    No hay productos vendidos en pedidos entregados
                    durante este período.
                </div>
            `;
        }

        return ranking.slice(0, 5).map((producto, indice) => {
            const porcentaje =
                producto.unidades / ranking[0].unidades * 100;

            return `
                <div class="vf-ranking-row">
                    <span class="vf-position">
                        ${String(indice + 1).padStart(2, "0")}
                    </span>

                    <div>
                        <strong class="d-block">
                            ${escapar(producto.nombre)}
                        </strong>

                        <small>
                            ${escapar(producto.categoria)}
                            · ${numero(producto.unidades)} unidades
                        </small>

                        <div class="vf-bar-track">
                            <div
                                class="vf-bar"
                                style="width: ${porcentaje}%"
                            ></div>
                        </div>
                    </div>

                    <span class="vf-ranking-income">
                        ${moneda(producto.ingresos)}
                    </span>
                </div>
            `;
        }).join("");
    }

    function dibujarCategorias(categorias, ingresos) {
        if (ingresos === 0) {
            return `
                <div class="vf-donut" style="background: #e8edf5">
                    <div class="vf-donut-center">
                        <strong>${moneda(0)}</strong>
                        <span>Sin ingresos</span>
                    </div>
                </div>

                <p class="vf-empty">
                    No hay ingresos para distribuir por categoría.
                </p>
            `;
        }

        let acumulado = 0;

        const segmentos = categorias.map((categoria, indice) => {
            const inicio = acumulado;
            acumulado += categoria.porcentaje;

            return `${colores[indice % colores.length]}
                ${inicio}% ${acumulado}%`;
        });

        const grafica = `
            <div
                class="vf-donut"
                style="background: conic-gradient(${segmentos.join(",")})"
                role="img"
                aria-label="Ingresos por categoría.
                Los valores y porcentajes están en la lista inferior."
            >
                <div class="vf-donut-center">
                    <strong>${categorias.length}</strong>
                    <span>categorías</span>
                </div>
            </div>
        `;

        const lista = categorias.map((categoria, indice) => {
            return `
                <div class="vf-category">
                    <span
                        class="vf-dot"
                        style="background: ${colores[indice % colores.length]}"
                    ></span>

                    <span>${escapar(categoria.nombre)}</span>
                    <span>${moneda(categoria.ingresos)}</span>

                    <strong>
                        ${numero(categoria.porcentaje)} %
                    </strong>
                </div>
            `;
        }).join("");

        return grafica + lista;
    }

    function actualizar() {
        obtener("mensajeError").hidden = true;

        try {
            const desde = obtener("fechaDesde").value;
            const hasta = obtener("fechaHasta").value;

            const resultado = calcular(desde, hasta);

            resultadoActual = resultado;
            periodoAplicado = { desde, hasta };

            obtener("ventasTotales").textContent =
                moneda(resultado.ingresos);

            obtener("pedidosPendientes").textContent =
                numero(resultado.pendientes);

            obtener("productosVendidos").textContent =
                numero(resultado.productosVendidos);

            obtener("clientesCompradores").textContent =
                numero(resultado.clientes);

            obtener("pedidosVentas").textContent =
                numero(resultado.cantidadPedidos);

            obtener("promedioPedido").textContent =
                moneda(resultado.promedio);

            obtener("unidadesVendidas").textContent =
                numero(resultado.unidades);

            obtener("periodoActual").textContent =
                `${mostrarFecha(desde)} — ${mostrarFecha(hasta)}` +
                ` · COP · ${resultado.cantidadPedidos} pedidos entregados`;


            obtener("avisoSinVentas").hidden =
                resultado.cantidadPedidos > 0;

            obtener("rankingProductos").innerHTML =
                dibujarRanking(resultado.ranking);

            obtener("categoriasIngresos").innerHTML =
                dibujarCategorias(
                    resultado.categorias,
                    resultado.ingresos
                );

            obtener("tablaDiaria").innerHTML =
                resultado.dias.map(dia => `
                    <tr>
                        <td>${dia.fecha}</td>
                        <td>${numero(dia.pedidos)}</td>
                        <td>${numero(dia.unidades)}</td>
                        <td>${moneda(dia.ingresos)}</td>
                        <td>${moneda(dia.promedio)}</td>
                    </tr>
                `).join("");

            mostrarHistorial();

            obtener("resultados").hidden = false;
            obtener("btnReporte").disabled = false;

        } catch (error) {
            mostrarError(error.message);
        }
    }

    function mostrarHistorial() {
        if (!resultadoActual) return;
        const busqueda = obtener("filtroCliente").value.trim().toLocaleLowerCase("es");
        const lista = resultadoActual.recientes.filter(pedido =>
            [pedido.clienteNombre, pedido.clienteCorreo, pedido.clienteId]
                .some(valor => valor.toLocaleLowerCase("es").includes(busqueda))
        );
        let clienteAnterior = null;
        obtener("tablaPedidos").innerHTML = lista.map(pedido => {
            const encabezado = clienteAnterior !== pedido.clienteId
                ? '<tr class="table-light"><th colspan="5" scope="rowgroup">' +
                    escapar(pedido.clienteNombre) + ' · #' + escapar(pedido.clienteId) +
                    (pedido.clienteCorreo ? ' · ' + escapar(pedido.clienteCorreo) : '') + '</th></tr>'
                : '';
            clienteAnterior = pedido.clienteId;
            return encabezado + '<tr><td>#' + escapar(pedido.id) + '</td><td>' +
                escapar(pedido.clienteNombre) + '</td><td><span class="vf-status ' + pedido.estado + '">' +
                escapar(pedido.estado.replaceAll('_', ' ')) + '</span></td><td>' + moneda(pedido.total) +
                '</td><td>' + escapar(new Date(pedido.fechaCompleta).toLocaleString('es-CO')) + '</td></tr>';
        }).join('') || '<tr><td colspan="5" class="text-center py-4">No hay pedidos para esta búsqueda.</td></tr>';
    }

    function aplicarPeriodo() {
        const seleccion = obtener("selectorPeriodo").value;

        if (seleccion === "personalizado") {
            return;
        }

        let hasta = fechaHoy();
        let desde;

        if (seleccion === "todo" && pedidos.length > 0) {
            const fechas = pedidos
                .map(pedido => pedido.fecha)
                .sort();

            desde = fechas[0];
            hasta = fechas[fechas.length - 1];

        } else {
            const dias = seleccion === "todo"
                ? 30
                : Number(seleccion);

            desde = new Date(
                Date.parse(hasta) - (dias - 1) * 86400000
            ).toISOString().slice(0, 10);
        }

        obtener("fechaDesde").value = desde;
        obtener("fechaHasta").value = hasta;

        actualizar();
    }

    function descargarReporte() {
        if (!resultadoActual || !periodoAplicado) {
            return;
        }

        const filas = [
            [
                "Fecha del pedido",
                "Pedidos entregados",
                "Unidades vendidas",
                "Ingresos COP",
                "Promedio por pedido COP"
            ],
            ...resultadoActual.dias.map(dia => [
                dia.fecha,
                dia.pedidos,
                dia.unidades,
                dia.ingresos.toFixed(2).replace(".", ","),
                dia.promedio.toFixed(2).replace(".", ",")
            ])
        ];

        const contenido = "\uFEFF" + filas
            .map(fila => fila.join(";"))
            .join("\r\n");

        const archivo = new Blob([contenido], {
            type: "text/csv;charset=utf-8"
        });

        const direccion = URL.createObjectURL(archivo);
        const enlace = document.createElement("a");

        enlace.href = direccion;

        enlace.download =
            `VidaFit-ventas-${periodoAplicado.desde}` +
            `-${periodoAplicado.hasta}.csv`;

        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        setTimeout(() => {
            URL.revokeObjectURL(direccion);
        }, 1000);
    }

    obtener("filtroCliente").addEventListener("input", mostrarHistorial);
    obtener("btnActualizarDashboard").addEventListener("click", async () => {
        obtener("btnActualizarDashboard").disabled = true;
        bloquearFiltros(true);
        obtener("mensajeCarga").hidden = false;
        try {
            pedidos = await cargarPedidos();
            if (obtener("selectorPeriodo").value === "personalizado") actualizar();
            else aplicarPeriodo();
            obtener("estadoConexion").textContent = 'Datos actualizados · ' + pedidos.length + ' pedidos cargados.';
        } catch (error) {
            mostrarError(error.message);
        } finally {
            bloquearFiltros(false);
            obtener("btnReporte").disabled = !resultadoActual;
            obtener("mensajeCarga").hidden = true;
            obtener("btnActualizarDashboard").disabled = false;
        }
    });

    bloquearFiltros(true);
    obtener("btnActualizarDashboard").disabled = true;
    obtener("mensajeCarga").hidden = false;

    obtener("formularioFiltros").addEventListener(
        "submit",
        evento => {
            evento.preventDefault();
            actualizar();
        }
    );

    obtener("selectorPeriodo").addEventListener(
        "change",
        aplicarPeriodo
    );

    ["fechaDesde", "fechaHasta"].forEach(id => {
        obtener(id).addEventListener("input", () => {
            obtener("selectorPeriodo").value = "personalizado";
        });
    });

    obtener("btnReporte").addEventListener(
        "click",
        descargarReporte
    );

    try {
        pedidos = await cargarPedidos();

        obtener("estadoConexion").textContent =
            `Conectado al backend · ${pedidos.length} pedidos cargados. ` +
            "Usa Actualizar datos para consultar cambios nuevos.";

        bloquearFiltros(false);
        aplicarPeriodo();

    } catch (error) {
        obtener("estadoConexion").textContent =
            "No se pudo completar la consulta al backend.";

        mostrarError(error.message);
        console.error("Dashboard VidaFit:", error);

    } finally {
        obtener("btnActualizarDashboard").disabled = false;
        obtener("mensajeCarga").hidden = true;
    }
})();
