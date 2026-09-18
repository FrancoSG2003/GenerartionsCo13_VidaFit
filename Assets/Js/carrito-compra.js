// Referencias al DOM
const btnCarrito = document.getElementById("btnAbrirCarrito");
const btnCerrarCarrito = document.getElementById("btnCerrarCarrito");
const btnContinuarComprando = document.getElementById("btnContinuarComprando");
const overlay = document.getElementById("overlay");

const contenedorProductosCarrito = document.getElementById("contenedorProductosCarrito");
const plantillaProductoCarrito = document.getElementById("plantillaProductoCarrito");
const carritoVacio = document.getElementById("carritoVacio");

const contadorCarrito = document.getElementById("contadorCarrito") || document.querySelector(".carrito-contador");
const cantidadTotalProductos = document.getElementById("cantidadTotalProductos");
const precioTotalCarrito = document.getElementById("precioTotalCarrito");
const btnVaciarCarrito = document.getElementById("btnVaciarCarrito");
const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");

// Estado global
let carrito = [];
let inicializado = false;

// Event Listeners de Interfaz
btnCarrito?.addEventListener("click", mostrarCarrito);
btnCerrarCarrito?.addEventListener("click", cerrarCarrito);
btnContinuarComprando?.addEventListener("click", cerrarCarrito);
btnVaciarCarrito?.addEventListener("click", vaciarCarrito);
btnFinalizarCompra?.addEventListener("click", finalizarCompra);

// Delegación global de clics para agregar al carrito
document.addEventListener("click", (e) => {
    const boton = e.target.closest(".btn-agregar-carrito");
    if (!boton) return;

    const tarjeta = boton.closest(".producto-card, .card");
    if (!tarjeta) return;

    const stockDisponible = Number(tarjeta.dataset.stock);
    if (!isNaN(stockDisponible) && stockDisponible <= 0) {
        boton.disabled = true;
        boton.textContent = "Agotado";
        return;
    }

    agregarProducto(e);
});

// Auxiliares
const parsearPrecio = (valor) => parseFloat(String(valor || 0).replace(/[^0-9.-]+/g, "")) || 0;
const formatearPrecio = (precio) => "$" + Number(precio).toLocaleString("es-CO");

function obtenerUsuarioIdSesion() {
    const sesion = localStorage.getItem("usuarioSesionActiva");
    if (!sesion) return 1;
    try {
        return JSON.parse(sesion).id || 1;
    } catch {
        return 1;
    }
}

function mostrarCarrito() {
    if (!overlay) return;
    overlay.classList.remove("d-none");
    setTimeout(() => overlay.classList.add("carrito-abierto"), 10);
}

function cerrarCarrito() {
    if (!overlay) return;
    overlay.classList.remove("carrito-abierto");
    setTimeout(() => overlay.classList.add("d-none"), 400);
}

function obtenerStockDisponible(id) {
    const tarjeta = document.querySelector(`.producto-card[data-id="${id}"], .card[data-id="${id}"]`);
    if (tarjeta?.dataset.stock !== undefined) return Number(tarjeta.dataset.stock);

    const stockGuardado = localStorage.getItem("stockVidaFit");
    if (stockGuardado) {
        try {
            const stockProductos = JSON.parse(stockGuardado);
            if (stockProductos[id] !== undefined) return Number(stockProductos[id]);
        } catch (e) {
            console.error("Error al leer stockVidaFit:", e);
        }
    }
    return null;
}

function mostrarLimiteStock(stockDisponible) {
    Swal.fire({
        icon: "info",
        title: "Stock máximo alcanzado",
        text: `Solo hay ${stockDisponible} unidades disponibles de este producto.`,
        confirmButtonColor: "#212529"
    });
}

function guardarStockLocal() {
    const stockProductos = {};
    document.querySelectorAll(".producto-card, .card").forEach((tarjeta) => {
        if (tarjeta.dataset.id) stockProductos[tarjeta.dataset.id] = Number(tarjeta.dataset.stock);
    });
    localStorage.setItem("stockVidaFit", JSON.stringify(stockProductos));
}

function cargarStockLocal() {
    const stockGuardado = localStorage.getItem("stockVidaFit");
    if (!stockGuardado) return;

    const stockProductos = JSON.parse(stockGuardado);
    document.querySelectorAll(".producto-card, .card").forEach((tarjeta) => {
        const id = tarjeta.dataset.id;
        if (id && stockProductos[id] !== undefined) tarjeta.dataset.stock = stockProductos[id];
    });
}

function actualizarDisponibilidadProductos() {
    document.querySelectorAll(".btn-agregar-carrito").forEach((boton) => {
        const tarjeta = boton.closest(".producto-card, .card");
        if (!tarjeta) return;

        const stockDisponible = Number(tarjeta.dataset.stock);
        if (!isNaN(stockDisponible) && stockDisponible <= 0) {
            boton.disabled = true;
            boton.textContent = "Agotado";
        } else {
            boton.disabled = false;
            boton.innerHTML = '<i class="fas fa-cart-plus me-1"></i> Agregar al carrito';
        }
    });
}

