// Керування кнопками
document.addEventListener('DOMContentLoaded', function() {
    // Просто слухачі для кнопок
    const buttons = document.querySelectorAll('.btn-small');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // Просто показуємо, що кнопка нажата
            console.log('Кнопка нажата!');
        });
    });

    // Рівень наведення для карток
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // CSS вже дбає про це через :hover
            console.log('Карточка наведена');
        });
    });
});