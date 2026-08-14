const formProducto = document.getElementById("form-producto");
const inputNombre = document.getElementById("nombre");
const inputCategoria = document.getElementById("categoria");
const inputPrecio = document.getElementById("precio");
const inputStock = document.getElementById("stock");
const inputDescripcion = document.getElementById("descripcion");
const inputImagen = document.getElementById("imagen");
const contenedorProductos = document.getElementById("contenedor-productos");
const contadorProductos = document.getElementById("contador-productos");

let contador = 1;

let productos = JSON.parse(localStorage.getItem("productos")) || [];

formProducto.addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = inputNombre.value.trim();
    const categoria = inputCategoria.value.trim();


    const descripcion = inputDescripcion.value.trim();
    const imagen = inputImagen.value.trim();

    const precio = Number(inputPrecio.value);
    const stock = parseInt(inputStock.value);

    if (!nombre || !categoria || !descripcion || !imagen || isNaN(precio) || isNaN(stock) || precio <= 0 || stock < 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Datos inválidos',
            text: 'Por favor, llena todos los campos y asegúrate de que el precio y stock sean mayores a cero.',
            confirmButtonColor: '#212529'
        });
        return;
    }
    const nuevoProducto = {
        id: contador++,
        nombre: nombre,
        categoria: categoria,
        precio: precio,
        stock: stock,
        descripcion: descripcion,
        imagen: imagen
    };

    productos.push(nuevoProducto);

    formProducto.reset();

    renderizarProductos();
    guardarProductosEnLocalStorage();
    Swal.fire({
        icon: 'success',
        title: 'Producto agregado',
        text: 'El producto ha sido agregado exitosamente.',
        confirmButtonColor: '#212529'
    });

});

function renderizarProductos() {

    contenedorProductos.innerHTML = "";

    if (productos.length === 0) {
        contenedorProductos.innerHTML = `<p class="text-center text-muted col-12 py-4">No hay productos registrados aún.</p>`;
        contadorProductos.textContent = `Total de productos: 0`;
        return;
    }

    productos.forEach(producto => {
        const productoHTML = `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${producto.nombre}</h5>
                        <p class="card-text text-secondary">${producto.descripcion}</p>
                        <p class="card-text mb-1"><strong>Categoría:</strong> ${producto.categoria}</p>
                        <p class="card-text mb-1"><strong>Precio:</strong> $${producto.precio.toFixed(2)}</p>
                        <p class="card-text mb-1"><strong>Stock:</strong> ${producto.stock}</p>
                        <button class="btn btn-outline-danger btn-sm w-100 mt-3" onclick="eliminarProducto(${producto.id})">
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
        contenedorProductos.innerHTML += productoHTML;
    });

    contadorProductos.textContent = `Total de productos: ${productos.length}`;
}

function eliminarProducto(id) {
    productos = productos.filter(producto => producto.id !== id);
    renderizarProductos();
    guardarProductosEnLocalStorage();
}


function guardarProductosEnLocalStorage() {
    localStorage.setItem("productos", JSON.stringify(productos));
}

renderizarProductos();