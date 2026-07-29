// js/app.js
document.addEventListener('DOMContentLoaded', () => {
  const cardContainer = document.getElementById('card-container');
  const searchInput = document.getElementById('search-input');
  const rarityFilter = document.getElementById('rarity-filter');

  let cardsData = [];

  // Toast System
  window.showToast = (message, type = 'accent') => {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Fetch Cards Function
  async function fetchCards() {
    try {
      // Fetching using Supabase client initialized in js/supabase.js
      const { data, error } = await supabaseClient.from('cards').select('*');
      
      if (error) throw error;

      cardsData = data || [];
      renderCards(cardsData);
    } catch (err) {
      console.error('Error fetching cards:', err);
      showToast('Failed to load marketplace cards.', 'danger');
      cardContainer.innerHTML = '<p style="color: var(--text-secondary);">No cards available or error loading dataset.</p>';
    }
  }

  // Render Grid Cards
  function renderCards(cards) {
    if (!cards.length) {
      cardContainer.innerHTML = '<p style="color: var(--text-secondary);">No matching cards found.</p>';
      return;
    }

    cardContainer.innerHTML = cards.map(card => `
      <div class="card-item">
        <div>
          <div class="card-title">${escapeHtml(card.title || 'Untitled Card')}</div>
          <span class="card-rarity">${escapeHtml(card.rarity || 'Standard')}</span>
        </div>
        <div>
          <div class="card-price">$${Number(card.price || 0).toFixed(2)}</div>
          <button class="btn" onclick="purchaseCard('${card.id}')">Buy Now</button>
        </div>
      </div>
    `).join('');
  }

  // Live Search & Filter Logic
  function filterCards() {
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const selectedRarity = rarityFilter?.value || '';

    const filtered = cardsData.filter(card => {
      const matchesSearch = (card.title || '').toLowerCase().includes(searchTerm);
      const matchesRarity = !selectedRarity || card.rarity === selectedRarity;
      return matchesSearch && matchesRarity;
    });

    renderCards(filtered);
  }

  // HTML sanitization helper
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
  }

  window.purchaseCard = (id) => {
    showToast(`Card purchase initiated for ID: ${id}`);
  };

  if (searchInput) searchInput.addEventListener('input', filterCards);
  if (rarityFilter) rarityFilter.addEventListener('change', filterCards);

  fetchCards();
});