import { gemstones } from '../data/gemstones.js';

export class Quiz {
  constructor(containerId, onComplete) {
    this.container = document.getElementById(containerId);
    this.onComplete = onComplete;
    
    this.currentStep = 1;
    this.answers = {
      zodiac: '',
      intention: '',
      energy: '',
      colorAura: ''
    };
    
    this.steps = [
      {
        id: 1,
        title: "Align with the Cosmos",
        subtitle: "Select your Zodiac alignment to calibrate the astral readings",
        field: "zodiac"
      },
      {
        id: 2,
        title: "Define Your Intention",
        subtitle: "What energy shifts or goals are you currently manifesting?",
        field: "intention"
      },
      {
        id: 3,
        title: "Calibrate Your Frequency",
        subtitle: "Which energetic temperament feels most needed right now?",
        field: "energy"
      },
      {
        id: 4,
        title: "Choose Your Aura",
        subtitle: "Select the visual color spectrum that draws your focus",
        field: "colorAura"
      }
    ];
    
    this.zodiacs = [
      { name: "Aries", symbol: "♈", date: "Mar 21 - Apr 19" },
      { name: "Taurus", symbol: "♉", date: "Apr 20 - May 20" },
      { name: "Gemini", symbol: "♊", date: "May 21 - Jun 20" },
      { name: "Cancer", symbol: "♋", date: "Jun 21 - Jul 22" },
      { name: "Leo", symbol: "♌", date: "Jul 23 - Aug 22" },
      { name: "Virgo", symbol: "♍", date: "Aug 23 - Sep 22" },
      { name: "Libra", symbol: "♎", date: "Sep 23 - Oct 22" },
      { name: "Scorpio", symbol: "♏", date: "Oct 23 - Nov 21" },
      { name: "Sagittarius", symbol: "♐", date: "Nov 22 - Dec 21" },
      { name: "Capricorn", symbol: "♑", date: "Dec 22 - Jan 19" },
      { name: "Aquarius", symbol: "♒", date: "Jan 20 - Feb 18" },
      { name: "Pisces", symbol: "♓", date: "Feb 19 - Mar 20" }
    ];
    
    this.intentions = [
      { name: "Wealth & Success", icon: "fa-solid fa-coins", desc: "Attract opportunities, prosperity, and career flow" },
      { name: "Love & Relationships", icon: "fa-solid fa-heart", desc: "Foster compassion, self-love, and deep connections" },
      { name: "Inner Peace & Calming", icon: "fa-solid fa-wind", desc: "Soothe anxiety, quiet thoughts, and rest deeply" },
      { name: "Courage & Confidence", icon: "fa-solid fa-fire", desc: "Activate personal will, power, and stand strong" },
      { name: "Protection & Grounding", icon: "fa-solid fa-shield-halved", desc: "Shield negative frequencies and center your core" },
      { name: "Focus & Clarity", icon: "fa-solid fa-brain", desc: "Quiet mental noise, study, and channel higher wisdom" },
      { name: "Growth & Transformation", icon: "fa-solid fa-seedling", desc: "Catalyze renewal, release blocks, and evolve" }
    ];
    
    this.energies = [
      { name: "Grounding", icon: "fa-solid fa-mountain", desc: "Steady, rooted, physical, stable" },
      { name: "Calming", icon: "fa-solid fa-droplet", desc: "Soothing, fluid, cooling, emotional healing" },
      { name: "Energizing", icon: "fa-solid fa-bolt", desc: "Uplifting, warm, passionate, action-oriented" },
      { name: "Inspiring", icon: "fa-solid fa-eye", desc: "Visionary, mental clarity, creative expansion" }
    ];
    
    this.auras = [
      { id: "Warm Sunset", name: "Warm Sunset", class: "color-sunset", colors: ["Red", "Orange", "Gold", "Yellow"], desc: "Passion, joy, vital flame" },
      { id: "Deep Ocean", name: "Deep Ocean", class: "color-ocean", colors: ["Blue", "Teal", "Blue-Green"], desc: "Calm truth, flow, focus" },
      { id: "Mystical Dusk", name: "Mystical Dusk", class: "color-mystical", colors: ["Violet", "Pink", "Clear"], desc: "Intuition, love, higher realms" },
      { id: "Forest Harmony", name: "Forest Harmony", class: "color-forest", colors: ["Green", "Blue-Green", "Gold"], desc: "Healing, luck, renewal" },
      { id: "Clear Starlight", name: "Clear Starlight", class: "color-starlight", colors: ["Clear", "Black", "White"], desc: "Purity, shielding, alignment" }
    ];
    
    this.render();
  }
  
