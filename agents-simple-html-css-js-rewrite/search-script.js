// Дані про пісні та виконавців
const songs = [
    { title: 'Neon Nights', artist: 'Hyperion Dreams', category: 'Електро' },
    { title: 'Electric Dreams', artist: 'Synth Wave', category: 'Електро' },
    { title: 'Digital Paradise', artist: 'Future Sound', category: 'Поп' },
    { title: 'Cyber Pulse', artist: 'Neon Vision', category: 'Електро' },
    { title: 'Stellar Journey', artist: 'Cosmic Beats', category: 'Поп' },
    { title: 'Echo Valley', artist: 'Echo Valley', category: 'Рок' },
    { title: 'Night Vision', artist: 'Hyperion Dreams', category: 'Електро' },
    { title: 'Starlight', artist: 'Synth Wave', category: 'Поп' },
];

// Знаходиться пошукова input та результати
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Функція для пошуку пісень
function performSearch() {
    const query = searchInput.value.toLowerCase();

    if (query === '') {
        searchResults.innerHTML = '<p class="empty-message">Введи текст для пошуку...</p>';
        return;
    }

    // Фільтруємо пісні
    const results = songs.filter(song => 
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.category.toLowerCase().includes(query)
    );

    // Показуємо результати
    if (results.length === 0) {
        searchResults.innerHTML = '<p class="empty-message">Результатів не знайдено</p>';
        return;
    }

    // Будуємо HTML для результатів
    searchResults.innerHTML = results.map((song, index) => `
        <div class="list-item">
            <span class="list-number">${index + 1}</span>
            <div class="list-info">
                <h3>${song.title}</h3>
                <p>${song.artist} • ${song.category}</p>
            </div>
            <button class="btn btn-small">▶ Грати</button>
        </div>
    `).join('');
}

// Функція для пошуку за категорією
function searchCategory(category) {
    searchInput.value = category;
    performSearch();
    // Скролимо до результатів
    searchResults.scrollIntoView({ behavior: 'smooth' });
}

// Функція для пошуку за виконавцем
function searchArtist(artist) {
    searchInput.value = artist;
    performSearch();
    // Скролимо до результатів
    searchResults.scrollIntoView({ behavior: 'smooth' });
}

// Слухаємо введення
searchInput.addEventListener('input', performSearch);
searchInput.addEventListener('keyup', performSearch);