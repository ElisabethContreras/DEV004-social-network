/* eslint-disable no-unused-vars */
import { navigateTo } from '../router';
import { signInWithGoogle, signInWithPassword, openModal} from '../helpers/accederCongmail';
import logo from '../assets/logo.png';
import logoDorado from '../assets/logo1.png';
import googleIcon from '../assets/google.png';

export const Login = () => {
  // Create a div element to hold the login component
  document.body.classList.add('others-background');
  document.body.classList.remove('home-background');
  const div = document.createElement('div');
  div.className = 'contenedores-r-r  contenedor-login';
  div.innerHTML = `
  <picture>
  <source media="(max-width: 600px)" srcset="${logo}">
  <img src="${logoDorado}" alt="Descripción de la imagen" class="logoForm">
  </picture>
  <form id="loginForm" class="loginForm">
  <button class="google-btn">
  <div class="contenido-google">
  <span>
  <img class="icono-google" src="${googleIcon}">
  </span>
  <p style="color: black;"class="texto-google">Continuar con Google</p>
  </div>
  </button>
  <p>o</p>
  <input type="email" id="username" name="username" placeholder="Correo electrónico ">
  <div style="height: 16px;"></div>
  <input type="password" id="password" name="password" placeholder="Contraseña" >
  <div style="height: 32px;"></div>
  <button class="btn-registros">Iniciar sesión</button>
  <div style="height: 16px;"></div>
  <div class="col">
  <div>
  <span class="olvidaste-contraseña-btn" >¿Olvidaste tu contraseña ? <a href="#" class="btn" style="color: #66DA5F; ">Recuperala</a></span>
  </div>
  <div>
  <span>¿No tienes una cuenta? <a href="#" class="signup-btn" style="color: #66DA5F; ">Registrate</a></span>
  </div>
  </div>
  </form>
  <div class="modal">
  <div class="modal-content">
    <span class="close" style="color: #565255;">&times;</span>
    <p>Some text in the Modal..</p>
  </div>
</div>`;

  // Function to open modal

  // funcion para ocultar el modal
  div.querySelector('.close').addEventListener('click', (e) => {
    e.preventDefault();
    div.querySelector('.modal').style.display = 'none';
  });

  div.querySelector('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = div.querySelector('#username').value;
    const password = div.querySelector('#password').value;
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      openModal('Por favor, introduce un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      openModal('Por favor, introduce una contraseña de al menos 6 caracteres.');
      return;
    }
    signInWithPassword(email, password)
      .then(() => {
        navigateTo('/home');
      })
      .catch((error) => {
        const errorCode = error.code;
        let errorMessage;
        if (errorCode === 'auth/wrong-password') {
          errorMessage = 'La contraseña es incorrecta. Por favor, inténtalo de nuevo.';
        } else if (errorCode === 'auth/user-not-found') {
          errorMessage = 'No se ha encontrado una cuenta con este correo electrónico. Por favor, regístrate primero.';
        } else {
          errorMessage = 'Ha ocurrido un error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.';
        }
        openModal(errorMessage);
      });
  });

  div.querySelector('.google-btn').addEventListener('click', (e) => {
    e.preventDefault();
    signInWithGoogle()
      .then(
        () => {
          navigateTo('/home');
        },
      )
      .catch((error) => {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            openModal('El inicio de sesión se ha cancelado.');
            break;
          case 'auth/cancelled-popup-request':
            openModal('El inicio de sesión se ha cancelado.');
            break;
          case 'auth/web-storage-unsupported':
            openModal('El navegador no soporta el almacenamiento web o el usuario ha desactivado este soporte.');
            break;
          case 'auth/operation-not-supported-in-this-environment':
            openModal('Esta operación no es compatible en el entorno actual.');
            break;
          case 'auth/auth-domain-config-required':
            openModal('La configuración del dominio de autenticación es obligatoria.');
            break;
          case 'auth/credential-already-in-use':
            openModal('Esta credencial ya está en uso.');
            break;
          case 'auth/user-disabled':
            openModal('La cuenta de usuario ha sido deshabilitada.');
            break;
          case 'auth/user-token-expired':
            openModal('El token de usuario ha expirado.');
            break;
          case 'auth/invalid-email':
            openModal('La dirección de correo electrónico proporcionada no es válida.');
            break;
          case 'auth/user-not-found':
            openModal('No se encontró una cuenta con la dirección de correo electrónico proporcionada.');
            break;
          case 'auth/wrong-password':
            openModal('La contraseña proporcionada no es válida.');
            break;
          case 'auth/popup-blocked':
            openModal('El inicio de sesión emergente ha sido bloqueado por el navegador.');
            break;
          case 'auth/network-request-failed':
            openModal('Ha ocurrido un error de red, por favor comprueba tu conexión.');
            break;
          default:
            openModal('Ha ocurrido un error desconocido, por favor intenta de nuevo más tarde.');
            break;
        }
      });
  });

  div.querySelector('.signup-btn').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/register');
  });
  div.querySelector('.btn').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/restablecer');
  });
  // Return the div element
  return div;
};
