/* eslint-disable no-shadow */
import { getAuth } from 'firebase/auth';
import { cerrarsesion } from '../helpers/firebaseAuth';
import { initFirebase } from '../helpers/firebase';
import { navigateTo } from '../router';
import logoBlanco from '../assets/logoPrincipal.png';
import iconoSalir from '../assets/logOutIcon.png';
import editarVacio from '../assets/mundoVacio.png';
import eliminarVacio from '../assets/deleteVacio.png';
import eliminarLleno from '../assets/deletePintado.png';
import {
  disLike,
  like,
  obtenerPublicaciones,
  editarPublicacion,
  crearPublicacion,
  eliminarPublicacion,
} from '../helpers/firebasestore';

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
    <h2>¡Hola, Bienvenidx a wanderlust !</h2>
    <section class="container-post">
    <form id="post-form" class="post-form">
    <p>¿Cuál ha sido tu destino de viaje favorito hasta ahora y por qué lo recomendarías?</p>
    <section class="contenedor-img-text">
    <textarea id="post-content" placeholder="Cuéntanos tus aventuras......" ></textarea>
    <section class="drop-container">
    <span style="color:black;"class="drop-title">Selecciona una imagen de tus viajes</span>
    <input type="file"  class="post-image" id="post-image" >
    </section>
    </section>
    <section class="contenedor-btn-publicar"><button type="submit" class='btn-publicar'>Publicar</button></section>
    </form>
    <article id="post-list"></article>
    </section>
  `;
  const postList = div.querySelector('#post-list');
  // eslint-disable-next-line max-len
  const { db } = initFirebase(); // desestructuramos el objeto que retorna initfirebase y obtenemos la referencia al objeto db

  div.querySelector('.cerrar-sesion').addEventListener('click', (e) => {
    cerrarsesion()
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
      const avatar = `https://ui-avatars.com/api/?name=${publicacion.autor}&size=96&background=007bff&color=fff&rounded=true`
      const imagenPost = `<div class="contenedor-img-post"><img class="post-imagen" src="${publicacion.image}" alt="Imagen de la publicación"></div>`
      const postDiv = document.createElement('div');
      postDiv.className = 'post';
      postDiv.innerHTML = ` 
      <header class="post-header">
      <div class="sub-header-post">
      <img class="post-author-photo" src="${publicacion.autorPhotoURL ? publicacion.autorPhotoURL : avatar }" alt="Foto de perfil de ${publicacion.autor}">
      <p><strong>${publicacion.autor}</strong></p>
      </div>
      <p>${publicacion.fecha_creacion.toDate().toLocaleString()}</p>
      </header>
        ${publicacion.image ? imagenPost : '<div class="post-imagen-vacia"></div>'}
      <p class="texto-descripcion"><strong>${publicacion.autor}</strong>  ${publicacion.descripcion}</p>
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
      const likeButton = postDiv.querySelector('#like');
      publicacion.likes = publicacion.likes || [];
      if (
        publicacion.likes
        && publicacion.likes.includes(auth.currentUser.uid)
      ) {
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
        const contenedorCajaEditar = postDiv.querySelector(
          '.contenedor-edicion',
        );
        const contenedorBtnPost = postDiv.querySelector('.contenedor-btn-post');
        const deleteImg = document.createElement('img');
        const editContent = document.createElement('img');
        editContent.setAttribute('class', 'editar-post');
        editContent.setAttribute('src', editarVacio);
        deleteImg.setAttribute('class', 'delete');
        deleteImg.setAttribute('src', eliminarVacio);
        contenedorBtnPost.append(editContent, deleteImg);
        // contenedorBtnPost.appendChild();
        deleteImg.addEventListener('click', async () => {
          // Mostrar mensaje de confirmación para eliminar post
          deleteImg.setAttribute('src', eliminarLleno);
          // eslint-disable-next-line no-restricted-globals, no-alert
          const confirmacion = confirm('¿Estás seguro de que deseas eliminar esta publicación?');
          if (confirmacion) {
            await eliminarPublicacion(publicacion.id);
            const publicaciones = await obtenerPublicaciones();
            mostrarPublicaciones(publicaciones);
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
            const form = document.createElement('form');
            form.className = 'form-edicion';
            form.innerHTML = `
            <section class="contenedor-inputs-editar">
            <label for="descripcion">Descripción:</label>
            <textarea id="descripcion"  name="descripcion">${publicacion.descripcion}</textarea>
            <label for="imagen">Imagen:</label>
            <input type="file" id="imagen" name="imagen">
            </section>
            <section class="contenedor-btn-edit">
            <button type="button" id="guardar" class="btn-guardar">Guardar</button>
            <button type="button" id="cancelar" class="btn-cancelar">Cancelar</button>
            </section>  `;
            // Agregar el formulario al DOM
            contenedorCajaEditar.appendChild(form);
            // Agregar controlador de eventos al botón "Cancelar"
            const cancelarBtn = form.querySelector('#cancelar');
            cancelarBtn.addEventListener('click', () => {
              // Ocultar el formulario y restablecer el contenido del campo de entrada de texto
              form.style.display = 'none';
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
                await editarPublicacion(publicacion.id, nuevoContenido, nuevaImagen);
                const publicaciones = await obtenerPublicaciones();
                mostrarPublicaciones(publicaciones);
                alert('La publicación se ha actualizado correctamente.');
                form.style.display = 'none';
              } catch (e) {
                console.error('Error actualizando la publicación: ', e);
              }
            });
          }
        });
      }
      postList.appendChild(postDiv);
    });
  };
  /*  obtener las publicaciones de Firestore, y
   después de que se resuelve la promesa, utiliza la función mostrarPublicaciones para
   mostrar los datos de esas publicaciones */
  obtenerPublicaciones().then((publicaciones) => {
    mostrarPublicaciones(publicaciones);
    // console.log(publicaciones)
  });
  const postForm = div.querySelector('#post-form');
  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const postContent = postForm.querySelector('#post-content').value;
    const postImage = postForm.querySelector('#post-image').files[0];
    const auth = getAuth();
    const user = auth.currentUser;
    if (postContent.trim().length === 0) {
      alert('Error, el contenido no puede estar vacío');
    }
    if (!postImage) {
      alert('Error, debes seleccionar una imagen');
    }
    try {
      await crearPublicacion(user, postContent, postImage);
      alert('La publicación se ha creado correctamente.');
    } catch (e) {
      alert('Error al crear la publicación:', e);
    }
    // Obtener y mostrar las publicaciones actualizadas
    const publicaciones = await obtenerPublicaciones();
    mostrarPublicaciones(publicaciones);
    // Resetear el formulario
    postForm.reset();
  });
  return div;
};
