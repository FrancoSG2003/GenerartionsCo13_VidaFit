const API_USUARIOS = 'https://backend-vidafit.onrender.com/api/usuarios';

let usuarios = [];

async function cargarUsuarios () {

    try {
        
        const respuesta = await fetch(API_USUARIOS);

        if (!respuesta.ok) {
            throw new Error('Error al recuperar los usuarios de la base de datos');
        }

        usuarios = await respuesta.json();

        mostrarUsuarios();
        actualizarContador();

    } catch (error) {

        console.error (
            'Error al cargar los usuarios',
            error
        );     
    }
}


function mostrarUsuarios () {

    const contenedor = document.getElementById('contenedor-usuarios');

    contenedor.innerHTML = '';

    usuarios.forEach(function (usuario) {

        const columna = document.createElement('div');

        columna.className = 'col-12';

        columna.innerHTML = `

            <article class="card shadow-sm border">

                <div class="card-body">

                    <div class="row align-items-center">

                        <div class="col-md-1">
                            <span class="text-muted">
                                #${usuario.id}
                            </span>
                        </div>

                        <div class="col-md-4">
                            <strong>
                                ${usuario.nombre}
                            </strong>
                        </div>

                        <div class="col-md-4">
                            <span class="text-muted">
                                ${usuario.correo}
                            </span>
                        </div>

                        <div class="col-md-3">
                            <span class="badge text-bg-primary">
                                ${usuario.roles.join(', ')}
                            </span>
                        </div>

                    </div>

                </div>

            </article>

        `;

        contenedor.appendChild(columna);
    });
}

function actualizarContador (){ 

    const contador =  document.getElementById('contador-productos');

    const cantidad = usuarios.length;

    contador.textContent = `${cantidad} ${cantidad === 1 ? 'Usuario' : 'Usuarios'}`;
}

cargarUsuarios();