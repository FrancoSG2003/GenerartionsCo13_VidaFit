const btnCarrito = document.getElementById("btnAbrirCarrito");
const btnCerrarCarrito = document.getElementById("btnCerrarCarrito");
const btnContinuarComprando = document.getElementById("btnContinuarComprando");
const overlay = document.getElementById("overlay");

const botonesAgregarCarrito = document.querySelectorAll(".btn-agregar-carrito");

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

    console.log(carrito);
}