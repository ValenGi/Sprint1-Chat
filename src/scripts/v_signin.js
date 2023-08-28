// Establecer el modo estricto para asegurar buenas prácticas y evitar errores.
(() => {
  "use strict";

  // Obtener referencias a elementos del formulario y campos de entrada.
  const loginForm = document.getElementById("login-form");
  const numeroUsuarioInput = document.getElementById("numeroUsuario");
  const contraseñaInput = document.getElementById("contraseña");

  // Agregar un evento de escucha al formulario para manejar el inicio de sesión.
  loginForm.addEventListener("submit", async function (event) {
    // Prevenir el comportamiento predeterminado del formulario (evitar recarga de página).
    event.preventDefault();

    // Obtener el número de usuario y contraseña ingresados por el usuario.
    const usuario = numeroUsuarioInput.value;
    const contraseña = contraseñaInput.value;

    try {
      // Hacer una solicitud para verificar si el usuario existe en la base de datos.
      const userExistResponse = await axios.get(
        `http://localhost:3000/usuarios?numero_usuario=${usuario}`
      );
      const userData = userExistResponse.data;

      // Si no se encuentra ningún usuario con el número proporcionado, mostrar alerta y salir.
      if (userData.length === 0) {
        alert("El número de usuario no existe.");
        return;
      }

      // Hacer una solicitud para verificar si la contraseña es válida para el usuario.
      const validContraseñaResponse = await axios.get(
        `http://localhost:3000/usuarios?numero_usuario=${usuario}&contrasena=${contraseña}`
      );
      const validContraseñaData = validContraseñaResponse.data;

      // Si no se encuentra ninguna coincidencia de contraseña, mostrar alerta y salir.
      if (validContraseñaData.length === 0) {
        alert("La contraseña ingresada es incorrecta.");
        window.location.href = "login.html";

        return;
      }

      // Obtener el nombre de usuario y mostrar un mensaje de bienvenida.
      const nombreUsuario = userData[0].nombre;
      alert(`¡Bienvenido, ${nombreUsuario}! Has iniciado sesión con éxito.`);

      // Redirigir a la página "home.html" después de iniciar sesión.
      loginForm.reset();
      window.location.href = "home.html";
    } catch (error) {
      console.error("Error al realizar la petición:", error);
    }
  });
})();
