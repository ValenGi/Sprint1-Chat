document.addEventListener('DOMContentLoaded', async function () {
  const usuariosContainer = document.querySelector('.listaChats');
  const chatBox = document.querySelector('.chatBox');
  const mensajeInput = document.querySelector('.chatbox-input input');
  const botonEnviar = document.querySelector('.chatbox-input button');
  const headerUsuario = document.querySelector('.container-derecha .header .imagenTexto');
 // const containerDerecha = document.querySelector('.container-derecha');
  

//Buscador
  const buscarInput = document.getElementById('buscarInput');
  const buscarIcono = document.getElementById('buscarIcono');
  const listaChats = document.querySelector('.listaChats');
  const bloquesChats = document.querySelectorAll('.listaChats-bloque');
  
  buscarInput.addEventListener('input', () => {
    
   const searchTerm = buscarInput.value.trim().toLowerCase();
   const bloquesChats = document.querySelectorAll('.listaChats-bloque');

    bloquesChats.forEach(bloque => {
      
      const nombreUsuario = bloque.querySelector('h4').textContent.toLowerCase();
      if (nombreUsuario.includes(searchTerm)) {
        bloque.style.display = 'flex';
        bloque.style.flexDirection= 'row';
        hayCoincidencias = true;
      } else {
        bloque.style.display = 'none';
      }
    });

    if (hayCoincidencias || searchTerm === '') {
      
      listaChats.style.display = 'flex';
      listaChats.style.flexDirection= 'column';
    } else {
      listaChats.style.display = 'none';
    }
  });


//Cargar conversaciones correspondientes


  const cargarConversacion = async (userId) => {
    const response = await fetch(`http://localhost:3000/mensajes/${userId}`);
    const data = await response.json();

    chatBox.innerHTML = '';

    data.conversaciones.forEach(mensaje => {
      const senderClass = mensaje.sendBy === 1 ? 'mi_mensaje' : 'su_mensaje';
      const mensajeHTML = `
      <div class="mensaje ${senderClass}">
      <div class="menu">
          <ul>
            <li><button>Acción 1</button></li>
            <li><button>Acción 2</button></li>
          </ul>
      </div>
        
           <p>
          <button class="button">
              <ion-icon name="chevron-down-outline" class="icono"></ion-icon>
              
            </button>
        ${mensaje.message}<br /><span>${mensaje.hour}</span></p>
      </div>
      </div>`;
      chatBox.innerHTML += mensajeHTML;
    });

    const userResponse = await fetch(`http://localhost:3000/usuarios/${userId}`);
    const userData = await userResponse.json();

    // Actualizar el panel derecho 
    headerUsuario.querySelector('img').src = userData.url;

    const h4 = headerUsuario.querySelector('h4');
    h4.innerHTML = `${userData.nombre}<br><span>${userData.flag || ''}</span>`;
  };


  const cargarUsuarios = async (usuarioAutenticadoId) => {
    const response = await fetch('http://localhost:3000/usuarios');
    const usuariosData = await response.json();

    usuariosData.forEach(async usuario => {
      if (usuario.id === usuarioAutenticadoId) {
        return; 
      }

      const bloque = document.createElement('div');
      bloque.classList.add('listaChats-bloque');
      bloque.setAttribute('data-id', usuario.id);
//Izquierda
      const lastMessageResponse = await fetch(`http://localhost:3000/mensajes/${usuario.id}`);
      const lastMessageData = await lastMessageResponse.json();
      const lastMessage = lastMessageData.conversaciones[lastMessageData.conversaciones.length - 1];
      

      bloque.innerHTML = `
      
        <div class="imgContenedor">
          <img src="${usuario.url}" class="cover" />
        </div>
        <div class="detallesChat">
          <div class="detallesChat-lista">
            <h4>${usuario.nombre}</h4>
            <p class="detallesChat-lista-hora">${lastMessage.hour}</p>
          </div>
          <div class="detallesChat-mensaje">
            <p>${lastMessage.message}</p>
          </div>
        </div>
      `;
      
      usuariosContainer.appendChild(bloque);

      bloque.addEventListener('click', async () => {
        const containerIzquierda = document.querySelector('.container-izquierda');
        if (window.innerWidth <= 768) {
          // Responsive panel derecho
          usuariosContainer.classList.remove('active');
          bloque.classList.add('active');

          const userId = bloque.getAttribute('data-id');
          await cargarConversacion(userId);

          // Mostrar el panel derecho después de hacer clic en una conversación
          const containerDerecha = document.querySelector('.container-derecha');
          
          containerDerecha.classList.add('active');

          containerIzquierda.style.display = 'none';
          
          const flechaBack = document.querySelector(".flechaBack")
          flechaBack.addEventListener('click', ()=>{
            window.location.href = "home.html";
          });
          
          
        } else {
          // Versión normal
          usuariosContainer.querySelectorAll('.listaChats-bloque').forEach(u => u.classList.remove('active'));
          bloque.classList.add('active');
          containerIzquierda.classList.add('active');

          const userId = bloque.getAttribute('data-id');
          await cargarConversacion(userId);
        }
      });
    });
  };

  // Panel Derecho - Autenticación del usuario
  const usuarioAutenticado = JSON.parse(localStorage.getItem('authenticatedUser'));

  if (usuarioAutenticado) {
    await cargarUsuarios(usuarioAutenticado.id);

 // Actualizar la imagen del usuario autenticado
 const imgUsuarioAutenticado = document.querySelector('.cover.imgUsuario');
 imgUsuarioAutenticado.src = usuarioAutenticado.url; 

    botonEnviar.addEventListener('click', async (event) => {
      event.preventDefault();
      const usuarioActivo = document.querySelector('.listaChats-bloque.active');
      if (!usuarioActivo) return;

      const userId = usuarioActivo.getAttribute('data-id');
      const nuevoMensaje = mensajeInput.value.trim();
      if (nuevoMensaje === '') return;

      // Agregar el nuevo mensaje al JSON Server
      const response = await fetch(`http://localhost:3000/mensajes/${userId}`);
      const data = await response.json();
      const newMessage = {
        sendBy: usuarioAutenticado.id, // Usar el ID del usuario autenticado
        date: new Date().toISOString().split('T')[0],
        hour: new Date().toLocaleTimeString(),
        message: nuevoMensaje,
        flag: false,
      };
      data.conversaciones.push(newMessage);

      await fetch(`http://localhost:3000/mensajes/${userId}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      await cargarConversacion(userId);
      mensajeInput.value = '';
    });
  } else {
    // Redirigir al usuario al formulario de inicio de sesión si no está autenticado
    window.location.href = 'login.html'; 
  }
});

//Editar mensajes 
const buttons = document.querySelectorAll(".button");
    const menus = document.querySelectorAll(".menu");

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => {
        if (menus[index].style.display === "block") {
          menus[index].style.display = "none";
        } else {
          menus[index].style.display = "block";
        }
      });
    });

//Modal para editar nombre e imagen
const abrirModalBtn = document.getElementById('abrirModalBtn');
const perfilModal = document.getElementById('perfilModal');
const cerrarModal = document.getElementById('cerrarModal');
const imagenPerfil = document.getElementById('imagenPerfil');
const nuevaImagenUrl = document.getElementById('nuevaImagenUrl');
const cambiarImagenBtn = document.getElementById('cambiarImagenBtn');

//Abrir modal
abrirModalBtn.addEventListener('click', () => {
  perfilModal.style.display = 'block';

  //Imagen actual
  const usuarioAutenticado = JSON.parse(localStorage.getItem('authenticatedUser'));
  if (usuarioAutenticado) {
    imagenPerfil.src = usuarioAutenticado.url;
  }

  // Cerrar modal
  cerrarModal.addEventListener('click', function () {
    perfilModal.style.display = 'none';
  });

  // Cerrar modal si se hace clic por fuera 
  window.addEventListener('click', function (event) {
    if (event.target === perfilModal) {
      perfilModal.style.display = 'none';
    }
  });

  
  const usuarioAutenticadoId = usuarioAutenticado.id;

  // Cargar la imagen del usuario autenticado
  const cargarImagenPerfil = async () => {
    const userResponse = await fetch(`http://localhost:3000/usuarios/${usuarioAutenticadoId}`);
    const userData = await userResponse.json();
    const imagenPerfil = document.getElementById('imagenPerfil');

    // Actualizar URL ingresada
    imagenPerfil.src = userData.url;
    imagenPerfil.setAttribute('data-id', usuarioAutenticadoId);
  };

  cargarImagenPerfil();

  // Cambiar la URL de la imagen del usuario autenticado
const cambiarImagenPerfil = async (nuevaUrl) => {
  const userId = imagenPerfil.getAttribute('data-id');

 
  const userResponse = await fetch(`http://localhost:3000/usuarios/${userId}`);
  const userData = await userResponse.json();

  if (nuevaUrl) {
    // Evitar errores si no se ingresa un enlace
    userData.url = nuevaUrl;

    // Actualizar los datos del usuario en el json server
    const response = await fetch(`http://localhost:3000/usuarios/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      // Actualizar la imagen en el modal
      imagenPerfil.src = nuevaUrl;

      // Actualizar la información en el almacenamiento local (solo si se proporcionó un enlace)
      const usuarioAutenticado = JSON.parse(localStorage.getItem('authenticatedUser'));
      usuarioAutenticado.url = nuevaUrl;
      localStorage.setItem('authenticatedUser', JSON.stringify(usuarioAutenticado));
    } else {
      console.error('Error al actualizar la imagen del perfil.');
    }
  } else {
    console.log('No se proporcionó una nueva URL de imagen. La imagen anterior permanecerá sin cambios.');
  }
    
  };
  //Actualizar nombre
  const nuevoNombreInput = document.getElementById('nuevoNombre');
  if (usuarioAutenticado && usuarioAutenticado.nombre) {
    //Input con el nombre actual del usuario
    nuevoNombreInput.value = usuarioAutenticado.nombre;
  }
  
  //Cambiar el nombre del usuario autentificado
  const cambiarNombreUsuario = async (nuevoNombre) => {
    const userId = usuarioAutenticado.id;
  
    const userResponse = await fetch(`http://localhost:3000/usuarios/${userId}`);
    const userData = await userResponse.json();
  
    // Actualizar el nombre 
    userData.nombre = nuevoNombre;
    const response = await fetch(`http://localhost:3000/usuarios/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  
    if (response.ok) {
      // Actualizar el nombre en el localStorage
      usuarioAutenticado.nombre = nuevoNombre;
      localStorage.setItem('authenticatedUser', JSON.stringify(usuarioAutenticado));

      nuevoNombreInput.value = '';
    } else {
      console.error('Error al actualizar el nombre del perfil.');
    }
  };


  // Botón Cambiar imagen y nombre
  const cambiarImagenBtn = document.getElementById('cambiarImagenBtn');
  cambiarImagenBtn.addEventListener('click', async () => {
  const nuevaImagenUrl = document.getElementById('nuevaImagenUrl').value;
  const nuevoNombre = nuevoNombreInput.value.trim();

  // Cambiar la imagen primero solo si se proporciona una nueva URL
if (nuevaImagenUrl) {
  await cambiarImagenPerfil(nuevaImagenUrl);
}

// Actualizar la URL si se proporcionó 
if (nuevaImagenUrl) {
  usuarioAutenticado.url = nuevaImagenUrl;
}

// Guardar en el localStorage
localStorage.setItem('authenticatedUser', JSON.stringify(usuarioAutenticado));

  // Cambiar el nombre 
  cambiarNombreUsuario(nuevoNombre);
}); 

});