function agregarProducto(event) {
    const boton = event.target?.closest(".btn-agregar-carrito");
    const tarjeta = boton?.closest(".producto-card, .card");
    if (!tarjeta) return;

    const rawId = tarjeta.dataset.id;
    const idProducto = rawId ? Number(rawId) : tarjeta.querySelector(".card-title")?.textContent.trim();
    const stockDisponible = obtenerStockDisponible(idProducto);

    if (stockDisponible !== null && !isNaN(stockDisponible) && stockDisponible <= 0) {
        boton.disabled = true;
        boton.textContent = "Agotado";
        return;
    }

    const nombreProducto = tarjeta.querySelector(".card-title")?.textContent.trim() || "Producto";
    const rawPrecio = tarjeta.dataset.precio || boton.dataset.precio || tarjeta.querySelector(".card-text")?.textContent;

    const productoExistente = carrito.find((item) => item.id === idProducto);

    if (productoExistente) {
        if (stockDisponible !== null && !isNaN(stockDisponible) && productoExistente.cantidad >= stockDisponible) {
            mostrarLimiteStock(stockDisponible);
            return;
        }
        productoExistente.cantidad++;
    } else {
        if (stockDisponible !== null && !isNaN(stockDisponible) && stockDisponible < 1) {
            mostrarLimiteStock(stockDisponible);
            return;
        }
        carrito.push({
            id: idProducto,
            nombre: nombreProducto,
            precio: parsearPrecio(rawPrecio),
            imagen: tarjeta.querySelector("img")?.src || "",
            cantidad: 1
        });
    }

    Swal.fire({
        icon: 'success',
        title: '¡Agregado al carrito!',
        text: `${nombreProducto} se añadió correctamente.`,
        timer: 1500,
        showConfirmButton: false,
        position: 'bottom-end',
        toast: true
    });

    guardarCarritoLocal();
    renderizarCarrito();
}

function renderizarCarrito() {
    if (!contenedorProductosCarrito || !plantillaProductoCarrito) return;

    contenedorProductosCarrito.innerHTML = "";
    const estaVacio = carrito.length === 0;

    carritoVacio?.classList.toggle("d-none", !estaVacio);
    if (btnVaciarCarrito) btnVaciarCarrito.disabled = estaVacio;
    if (btnFinalizarCompra) btnFinalizarCompra.disabled = estaVacio;

    carrito.forEach((producto) => {
        const clon = plantillaProductoCarrito.content.cloneNode(true);

        const tarjetaProducto = clon.querySelector(".producto-carrito, article");
        if (tarjetaProducto) tarjetaProducto.dataset.id = producto.id;

        const img = clon.querySelector(".producto-imagen-carrito");
        if (img) { img.src = producto.imagen; img.alt = producto.nombre; }

        const nombre = clon.querySelector(".producto-nombre");
        if (nombre) nombre.textContent = producto.nombre;

        const precio = clon.querySelector(".producto-precio");
        if (precio) precio.textContent = formatearPrecio(producto.precio);

        const cantidad = clon.querySelector(".producto-cantidad");
        if (cantidad) cantidad.textContent = producto.cantidad;

        const subtotal = clon.querySelector(".producto-subtotal");
        if (subtotal) subtotal.textContent = formatearPrecio(producto.precio * producto.cantidad);

        clon.querySelector(".btnDisminuirCantidad")?.addEventListener("click", () => disminuirCantidad(producto.id));
        clon.querySelector(".btnAumentarCantidad")?.addEventListener("click", () => aumentarCantidad(producto.id));
        clon.querySelector(".btnEliminarProducto")?.addEventListener("click", () => eliminarProducto(producto.id));

        contenedorProductosCarrito.appendChild(clon);
    });

    actualizarResumenCarrito();
}

function aumentarCantidad(id) {
    const producto = carrito.find((item) => item.id === id);
    if (!producto) return;

    const stockDisponible = obtenerStockDisponible(id);
    if (stockDisponible !== null && producto.cantidad >= stockDisponible) {
        mostrarLimiteStock(stockDisponible);
        return;
    }

    producto.cantidad++;
    guardarCarritoLocal();
    renderizarCarrito();
}

function disminuirCantidad(id) {
    const producto = carrito.find((item) => item.id === id);
    if (!producto) return;

    if (producto.cantidad > 1) {
        producto.cantidad--;
    } else {
        eliminarProducto(id);
        return;
    }

    guardarCarritoLocal();
    renderizarCarrito();
}

function eliminarProducto(id) {
    carrito = carrito.filter((item) => item.id !== id);
    guardarCarritoLocal();
    renderizarCarrito();
}

function vaciarCarrito() {
    if (carrito.length === 0) return;

    const swalWithBootstrapButtons = Swal.mixin({
        customClass: { confirmButton: "btn btn-success me-2", cancelButton: "btn btn-danger" },
        buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
        title: "¿Vaciar carrito?",
        text: "Se eliminarán todos los productos del carrito.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, vaciar carrito",
        cancelButtonText: "No, cancelar",
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            carrito = [];
            guardarCarritoLocal();
            renderizarCarrito();
            swalWithBootstrapButtons.fire({ title: "¡Carrito vacío!", text: "Todos los productos fueron eliminados.", icon: "success" });
        }
    });
}

