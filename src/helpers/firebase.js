import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// eslint-disable-next-line import/no-extraneous-dependencies
import { getStorage } from '@firebase/storage';

// La configuración de Firebase de tu aplicación web

const firebaseConfig = {
  apiKey: 'AIzaSyCjLRggO4nm5RYFKjQKUjA7g69MfIEAxJ4',
  authDomain: 'wanderlust-edc27.firebaseapp.com',
  projectId: 'wanderlust-edc27',
  storageBucket: 'wanderlust-edc27.appspot.com',
  messagingSenderId: '828427249355',
  appId: '1:828427249355:web:5284d5c1824c78086b5d4e',
  measurementId: 'G-0RJ1R9SWL7',
};

export const initFirebase = () => {
  // Inicializa el Firebase
  const app = initializeApp(firebaseConfig);

  // Inicializa Firebase Authentication  y obtenemos una referencia al servicio.
  const auth = getAuth(app);

  // Initialize Cloud Firestore y  obtenemos una referencia al servicio.
  const db = getFirestore(app);
  const storage = getStorage(app, 'gs://wanderlust-edc27.appspot.com');
  // Devuelve un objeto que contiene las referencias a la app de Firebase.
  return {
    app,
    auth,
    db,
    storage,
  };
};
