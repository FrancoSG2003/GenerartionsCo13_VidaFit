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
const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");

const carrito = [];


btnCarrito.addEventListener("click", mostrarCarrito);
btnCerrarCarrito.addEventListener("click", cerrarCarrito);
btnContinuarComprando.addEventListener("click", cerrarCarrito);

botonesAgregarCarrito.forEach(function (boton) {
    boton.addEventListener("click", agregarProducto);
});


function mostrarCarrito() {
    overlay.classList.remove("d-none");

    setTimeout(function () {
        overlay.classList.add("carrito-abierto");
    }, 10);
}


function cerrarCarrito() {
    overlay.classList.remove("carrito-abierto");

    setTimeout(function () {
        overlay.classList.add("d-none");
    }, 400);
}


function agregarProducto(event) {
    const boton = event.currentTarget;
    const tarjeta = boton.closest(".producto-card");

    if (!tarjeta) {
        return;
    }

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
        productoExistente.cantidad++;
    } else {
        carrito.push(producto);
    }

    renderizarCarrito();
}


function renderizarCarrito() {
    contenedorProductosCarrito.innerHTML = "";

    if (carrito.length === 0) {
        carritoVacio.classList.remove("d-none");
        btnFinalizarCompra.disabled = true;
    } else {
        carritoVacio.classList.add("d-none");
        btnFinalizarCompra.disabled = false;
    }

    carrito.forEach(function (producto) {
        const productoCarrito = plantillaProductoCarrito.content.cloneNode(true);

        const tarjetaProducto = productoCarrito.querySelector(".producto-carrito");
        const imagenProducto = productoCarrito.querySelector(".producto-imagen-carrito");
        const nombreProducto = productoCarrito.querySelector(".producto-nombre");
        const precioProducto = productoCarrito.querySelector(".producto-precio");
        const cantidadProducto = productoCarrito.querySelector(".producto-cantidad");
        const subtotalProducto = productoCarrito.querySelector(".producto-subtotal");

        tarjetaProducto.dataset.id = producto.id;

        imagenProducto.src = producto.imagen;
        imagenProducto.alt = producto.nombre;

        nombreProducto.textContent = producto.nombre;
        precioProducto.textContent = formatearPrecio(producto.precio);
        cantidadProducto.textContent = producto.cantidad;

        const subtotal = producto.precio * producto.cantidad;
        subtotalProducto.textContent = formatearPrecio(subtotal);

        contenedorProductosCarrito.appendChild(productoCarrito);
    });

    actualizarResumenCarrito();
}


function actualizarResumenCarrito() {
    let cantidadTotal = 0;
    let precioTotal = 0;

    carrito.forEach(function (producto) {
        cantidadTotal += producto.cantidad;
        precioTotal += producto.precio * producto.cantidad;
    });

    contadorCarrito.textContent = cantidadTotal;
    cantidadTotalProductos.textContent = cantidadTotal;
    precioTotalCarrito.textContent = formatearPrecio(precioTotal);
}


function formatearPrecio(precio) {
    return "$" + precio.toLocaleString("es-CO");
}


renderizarCarrito();