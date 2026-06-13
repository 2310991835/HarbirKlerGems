import { gemstones } from '../data/gemstones.js';
import { getCrystalSVG } from './Result.js';

const ZODIAC_WISDOM = {
  Aries: {
    symbol: "♈",
    title: "Celestial Pioneer",
    affirmation: "Your inner flame burns bright today. Channel your active energy into manifestation. Let grounding stones calm your impulsive sparks, allowing clear visions of your goals to crystalise.",
    crystalType: "Carnelian or Hematite"
  },
  Taurus: {
    symbol: "♉",
    title: "Earth Anchor",
    affirmation: "Stability is your superpower, but do not let it become stagnation. Allow celestial vibrations to open your heart to change. Rest your hands on green crystals to manifest natural abundance.",
    crystalType: "Jade or Emerald"
  },
  Gemini: {
    symbol: "♊",
    title: "Astral Messenger",
    affirmation: "Your mind is a constellation of ideas today. Quiet the noise and focus on a single star. Blue crystals will align your throat chakra, allowing your truth to flow with elegant precision.",
    crystalType: "Lapis Lazuli or Sodalite"
  },
  Cancer: {
    symbol: "♋",
    title: "Lunar Guardian",
    affirmation: "Your emotional tides are high today. Trust your intuition—it is fully aligned. Wrap yourself in protective lunar energies, and let crystals soothe any passing anxiety.",
    crystalType: "Moonstone or Selenite"
  },
  Leo: {
    symbol: "♌",
    title: "Solar Sovereign",
    affirmation: "Your solar presence radiates warmth to those around you. Remember to nourish your own inner light as well. Golden, sun-charged crystals will amplify your creativity and steady your confidence.",
    crystalType: "Citrine or Pyrite"
  },
  Virgo: {
    symbol: "♍",
    title: "Sacred Alchemist",
    affirmation: "Order and clarity are your guides today. Release the need to perfect everything, and trust the cosmic flow. Grounding earthy crystals will help you integrate your wisdom without strain.",
    crystalType: "Jasper or Amethyst"
  },
  Libra: {
    symbol: "♎",
    title: "Harmonic Weaver",
    affirmation: "Balance is seeking you. Seek harmony not just in others, but within your own center. Heart-attuned crystals will help you bridge the space between thoughts and feelings.",
    crystalType: "Rose Quartz or Jade"
  },
  Scorpio: {
    symbol: "♏",
    title: "Shadow Transmuter",
    affirmation: "Your transformational power is peaking. Do not fear the shadows; they are the cradle of your renewal. High-frequency crystals will shield your energy field as you manifest your intentions.",
    crystalType: "Obsidian or Labradorite"
  },
  Sagittarius: {
    symbol: "♐",
    title: "Cosmic Voyager",
    affirmation: "The horizon is calling you, Seeker. Keep your focus high and your feet steady. Crystals that activate the crown and third-eye chakras will expand your visionary plans.",
    crystalType: "Clear Quartz or Amethyst"
  },
  Capricorn: {
    symbol: "♑",
    title: "Earthy Architect",
    affirmation: "Your dedication is laying down roots for future legacy. Be patient with the divine timing of the cosmos. Grounding crystals will support your structural build and invite steady prosperity.",
    crystalType: "Garnet or Black Tourmaline"
  },
  Aquarius: {
    symbol: "♒",
    title: "Stellar Visionary",
    affirmation: "Your thoughts are anchored in the future. Share your visionary sparks with the collective. High-frequency electrical crystals will amplify your unique cosmic frequency.",
    crystalType: "Labradorite or Aquamarine"
  },
  Pisces: {
    symbol: "♓",
    title: "Dream Mystic",
    affirmation: "You are drifting through deep spiritual waters today. Anchor your dreams into physical reality. Violet or soft blue crystals will shield your empathetic heart and inspire art.",
    crystalType: "Amethyst or Aquamarine"
  }
};

export class Altar {
  constructor(containerId, currentUser, favorites, onUnlock, onToggleFavorite, onOpenDrawer, onNavigate) {
    this.container = document.getElementById(containerId);
    this.currentUser = currentUser;
    this.favorites = favorites; // Array of gemstone IDs
    this.onUnlock = onUnlock;
    this.onToggleFavorite = onToggleFavorite;
    this.onOpenDrawer = onOpenDrawer;
    this.onNavigate = onNavigate;
    
    this.render();
  }
  
  updateUser(user, favorites) {
    this.currentUser = user;
    this.favorites = favorites;
    this.render();
  }
  
  render() {
    if (!this.container) return;
    
    if (!this.currentUser) {
      this.renderLockedState();
    } else {
      this.renderActiveState();
    }
  }
  
