import { getCrystalSVG } from './Result.js';

export class Comparison {
  constructor(containerId, comparedGems, onRemoveGem, onNavigateToTab) {
    this.container = document.getElementById(containerId);
    this.comparedGems = comparedGems; // Array of gemstone objects
    this.onRemoveGem = onRemoveGem; // Callback when removing a gem
    this.onNavigateToTab = onNavigateToTab; // Navigation callback
    
    this.render();
  }
  
  update(newList) {
    this.comparedGems = newList;
    this.render();
  }
  
  render() {
    if (!this.container) return;
    
    if (this.comparedGems.length === 0) {
      this.renderEmptyState();
      return;
    }
    
    this.container.innerHTML = `
      <div class="compare-container">
        <div class="compare-header">
          <h2>Compare board</h2>
          <span style="color: var(--cyan-glow); font-family: var(--font-display); font-size: 0.9rem; font-weight: 500;">
            Comparing ${this.comparedGems.length} Crystal${this.comparedGems.length > 1 ? 's' : ''}
          </span>
        </div>
        
        <div class="compare-table-wrapper">
          <table class="compare-table">
            <thead>
              <tr class="header-row">
                <th>Metric</th>
                ${this.comparedGems.map(gem => {
                  const hasRealImage = gem.image && !gem.image.includes('placeholder') && (gem.id === 'amethyst' || gem.id === 'citrine');
                  const gemGraphic = hasRealImage 
                    ? `<img src="${gem.image}" alt="${gem.name}" />`
                    : getCrystalSVG(gem.colorHex, 80);
                    
                  return `
                    <td>
                      <div class="compare-gem-card">
                        ${gemGraphic}
                        <span class="name" style="color: ${gem.colorHex};">${gem.name}</span>
                        <button class="btn-remove-compare" data-gem-id="${gem.id}">
                          <i class="fa-solid fa-trash-can"></i> Remove
                        </button>
                      </div>
                    </td>
                  `;
                }).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Category</th>
                ${this.comparedGems.map(gem => `<td>${gem.category}</td>`).join('')}
              </tr>
              <tr>
                <th>Crystal System</th>
                ${this.comparedGems.map(gem => `<td>${gem.physical.crystalSystem}</td>`).join('')}
              </tr>
              <tr>
                <th>Hardness</th>
                ${this.comparedGems.map(gem => `<td>${gem.physical.hardness}</td>`).join('')}
              </tr>
              <tr>
                <th>Color Aura</th>
                ${this.comparedGems.map(gem => `<td><span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${gem.colorHex}; margin-right:6px; vertical-align:middle;"></span>${gem.color}</td>`).join('')}
              </tr>
              <tr>
                <th>Chakra Resonance</th>
                ${this.comparedGems.map(gem => `<td><strong>${gem.chakra}</strong></td>`).join('')}
              </tr>
              <tr>
                <th>Energy Frequency</th>
                ${this.comparedGems.map(gem => `<td><i class="fa-solid fa-bolt-lightning" style="color:${gem.colorHex}; margin-right:4px;"></i> ${gem.energy}</td>`).join('')}
              </tr>
              <tr>
                <th>Zodiac Affinity</th>
                ${this.comparedGems.map(gem => `<td>${gem.zodiac.join(', ')}</td>`).join('')}
              </tr>
              <tr>
                <th>Birth Month</th>
                ${this.comparedGems.map(gem => `<td>${gem.months.join(', ')}</td>`).join('')}
              </tr>
              <tr>
                <th>Intention Profiles</th>
                ${this.comparedGems.map(gem => `
                  <td>
                    <ul style="list-style: none; padding-left:0; display:flex; flex-direction:column; gap:0.3rem;">
                      ${gem.intentions.map(int => `<li style="font-size:0.85rem;"><i class="fa-solid fa-check" style="color:var(--cyan-glow); margin-right:6px;"></i>${int}</li>`).join('')}
                    </ul>
                  </td>
                `).join('')}
              </tr>
              <tr>
                <th>Key Origins</th>
                ${this.comparedGems.map(gem => `<td>${gem.physical.origin}</td>`).join('')}
              </tr>
              <tr>
                <th>Cleansing Method</th>
                ${this.comparedGems.map(gem => `<td style="font-size:0.85rem; color:var(--text-muted);">${gem.ritual.cleansing}</td>`).join('')}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    this.bindEvents();
  }
  
  renderEmptyState() {
    this.container.innerHTML = `
      <div class="compare-container">
        <div class="compare-header">
          <h2>Compare board</h2>
        </div>
        <div class="compare-empty glass-card">
          <i class="fa-solid fa-scale-balanced aura-glow"></i>
          <p>Your comparison board is empty. Choose crystals from the sanctuary to evaluate them side-by-side.</p>
          <button id="compare-explore-btn" class="btn-primary" style="margin: 0 auto;">
            Browse Gem Explorer <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `;
    
    const exploreBtn = this.container.querySelector('#compare-explore-btn');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        this.onNavigateToTab('explorer');
      });
    }
  }
  
  bindEvents() {
    const removeBtns = this.container.querySelectorAll('.btn-remove-compare');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const gemId = btn.getAttribute('data-gem-id');
        this.onRemoveGem(gemId);
      });
    });
  }
}
