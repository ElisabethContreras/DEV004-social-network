import {
  arrayRemove,
  arrayUnion,
  updateDoc,
  doc,
  collection,
  orderBy,
  query,
  getDocs,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
// eslint-disable-next-line import/no-extraneous-dependencies
import { uploadBytes, ref, getDownloadURL } from '@firebase/storage';
import { initFirebase } from './firebase';

const { db, storage } = initFirebase();
//-----------------------------------------------------------------
export const like = async (id, uid) => updateDoc(doc(db, 'publicaciones', id), { likes: arrayUnion(uid) });
//-----------------------------------------------------------------
export const disLike = async (id, uid) => updateDoc(doc(db, 'publicaciones', id), { likes: arrayRemove(uid) });
//-----------------------------------------------------------------
export const uploadImage = async (storage, file) => {
  const storageRef = ref(storage, `images/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};
//------------------------------------------------------------------
export const editarPublicacion = async (postId, newContent, newImage) => {
  const docRef = doc(db, 'publicaciones', postId);
  const updateData = { descripcion: newContent };

  if (newImage) {
    const newImageUrl = await uploadImage(storage, newImage);
    updateData.image = newImageUrl;
  }
  await updateDoc(docRef, updateData);
};
//-------------------------------------------------------------------------------
export const obtenerPublicaciones = async () => {
  const q = query(collection(db, 'publicaciones'), orderBy('fecha_creacion', 'desc'));
  const querySnapshot = await getDocs(q);
  const publicaciones = [];
  querySnapshot.forEach((doc) => {
    publicaciones.push({ id: doc.id, ...doc.data() });
  });
  console.log(publicaciones);
  return publicaciones;
};
//--------------------------------------------------------------------------------
export const crearPublicacion = async (user, postContent, postImage) => {
  const imageUrl = await uploadImage(storage, postImage);
  // Crear la publicación con la información de la imagen y guardarla en la base de datos
  const post = {
    autorPhotoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.email.split('@')[0]}&size=96&background=007bff&color=fff&rounded=true`,
    descripcion: postContent,
    autor: user.displayName || user.email.split('@')[0],
    fecha_creacion: new Date(),
    uid: user.uid,
    image: imageUrl,
  };
  const docRef = await addDoc(collection(db, 'publicaciones'), post);
  console.log('Publicación agregada con ID:', docRef.id);
};
//---------------------------------------------------------------------------------
export const eliminarPublicacion = async (postId, db) => {
  try {
    await deleteDoc(doc(db, 'publicaciones', postId));
    alert('Publicación eliminada con éxito.');
  } catch (error) {
    alert('Error al eliminar la publicación:', error);
  }
};