async function finalizarCompra() {
    if (carrito.length === 0) return;

    const productoSinStock = carrito.find((p) => {
        const stock = obtenerStockDisponible(p.id);
        return stock !== null && p.cantidad > stock;
    });

    if (productoSinStock) {
        Swal.fire({
            icon: "warning",
            title: "Stock insuficiente",
            text: `No hay suficientes unidades de ${productoSinStock.nombre}.`,
            confirmButtonColor: "#212529"
        });
        return;
    }

    const result = await Swal.fire({
        title: "¿Finalizar compra?",
        text: "Confirmas que deseas realizar la compra.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, comprar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#212529"
    });

    if (!result.isConfirmed) return;

    try {
        const token = localStorage.getItem("token");
        const usuarioId = obtenerUsuarioIdSesion();
        let direccionId = Number(localStorage.getItem("direccionId"));

        // Verificación de respaldo si el ID de la dirección no está cargado localmente
        if (!direccionId || isNaN(direccionId)) {
            const resDirecciones = await fetch(`https://backend-vidafit.onrender.com/api/direcciones/usuario/${usuarioId}`, {
                headers: { ...(token && { "Authorization": `Bearer ${token}` }) }
            });

            if (resDirecciones.ok) {
                const direcciones = await resDirecciones.json();
                if (Array.isArray(direcciones) && direcciones.length > 0) {
                    direccionId = direcciones[0].id;
                    localStorage.setItem("direccionId", direccionId);
                }
            }
        }

        if (!direccionId) {
            throw new Error("No tienes una dirección de envío registrada. Registra una dirección antes de realizar la compra.");
        }

        const pedidoPayload = {
            usuarioId,
            direccionId,
            estado: "CREADO",
            detalles: carrito.map((item) => ({
                productoId: Number(item.id) || 1,
                cantidad: item.cantidad,
                precioUnitario: item.precio
            }))
        };

        const response = await fetch("https://backend-vidafit.onrender.com/api/pedidos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` })
            },
            body: JSON.stringify(pedidoPayload)
        });

        if (!response.ok) {
            const mensajeError = await response.text();
            throw new Error(mensajeError || `Error ${response.status} en la solicitud.`);
        }

        const pedidoCreado = await response.json();

        carrito.forEach((producto) => {
            const tarjeta = document.querySelector(`.producto-card[data-id="${producto.id}"], .card[data-id="${producto.id}"]`);
            if (!tarjeta) return;

            const stockActual = Number(tarjeta.dataset.stock);
            if (!isNaN(stockActual)) {
                tarjeta.dataset.stock = Math.max(0, stockActual - producto.cantidad);
            }
        });

        guardarStockLocal();
        actualizarDisponibilidadProductos();

        carrito = [];
        guardarCarritoLocal();
        renderizarCarrito();

        Swal.fire({
            icon: "success",
            title: "¡Compra realizada!",
            text: `Tu pedido #${pedidoCreado.id || ''} fue procesado correctamente.`,
            confirmButtonColor: "#212529"
        });

    } catch (error) {
        console.error("Error al procesar el pedido:", error);
        Swal.fire({
            icon: "error",
            title: "Error al realizar la compra",
            text: error.message || "Ocurrió un problema al intentar procesar la orden.",
            confirmButtonColor: "#212529"
        });
    }
}

function actualizarResumenCarrito() {
    const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const precioTotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    if (contadorCarrito) contadorCarrito.textContent = cantidadTotal;
    if (cantidadTotalProductos) cantidadTotalProductos.textContent = cantidadTotal;
    if (precioTotalCarrito) precioTotalCarrito.textContent = formatearPrecio(precioTotal);
}

function guardarCarritoLocal() {
    localStorage.setItem("carritoVidaFit", JSON.stringify(carrito));
}

function cargarCarritoLocal() {
    const carritoGuardado = localStorage.getItem("carritoVidaFit");
    if (!carritoGuardado) return;

    carrito = [];
    const productosGuardados = JSON.parse(carritoGuardado);

    productosGuardados.forEach((producto) => {
        const stockDisponible = obtenerStockDisponible(producto.id);
        if (stockDisponible !== null) {
            if (stockDisponible > 0) {
                producto.cantidad = Math.min(producto.cantidad, stockDisponible);
                carrito.push(producto);
            }
        } else {
            carrito.push(producto);
        }
    });
}

function inicializarApp() {
    if (inicializado) return;
    cargarStockLocal();
    cargarCarritoLocal();
    actualizarDisponibilidadProductos();
    renderizarCarrito();
    inicializado = true;
}

// Inicialización
document.addEventListener("productosCatalogoCargados", inicializarApp);
document.addEventListener("DOMContentLoaded", inicializarApp);