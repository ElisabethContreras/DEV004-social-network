import { navigateTo } from '../router.js';
import { registerWithEmail } from '../helpers/accederCongmail.js';

export const Register = () => {
  document.body.classList.add('others-background');
  document.body.classList.remove('home-background');
  const div = document.createElement('div');
  div.className = 'contenedores-r-r';
  div.innerHTML = `
  <picture>
  <source media="(max-width: 600px)" srcset="assets/logoPrincipal.png">
  <img src="assets/iconoNavegador.png" alt="Descripción de la imagen" class="icono-register">
</picture>
    <p>Únete a nuestra comunidad de viajeros y comparte tus aventuras con el mundo. ¡Viaja sin límites!</p>
    <form id="registerForm" class="form-r-r">
    <h2>Registro</h2>
        <input type="email" placeholder="Correo electrónico" name="email" id="email" >
        <div style="height: 16px;"></div>
        <input type="password" maxlength="16" minlength="6"  placeholder="Contraseña" name="psw" id="psw" >
        <div style="height: 16px;"></div>
        <button  class="btn-registros">Crear</button>
        <div style="height: 32px;"></div>
        <a href="#" style="color: black;" class="btn"> ¿ Ya tienes una cuenta?<br><span style="color: #3e8ed0; ">Ingresa</span></a>
    </form>
    <div class="modal">
    <div class="modal-content">
      <span class="close">&times;</span>
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
  const openModal = (message) => {
    div.querySelector('.modal').style.display = 'block';
    div.querySelector('.modal-content > p:nth-child(2)').textContent = message;
    div.querySelector('.modal-content > p:nth-child(2)').style.color = 'black';
  };

  div.querySelector('#registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.psw.value;
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      openModal('Por favor, ingrese su dirección de correo electrónico.');
      return;
    }
    if (!password) {
      openModal('Por favor, ingrese su contraseña.');
      return;
    }
    if (password.length < 6) {
      openModal('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    registerWithEmail(email, password)
      .then(() => {
        navigateTo('/home');
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
