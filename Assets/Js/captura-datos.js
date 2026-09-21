let listaProductos = [];
let listaCategorias = [];
let listaMarcas = [];

const API_BASE = window.VidaFitApiAdmin || 'https://backend-vidafit.onrender.com/api';
const API_PRODUCTOS = `${API_BASE}/productos`;
const API_CATEGORIAS = `${API_BASE}/categorias`;
const API_MARCAS = `${API_BASE}/productos/marcas`;

const formProducto = document.getElementById('form-producto');
const contenedorProductos = document.getElementById('contenedor-productos');
const contadorProductos = document.getElementById('contador-productos');

const tituloFormularioProducto = document.getElementById('tituloFormularioProducto');
const descripcionFormularioProducto = document.getElementById('descripcionFormularioProducto');
const btnAdminAgregarProducto = document.getElementById('btnAdminAgregarProducto');
const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');

let productoEnEdicionId = null;

const IMAGEN_FALLBACK = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23e9ecef%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%236c757d%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%3ESin%20Imagen%3C%2Ftext%3E%3C%2Fsvg%3E';

window.handleImageError = function (img) {
    img.onerror = null;
    img.src = IMAGEN_FALLBACK;
};

async function cargarCategorias() {
    try {
        const respuesta = await fetch(API_CATEGORIAS);
        if (!respuesta.ok) throw new Error('Error al obtener las categorías');

        listaCategorias = await respuesta.json();
        const selectCategoria = document.getElementById('categoria');
        selectCategoria.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>';

        listaCategorias.forEach(categoria => {
            const opcion = document.createElement('option');
            opcion.value = categoria.id;
            opcion.textContent = categoria.nombre;
            selectCategoria.appendChild(opcion);
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

async function cargarMarcas() {
    try {
        const respuesta = await fetch(API_MARCAS);

        if (respuesta.ok) {
            listaMarcas = await respuesta.json();
        } else {
            listaMarcas = ['OPTIMUM_NUTRITION', 'PROSCIENCE', 'MUSCLETECH', 'BSN', 'MUTANT', 'DYMATIZE'];
        }

        const selectMarca = document.getElementById('marca');
        selectMarca.innerHTML = '<option value="" disabled selected>Selecciona una marca</option>';

        listaMarcas.forEach(marca => {
            const opcion = document.createElement('option');
            const valorMarca = typeof marca === 'object' ? marca.id || marca.nombre : marca;
            const textoMarca = typeof marca === 'object' ? marca.nombre : String(marca).replaceAll('_', ' ');

            opcion.value = valorMarca;
            opcion.textContent = textoMarca;
            selectMarca.appendChild(opcion);
        });

    } catch (error) {
        console.error('Error al cargar marcas:', error);
    }
}

async function cargarProductos() {
    try {
        const respuesta = await fetch(API_PRODUCTOS);
        if (!respuesta.ok) throw new Error('Error al obtener los productos');

        listaProductos = await respuesta.json();
        actualizarInterfaz();
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

formProducto.addEventListener('submit', async function (event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const categoriaId = parseInt(document.getElementById('categoria').value, 10);
    const marca = document.getElementById('marca').value;
    const precio = parseFloat(document.getElementById('precio').value.trim());
    const stock = parseInt(document.getElementById('stock').value.trim(), 10);
    const imagen = document.getElementById('imagen').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();

    if (!nombre || isNaN(categoriaId) || !marca || !descripcion || !imagen || isNaN(precio) || isNaN(stock) || precio <= 0 || stock < 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Datos inválidos',
            text: 'Por favor, llena todos los campos incluyendo la marca.',
            confirmButtonColor: '#212529'
        });
        return;
    }

    const esEdicion = productoEnEdicionId !== null;

    const nuevoProducto = {
        nombre: nombre,
        categoriaId: categoriaId,
        marca: marca,
        precio: precio,
        stock: stock,
        imagen: imagen,
        descripcion: descripcion
    };

    try {
        const url = esEdicion ? `${API_PRODUCTOS}/${productoEnEdicionId}` : API_PRODUCTOS;
        const metodo = esEdicion ? 'PUT' : 'POST';

        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        });

        if (!respuesta.ok) throw new Error('Error al guardar el producto.');

        const productoResultado = await respuesta.json();

        if (esEdicion) {
            const indice = listaProductos.findIndex(p => p.id === productoEnEdicionId);
            if (indice !== -1) listaProductos[indice] = productoResultado;
        } else {
            listaProductos.push(productoResultado);
        }

        actualizarInterfaz();
        restablecerFormulario();

        Swal.fire({
            icon: 'success',
            title: esEdicion ? 'Producto actualizado' : 'Producto agregado',
            text: esEdicion ? 'Cambios guardados con éxito.' : 'Producto creado exitosamente.',
            confirmButtonColor: '#212529'
        });

    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message,
            confirmButtonColor: '#212529'
        });
    }
});

