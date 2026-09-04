const btnCarrito = document.getElementById("btnAbrirCarrito");
const btnCerrarCarrito = document.getElementById("btnCerrarCarrito");
const btnContinuarComprando = document.getElementById("btnContinuarComprando");
const overlay = document.getElementById("overlay");

const botonesAgregarCarrito = document.querySelectorAll(".btn-agregar-carrito");

const contenedorProductosCarrito = document.getElementById("contenedorProductosCarrito");
const plantillaProductoCarrito = document.getElementById("plantillaProductoCarrito");
const carritoVacio = document.getElementById("carritoVacio");

const contadorCarrito = document.getElementById("contadorCarrito");
const cantidadTotalProductos = document.getElementById("cantidadTotalProductos");
const precioTotalCarrito = document.getElementById("precioTotalCarrito");
const btnVaciarCarrito = document.getElementById("btnVaciarCarrito");
const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");

const carrito = [];

if (btnCarrito) btnCarrito.addEventListener("click", mostrarCarrito);
if (btnCerrarCarrito) btnCerrarCarrito.addEventListener("click", cerrarCarrito);
if (btnContinuarComprando) btnContinuarComprando.addEventListener("click", cerrarCarrito);
if (btnVaciarCarrito) btnVaciarCarrito.addEventListener("click", vaciarCarrito);
if (btnFinalizarCompra) btnFinalizarCompra.addEventListener("click", finalizarCompra);

botonesAgregarCarrito.forEach(function (boton) {
    const tarjeta = boton.closest(".producto-card");
    if (!tarjeta) return;

    const stockDisponible = Number(tarjeta.dataset.stock);
    if (stockDisponible <= 0) {
        boton.disabled = true;
        boton.textContent = "Agotado";
        return;
    }

    boton.addEventListener("click", agregarProducto);
});

function mostrarCarrito() {
    if (!overlay) return;
    overlay.classList.remove("d-none");
    setTimeout(function () {
        overlay.classList.add("carrito-abierto");
    }, 10);
}

function cerrarCarrito() {
    if (!overlay) return;
    overlay.classList.remove("carrito-abierto");
    setTimeout(function () {
        overlay.classList.add("d-none");
    }, 400);
}

function obtenerStockDisponible(id) {
    const tarjeta = document.querySelector(`.producto-card[data-id="${id}"]`);
    if (!tarjeta) {
        return null; // Retorna null si la tarjeta no está presente en esta página específica
    }
    return Number(tarjeta.dataset.stock);
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
    document.querySelectorAll(".producto-card").forEach(function (tarjeta) {
        stockProductos[tarjeta.dataset.id] = Number(tarjeta.dataset.stock);
    });
    localStorage.setItem("stockVidaFit", JSON.stringify(stockProductos));
}

function cargarStockLocal() {
    const stockGuardado = localStorage.getItem("stockVidaFit");
    if (!stockGuardado) return;

    const stockProductos = JSON.parse(stockGuardado);
    document.querySelectorAll(".producto-card").forEach(function (tarjeta) {
        const id = tarjeta.dataset.id;
        if (stockProductos[id] !== undefined) {
            tarjeta.dataset.stock = stockProductos[id];
        }
    });
}

function actualizarDisponibilidadProductos() {
    botonesAgregarCarrito.forEach(function (boton) {
        const tarjeta = boton.closest(".producto-card");
        if (!tarjeta) return;

        const stockDisponible = Number(tarjeta.dataset.stock);
        if (stockDisponible <= 0) {
            boton.disabled = true;
            boton.textContent = "Agotado";
        }
    });
}

function agregarProducto(event) {
    const boton = event.currentTarget;
    const tarjeta = boton.closest(".producto-card");
    if (!tarjeta) return;

    const stockDisponible = Number(tarjeta.dataset.stock);
    if (stockDisponible <= 0) return;

    const producto = {
        id: Number(tarjeta.dataset.id),
        nombre: tarjeta.querySelector(".card-title").textContent.trim(),
        precio: Number(tarjeta.dataset.precio),
        imagen: tarjeta.querySelector(".producto-imagen img").src,
        cantidad: 1
    };

    const productoExistente = carrito.find(function (item) {
        return item.id === producto.id;
    });

    if (productoExistente) {
        if (productoExistente.cantidad >= stockDisponible) {
            mostrarLimiteStock(stockDisponible);
            return;
        }
        productoExistente.cantidad++;
    } else {
        carrito.push(producto);
    }

    guardarCarritoLocal();
    renderizarCarrito();
}

