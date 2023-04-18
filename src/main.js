// Este es el punto de entrada de tu aplicacion
import { initFirebase } from './helpers/firebase';
import { initRouter } from './router';
import { ROUTES } from './routes';

// Se inicializa el ROUTES y el Firebase.
initRouter(ROUTES);
initFirebase();
