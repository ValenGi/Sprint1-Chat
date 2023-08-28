document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("usuarioForm");

  formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const numeroUsuario = document.getElementById("numero_usuario").value;
    const contrasena = document.getElementById("contrasena").value;
    const url = document.getElementById("url").value;
    const info = document.getElementById("info").value;

    const nuevoUsuario = {
      nombre: nombre,
      numero_usuario: numeroUsuario,
      contrasena: contrasena,
      url: url,
      info: info,
    };

    axios
      .post("URL_DEL_ENDPOINT", nuevoUsuario)
      .then(function (response) {
        console.log("Usuario agregado:", response.data);
        // Puedes realizar acciones adicionales aquí después de agregar el usuario
      })
      .catch(function (error) {
        console.error("Error al agregar usuario:", error);
      });
  });
});
