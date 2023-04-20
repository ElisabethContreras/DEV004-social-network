import { getAuth, signOut } from 'firebase/auth';
import {
  // eslint-disable-next-line max-len
  collection, query, getDocs, addDoc, deleteDoc, doc, updateDoc,
} from 'firebase/firestore';
import { initFirebase } from '../helpers/firebase';
import { navigateTo } from '../router';

export const Home = () => {
  document.body.classList.add('home-background');
  document.body.classList.remove('others-background');
  const auth = getAuth();
  const user = auth.currentUser;
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
    <textarea id="post-content" placeholder="Cuéntanos tus aventuras......" required></textarea>
    </div>
    <div class="contenedor-btn-publicar"><button type="submit" class='btn-registros'>Publicar</button></div>
    </form>
    <div id="post-list"></div>
    </div>
  `;
  const postList = div.querySelector('#post-list');
  const { db } = initFirebase(); // obtener la referencia al objeto db

  div.querySelector('.cerrar-sesion').addEventListener('click', (e) => {
    // eslint-disable-next-line no-shadow
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigateTo('/');
        alert('Sesión cerrada con éxito');
      })
      .catch((error) => {
        console.error(error);
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
      `;
      // eslint-disable-next-line no-shadow

      // eslint-disable-next-line no-shadow
      const auth = getAuth();
      const currentUser = auth.currentUser;

      // Botón de "Me gusta"
      // const likeButton = document.createElement('div');
      // const likeImg = document.createElement('img');
      // likeImg.setAttribute('class', 'like');
      // likeImg.setAttribute('src', 'assets/likeVacio.png');
      // likeButton.appendChild(likeImg);
      // likeImg.addEventListener('click', async () => {
      //   try {
      //     // eslint-disable-next-line no-use-before-define
      //     await darMeGusta(publicacion.id, currentUser.uid);
      //     // Actualizar el número de likes en la publicación
      //     publicacion.likes += 1;
      //     const likesContainer = postDiv.querySelector('.likes-container');
      // eslint-disable-next-line max-len
      //     likesContainer.innerHTML = `${publicacion.likes} ${publicacion.likes === 1 ? 'me gusta' : 'me gustan'}`;
      //     // Cambiar el icono de "Me gusta"
      //     likeImg.setAttribute('src', 'assets/likeLleno.png');
      //   } catch (e) {
      //     console.error('Error al dar "Me gusta":', e);
      //   }
      // });
      /* si el usuario esta logeado y su uid es igual a la de la publicacion entonces
      puede editar y elimar su post */

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
        // añadimos un escuchador de eventos para cuando demos click en la imagen poder editar post

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
      <div>
        <button type="button" id="guardar">Guardar</button>
        <button type="button" id="cancelar">Cancelar</button>
      </div>
    `;
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
              if (nuevoContenido !== null && nuevoContenido !== '') {
                try {
                  await editarPublicacion(publicacion.id, nuevoContenido);
                  // Actualizar la descripción en la página y ocultar el formulario
                  publicacion.descripcion = nuevoContenido;
                  alert('guardado con exito');
                  document.getElementById('descripcion-publicacion').textContent = nuevoContenido;
                  form.style.display = 'none';
                } catch (e) {
                  console.log(e);
                }
              } else if (nuevoContenido === '') {
                alert('Error , el contenido no puede estar vacio ');
              }
            });
          }
        });
        postDiv.appendChild(contenedorCajaEditar);
        postDiv.appendChild(contenedorBtnPost);
      }
      // postDiv.appendChild(likeButton);
      postList.appendChild(postDiv);
    });
  };

  // funcion para dar me gusta
  // const darMeGusta = async (publicacionId, uid) => {
  //   const docRef = doc(db, 'publicaciones', publicacionId);
  //   const publicacion = await getDoc(docRef);
  //   const usuariosQueDieronLike = publicacion.data().usuariosQueDieronLike;
  //   if (!usuariosQueDieronLike.includes(uid)) {
  //     await updateDoc(docRef, {
  //       likes: increment(1),
  //       usuariosQueDieronLike: arrayUnion(uid),
  //     });
  //   } else {
  //     await updateDoc(docRef, {
  //       likes: increment(-1),
  //       usuariosQueDieronLike: arrayRemove(uid),
  //     });
  //   }
  // };

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

  /* funcion para obtener las publicaciones almacenadas en una colección Firestore de
  Firebase y devolverlas como un array de objetos que contienen el ID del documento y sus datos. */
  const obtenerPublicaciones = async () => {
    const q = query(collection(db, 'publicaciones'));
    const querySnapshot = await getDocs(q);
    const publicaciones = [];
    // eslint-disable-next-line no-shadow
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
    const post = {
      autorPhotoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.email.split('@')[0]}&size=96&background=007bff&color=fff&rounded=true`,
      descripcion: postContent,
      autor: user.displayName || user.email.split('@')[0], // utilizar displayName si está definido, si no utilizar el nombre de usuario basado en el correo electrónico
      fecha_creacion: new Date(),
      uid: user.uid,
    };
    /* try y catch el código puede manejar de manera efectiva cualquier excepción que pueda surgir
    y evitar que la aplicación se bloquee o cierre debido a un error no controlado. */
    try {
    // agregar la publicación a la base de datos
      const docRef = await addDoc(collection(db, 'publicaciones'), post);
      // eslint-disable-next-line no-console
      console.log('Publicación agregada con ID:', docRef.id);
    // eslint-disable-next-line no-shadow
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error al agregar la publicación:', e);
    }
    // obtener y mostrar las publicaciones actualizadas
    const publicaciones = await obtenerPublicaciones();
    mostrarPublicaciones(publicaciones);
    // resetear el formulario
    postForm.reset();
  });

  return div;
};
