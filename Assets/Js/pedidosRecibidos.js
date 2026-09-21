
"use strict";

const URL_PEDIDOS = "https://backend-vidafit.onrender.com/api/pedidos";
const URL_USUARIOS = "https://backend-vidafit.onrender.com/api/usuarios";

// Estados definidos en EstadoPedido.java
const estadosPedido = [
    "CREADO",
    "RECIBIDO",
    "EN_PROCESO",
    "EN_CAMINO",
    "ENTREGADO",
    "PENDIENTE"
];


const tablaPedidos = document.getElementById("tablaPedidos");
const mensajePedidos = document.getElementById("mensajePedidos");
const btnActualizarPedidos = document.getElementById("btnActualizarPedidos");
const btnCerrarSesionAdmin = document.getElementById("btnCerrarSesionAdmin");


let pedidosCargados = [];
let usuariosPorId = new Map();


function mostrarMensaje(mensaje, tipo = "info") {
    mensajePedidos.textContent = mensaje;
    mensajePedidos.className = `alert alert-${tipo}`;
}

function ocultarMensaje() {
    mensajePedidos.textContent = "";
    mensajePedidos.className = "alert d-none";
}


function crearCelda(texto) {
    const celda = document.createElement("td");
    celda.textContent = texto ?? "—";

    return celda;
}

function formatearFecha(fechaPedido) {
    if (!fechaPedido) {
        return "Sin fecha";
    }

    const fecha = new Date(fechaPedido);

    if (Number.isNaN(fecha.getTime())) {
        return "Fecha no disponible";
    }

    return fecha.toLocaleString("es-CO", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

function formatearMoneda(total) {
    if (total == null || !Number.isFinite(Number(total))) {
        return "No disponible";
    }

    return Number(total).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 2
    });
}

function formatearEstado(estado) {
    if (!estado) {
        return "Sin estado";
    }

    return estado.replaceAll("_", " ");
}


function crearSelectEstado(pedido) {
    const select = document.createElement("select");

    select.className = "form-select form-select-sm select-estado";

    select.setAttribute(
        "aria-label",
        `Cambiar estado del pedido ${pedido.id}`
    );

    select.dataset.id = pedido.id;
    select.dataset.estadoAnterior = pedido.estado ?? "";

    // Incluimos el estado actual por seguridad,
    // además de los estados definidos en el enum.
    const opciones = [...new Set([
        ...(pedido.estado ? [pedido.estado] : []),
        ...estadosPedido
    ])];

    opciones.forEach(estado => {
        const opcion = document.createElement("option");

        opcion.value = estado;
        opcion.textContent = formatearEstado(estado);
        opcion.selected = estado === pedido.estado;

        select.appendChild(opcion);
    });

    return select;
}

function renderizarPedidos(pedidos) {
    tablaPedidos.replaceChildren();

    if (!Array.isArray(pedidos) || pedidos.length === 0) {
        const fila = document.createElement("tr");
        const celda = crearCelda("No hay pedidos registrados.");

        celda.colSpan = 6;
        celda.className = "text-center py-4";

        fila.appendChild(celda);
        tablaPedidos.appendChild(fila);

        return;
    }

    // Mostrar primero los pedidos más recientes.
    const pedidosOrdenados = [...pedidos].sort((a, b) => {
        return Number(b.id) - Number(a.id);
    });

    pedidosOrdenados.forEach(pedido => {
        const fila = document.createElement("tr");

        // Buscar el nombre del cliente por su ID.
        const usuario = usuariosPorId.get(pedido.usuarioId);

        const nombreCliente = usuario
            ? usuario.nombre
            : `Usuario #${pedido.usuarioId ?? "desconocido"}`;

        // Sumar las unidades de todos los detalles.
        const detalles = Array.isArray(pedido.detalles)
            ? pedido.detalles
            : [];

        const cantidadProductos = detalles.reduce((acumulado, detalle) => {
            return acumulado + (Number(detalle.cantidad) || 0);
        }, 0);

        // Número de orden.
        fila.appendChild(crearCelda(`#${pedido.id}`));

        // Cliente.
        fila.appendChild(crearCelda(nombreCliente));

        // Estado.
        const celdaEstado = document.createElement("td");
        celdaEstado.appendChild(crearSelectEstado(pedido));
        fila.appendChild(celdaEstado);

        // Cantidad total de unidades.
        fila.appendChild(crearCelda(cantidadProductos));

        // Total monetario.
        fila.appendChild(crearCelda(formatearMoneda(pedido.total)));

        // Fecha.
        fila.appendChild(crearCelda(formatearFecha(pedido.fechaPedido)));

        tablaPedidos.appendChild(fila);
    });
}


