/* eslint-disable max-len */
/**
 * @jest-environment jsdom
 */
import * as prueba from '../src/router';
import { Login } from '../src/components/login';
import { RecuperarContrasena } from '../src/components/restablecer';
import { Register } from '../src/components/register';
import {
  signInWithPassword, signInWithGoogle, mostrarVentanaRecuperarContraseña, registerWithEmail,
  openModal,
} from '../src/helpers/accederCongmail';

jest.mock('../src/helpers/accederCongmail');

describe('Pruebas de login', () => {
  beforeEach(() => {
    // eslint-disable-next-line no-import-assign
    prueba.navigateTo = jest.fn(() => console.log('ok'));
  });

  it('Autenticación con correo electrónico y contraseña correcta, debería redireccionar a /home', () => {
    // preparamos el mock
    signInWithPassword.mockResolvedValueOnce({ user: { email: 'ssinuco@gmail.com' } });

    // Paso 1: Visualizar el formulario de login.
    const loginDiv = Login();

    // Paso 2: Completamos el formulario con un correo electrónico y contraseña correctos.
    loginDiv.querySelector('#username').value = 'ssinuco@gmail.com';
    loginDiv.querySelector('#password').value = '123456';

    // // Sobrescribimos la función signInWithPassword con un mock
    signInWithPassword.mockImplementation(() => Promise.resolve({ user: { email: 'ssinuco@gmail.com' } }));

    // // Paso 3: Enviamos el formulario dando clic en el botón `Login`.
    loginDiv.querySelector('#loginForm').dispatchEvent(new Event('submit'));

    // // Paso 4: Verificamos visualmente que la aplicación redija a `/home`.
    return Promise.resolve().then(() => {
      expect(prueba.navigateTo).toHaveBeenCalledWith('/home');
    });
  });
  it('La promesa de iniciar sesion con correo y pws ha sido rechazada deberia abrir un modal', (done) => {
    signInWithPassword.mockRejectedValue({ code: 'auth/wrong-password' });
    const loginDiv = Login();
    loginDiv.querySelector('#username').value = 'ssinuco@gmail.com';
    loginDiv.querySelector('#password').value = '123456';
    loginDiv.querySelector('#loginForm').dispatchEvent(new Event('submit'));
    setTimeout(() => {
      expect(openModal).toHaveBeenCalled();
      done();
    });
  });
  it('Autenticación con Google, debería redireccionar a /home', () => {
    // Paso 1: Visualizar el formulario de login.
    signInWithGoogle.mockResolvedValueOnce({ user: { email: 'ssinuco@gmail.com' } });
    const loginDiv = Login();

    // Paso 2: Simulamos un clic en el botón de Google.
    const googleBtn = loginDiv.querySelector('.google-btn');
    googleBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Paso 3: Verificar que se llamó a la función signInWithGoogle.
    expect(signInWithGoogle).toHaveBeenCalled();

    // Paso 4: Verificar que se llamó a la función navigateTo con '/home'.
    return Promise.resolve().then(() => {
      expect(prueba.navigateTo).toHaveBeenCalledWith('/home');
    });
  });
  it('Al hacer clic en el botón de registro, debería llamar a la función navigateTo con la ruta /register', () => {
    // Paso 1: Visualizar el componente Login.
    const loginDiv = Login();
    // Paso 2: Simular un clic en el botón de registro.
    const signupBtn = loginDiv.querySelector('.signup-btn');
    signupBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Paso 3: Verificar que se llamó a la función navigateTo con la ruta /register.
    expect(prueba.navigateTo).toHaveBeenCalledWith('/register');
  });
});

describe('Pruebas de recuperar contraseña', () => {
  beforeEach(() => {
    // eslint-disable-next-line no-import-assign
    prueba.navigateTo = jest.fn(() => console.log('ok'));
    // eslint-disable-next-line no-import-assign
  });
  // eslint-disable-next-line no-undef
  mostrarVentanaRecuperarContraseña.mockResolvedValueOnce({ user: { email: 'ssinuco@gmail.com' } });
  const div = RecuperarContrasena();
  it('navega a la página de inicio cuando se hace clic en el botón de "Ingresa"', () => {
    const btnIngresa = div.querySelector('.btn');
    btnIngresa.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(prueba.navigateTo).toHaveBeenCalledWith('/');
  });
});

describe('Prueba de registro', () => {
  beforeEach(() => {
  // eslint-disable-next-line no-import-assign
    prueba.navigateTo = jest.fn(() => console.log('ok'));
  });
  it('Registro con correo electrónico y contraseña , debería redireccionar a /', () => {
    // preparamos el mock
    registerWithEmail.mockResolvedValueOnce({ user: { email: 'ssinuco@gmail.com' } });
    // Paso 1: Visualizar el formulario de registro.
    const registerDiv = Register();

    // Paso 2: Completar el formulario con un correo electrónico y contraseña correctos.
    registerDiv.querySelector('#email').value = 'ssinuco@gmail.com';
    registerDiv.querySelector('#psw').value = '123456';

    // // Sobrescribimos la función signInWithPassword con un mock
    registerWithEmail.mockImplementation(() => Promise.resolve({ user: { email: 'ssinuco@gmail.com' } }));

    // // Paso 3: Enviamos el formulario dando clic en el botón `Login`.
    registerDiv.querySelector('#registerForm').dispatchEvent(new Event('submit'));

    // // Paso 4: Verificamos visualmente que la aplicación redija a `/`.
    return Promise.resolve().then(() => {
      expect(prueba.navigateTo).toHaveBeenCalledWith('/');
    });
  });
});
