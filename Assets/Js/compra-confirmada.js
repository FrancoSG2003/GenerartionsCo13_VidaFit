document.addEventListener("DOMContentLoaded", () => {
    const compraGuardada = localStorage.getItem("ultimaCompraVidaFit");

    if (!compraGuardada) {
        window.location.href = "catalogo.html";
        return;
    }

    let compra;

    try {
        compra = JSON.parse(compraGuardada);
    } catch (error) {
        console.error("Error al leer la información de la compra:", error);
        window.location.href = "catalogo.html";
        return;
    }

    mostrarNumeroPedido(compra);
    mostrarInformacionCliente(compra.usuario);
    mostrarDireccionEnvio(compra.direccion);
    mostrarProductos(compra.productos);
    mostrarTotal(compra.total);
});

function mostrarNumeroPedido(compra) {
    const numeroPedido = document.getElementById("numeroPedido");

    if (!numeroPedido) return;

    numeroPedido.textContent = `Pedido #${compra.pedidoId}`;
}

function mostrarInformacionCliente(usuario = {}) {
    const clienteNombre = document.getElementById("clienteNombre");
    const clienteEmail = document.getElementById("clienteEmail");
    const clienteTelefono = document.getElementById("clienteTelefono");

    const nombreCompleto = `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();

    if (clienteNombre) {
        clienteNombre.textContent = nombreCompleto || "No disponible";
    }

    if (clienteEmail) {
        clienteEmail.textContent = usuario.correo  || "No disponible";
    }

    if (clienteTelefono) {
        clienteTelefono.textContent = usuario.telefono || "No registrado";
    }
}

function mostrarDireccionEnvio(direccion = {}) {
    const direccionExacta = document.getElementById("direccionExacta");
    const direccionBarrio = document.getElementById("direccionBarrio");
    const direccionCiudad = document.getElementById("direccionCiudad");

    if (direccionExacta) {
        direccionExacta.textContent =
            direccion.direccionExacta || "No disponible";
    }

    if (direccionBarrio) {
        direccionBarrio.textContent = direccion.barrio
            ? `Barrio: ${direccion.barrio}`
            : "No disponible";
    }

    if (direccionCiudad) {
        const ciudad = direccion.ciudad || "";
        const departamento = direccion.departamento || "";

        direccionCiudad.textContent =
            `${ciudad}${departamento ? `, ${departamento}` : ""}` ||
            "No disponible";
    }
}

function mostrarProductos(productos = []) {
    const listaProductos = document.getElementById("listaProductosCompra");

    if (!listaProductos) return;

    listaProductos.innerHTML = "";

    if (!Array.isArray(productos) || productos.length === 0) {
        listaProductos.innerHTML =
            '<p class="text-muted mb-0">No hay productos registrados.</p>';
        return;
    }

    productos.forEach((producto) => {
        const subtotal = Number(producto.precio) * Number(producto.cantidad);
        const elemento = document.createElement("div");

        elemento.className =
            "d-flex justify-content-between align-items-center border-bottom py-3";

        elemento.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <img
                    src="${producto.imagen || ""}"
                    alt="${producto.nombre || "Producto"}"
                    style="width: 65px; height: 65px; object-fit: contain;"
                    class="rounded border"
                >

                <div>
                    <p class="fw-semibold mb-1">
                        ${producto.nombre || "Producto"}
                    </p>

                    <small class="text-muted">
                        Cantidad: ${producto.cantidad}
                    </small>
                </div>
            </div>

            <span class="fw-semibold">
                $${subtotal.toLocaleString("es-CO")}
            </span>
        `;

        listaProductos.appendChild(elemento);
    });
}

function mostrarTotal(total) {
    const totalCompra = document.getElementById("totalCompra");

    if (!totalCompra) return;

    totalCompra.textContent =
        `$${Number(total || 0).toLocaleString("es-CO")}`;
}