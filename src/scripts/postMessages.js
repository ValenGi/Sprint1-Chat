document.addEventListener('DOMContentLoaded', async function () {
  const usuariosContainer = document.querySelector('.listaChats');
  const chatBox = document.querySelector('.chatBox');
  const mensajeInput = document.querySelector('.chatbox-input input');
  const botonEnviar = document.querySelector('.chatbox-input button');
  const headerUsuario = document.querySelector('.container-derecha .header .imagenTexto');
  const containerDerecha = document.querySelector('.container-derecha');

  const cargarConversacion = async (userId) => {
    const response = await fetch(`http://localhost:3000/mensajes/${userId}`);
    const data = await response.json();

    chatBox.innerHTML = '';

    data.conversaciones.forEach(mensaje => {
      const senderClass = mensaje.sendBy === 1 ? 'mi_mensaje' : 'su_mensaje';
      const mensajeHTML = `
        <div class="mensaje ${senderClass}">
          <p>${mensaje.message}<br /><span>${mensaje.hour}</span></p>
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

  const cargarUsuarios = async () => {
    const response = await fetch('http://localhost:3000/usuarios');
    const usuariosData = await response.json();

    usuariosData.forEach(async usuario => {
      const bloque = document.createElement('div');
      bloque.classList.add('listaChats-bloque');
      bloque.setAttribute('data-id', usuario.id);

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
        if (window.innerWidth <= 768) {
          // Responsive panel derecho
          usuariosContainer.classList.remove('active');
          bloque.classList.add('active');

          const userId = bloque.getAttribute('data-id');
          await cargarConversacion(userId);

          // Mostrar el panel derecho después de hacer clic en una conversación
          const containerDerecha = document.querySelector('.container-derecha');
          containerDerecha.classList.add('active');
          
        } else {
          // Versión normal
          usuariosContainer.querySelectorAll('.listaChats-bloque').forEach(u => u.classList.remove('active'));
          bloque.classList.add('active');

          const userId = bloque.getAttribute('data-id');
          await cargarConversacion(userId);
        }
      });
    });
  };

  await cargarUsuarios();

  botonEnviar.addEventListener('click', async () => {
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
      sendBy: 1,
      date: new Date().toISOString().split('T')[0],
      hour: new Date().toLocaleTimeString(),
      message: nuevoMensaje,
      flag: false,
    };
    data.conversaciones.push(newMessage);

    await fetch(`http://localhost:3000/mensajes/${userId}`, {
      method: 'PUT', // Actualizar la conversación
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    await cargarConversacion(userId);
    mensajeInput.value = '';
  });
});
