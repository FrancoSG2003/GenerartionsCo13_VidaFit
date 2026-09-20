const API_PRODUCTOS = 'https://backend-vidafit.onrender.com/api/productos';
const API_CATEGORIAS = 'https://backend-vidafit.onrender.com/api/categorias';

let productosCatalogo = [];
let categoriasCatalogo = [];

async function cargarCategorias() {
    try {
        const respuesta = await fetch(API_CATEGORIAS);

        if (!respuesta.ok) {
            throw new Error('Error al obtener las categorias.');
        }

        categoriasCatalogo = await respuesta.json();

    } catch (error) {
        console.error('Error al cargar categorias:', error);
    }
}

async function cargarProductos() { 
    try {
        const respuesta = await fetch(API_PRODUCTOS);

        if (!respuesta.ok) {
            throw new Error('Error al obtener los productos');
        }

        productosCatalogo = await respuesta.json();
        mostrarProductos();

    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function obtenerNombreCategoria(categoriaId) {
    const categoria = categoriasCatalogo.find(
        cat => cat.id === categoriaId
    );

    if (!categoria) {
        return '';
    }

    return categoria.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll(' ', '-');
}

function mostrarProductos() {
    const contenedor = document.getElementById('contenedor-productos');

    if (!contenedor) return;

    contenedor.innerHTML = '';

    productosCatalogo.forEach(function (producto, indice) {

        const columna = document.createElement('div');
        columna.className = 'col producto-columna';
        columna.dataset.posicionOriginal = indice;

        const categoria = obtenerNombreCategoria(producto.categoriaId);
        const imagenRuta = producto.imagen || 'Assets/img/vitaminas-bg.png';

        columna.innerHTML = `
            <article
                class="card h-100 shadow-sm border position-relative producto-card"
                data-id="${producto.id}"
                data-categoria="${categoria}"
                data-precio="${producto.precio}"
                data-stock="${producto.stock ?? 100}"
                data-marca=""
                data-ventas="0"
                data-valoracion="0"
            >
                <button
                    type="button"
                    class="btn btn-link text-dark position-absolute top-0 end-0 m-2 p-0 z-1 boton-favorito"
                    aria-label="Agregar ${producto.nombre} a favoritos"
                    aria-pressed="false">
                    <i class="bi bi-heart fs-5"></i>
                </button>

                <div class="producto-imagen bg-light d-flex align-items-center justify-content-center rounded-top">
                    <img
                        src="${imagenRuta}"
                        alt="${producto.nombre}">
                </div>

                <div class="card-body d-flex flex-column text-start">
                    <h6 class="card-title fw-bold mb-1">
                        ${producto.nombre}
                    </h6>

                    <small class="text-muted">
                        ${producto.descripcion || ''}
                    </small>

                    <div class="my-2 text-warning small">
                        ★★★★★
                        <span class="text-dark ms-1">
                            (0)
                        </span>
                    </div>

                    <p class="card-text fw-bold mb-3">
                        $${Number(producto.precio).toLocaleString('es-CO')}
                    </p>

                    <button
                        type="button"
                        class="btn-agregar-carrito btn btn-outline-dark btn-sm mt-auto w-100"
                        data-precio="${producto.precio}">
                        Agregar al carrito
                        <i class="bi bi-cart"></i>
                    </button>
                </div>
            </article>
        `;

        contenedor.appendChild(columna);
    });

    // Notificar a carrito-compra.js que la carga de productos ha terminado
    document.dispatchEvent(
        new Event('productosCatalogoCargados')
    );
}

async function iniciarCatalogo() {
    await cargarCategorias();
    await cargarProductos();
}

iniciarCatalogo();