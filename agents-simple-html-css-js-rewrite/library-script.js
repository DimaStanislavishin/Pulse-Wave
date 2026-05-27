// Функція для переключення вкладок
function showTab(tabName) {
    // Приховуємо всі вкладки
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });

    // Видаляємо активний клас з усіх кнопок
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Показуємо обрану вкладку
    const activeTab = document.getElementById(tabName);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Додаємо активний клас до обраної кнопки
    event.target.classList.add('active');
}

// Ініціалізація
document.addEventListener('DOMContentLoaded', function() {
    // Першу вкладку активні за замовчуванням (це вже в HTML)
    
    // Слухачі для кнопок плейлистів
    const playlistCards = document.querySelectorAll('#playlists .card');
    playlistCards.forEach(card => {
        card.addEventListener('click', function() {
            alert('Плейліст відкрито! 🎵');
        });
    });

    // Слухачі для кнопок скачування
    const downloadButtons = document.querySelectorAll('#downloads .btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = button.closest('.list-item');
            const title = parent.querySelector('h3').textContent;
            alert(`Пісня "${title}" готова до прослухання!`);
        });
    });

    // Слухачі для кнопок історії
    const historyButtons = document.querySelectorAll('#history .btn');
    historyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = button.closest('.list-item');
            const title = parent.querySelector('h3').textContent;
            console.log(`Граємо: ${title}`);
        });
    });
});