function restablecerFormulario() {
    productoEnEdicionId = null;
    formProducto.reset();
    tituloFormularioProducto.textContent = 'Crear nuevo producto';
    descripcionFormularioProducto.textContent = 'Ingresa la información del producto para agregarlo al catálogo.';
    btnAdminAgregarProducto.textContent = '+ Agregar producto';
    btnCancelarEdicion.hidden = true;
}

btnCancelarEdicion.addEventListener('click', restablecerFormulario);

window.editarProducto = function (id) {
    const producto = listaProductos.find(p => p.id === id);
    if (!producto) return;

    productoEnEdicionId = producto.id;

    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('categoria').value = producto.categoriaId || producto.categoria?.id || '';
    document.getElementById('marca').value = producto.marca || '';
    document.getElementById('precio').value = producto.precio;
    document.getElementById('stock').value = producto.stock;
    document.getElementById('imagen').value = producto.imagen;
    document.getElementById('descripcion').value = producto.descripcion;

    tituloFormularioProducto.textContent = 'Editar producto';
    descripcionFormularioProducto.textContent = 'Modifica la información del producto y guarda los cambios.';
    btnAdminAgregarProducto.textContent = 'Guardar cambios';
    btnCancelarEdicion.hidden = false;

    document.getElementById('nombre').focus();
};

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
        const sinStock = producto.stock === 0;
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4';

        const nombreCategoria = listaCategorias.find(c => c.id === (producto.categoriaId || producto.categoria?.id))?.nombre || 'Sin categoría';

        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm ${sinStock ? 'producto-sin-stock' : ''}">
                <img 
                    src="${producto.imagen}" 
                    class="card-img-top object-fit-cover" 
                    alt="${producto.nombre}" 
                    style="height: 200px;" 
                    onerror="handleImageError(this)"
                >
                <div class="card-body d-flex flex-column">

                    <div class="d-flex gap-1 mb-2">
                        <span class="badge text-bg-secondary">
                            ${nombreCategoria}
                        </span>
                        <span class="badge text-bg-dark">
                            ${producto.marca ? String(producto.marca).replaceAll('_', ' ') : 'Sin marca'}
                        </span>
                    </div>

                    ${sinStock ? '<span class="badge bg-danger w-auto align-self-start mb-2">Sin stock</span>' : ''}

                    <h5 class="card-title fw-bold">${producto.nombre}</h5>

                    <p class="card-text text-secondary small flex-grow-1">
                        ${producto.descripcion}
                    </p>

                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="fs-5 fw-bold ${sinStock ? 'text-secondary' : 'text-primary'}">
                            $${producto.precio.toLocaleString()}
                        </span>
                        <span class="small ${sinStock ? 'text-danger fw-bold' : 'text-muted'}">
                            ${sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
                        </span>
                    </div>

                    <button type="button" class="btn btn-outline-secondary btn-sm w-100 mb-2" onclick="editarProducto(${producto.id})">
                        <i class="bi bi-pencil"></i> Editar
                    </button>

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

window.eliminarProducto = async function (id) {
    const producto = listaProductos.find(p => p.id === id);
    if (!producto) return;

    const confirmacion = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar producto?',
        text: `¿Estás seguro de eliminar "${producto.nombre}"?`,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#212529'
    });

    if (!confirmacion.isConfirmed) return;

    try {
        const respuesta = await fetch(`${API_PRODUCTOS}/${id}`, { method: 'DELETE' });

        if (!respuesta.ok) {
            if (respuesta.status === 409) throw new Error('No se puede eliminar el producto porque está asociado a pedidos existentes.');
            if (respuesta.status === 404) throw new Error('El producto no existe o ya fue eliminado.');
            throw new Error('No se pudo eliminar el producto.');
        }

        listaProductos = listaProductos.filter(p => p.id !== id);
        if (productoEnEdicionId === id) restablecerFormulario();

        actualizarInterfaz();

        Swal.fire({
            icon: 'success',
            title: 'Producto eliminado',
            text: 'El producto ha sido eliminado exitosamente.',
            confirmButtonColor: '#212529'
        });

    } catch (error) {
        console.error('Error al eliminar producto:', error);
        Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar',
            text: error.message,
            confirmButtonColor: '#212529'
        });
    }
};

function imprimirJsonConsola() {
    console.log("--Catálogo--");
    console.log(JSON.stringify(listaProductos, null, 2));
}

async function inicializarAdmin() {
    await cargarCategorias();
    await cargarMarcas();
    await cargarProductos();
}

inicializarAdmin();