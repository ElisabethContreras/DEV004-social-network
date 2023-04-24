const div = document.createElement('div');
div.innerHTML = `
  <div class="modal">
    <div class="modal-content">
      <span class="close">&times;</span>
      <p>Este es un modal.</p>
      <p></p>
    </div>
  </div>
`;

export const openModal = (mensaje) => {
  div.querySelector('.modal').style.display = 'block';
  div.querySelector('.modal-content > p:nth-child(2)').textContent = mensaje;
  div.querySelector('.modal-content > p:nth-child(2)').style.color = 'black';
};

export const hideModal = () => {
  div.querySelector('.modal').style.display = 'none';
};

div.querySelector('.close').addEventListener('click', (e) => {
  e.preventDefault();
  hideModal();
});