async function obtenerPedidos() {
    const respuesta = await fetch(URL_PEDIDOS);

    if (!respuesta.ok) {
        throw new Error(`Error al consultar pedidos: ${respuesta.status}`);
    }

    const pedidos = await respuesta.json();

    if (!Array.isArray(pedidos)) {
        throw new Error("La respuesta de pedidos no tiene el formato esperado.");
    }

    return pedidos;
}


async function obtenerUsuarios() {
    const respuesta = await fetch(URL_USUARIOS);

    if (!respuesta.ok) {
        throw new Error(`Error al consultar usuarios: ${respuesta.status}`);
    }

    const usuarios = await respuesta.json();

    if (!Array.isArray(usuarios)) {
        throw new Error("La respuesta de usuarios no tiene el formato esperado.");
    }

    return usuarios;
}

async function cargarPedidos() {
    btnActualizarPedidos.disabled = true;

    mostrarMensaje("Consultando el historial de pedidos...", "info");

    try {
        // Los pedidos son la información principal.
        // Si falla la consulta de usuarios, los pedidos
        // todavía pueden mostrarse utilizando su usuarioId.
        const resultadoPedidos = await obtenerPedidos();

        pedidosCargados = resultadoPedidos;

        try {
            const usuarios = await obtenerUsuarios();

            usuariosPorId = new Map(
                usuarios.map(usuario => [usuario.id, usuario])
            );

        } catch (errorUsuarios) {
            console.error("No fue posible cargar los usuarios:", errorUsuarios);

            usuariosPorId = new Map();

            mostrarMensaje(
                "Pedidos cargados, pero no se pudieron obtener los nombres de los clientes.",
                "warning"
            );
        }

        renderizarPedidos(pedidosCargados);

        if (usuariosPorId.size > 0 || pedidosCargados.length === 0) {
            mostrarMensaje(
                `Se cargaron ${pedidosCargados.length} pedidos correctamente.`,
                "success"
            );
        }

    } catch (error) {
        console.error("Error al cargar pedidos:", error);

        mostrarMensaje(
            error.message || "Ocurrió un error al cargar los pedidos.",
            "danger"
        );

        tablaPedidos.replaceChildren();

        const fila = document.createElement("tr");
        const celda = crearCelda("No fue posible cargar los pedidos.");

        celda.colSpan = 6;
        celda.className = "text-center text-danger py-4";

        fila.appendChild(celda);
        tablaPedidos.appendChild(fila);

    } finally {
        btnActualizarPedidos.disabled = false;
    }
}


async function actualizarEstado(select) {
    const pedidoId = select.dataset.id;
    const estadoAnterior = select.dataset.estadoAnterior;
    const nuevoEstado = select.value;

    // No enviar la petición si no hubo cambios.
    if (nuevoEstado === estadoAnterior) {
        return;
    }

    select.disabled = true;

    mostrarMensaje(`Actualizando el estado del pedido #${pedidoId}...`, "info");

    try {
        const respuesta = await fetch(`${URL_PEDIDOS}/${pedidoId}`, {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            // PedidoRequestDTO acepta el campo estado.
            body: JSON.stringify({
                estado: nuevoEstado
            })
        });

        if (!respuesta.ok) {
            const detalleError = await respuesta.text();

            throw new Error(
                detalleError || `Error HTTP ${respuesta.status} al actualizar el pedido.`
            );
        }

        const pedidoActualizado = await respuesta.json();

        // Actualizar el pedido en la memoria del frontend.
        const indice = pedidosCargados.findIndex(
            pedido => String(pedido.id) === String(pedidoId)
        );

        if (indice !== -1) {
            pedidosCargados[indice] = pedidoActualizado;
        }

        // Guardar el nuevo estado como estado anterior.
        select.dataset.estadoAnterior = pedidoActualizado.estado;

        // Reflejar el valor que confirmó el backend.
        select.value = pedidoActualizado.estado;

        mostrarMensaje(
            `El estado del pedido #${pedidoId} se actualizó a ${formatearEstado(pedidoActualizado.estado)}.`,
            "success"
        );

    } catch (error) {
        console.error("Error al actualizar el estado:", error);

        // Restaurar el estado anterior si la petición falla.
        select.value = estadoAnterior;

        mostrarMensaje(
            error.message || "No fue posible actualizar el estado del pedido.",
            "danger"
        );

    } finally {
        select.disabled = false;
    }
}

// Detectar cambios en cualquier menú de estado.
// Se utiliza delegación de eventos porque las filas
// se crean dinámicamente desde JavaScript.
tablaPedidos.addEventListener("change", event => {
    const select = event.target.closest(".select-estado");

    if (!select) {
        return;
    }

    actualizarEstado(select);
});

// Botón para volver a consultar el historial.
btnActualizarPedidos.addEventListener("click", cargarPedidos);

// Cerrar sesión.
btnCerrarSesionAdmin.addEventListener("click", () => {
    localStorage.removeItem("userRole");
    window.location.href = "Login.html";
});



cargarPedidos();