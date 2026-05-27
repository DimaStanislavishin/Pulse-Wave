// Small interactions moved from inline script in index.html
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mousedown', () => el.style.transform = 'scale(0.96)');
    el.addEventListener('mouseup', () => el.style.transform = '');
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });

  const carousels = document.querySelectorAll('.hide-scrollbar');
  carousels.forEach(carousel => {
    carousel.addEventListener('wheel', (evt) => {
      evt.preventDefault();
      carousel.scrollLeft += evt.deltaY;
    });
  });
});
