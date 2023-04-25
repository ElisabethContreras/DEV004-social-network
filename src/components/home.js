/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
import { getAuth, signOut } from 'firebase/auth';
import {
  collection, query, getDocs, addDoc, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove,
} from 'firebase/firestore';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { initFirebase } from '../helpers/firebase';
import { navigateTo } from '../router';
import logoBlanco from '../assets/logoPrincipal.png';
import iconoSalir from '../assets/logOutIcon.png';
import editarVacio from '../assets/mundoVacio.png';
import eliminarVacio from '../assets/deleteVacio.png';
import eliminarLleno from '../assets/deletePintado.png';

export const Home = () => {
  document.body.classList.add('home-background');
  document.body.classList.remove('others-background');
  const div = document.createElement('div');
  div.className = 'muro';
  div.innerHTML = `
    <header class="header-muro">
    <img class="img-logo-muro" src="${logoBlanco}">
    <h1>Wanderlust</h1>
    <img class="cerrar-sesion" src="${iconoSalir}" alt="Cerrar sesión">
    </header>
    <h1>¡Hola, Bienvenidx a wanderlust !</h1>
    <div class="container-post">
    <form id="post-form" class="post-form">
    <p>¿Cuál ha sido tu destino de viaje favorito hasta ahora y por qué lo recomendarías?</p>
    <div class="contenedor-img-text">
    <textarea id="post-content" placeholder="Cuéntanos tus aventuras......" ></textarea>
    <input type="file" id="post-image" >
    </div>
    <div class="contenedor-btn-publicar"><button type="submit" class='btn-registros'>Publicar</button></div>
    </form>
    <div id="post-list"></div>
    </div>
  `;
  const postList = div.querySelector('#post-list');
  const { db, storage } = initFirebase(); // obtener la referencia al objeto db

  div.querySelector('.cerrar-sesion').addEventListener('click', (e) => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigateTo('/');
        alert('Sesión cerrada con éxito, vuelve pronto :D');
      })
      .catch((error) => {
        alert(error);
      });
  });

  const mostrarPublicaciones = (publicaciones) => {
    postList.innerHTML = '';
    publicaciones.forEach((publicacion) => {
      const postDiv = document.createElement('div');
      postDiv.className = 'post';
      postDiv.innerHTML = ` 
      <header class="post-header">
      <img class="post-author-photo" src="${publicacion.autorPhotoURL ? publicacion.autorPhotoURL : `https://ui-avatars.com/api/?name=${publicacion.autor}&size=96&background=007bff&color=fff&rounded=true`}" alt="Foto de perfil de ${publicacion.autor}">
      <p>Publicado por ${publicacion.autor} el ${publicacion.fecha_creacion.toDate().toLocaleString()}</p>
      </header>
        ${publicacion.image ? `<div class="contenedor-img-post"><img class="post-imagen" src="${publicacion.image}" alt="Imagen de la publicación"></div>` : '<div class="post-imagen-vacia"></div>'}
        <p class="texto-descripcion">${publicacion.descripcion}</p>
      <div class="contenedor-edicion">
      </div>
      <div class="contenedor-like">
      <div class="items-likes" >
      <img id="like">
      <p class="p2"></p>
      </div>
      <div class="contenedor-btn-post"></div>
      </div>
      `;
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const like = async (id, uid) => updateDoc(doc(db, 'publicaciones', id), { likes: arrayUnion(uid) });
      const disLike = async (id, uid) => updateDoc(doc(db, 'publicaciones', id), { likes: arrayRemove(uid) });
      const likeButton = postDiv.querySelector('#like');
      publicacion.likes = publicacion.likes || [];
      if (publicacion.likes && publicacion.likes.includes(auth.currentUser.uid)) {
        likeButton.classList.add('like');
      } else {
        likeButton.classList.add('disLike');
      }
      likeButton.addEventListener('click', async () => {
        if (likeButton.classList.toggle('disLike')) {
          disLike(publicacion.id, currentUser.uid);
          const publicaciones = await obtenerPublicaciones();
          mostrarPublicaciones(publicaciones);
        }
      });
      likeButton.addEventListener('click', async () => {
        if (likeButton.classList.toggle('like')) {
          like(publicacion.id, currentUser.uid);
          const publicaciones = await obtenerPublicaciones();
          mostrarPublicaciones(publicaciones);
        }
      });
      const counterLike = postDiv.querySelector('.p2');
      counterLike.textContent = publicacion.likes.length;

      if (currentUser && currentUser.uid === publicacion.uid) {
        const contenedorCajaEditar = postDiv.querySelector('.contenedor-edicion');
        const contenedorBtnPost = postDiv.querySelector('.contenedor-btn-post');
        const deleteImg = document.createElement('img');
        const editContent = document.createElement('img');
        editContent.setAttribute('class', 'editar-post');
        editContent.setAttribute('src', editarVacio);
        deleteImg.setAttribute('class', 'delete');
        deleteImg.setAttribute('src', eliminarVacio);
        contenedorBtnPost.appendChild(editContent);
        contenedorBtnPost.appendChild(deleteImg);
        deleteImg.addEventListener('click', async () => {
          // Mostrar mensaje de confirmación para eliminar post
          deleteImg.setAttribute('src', eliminarLleno);
          const confirmacion = confirm('¿Estás seguro de que deseas eliminar esta publicación?');
          if (confirmacion) {
            try {
              await deleteDoc(doc(db, 'publicaciones', publicacion.id));
              // Cambiar la ruta de la imagen
              // eslint-disable-next-line no-shadow
              const publicaciones = await obtenerPublicaciones();
              mostrarPublicaciones(publicaciones);
            } catch (e) {
              console.error('Error al eliminar la publicación:', e);
            }
          }
        });

        editContent.addEventListener('click', () => {
          // Verificar si ya hay un formulario de edición
          const formExistente = contenedorCajaEditar.querySelector('.form-edicion');
          if (formExistente) {
            // Si ya existe un formulario, mostrarlo en lugar de crear uno nuevo
            formExistente.style.display = 'block';
            document.getElementById('descripcion').value = publicacion.descripcion;
          } else {
            // Si no existe un formulario, crear uno nuevo
            const form = document.createElement('div');
            form.className = 'form-edicion';
            form.innerHTML = `
            <label for="descripcion">Descripción:</label>
            <input type="text" id="descripcion"  name="descripcion" value="${publicacion.descripcion}">
            <label for="imagen">Imagen:</label>
            <input type="file" id="imagen" name="imagen">
            <div class="contenedor-btn-edit">
            <button type="button" id="guardar" class="btn-guardar">Guardar</button>
            <button type="button" id="cancelar" class="btn-cancelar">Cancelar</button>
            </div>  `;
            // Agregar el formulario al DOM
            contenedorCajaEditar.appendChild(form);
            // Agregar controlador de eventos al botón "Cancelar"
            const cancelarBtn = form.querySelector('#cancelar');
            cancelarBtn.addEventListener('click', () => {
              // Ocultar el formulario y restablecer el contenido del campo de entrada de texto
              form.style.display = 'none';
              document.getElementById('descripcion').value = publicacion.descripcion;
            });
            // Agregar controlador de eventos al botón "Guardar"
            const guardarBtn = form.querySelector('#guardar');
            guardarBtn.addEventListener('click', async () => {
              const imagenInput = document.getElementById('imagen');
              const nuevoContenido = document.getElementById('descripcion').value;
              const nuevaImagen = imagenInput.files[0];
              if (nuevoContenido.trim().length === 0) {
                alert('Error: La descripción no puede estar vacía.');
                return;
              }
              try {
                // Actualizar la descripción de la publicación
                const docRef = doc(db, 'publicaciones', publicacion.id);
                await updateDoc(docRef, { descripcion: nuevoContenido });
                // Si se seleccionó una nueva imagen, subirla al storage y actualizar la URL de la imagen en la base de datos
                if (nuevaImagen) {
                  const storageRef = ref(storage, `images/${nuevaImagen.name}`);
                  const snapshot = await uploadBytes(storageRef, nuevaImagen);
                  const nuevaUrlImagen = await getDownloadURL(snapshot.ref);
                  await updateDoc(docRef, { image: nuevaUrlImagen });
                }
                // Actualizar la descripción en la página
                publicacion.descripcion = nuevoContenido;
                publicacion.image = nuevaImagen;
                alert('La publicación se ha actualizado correctamente.');
                form.style.display = 'none';
              } catch (error) {
                console.error('Error actualizando la publicación: ', error);
              }
            });
          }
        });
      }
      postList.appendChild(postDiv);
    });
  };
  /* obtener las publicaciones almacenadas en una colección Firestore de
  Firebase y devolverlas como un array de objetos que contienen el ID del documento y sus datos. */
  const obtenerPublicaciones = async () => {
    const q = query(collection(db, 'publicaciones'));
    const querySnapshot = await getDocs(q);
    const publicaciones = [];
    querySnapshot.forEach((doc) => {
      publicaciones.push({ id: doc.id, ...doc.data() });
    });
    return publicaciones;
  };
  /* se utiliza la función obtenerPublicaciones para obtener las publicaciones de Firestore, y
   después de que se resuelve la promesa, utiliza la función mostrarPublicaciones para
   mostrar los datos de esas publicaciones */
  obtenerPublicaciones().then((publicaciones) => {
    mostrarPublicaciones(publicaciones);
  });

  const postForm = div.querySelector('#post-form');
  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const postContent = postForm.querySelector('#post-content').value;
    const postImage = postForm.querySelector('#post-image').files[0];
    const auth = getAuth();
    const user = auth.currentUser;

    // Validar que el contenido y la imagen no estén vacíos
    if (postContent.trim().length === 0) {
      alert('Error, el contenido no puede estar vacío');
      return;
    }
    if (!postImage) {
      alert('Error, debes seleccionar una imagen');
      return;
    }

    // Subir la imagen a Firebase Storage
    const storageRef = ref(storage, `images/${postImage.name}`);
    const snapshot = await uploadBytes(storageRef, postImage);
    const imageUrl = await getDownloadURL(snapshot.ref);

    // Crear la publicación con la información de la imagen y guardarla en la base de datos
    const post = {
      autorPhotoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.email.split('@')[0]}&size=96&background=007bff&color=fff&rounded=true`,
      descripcion: postContent,
      autor: user.displayName || user.email.split('@')[0],
      fecha_creacion: new Date(),
      uid: user.uid,
      image: imageUrl,
    };
    try {
      const docRef = await addDoc(collection(db, 'publicaciones'), post);
      console.log('Publicación agregada con ID:', docRef.id);
    } catch (e) {
      console.log(e);
    }

    // Obtener y mostrar las publicaciones actualizadas
    const publicaciones = await obtenerPublicaciones();
    mostrarPublicaciones(publicaciones);

    // Resetear el formulario
    postForm.reset();
  });
  return div;
};
