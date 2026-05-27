       // Simple micro-interaction for the search input
        const searchInput = document.querySelector('input[type="text"]');
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.classList.add('scale-[1.01]');
        });
        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.classList.remove('scale-[1.01]');
        });

        // Pulsing effect for cards on hover
        const cards = document.querySelectorAll('.category-grid > div');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.boxShadow = '0 0 25px rgba(207, 188, 255, 0.2)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = '';
            });
        });