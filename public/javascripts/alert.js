const closeButton = document.querySelector('.close');
const alert = document.querySelector('.alert');;


closeButton.addEventListener('click', () => {
  alert.remove();
});

