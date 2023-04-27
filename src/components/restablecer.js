/* eslint-disable no-unused-vars */
import { mostrarVentanaRecuperarContraseña } from '../helpers/accederCongmail.js';
import { navigateTo } from '../router.js';
import logoBlanco from '../assets/logoPrincipal.png';
import iconoNegro from '../assets/iconoNavegador.png';

export const RecuperarContrasena = () => {
  document.body.classList.add('others-background');
  document.body.classList.remove('home-background');
  const div = document.createElement('div');
  div.className = 'contenedores-r-r';
  div.innerHTML = `
    <picture>
      <source media="(max-width: 600px)" srcset="${logoBlanco}">
      <img src="${iconoNegro}" alt="Descripción de la imagen" class="icono-register icono-restablecer">
    </picture>
    <form id="recuperar-Form" class="form-r-r">
      <h2>Recuperar contraseña</h2>
      <p style="color: black;">Para restablecer su contraseña, ingrese la dirección de correo electrónico que usa para iniciar sesión.</p>
      <input type="email" placeholder="Correo electrónico" name="email" id="email">
      <div style="height: 16px;"></div>
      <button class="btn-registros">Enviar</button>
      <div style="height: 16px;"></div>
      <span style="color: black;">
      ¡No importa! <br>
      <a href="#"  style="color: #3e8ed0;"class="btn"> Llévame de vuelta para iniciar sesión</a></span>
    </form>
    <div class="mensaje-envio-container modal">
    <div id="contenedor-msj" class="modal-content">
    <h2>Consultar su correo electrónico</h2>
      <span class="close" style="color: #565255;">&times;</span>
      <div id="mensaje-envio"></div>
    <button id="volver-inicio" class="btn-registros">Volver a la página de inicio</button>
    </div>
  </div>
   `;
  div.querySelector('.btn').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/');
  });

  const formulario = div.querySelector('#recuperar-Form');
  const mensajeEnvio = div.querySelector('#mensaje-envio');
  const mensajeEnvioContainer = div.querySelector('.mensaje-envio-container');
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    mostrarVentanaRecuperarContraseña(email)
      .then(() => {
        // mostrar mensaje de éxito
        // eslint-disable-next-line no-template-curly-in-string
        mensajeEnvio.textContent = `Correo enviado correctamente. Por favor, revise su bandeja de entrada de ${email} para obtener instrucciones sobre cómo restablecer su contraseña.`;
        mensajeEnvioContainer.style.display = 'flex';
      })
      .catch((error) => {
        if (error.code === 'auth/invalid-email') {
          // Mostrar mensaje de error en español
          mensajeEnvio.textContent = 'La dirección de correo electrónico no es válida.';
          mensajeEnvioContainer.style.display = 'flex';
        } else if (error.code === 'auth/user-not-found') {
          // Mostrar mensaje de error en español
          mensajeEnvio.textContent = 'No se encontró ningún usuario con la dirección de correo electrónico proporcionada.';
          mensajeEnvioContainer.style.display = 'flex';
        } else {
          // Mostrar mensaje de error genérico en español
          mensajeEnvio.textContent = 'Se ha producido un error al restablecer la contraseña. Por favor, inténtelo nuevamente más tarde.';
          mensajeEnvioContainer.style.display = 'flex';
        }
      });
  });

  // Función para mostrar el modal de recuperación de contraseña
  const mostrarModalRecuperarContraseña = (mensaje) => {
    mensajeEnvio.textContent = mensaje;
    mensajeEnvioContainer.style.display = 'flex';
  };

  // función para ocultar el modal de recuperación de contraseña
  div.querySelector('.close').addEventListener('click', (e) => {
    e.preventDefault();
    mensajeEnvioContainer.style.display = 'none';
  });

  const botonVolverInicio = div.querySelector('#volver-inicio');
  botonVolverInicio.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/');
  });
  return div;
};