  renderLockedState() {
    this.container.innerHTML = `
      <div class="locked-altar glass-card">
        <div class="locked-altar-icon">
          <i class="fa-solid fa-lock"></i>
        </div>
        <h2>Unlock Your Altar</h2>
        <p>Your personal spiritual altar is currently locked in the stars. Align your profile to save your favorite crystals, calibrate your zodiac resonance, and receive custom daily astrological readings.</p>
        <button id="altar-unlock-btn" class="btn-primary" style="margin: 0 auto;">
          Align Profile & Unlock <i class="fa-solid fa-wand-magic-sparkles"></i>
        </button>
      </div>
    `;
    
    const unlockBtn = this.container.querySelector('#altar-unlock-btn');
    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => {
        this.onUnlock();
      });
    }
  }
  
  renderActiveState() {
    const zodiacInfo = ZODIAC_WISDOM[this.currentUser.zodiac] || { symbol: "🌟", title: "Adept", affirmation: "Your frequency is aligning with the cosmic waves.", crystalType: "Clear Quartz" };
    
    // Filter gemstones matching user favorites list
    const favGems = gemstones.filter(g => this.favorites.includes(g.id));
    
    let gridHtml = '';
    if (favGems.length === 0) {
      gridHtml = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: rgba(255,255,255,0.01); border: 1px dashed var(--border-light); border-radius: var(--radius-md);">
          <i class="fa-solid fa-circle-nodes" style="font-size: 3rem; margin-bottom: 1rem; color: var(--text-muted); opacity: 0.3;"></i>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">Your Altar has no active crystal configurations.</p>
          <button id="go-explorer-btn" class="btn-secondary" style="margin: 0 auto;">
            Go Explore Gems <i class="fa-solid fa-compass"></i>
          </button>
        </div>
      `;
    } else {
      gridHtml = `
        <div class="explorer-grid">
          ${favGems.map(gem => {
            const hasRealImage = gem.image && !gem.image.includes('placeholder') && (gem.id === 'amethyst' || gem.id === 'citrine');
            const thumbContent = hasRealImage 
              ? `<img src="${gem.image}" alt="${gem.name}" />`
              : `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:rgba(255,255,255,0.02);padding:1.5rem;">${getCrystalSVG(gem.colorHex, 90)}</div>`;
              
            return `
              <div class="gem-grid-card" data-gem-id="${gem.id}">
                <div class="card-img-container">
                  ${thumbContent}
                  <span class="category-badge">${gem.category}</span>
                  <button class="btn-favorite active" data-gem-id="${gem.id}" title="Remove from Altar">
                    <i class="fa-solid fa-heart"></i>
                  </button>
                </div>
                
                <div class="card-body">
                  <h3 style="color: ${gem.colorHex};">${gem.name}</h3>
                  <span class="card-energy"><i class="fa-solid fa-bolt-lightning"></i> ${gem.energy} Frequency</span>
                  <p class="card-desc">${gem.description.slice(0, 95)}...</p>
                  
                  <div class="card-actions" style="margin-top: auto;">
                    <a href="#" class="card-read-more" data-gem-id="${gem.id}" style="margin-left: auto;">
                      Read Wisdom <i class="fa-solid fa-chevron-right"></i>
                    </a>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
    
    this.container.innerHTML = `
      <div class="altar-container">
        
        <!-- User Cosmic Bio Card -->
        <div class="altar-profile-card">
          <div class="altar-avatar-container">
            <span>${zodiacInfo.symbol}</span>
          </div>
          <div class="altar-profile-details">
            <h2>Adept ${this.currentUser.username}</h2>
            <div class="zodiac-meta">
              <span>${zodiacInfo.symbol} ${this.currentUser.zodiac} Alignment</span>
              <span style="font-size: 0.8rem; background: rgba(0, 210, 196, 0.15); color: var(--cyan-glow); padding: 0.1rem 0.5rem; border-radius: 4px; border: 1px solid rgba(0, 210, 196, 0.2);">${zodiacInfo.title}</span>
            </div>
            <p class="reading-text">
              <strong>Daily Calibration:</strong> ${zodiacInfo.affirmation} 
              <br><span style="display:inline-block; margin-top: 0.5rem; color: var(--primary-light); font-size: 0.85rem;"><i class="fa-solid fa-angles-right"></i> Suggested Altar Resonance: <strong>${zodiacInfo.crystalType}</strong></span>
            </p>
          </div>
        </div>
        
        <!-- Altar Saved Crystals -->
        <div>
          <h2 style="font-family: var(--font-serif); font-size: 2rem; margin-bottom: 0.5rem;">Your Sanctuary Altar</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 2rem; font-family: var(--font-display);">Crystals bound to your energetic signature</p>
          
          ${gridHtml}
        </div>
        
      </div>
    `;
    
    this.bindEvents();
  }
  
  bindEvents() {
    // Navigate explorer button
    const goExplorerBtn = this.container.querySelector('#go-explorer-btn');
    if (goExplorerBtn) {
      goExplorerBtn.addEventListener('click', () => {
        this.onNavigate('explorer');
      });
    }
    
    // Heart togglers to remove favorite
    const favBtns = this.container.querySelectorAll('.btn-favorite');
    favBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const gemId = btn.getAttribute('data-gem-id');
        this.onToggleFavorite(gemId);
        
        // Remove card element with brief fade out
        const card = btn.closest('.gem-grid-card');
        if (card) {
          card.style.transition = 'all 0.4s ease';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.8)';
          setTimeout(() => {
            this.render();
          }, 400);
        }
      });
    });
    
    // Read more links
    const readLinks = this.container.querySelectorAll('.card-read-more');
    readLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const gemId = link.getAttribute('data-gem-id');
        this.onOpenDrawer(gemId);
      });
    });
    
    // Grid card click
    const cards = this.container.querySelectorAll('.gem-grid-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-favorite')) return;
        const gemId = card.getAttribute('data-gem-id');
        this.onOpenDrawer(gemId);
      });
    });
  }
}
