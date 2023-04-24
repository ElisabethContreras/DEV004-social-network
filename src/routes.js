import { Register } from './components/register';
import { Login } from './components/login';
import { Home } from './components/home';
import { RecuperarContrasena } from './components/restablecer';
// Se crea el objeto ROUTES que contiene cuatro rutas y sus respectivos componentes.
export const ROUTES = {
  '/': Login,
  '/register': Register,
  '/home': Home,
  '/restablecer': RecuperarContrasena,
};
