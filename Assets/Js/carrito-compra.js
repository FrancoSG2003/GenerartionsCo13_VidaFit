const  btnCarrrito = document.getElementById("btnAbrirCarrito");
const btnCerrarCarrito = document.getElementById("btnCerrarCarrito")
const btnSeguirComprando = document.getElementById("btnContinuarComprando")
const overlay = document.getElementById("overlay");


btnCarrrito.addEventListener("click", mostrarCarrito);
btnCerrarCarrito.addEventListener("click", cerrarCarrito);
btnSeguirComprando.addEventListener("click", cerrarCarrito);



function mostrarCarrito() {
    overlay.classList.remove("d-none");

    setTimeout(function() {
        overlay.classList.add("carrito-abierto");
    }, 10); 
}


function cerrarCarrito() {
    overlay.classList.remove("carrito-abierto");

    setTimeout(function() {
        overlay.classList.add("d-none");
    }, 400);
}