function renderizarCarrito() {
    if (!contenedorProductosCarrito || !plantillaProductoCarrito) return;

    contenedorProductosCarrito.innerHTML = "";

    if (carrito.length === 0) {
        if (carritoVacio) carritoVacio.classList.remove("d-none");
        if (btnVaciarCarrito) btnVaciarCarrito.disabled = true;
        if (btnFinalizarCompra) btnFinalizarCompra.disabled = true;
    } else {
        if (carritoVacio) carritoVacio.classList.add("d-none");
        if (btnVaciarCarrito) btnVaciarCarrito.disabled = false;
        if (btnFinalizarCompra) btnFinalizarCompra.disabled = false;
    }

    carrito.forEach(function (producto) {
        const productoCarrito = plantillaProductoCarrito.content.cloneNode(true);

        const tarjetaProducto = productoCarrito.querySelector(".producto-carrito");
        const imagenProducto = productoCarrito.querySelector(".producto-imagen-carrito");
        const nombreProducto = productoCarrito.querySelector(".producto-nombre");
        const precioProducto = productoCarrito.querySelector(".producto-precio");
        const cantidadProducto = productoCarrito.querySelector(".producto-cantidad");
        const subtotalProducto = productoCarrito.querySelector(".producto-subtotal");

        const btnDisminuirCantidad = productoCarrito.querySelector(".btnDisminuirCantidad");
        const btnAumentarCantidad = productoCarrito.querySelector(".btnAumentarCantidad");
        const btnEliminarProducto = productoCarrito.querySelector(".btnEliminarProducto");

        tarjetaProducto.dataset.id = producto.id;
        imagenProducto.src = producto.imagen;
        imagenProducto.alt = producto.nombre;

        nombreProducto.textContent = producto.nombre;
        precioProducto.textContent = formatearPrecio(producto.precio);
        cantidadProducto.textContent = producto.cantidad;

        const subtotal = producto.precio * producto.cantidad;
        subtotalProducto.textContent = formatearPrecio(subtotal);

        btnDisminuirCantidad.addEventListener("click", function () {
            disminuirCantidad(producto.id);
        });

        btnAumentarCantidad.addEventListener("click", function () {
            aumentarCantidad(producto.id);
        });

        btnEliminarProducto.addEventListener("click", function () {
            eliminarProducto(producto.id);
        });

        contenedorProductosCarrito.appendChild(productoCarrito);
    });

    actualizarResumenCarrito();
}

function aumentarCantidad(id) {
    const producto = carrito.find(function (item) {
        return item.id === id;
    });
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
    const producto = carrito.find(function (item) {
        return item.id === id;
    });
    if (!producto) return;

    if (producto.cantidad > 1) {
        producto.cantidad--;
    }

    guardarCarritoLocal();
    renderizarCarrito();
}

function eliminarProducto(id) {
    const posicionProducto = carrito.findIndex(function (item) {
        return item.id === id;
    });
    if (posicionProducto === -1) return;

    carrito.splice(posicionProducto, 1);
    guardarCarritoLocal();
    renderizarCarrito();
}

function vaciarCarrito() {
    if (carrito.length === 0) return;

    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-danger"
        },
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
            carrito.length = 0;
            guardarCarritoLocal();
            renderizarCarrito();

            swalWithBootstrapButtons.fire({
                title: "¡Carrito vacío!",
                text: "Todos los productos fueron eliminados.",
                icon: "success"
            });
        }
    });
}

function finalizarCompra() {
    if (carrito.length === 0) return;

    const productoSinStock = carrito.find(function (producto) {
        const stockDisponible = obtenerStockDisponible(producto.id);
        return stockDisponible !== null && producto.cantidad > stockDisponible;
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

    Swal.fire({
        title: "¿Finalizar compra?",
        text: "Confirma que deseas realizar la compra.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, comprar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#212529"
    }).then(function (result) {
        if (!result.isConfirmed) return;

        carrito.forEach(function (producto) {
            const tarjeta = document.querySelector(`.producto-card[data-id="${producto.id}"]`);
            if (!tarjeta) return;

            const stockActual = Number(tarjeta.dataset.stock);
            tarjeta.dataset.stock = stockActual - producto.cantidad;
        });

        guardarStockLocal();
        actualizarDisponibilidadProductos();

        carrito.length = 0;
        guardarCarritoLocal();
        renderizarCarrito();

        Swal.fire({
            icon: "success",
            title: "¡Compra realizada!",
            text: "Tu compra fue finalizada correctamente.",
            confirmButtonColor: "#212529"
        });
    });
}

function actualizarResumenCarrito() {
    let cantidadTotal = 0;
    let precioTotal = 0;

    carrito.forEach(function (producto) {
        cantidadTotal += producto.cantidad;
        precioTotal += producto.precio * producto.cantidad;
    });

    if (contadorCarrito) contadorCarrito.textContent = cantidadTotal;
    if (cantidadTotalProductos) cantidadTotalProductos.textContent = cantidadTotal;
    if (precioTotalCarrito) precioTotalCarrito.textContent = formatearPrecio(precioTotal);
}

function formatearPrecio(precio) {
    return "$" + precio.toLocaleString("es-CO");
}

function guardarCarritoLocal() {
    localStorage.setItem("carritoVidaFit", JSON.stringify(carrito));
}

function cargarCarritoLocal() {
    const carritoGuardado = localStorage.getItem("carritoVidaFit");
    if (!carritoGuardado) return;

    const productosGuardados = JSON.parse(carritoGuardado);

    productosGuardados.forEach(function (producto) {
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

cargarStockLocal();
cargarCarritoLocal();
actualizarDisponibilidadProductos();
renderizarCarrito();