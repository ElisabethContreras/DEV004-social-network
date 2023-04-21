/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
import { getAuth, signOut } from 'firebase/auth';
import {
  collection, query, getDocs, addDoc, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { initFirebase } from '../helpers/firebase';
import { navigateTo } from '../router';

export const Home = () => {
  document.body.classList.add('home-background');
  document.body.classList.remove('others-background');
  const div = document.createElement('div');
  div.className = 'muro';
  div.innerHTML = `
    <header class="header-muro">
    <img class="img-logo-muro" src="assets/logoPrincipal.png">
    <h1>Wanderlust</h1>
    <img class="cerrar-sesion" src="assets/logOutIcon.png" alt="Cerrar sesión">
    </header>
    <h1>Bienvenido a wanderlust</h1>
    <div class="container-post">
    <form id="post-form" class="post-form">
    <p>¿Cuál ha sido tu destino de viaje favorito hasta ahora y por qué lo recomendarías?</p>
    <div class="contenedor-img-text">
    <textarea id="post-content" placeholder="Cuéntanos tus aventuras......" ></textarea>
    </div>
    <div class="contenedor-btn-publicar"><button type="submit" class='btn-registros'>Publicar</button></div>
    </form>
    <div id="post-list"></div>
    </div>
  `;
  const postList = div.querySelector('#post-list');
  const { db } = initFirebase(); // obtener la referencia al objeto db

  div.querySelector('.cerrar-sesion').addEventListener('click', (e) => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigateTo('/');
        alert('Sesión cerrada con éxito');
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
      <p class="texto-descripcion">${publicacion.descripcion}</p>
      <div class="contenedor-like">
      <img id="like">
      <p class="p2"></p>
      </div>
      `;
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const like = async (id, uid) => updateDoc(doc(db, 'publicaciones', id), { likes: arrayUnion(uid) });
      const disLike = async (id, uid) => updateDoc(doc(db, 'publicaciones', id), { likes: arrayRemove(uid) });
      const likeButton = postDiv.querySelector('#like');
      const disLikeButton = postDiv.querySelector('#like');
      publicacion.likes = publicacion.likes || [];
      if (publicacion.likes && publicacion.likes.includes(auth.currentUser.uid)) {
        likeButton.classList.add('like');
      } else {
        disLikeButton.classList.add('disLike');
      }
      likeButton.addEventListener('click', async () => {
        if (likeButton.classList.toggle('disLike')) {
          disLike(publicacion.id, currentUser.uid);
          const publicaciones = await obtenerPublicaciones();
          mostrarPublicaciones(publicaciones);
        }
      });
      disLikeButton.addEventListener('click', async () => {
        if (disLikeButton.classList.toggle('like')) {
          like(publicacion.id, currentUser.uid);
          const publicaciones = await obtenerPublicaciones();
          mostrarPublicaciones(publicaciones);
        }
      });
      const counterLike = postDiv.querySelector('.p2');
      counterLike.textContent = publicacion.likes.length;

      if (currentUser && currentUser.uid === publicacion.uid) {
        const contenedorCajaEditar = document.createElement('div');
        const contenedorBtnPost = document.createElement('div');
        const deleteImg = document.createElement('img');
        const editContent = document.createElement('img');
        contenedorBtnPost.setAttribute('class', 'contenedor-btn-post');
        editContent.setAttribute('class', 'editar-post');
        editContent.setAttribute('src', 'assets/mundoVacio.png');
        deleteImg.setAttribute('class', 'delete');
        deleteImg.setAttribute('src', 'assets/deleteVacio.png');
        contenedorBtnPost.appendChild(editContent);
        contenedorBtnPost.appendChild(deleteImg);
        deleteImg.addEventListener('click', async () => {
          // Mostrar mensaje de confirmación para eliminar post
          deleteImg.setAttribute('src', 'assets/deletePintado.png');
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
            <input type="text" id="descripcion" class="item-edit" placeholder="Editar descripción:" name="descripcion" value="${publicacion.descripcion}">
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
              const nuevoContenido = document.getElementById('descripcion').value;
              if (nuevoContenido.trim().length !== 0) {
                try {
                  await editarPublicacion(publicacion.id, nuevoContenido);
                  // Actualizar la descripción en la página y ocultar el formulario
                  publicacion.descripcion = nuevoContenido;
                  alert('Guardado con éxito');
                  document.getElementById('descripcion-publicacion').textContent = nuevoContenido;
                  form.style.display = 'none';
                } catch (e) {
                  console.log(e);
                }
              } else {
                alert('Error, el contenido no puede estar vacío');
              }
            });
          }
        });
        postDiv.appendChild(contenedorCajaEditar);
        postDiv.appendChild(contenedorBtnPost);
      }
      postList.appendChild(postDiv);
    });
  };
  /* La función editarPublicacion es una función asíncrona que toma dos argumentos: publicacionId,
   que es el ID de la publicación a editar, y nuevoContenido, que es la nueva descripción que se
   desea establecer para la publicación. */
  const editarPublicacion = async (publicacionId, nuevoContenido) => {
    const docRef = doc(db, 'publicaciones', publicacionId);
    await updateDoc(docRef, { descripcion: nuevoContenido });
    /* Esto se puede hacer para asegurarse de que se muestren las publicaciones actualizadas y que
     la lista de publicaciones en la página */
    const publicaciones = await obtenerPublicaciones();
    mostrarPublicaciones(publicaciones);
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
    const auth = getAuth();
    const user = auth.currentUser;
    const post = {
      autorPhotoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.email.split('@')[0]}&size=96&background=007bff&color=fff&rounded=true`,
      descripcion: postContent,
      autor: user.displayName || user.email.split('@')[0], // utilizar displayName si está definido, si no utilizar el nombre de usuario basado en el correo electrónico
      fecha_creacion: new Date(),
      uid: user.uid,
    };
    if (postContent.trim().length !== 0) {
      try {
        // agregar la publicación a la base de datos
        const docRef = await addDoc(collection(db, 'publicaciones'), post);
        console.log('Publicación agregada con ID:', docRef.id);
      } catch (e) {
        console.log(e);
      }
    } else {
      alert('Error, el contenido no puede estar vacío');
    }
    // obtener y mostrar las publicaciones actualizadas
    const publicaciones = await obtenerPublicaciones();
    mostrarPublicaciones(publicaciones);
    // resetear el formulario
    postForm.reset();
  });

  return div;
};
