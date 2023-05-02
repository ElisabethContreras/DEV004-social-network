import { navigateTo } from '../router.js';
import { registerWithEmail, openModal } from '../helpers/firebaseAuth.js';
import logoBlanco from '../assets/logoPrincipal.png';
import iconoNegro from '../assets/iconoNavegador.png';

export const Register = () => {
  document.body.classList.add('others-background');
  document.body.classList.remove('home-background');
  const div = document.createElement('div');
  div.className = 'contenedores-r-r';
  div.innerHTML = `
  <picture>
  <source media="(max-width: 600px)" srcset="${logoBlanco}">
  <img src="${iconoNegro}" alt="Descripción de la imagen" class="icono-register">
  </picture>
  <span class="span-register">Únete a nuestra comunidad de viajeros y comparte tus aventuras con el mundo. ¡Viaja sin límites!</span>
  <form id="registerForm" class="form-r-r">
       <h2>Registro</h2>
        <input type="email" placeholder="Correo electrónico" name="email" id="email" >
        <div style="height: 16px;"></div>
        <input type="password" maxlength="16" minlength="6"  placeholder="Contraseña" name="psw" id="psw" >
        <div style="height: 16px;"></div>
        <button id="crear" class="btn-registros">Crear</button>
        <div style="height: 32px;"></div>
        <span style="color: black;"> ¿ Ya tienes una cuenta?<br><a href="#" style="color: #3e8ed0; " class="btn">Ingresa</a></span>
    </form>
    <div class="modal">
    <div class="modal-content">
      <span class="close" style="color: #565255;">&times;</span>
      <p>Some text in the Modal..</p>
    </div>
  </div>`;
  div.querySelector('.btn').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/');
  });
  div.querySelector('.close').addEventListener('click', (e) => {
    e.preventDefault();
    div.querySelector('.modal').style.display = 'none';
  });
  div.querySelector('#registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = div.querySelector('#email').value;
    const password = div.querySelector('#psw').value;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Validar que se haya ingresado un correo electrónico válido
    if (!email || !emailRegex.test(email)) {
      openModal('Por favor, ingrese una dirección de correo electrónico válida.');
      return;
    }
    // eslint-disable-next-line max-len
    // Validar que se haya ingresado una contraseña de al menos 6 caracteres y sin espacios en blanco
    if (password.trim().length < 6 || /\s/.test(password)) {
      openModal('La contraseña debe tener al menos 6 caracteres y no tener espacios en blanco.');
      return;
    }
    registerWithEmail(email, password)
      .then(() => {
        navigateTo('/');
        openModal('Registrado exitosamente');
      })
      .catch((error) => {
        switch (error.code) {
          case 'auth/email-already-in-use':
            openModal('correo electrónico ya está en uso');
            break;
          case 'auth/invalid-email':
            openModal('correo electrónico no tiene un formato válido');
            break;
          case 'auth/weak-password':
            openModal('la contraseña no cumple los requisitos de seguridad');
            break;
          default:
            openModal('Ha ocurrido un error desconocido, por favor intenta de nuevo más tarde.');
            break;
        }
      });
  });
  return div;
};
