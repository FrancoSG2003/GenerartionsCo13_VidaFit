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


btnCarrito.addEventListener("click", mostrarCarrito);
btnCerrarCarrito.addEventListener("click", cerrarCarrito);
btnContinuarComprando.addEventListener("click", cerrarCarrito);
btnVaciarCarrito.addEventListener("click", vaciarCarrito);

botonesAgregarCarrito.forEach(function (boton) {
    const tarjeta = boton.closest(".producto-card");

    if (!tarjeta) {
        return;
    }

    if (tarjeta.dataset.stock === "false") {
        boton.disabled = true;
        boton.textContent = "Agotado";
        return;
    }

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

    if (tarjeta.dataset.stock === "false") {
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

    guardarCarritoLocal();
    renderizarCarrito();
}


function renderizarCarrito() {
    contenedorProductosCarrito.innerHTML = "";

    if (carrito.length === 0) {
        carritoVacio.classList.remove("d-none");
        btnVaciarCarrito.disabled = true;
        btnFinalizarCompra.disabled = true;
    } else {
        carritoVacio.classList.add("d-none");
        btnVaciarCarrito.disabled = false;
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

    if (!producto) {
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

    if (!producto) {
        return;
    }

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

    if (posicionProducto === -1) {
        return;
    }

    carrito.splice(posicionProducto, 1);

    guardarCarritoLocal();
    renderizarCarrito();
}

function vaciarCarrito() { 
    if (carrito.length === 0) { 
        return; 
    }
    
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


function guardarCarritoLocal() {
    localStorage.setItem("carritoVidaFit", JSON.stringify(carrito));
}


function cargarCarritoLocal() {
    const carritoGuardado = localStorage.getItem("carritoVidaFit");

    if (!carritoGuardado) {
        return;
    }

    const productosGuardados = JSON.parse(carritoGuardado);

    carrito.push(...productosGuardados);
}


cargarCarritoLocal();
renderizarCarrito();