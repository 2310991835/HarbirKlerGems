import { gemstones } from '../data/gemstones.js';
import { getCrystalSVG } from './Result.js';

export class Explorer {
  constructor(containerId, onToggleCompare, isCompared, onOpenCompareTab, onToggleFavorite, isFavorited) {
    this.container = document.getElementById(containerId);
    this.onToggleCompare = onToggleCompare;
    this.isCompared = isCompared; // Function returning true if gem is added
    this.onOpenCompareTab = onOpenCompareTab;
    this.onToggleFavorite = onToggleFavorite || (() => {});
    this.isFavorited = isFavorited || (() => false);
    
    this.searchQuery = '';
    this.selectedIntention = '';
    this.selectedEnergy = '';
    this.selectedColor = '';
    
    this.drawer = document.getElementById('details-drawer');
    this.overlay = document.getElementById('drawer-overlay');
    this.setupGlobalDrawer();
    
    this.render();
  }
  
  setupGlobalDrawer() {
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.closeDrawer());
    }
  }
  
  render() {
    if (!this.container) return;
    
    // Extract unique filter options from gemstones list
    const intentionsList = [...new Set(gemstones.flatMap(g => g.intentions))].sort();
    const energiesList = [...new Set(gemstones.map(g => g.energy))].sort();
    const colorsList = [...new Set(gemstones.map(g => g.color))].sort();
    
    // Render Layout shell with control controls
    this.container.innerHTML = `
      <div class="compare-container">
        <div class="compare-header" style="border-bottom:none; padding-bottom:0.5rem;">
          <h2>Gemstone Sanctuary</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem; font-family: var(--font-display);">
            Explore the ancient wisdom and energetic profiles of crystals
          </p>
        </div>
        
        <!-- Filter Bar -->
        <div class="explorer-controls glass-card" style="padding: 1.2rem; margin-bottom: 1.5rem; display: flex; gap: 1rem;">
          <div class="search-bar">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="gem-search" placeholder="Search by name, chakra, or traits..." value="${this.searchQuery}">
          </div>
          
          <select id="filter-intention" class="filter-select">
            <option value="">All Intentions</option>
            ${intentionsList.map(int => `<option value="${int}" ${this.selectedIntention === int ? 'selected' : ''}>${int}</option>`).join('')}
          </select>
          
          <select id="filter-energy" class="filter-select">
            <option value="">All Energies</option>
            ${energiesList.map(eng => `<option value="${eng}" ${this.selectedEnergy === eng ? 'selected' : ''}>${eng}</option>`).join('')}
          </select>
          
          <select id="filter-color" class="filter-select">
            <option value="">All Colors</option>
            ${colorsList.map(col => `<option value="${col}" ${this.selectedColor === col ? 'selected' : ''}>${col}</option>`).join('')}
          </select>
        </div>
        
        <!-- Grid list of Gemstones -->
        <div id="explorer-grid" class="explorer-grid">
          <!-- Filled by filterGemstones() -->
        </div>
      </div>
    `;
    
    this.filterGemstones();
    this.bindEvents();
  }
  
  filterGemstones() {
    const grid = this.container.querySelector('#explorer-grid');
    if (!grid) return;
    
    const query = this.searchQuery.toLowerCase().trim();
    
    const filtered = gemstones.filter(gem => {
      // 1. Search Query Match
      const matchesSearch = !query || 
        gem.name.toLowerCase().includes(query) ||
        gem.subtitle.toLowerCase().includes(query) ||
        gem.chakra.toLowerCase().includes(query) ||
        gem.description.toLowerCase().includes(query) ||
        gem.color.toLowerCase().includes(query);
        
      // 2. Intention Match
      const matchesIntention = !this.selectedIntention || gem.intentions.includes(this.selectedIntention);
      
      // 3. Energy Match
      const matchesEnergy = !this.selectedEnergy || gem.energy === this.selectedEnergy;
      
      // 4. Color Match
      const matchesColor = !this.selectedColor || gem.color === this.selectedColor;
      
      return matchesSearch && matchesIntention && matchesEnergy && matchesColor;
    });
    
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
          <i class="fa-regular fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.4;"></i>
          <p>No matching gemstones found in our sanctuary. Try adjusting your filters.</p>
        </div>
      `;
      return;
    }
    
    grid.innerHTML = filtered.map(gem => {
      const isAdded = this.isCompared(gem.id);
      const isFav = this.isFavorited(gem.id);
      const hasRealImage = gem.image && !gem.image.includes('placeholder') && (gem.id === 'amethyst' || gem.id === 'citrine');
      
      const thumbContent = hasRealImage 
        ? `<img src="${gem.image}" alt="${gem.name}" />`
        : `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:rgba(255,255,255,0.02);padding:1.5rem;">${getCrystalSVG(gem.colorHex, 100)}</div>`;
        
      return `
        <div class="gem-grid-card" data-gem-id="${gem.id}">
          <div class="card-img-container">
            ${thumbContent}
            <span class="category-badge">${gem.category}</span>
            <button class="btn-favorite ${isFav ? 'active' : ''}" data-gem-id="${gem.id}" title="${isFav ? 'Remove from Altar' : 'Save to Altar'}">
              <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
            </button>
          </div>
          
          <div class="card-body">
            <h3 style="color: ${gem.colorHex};">${gem.name}</h3>
            <span class="card-energy"><i class="fa-solid fa-bolt-lightning"></i> ${gem.energy} Frequency</span>
            <p class="card-desc">${gem.description.slice(0, 100)}...</p>
            
            <div class="card-actions">
              <button class="btn-compare-add ${isAdded ? 'selected' : ''}" data-gem-id="${gem.id}">
                <i class="fa-solid ${isAdded ? 'fa-circle-check' : 'fa-scale-balanced'}"></i> 
                ${isAdded ? 'Compared' : 'Compare'}
              </button>
              
              <a href="#" class="card-read-more" data-gem-id="${gem.id}">
                Read Wisdom <i class="fa-solid fa-chevron-right"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    this.bindCardEvents();
  }
  
  bindEvents() {
    const searchInput = this.container.querySelector('#gem-search');
    const filterIntention = this.container.querySelector('#filter-intention');
    const filterEnergy = this.container.querySelector('#filter-energy');
    const filterColor = this.container.querySelector('#filter-color');
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.filterGemstones();
      });
    }
    
    if (filterIntention) {
      filterIntention.addEventListener('change', (e) => {
        this.selectedIntention = e.target.value;
        this.filterGemstones();
      });
    }
    
    if (filterEnergy) {
      filterEnergy.addEventListener('change', (e) => {
        this.selectedEnergy = e.target.value;
        this.filterGemstones();
      });
    }
    
    if (filterColor) {
      filterColor.addEventListener('change', (e) => {
        this.selectedColor = e.target.value;
        this.filterGemstones();
      });
    }
  }
  
  bindCardEvents() {
    const cards = this.container.querySelectorAll('.gem-grid-card');
    cards.forEach(card => {
      const gemId = card.getAttribute('data-gem-id');
      
      // Click card to open drawer (except if clicking compare or favorite button)
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-compare-add') || e.target.closest('.btn-favorite')) return;
        this.openDrawer(gemId);
      });
    });
    
    // Compare button clicks
    const compareBtns = this.container.querySelectorAll('.btn-compare-add');
    compareBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const gemId = btn.getAttribute('data-gem-id');
        const gem = gemstones.find(g => g.id === gemId);
        if (gem) {
          this.onToggleCompare(gem);
          
          // Toggle UI state
          const isAdded = this.isCompared(gemId);
          btn.classList.toggle('selected', isAdded);
          btn.innerHTML = `<i class="fa-solid ${isAdded ? 'fa-circle-check' : 'fa-scale-balanced'}"></i> ${isAdded ? 'Compared' : 'Compare'}`;
        }
      });
    });
    
    // Favorite button clicks
    const favoriteBtns = this.container.querySelectorAll('.btn-favorite');
    favoriteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const gemId = btn.getAttribute('data-gem-id');
        const nowFavorited = this.onToggleFavorite(gemId);
        
        btn.classList.toggle('active', nowFavorited);
        const icon = btn.querySelector('i');
        if (icon) {
          icon.className = `fa-${nowFavorited ? 'solid' : 'regular'} fa-heart`;
        }
      });
    });
    
    // Read more links
    const readMoreLinks = this.container.querySelectorAll('.card-read-more');
    readMoreLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const gemId = link.getAttribute('data-gem-id');
        this.openDrawer(gemId);
      });
    });
  }
  
  openDrawer(gemId) {
    const gem = gemstones.find(g => g.id === gemId);
    if (!gem || !this.drawer || !this.overlay) return;
    
    const isAdded = this.isCompared(gem.id);
    const isFav = this.isFavorited(gem.id);
    const hasRealImage = gem.image && !gem.image.includes('placeholder') && (gem.id === 'amethyst' || gem.id === 'citrine');
    
    const imageContent = hasRealImage 
      ? `<img src="${gem.image}" alt="${gem.name}" />`
      : getCrystalSVG(gem.colorHex, 150);
      
    this.drawer.innerHTML = `
      <button class="drawer-close" id="drawer-close-btn" title="Close Drawer"><i class="fa-solid fa-xmark"></i></button>
      
      <div class="drawer-header">
        <div class="drawer-img-container">
          ${imageContent}
        </div>
        <h2 style="color: ${gem.colorHex};">${gem.name}</h2>
        <span class="subtitle">${gem.subtitle}</span>
      </div>
      
      <div class="drawer-section">
        <h3><i class="fa-solid fa-circle-info"></i> Astral Essence</h3>
        <p>${gem.description}</p>
        <p style="margin-top:0.8rem; font-style:italic; color:var(--text-muted); border-left: 2px solid ${gem.colorHex}; padding-left: 0.8rem;">
          ${gem.metaphysical}
        </p>
      </div>
      
      <div class="drawer-section">
        <h3><i class="fa-solid fa-sliders"></i> Alignment Specs</h3>
        <div class="attributes-grid" style="grid-template-columns: 1fr; gap:0.6rem;">
          <div class="attr-item" style="padding:0.6rem;">
            <i class="fa-solid fa-circle-notch" style="color: ${gem.colorHex};"></i>
            <div class="attr-info">
              <span class="attr-label">Chakra Resonance</span>
              <span class="attr-val" style="font-size:0.85rem;">${gem.chakra}</span>
            </div>
          </div>
          <div class="attr-item" style="padding:0.6rem;">
            <i class="fa-solid fa-star" style="color: var(--gold-accent);"></i>
            <div class="attr-info">
              <span class="attr-label">Zodiac Affinity</span>
              <span class="attr-val" style="font-size:0.85rem;">${gem.zodiac.join(', ')}</span>
            </div>
          </div>
          <div class="attr-item" style="padding:0.6rem;">
            <i class="fa-solid fa-gem"></i>
            <div class="attr-info">
              <span class="attr-label">Hardness (Mohs)</span>
              <span class="attr-val" style="font-size:0.85rem;">${gem.physical.hardness}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="drawer-section">
        <h3><i class="fa-solid fa-spa"></i> Sanctuary Rituals</h3>
        <p style="margin-bottom:0.8rem;"><strong style="font-size:0.85rem; color: var(--text-main);"><i class="fa-solid fa-hands-bubbles"></i> Cleansing:</strong> ${gem.ritual.cleansing}</p>
        <p><strong style="font-size:0.85rem; color: var(--text-main);"><i class="fa-solid fa-om"></i> Meditation:</strong> ${gem.ritual.meditation}</p>
      </div>
      
      <div style="margin-top: 2rem; display: flex; gap: 0.8rem;">
        <button id="drawer-compare-btn" class="btn-primary" style="flex:1; justify-content:center; background: linear-gradient(135deg, ${gem.colorHex} 0%, #1a162d 150%);">
          <i class="fa-solid ${isAdded ? 'fa-circle-check' : 'fa-scale-balanced'}"></i>
          <span>${isAdded ? 'Added to Compare' : 'Add to Compare'}</span>
        </button>
        
        <button id="drawer-favorite-btn" class="btn-secondary ${isFav ? 'active' : ''}" style="display:flex; align-items:center; gap:0.5rem; justify-content:center; ${isFav ? 'color: var(--rose-love); border-color: rgba(255, 118, 117, 0.4); background: rgba(255,118,117,0.05);' : ''}">
          <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
          <span>${isFav ? 'Favorited' : 'Favorite'}</span>
        </button>
      </div>
    `;
    
    // Add open classes
    this.drawer.classList.add('open');
    this.overlay.classList.add('open');
    
    // Bind drawer events
    const closeBtn = this.drawer.querySelector('#drawer-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());
    
    const drawerCompareBtn = this.drawer.querySelector('#drawer-compare-btn');
    if (drawerCompareBtn) {
      drawerCompareBtn.addEventListener('click', () => {
        this.onToggleCompare(gem);
        const active = this.isCompared(gem.id);
        
        // Update drawer button
        drawerCompareBtn.querySelector('i').className = `fa-solid ${active ? 'fa-circle-check' : 'fa-scale-balanced'}`;
        drawerCompareBtn.querySelector('span').innerText = active ? 'Added to Compare' : 'Add to Compare';
        
        // Refresh grid buttons to align states
        this.filterGemstones();
      });
    }
    
    const drawerFavBtn = this.drawer.querySelector('#drawer-favorite-btn');
    if (drawerFavBtn) {
      drawerFavBtn.addEventListener('click', () => {
        const nowFavorited = this.onToggleFavorite(gem.id);
        
        drawerFavBtn.classList.toggle('active', nowFavorited);
        drawerFavBtn.querySelector('i').className = `fa-${nowFavorited ? 'solid' : 'regular'} fa-heart`;
        drawerFavBtn.querySelector('span').innerText = nowFavorited ? 'Favorited' : 'Favorite';
        if (nowFavorited) {
          drawerFavBtn.style.color = 'var(--rose-love)';
          drawerFavBtn.style.borderColor = 'rgba(255, 118, 117, 0.4)';
          drawerFavBtn.style.background = 'rgba(255,118,117,0.05)';
        } else {
          drawerFavBtn.style.color = '';
          drawerFavBtn.style.borderColor = '';
          drawerFavBtn.style.background = '';
        }
        
        // Refresh grid buttons to align states
        this.filterGemstones();
      });
    }
  }
  
  closeDrawer() {
    if (this.drawer) this.drawer.classList.remove('open');
    if (this.overlay) this.overlay.classList.remove('open');
  }
}
