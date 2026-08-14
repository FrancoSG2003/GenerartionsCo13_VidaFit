let listaProductos = [];

const formProducto = document.getElementById('form-producto');
const contenedorProductos = document.getElementById('contenedor-productos');
const contadorProductos = document.getElementById('contador-productos');


const IMAGEN_FALLBACK = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23e9ecef%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%236c757d%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%3ESin%20Imagen%3C%2Ftext%3E%3C%2Fsvg%3E';

// Arreglo de imagen y evitar bucles
window.handleImageError = function (img) {
    img.onerror = null; 
    img.src = IMAGEN_FALLBACK;
};

formProducto.addEventListener('submit', function (event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const categoria = document.getElementById('categoria').value;
    const precio = parseFloat(document.getElementById('precio').value) || 0;
    const stock = parseInt(document.getElementById('stock').value, 10) || 0;
    const imagen = document.getElementById('imagen').value;
    const descripcion = document.getElementById('descripcion').value;

    const nuevoProducto = {
        id: Date.now(),
        nombre: nombre,
        categoria: categoria,
        precio: precio,
        stock: stock,
        imagen: imagen.trim() !== '' ? imagen : IMAGEN_FALLBACK,
        descripcion: descripcion
    };

    listaProductos.push(nuevoProducto);
    actualizarInterfaz();
    formProducto.reset();
});

function actualizarInterfaz() {
    renderizarProductos();
    actualizarContador();
    imprimirJsonConsola();
}

function renderizarProductos() {
    contenedorProductos.innerHTML = '';

    if (listaProductos.length === 0) {
        contenedorProductos.innerHTML = `
            <div class="col-12 text-center text-muted py-4">
                <p class="mb-0">No hay productos registrados en el catálogo.</p>
            </div>
        `;
        return;
    }

    listaProductos.forEach((producto) => {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4';

        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm">
                <img src="${producto.imagen}" class="card-img-top object-fit-cover" alt="${producto.nombre}" style="height: 200px;" onerror="handleImageError(this)">
                <div class="card-body d-flex flex-column">
                    <span class="badge text-bg-secondary w-auto align-self-start mb-2">${producto.categoria}</span>
                    <h5 class="card-title fw-bold">${producto.nombre}</h5>
                    <p class="card-text text-secondary small flex-grow-1">${producto.descripcion}</p>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="fs-5 fw-bold text-primary">$${producto.precio.toLocaleString()}</span>
                        <span class="small text-muted">Stock: ${producto.stock}</span>
                    </div>
                    <button type="button" class="btn btn-outline-danger btn-sm w-100 mt-auto" onclick="eliminarProducto(${producto.id})">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;

        contenedorProductos.appendChild(col);
    });
}

function actualizarContador() {
    const total = listaProductos.length;
    contadorProductos.textContent = `${total} Producto${total === 1 ? '' : 's'}`;
}

window.eliminarProducto = function (id) {
    listaProductos = listaProductos.filter(producto => producto.id !== id);
    actualizarInterfaz();
};

function imprimirJsonConsola() {
    console.log("--Catálogo--");
    console.log(JSON.stringify(listaProductos, null, 2));
}