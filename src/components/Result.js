/**
 * Helper to generate a multi-faceted glowing SVG crystal graphic based on the gemstone's color.
 */
export function getCrystalSVG(colorHex, size = 180) {
  // Variations of colors based on hex
  const primary = colorHex;
  const light = adjustColorOpacity(colorHex, 0.9);
  const dark = adjustColorOpacity(colorHex, 0.4);
  const highlight = "#ffffff";
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="crystal-svg" style="filter: drop-shadow(0 0 15px ${primary}80);">
      <defs>
        <linearGradient id="facet-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${light}" />
          <stop offset="100%" stop-color="${primary}" />
        </linearGradient>
        <linearGradient id="facet-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${dark}" />
        </linearGradient>
        <linearGradient id="facet-grad-3" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${highlight}" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="${primary}" />
        </linearGradient>
      </defs>
      
      <g style="transform-origin: center; animation: float-crystal 6s ease-in-out infinite;">
        <!-- Left Side Base Facet -->
        <polygon points="50,15 25,45 50,85" fill="url(#facet-grad-1)" opacity="0.85" />
        
        <!-- Right Side Base Facet -->
        <polygon points="50,15 75,45 50,85" fill="url(#facet-grad-2)" opacity="0.95" />
        
        <!-- Center Facet (Front Cap) -->
        <polygon points="50,15 38,40 50,75" fill="url(#facet-grad-3)" opacity="0.9" />
        <polygon points="50,15 62,40 50,75" fill="url(#facet-grad-1)" opacity="0.8" />
        
        <!-- Bottom Facets -->
        <polygon points="25,45 38,40 50,75 50,85" fill="${dark}" opacity="0.9" />
        <polygon points="75,45 62,40 50,75 50,85" fill="${primary}" opacity="0.6" />
        
        <!-- Highlighting Edges -->
        <line x1="50" y1="15" x2="50" y2="85" stroke="${highlight}" stroke-width="0.5" opacity="0.3" />
        <line x1="50" y1="15" x2="25" y2="45" stroke="${highlight}" stroke-width="0.5" opacity="0.4" />
        <line x1="50" y1="15" x2="75" y2="45" stroke="${highlight}" stroke-width="0.5" opacity="0.4" />
      </g>
      
      <style>
        @keyframes float-crystal {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      </style>
    </svg>
  `;
}

function adjustColorOpacity(hex, opacity) {
  // Simple utility to add opacity or lighten hex
  return hex + Math.round(opacity * 255).toString(16).padStart(2, '0');
}

export class Result {
  constructor(containerId, resultsData, onRetake, onSelectGem, onToggleCompare) {
    this.container = document.getElementById(containerId);
    this.data = resultsData;
    this.onRetake = onRetake;
    this.onSelectGem = onSelectGem;
    this.onToggleCompare = onToggleCompare;
    
    this.render();
  }
  
  render() {
    if (!this.container) return;
    
    const primary = this.data.primaryMatch;
    const score = this.data.primaryScore;
    const runnerUps = this.data.runnerUps;
    
    // Check if real image exists
    const hasRealImage = primary.image && !primary.image.includes('placeholder') && (primary.id === 'amethyst' || primary.id === 'citrine');
    const imageContent = hasRealImage 
      ? `<img src="${primary.image}" alt="${primary.name}" />` 
      : getCrystalSVG(primary.colorHex, 180);
      
    this.container.innerHTML = `
      <div class="results-container">
        
        <!-- LEFT: Hero Matched Crystal Card -->
        <div class="hero-stone-card">
          <div class="hero-stone-inner">
            <div class="match-badge">
              <i class="fa-solid fa-star"></i> ${score}% Soul Match
            </div>
            
            <div class="gem-image-frame">
              ${imageContent}
            </div>
            
            <h1 class="hero-stone-title" style="color: ${primary.colorHex};">${primary.name}</h1>
            <p class="hero-stone-subtitle">${primary.subtitle}</p>
            
            <div class="hero-stone-traits">
              <span class="trait-tag"><i class="fa-solid fa-bolt-lightning"></i> ${primary.energy}</span>
              <span class="trait-tag"><i class="fa-solid fa-moon"></i> ${primary.category}</span>
              <span class="trait-tag"><i class="fa-solid fa-gem"></i> Mohs ${primary.physical.hardness.split(' ')[0]}</span>
            </div>
            
            <div style="margin-top: 2.5rem; display: flex; flex-direction: column; gap: 0.8rem;">
              <button id="add-compare-btn" class="btn-primary" style="background: linear-gradient(135deg, ${primary.colorHex} 0%, #110c22 150%); width: 100%; justify-content: center; box-shadow: 0 4px 15px ${primary.colorHex}40;">
                <i class="fa-solid fa-scale-balanced"></i> Add to Compare Board
              </button>
              <button id="retake-quiz-btn" class="btn-secondary" style="width: 100%;">
                <i class="fa-solid fa-rotate-left"></i> Consult Oracle Again
              </button>
            </div>
          </div>
        </div>
        
        <!-- RIGHT: Detailed Metaphysical Reading & specs -->
        <div class="reading-panel">
          <div class="panel-header-actions">
            <h2>Cosmic Reading</h2>
            <span style="color: var(--text-muted); font-size: 0.85rem; font-family: var(--font-display);">
              Zodiac alignment: <strong style="color: var(--text-main);">${this.data.answers.zodiac}</strong>
            </span>
          </div>
          
          <div class="reading-card">
            <h3><i class="fa-solid fa-feather-pointed"></i> Metaphysical Properties</h3>
            <p>${primary.description}</p>
            <p style="margin-top: 1rem; font-style: italic; color: var(--text-muted); border-left: 2px solid ${primary.colorHex}; padding-left: 1rem;">
              ${primary.metaphysical}
            </p>
          </div>
          
          <div class="reading-card">
            <h3><i class="fa-solid fa-sliders"></i> Alignment Specifications</h3>
            <div class="attributes-grid">
              <div class="attr-item">
                <i class="fa-solid fa-circle-notch" style="color: ${primary.colorHex};"></i>
                <div class="attr-info">
                  <span class="attr-label">Primary Chakra</span>
                  <span class="attr-val">${primary.chakra}</span>
                </div>
              </div>
              <div class="attr-item">
                <i class="fa-solid fa-shield-halved"></i>
                <div class="attr-info">
                  <span class="attr-label">Energy Frequency</span>
                  <span class="attr-val">${primary.energy}</span>
                </div>
              </div>
              <div class="attr-item">
                <i class="fa-solid fa-arrows-to-dot"></i>
                <div class="attr-info">
                  <span class="attr-label">Crystal System</span>
                  <span class="attr-val">${primary.physical.crystalSystem}</span>
                </div>
              </div>
              <div class="attr-item">
                <i class="fa-solid fa-earth-americas"></i>
                <div class="attr-info">
                  <span class="attr-label">Key Origins</span>
                  <span class="attr-val">${primary.physical.origin}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="reading-card">
            <h3><i class="fa-solid fa-spa"></i> Cleansing & charging Ritual</h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div>
                <strong style="color: var(--text-main); font-size: 0.9rem; display: block; margin-bottom: 0.2rem;"><i class="fa-solid fa-hands-bubbles"></i> Cleansing Method</strong>
                <p style="font-size: 0.88rem; color: var(--text-muted);">${primary.ritual.cleansing}</p>
              </div>
              <div>
                <strong style="color: var(--text-main); font-size: 0.9rem; display: block; margin-bottom: 0.2rem;"><i class="fa-solid fa-om"></i> Meditative Practice</strong>
                <p style="font-size: 0.88rem; color: var(--text-muted);">${primary.ritual.meditation}</p>
              </div>
            </div>
          </div>
          
          <!-- Runner Ups Section -->
          <div class="runner-ups-section">
            <h3>Alternative Resonance Matches</h3>
            <div class="runner-ups-list">
              ${runnerUps.map(ru => {
                const ruGem = ru.gemstone;
                const isRuAmethystOrCitrine = ruGem.id === 'amethyst' || ruGem.id === 'citrine';
                const thumbContent = isRuAmethystOrCitrine 
                  ? `<img src="${ruGem.image}" alt="${ruGem.name}" class="runner-thumb" />`
                  : `<div class="runner-thumb" style="display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.02);border:1px dashed ${ruGem.colorHex};">${getCrystalSVG(ruGem.colorHex, 45)}</div>`;
                  
                return `
                  <div class="runner-card" data-gem-id="${ruGem.id}">
                    ${thumbContent}
                    <div class="runner-info">
                      <span class="runner-name" style="color: ${ruGem.colorHex};">${ruGem.name}</span>
                      <span class="runner-match"><i class="fa-solid fa-chart-simple"></i> ${ru.score}% resonance</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
        </div>
      </div>
    `;
    
    this.bindEvents();
  }
  
  bindEvents() {
    const primary = this.data.primaryMatch;
    
    const retakeBtn = this.container.querySelector('#retake-quiz-btn');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        this.onRetake();
      });
    }
    
    const compareBtn = this.container.querySelector('#add-compare-btn');
    if (compareBtn) {
      compareBtn.addEventListener('click', () => {
        this.onToggleCompare(primary);
      });
    }
    
    const runnerCards = this.container.querySelectorAll('.runner-card');
    runnerCards.forEach(card => {
      card.addEventListener('click', () => {
        const gemId = card.getAttribute('data-gem-id');
        this.onSelectGem(gemId);
      });
    });
  }
}