  render() {
    if (!this.container) return;
    
    const stepInfo = this.steps[this.currentStep - 1];
    const progressPercent = (this.currentStep / this.steps.length) * 100;
    
    let optionsHtml = '';
    
    if (this.currentStep === 1) {
      // Zodiac Layout
      optionsHtml = `
        <div class="options-grid zodiac-grid">
          ${this.zodiacs.map(z => `
            <div class="option-card zodiac-card ${this.answers.zodiac === z.name ? 'selected' : ''}" data-value="${z.name}">
              <div class="zodiac-symbol">${z.symbol}</div>
              <span>${z.name}</span>
              <div class="zodiac-date">${z.date}</div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (this.currentStep === 2) {
      // Intentions Layout
      optionsHtml = `
        <div class="options-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
          ${this.intentions.map(i => `
            <div class="option-card ${this.answers.intention === i.name ? 'selected' : ''}" data-value="${i.name}">
              <i class="${i.icon}"></i>
              <span>${i.name}</span>
              <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center;">${i.desc}</div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (this.currentStep === 3) {
      // Energies Layout
      optionsHtml = `
        <div class="options-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
          ${this.energies.map(e => `
            <div class="option-card ${this.answers.energy === e.name ? 'selected' : ''}" data-value="${e.name}">
              <i class="${e.icon}"></i>
              <span>${e.name}</span>
              <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center;">${e.desc}</div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (this.currentStep === 4) {
      // Aura Colors Layout
      optionsHtml = `
        <div class="options-grid color-grid">
          ${this.auras.map(a => `
            <div class="option-card color-option ${this.answers.colorAura === a.id ? 'selected' : ''}" data-value="${a.id}">
              <div class="color-circle ${a.class}"></div>
              <span>${a.name}</span>
              <div style="font-size: 0.72rem; color: var(--text-muted); text-align: center; font-style: italic;">${a.desc}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    this.container.innerHTML = `
      <div class="quiz-wrapper glass-card">
        <div class="quiz-header">
          <h1>${stepInfo.title}</h1>
          <p>${stepInfo.subtitle}</p>
        </div>
        
        <div class="progress-bar-container">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        
        ${optionsHtml}
        
        <div class="quiz-actions">
          <button id="quiz-back-btn" class="btn-secondary" ${this.currentStep === 1 ? 'disabled style="opacity: 0.3;"' : ''}>
            <i class="fa-solid fa-arrow-left"></i> Back
          </button>
          
          <button id="quiz-next-btn" class="btn-primary" ${!this.answers[stepInfo.field] ? 'disabled' : ''}>
            ${this.currentStep === this.steps.length ? 'Reveal Match <i class="fa-solid fa-gem"></i>' : 'Continue <i class="fa-solid fa-arrow-right"></i>'}
          </button>
        </div>
      </div>
    `;
    
    this.bindEvents();
  }
  
  bindEvents() {
    const cards = this.container.querySelectorAll('.option-card');
    const stepInfo = this.steps[this.currentStep - 1];
    
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const val = card.getAttribute('data-value');
        this.answers[stepInfo.field] = val;
        
        // Visual toggle
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        // Enable next button
        const nextBtn = this.container.querySelector('#quiz-next-btn');
        if (nextBtn) nextBtn.removeAttribute('disabled');
      });
    });
    
    const backBtn = this.container.querySelector('#quiz-back-btn');
    if (backBtn && this.currentStep > 1) {
      backBtn.addEventListener('click', () => {
        this.currentStep--;
        this.render();
      });
    }
    
    const nextBtn = this.container.querySelector('#quiz-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentStep < this.steps.length) {
          this.currentStep++;
          this.render();
        } else {
          this.calculateMatch();
        }
      });
    }
  }
  
  calculateMatch() {
    const scoredGems = gemstones.map(gem => {
      let score = 0;
      let maxPossibleScore = 0;
      
      // 1. Intention Match (Weight: 5 points)
      maxPossibleScore += 5;
      if (gem.intentions.includes(this.answers.intention)) {
        score += 5;
      }
      
      // 2. Energy Temperament Match (Weight: 3 points)
      maxPossibleScore += 3;
      if (gem.energy === this.answers.energy) {
        score += 3;
      }
      
      // 3. Zodiac Compatibility (Weight: 2 points)
      maxPossibleScore += 2;
      if (gem.zodiac.includes(this.answers.zodiac)) {
        score += 2;
      }
      
      // 4. Color Aura Match (Weight: 1 point)
      maxPossibleScore += 1;
      const selectedAura = this.auras.find(a => a.id === this.answers.colorAura);
      if (selectedAura && selectedAura.colors.includes(gem.color)) {
        score += 1;
      }
      
      // Calculate match percentage
      const matchPercentage = Math.round((score / maxPossibleScore) * 100);
      
      return {
        gemstone: gem,
        score: matchPercentage
      };
    });
    
    // Sort descending by match percentage, then sort by rarity/category (Precious over Semi-precious)
    scoredGems.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Tie-breaker: Precious category first
      const catA = a.gemstone.category === "Precious" ? 1 : 0;
      const catB = b.gemstone.category === "Precious" ? 1 : 0;
      if (catB !== catA) return catB - catA;
      
      // Alphabetical fall-back
      return a.gemstone.name.localeCompare(b.gemstone.name);
    });
    
    const primary = scoredGems[0];
    const runnerUps = scoredGems.slice(1, 3);
    
    // Pass quiz answers & results to callback
    this.onComplete({
      answers: this.answers,
      primaryMatch: primary.gemstone,
      primaryScore: primary.score,
      runnerUps: runnerUps.map(ru => ({ gemstone: ru.gemstone, score: ru.score }))
    });
  }
}
