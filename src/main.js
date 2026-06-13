import { StarryBackground } from './components/StarryBackground.js';
import { CosmicSynth } from './components/CosmicSynth.js';
import { Quiz } from './components/Quiz.js';
import { Result } from './components/Result.js';
import { Explorer } from './components/Explorer.js';
import { Comparison } from './components/Comparison.js';
import { gemstones } from './data/gemstones.js';
import { Auth } from './components/Auth.js';
import { Altar } from './components/Altar.js';

class App {
  constructor() {
    this.activeTab = 'quiz';
    this.comparedGemIds = [];
    this.quizResults = null;
    
    // Core Background and Audio
    this.background = new StarryBackground('starry-canvas');
    this.synth = new CosmicSynth();
    
    // User session and favorites state
    this.currentUser = JSON.parse(localStorage.getItem('auragems_current_user')) || null;
    this.favorites = this.currentUser ? (JSON.parse(localStorage.getItem(`auragems_favs_${this.currentUser.email}`)) || []) : [];
    
    // Authentication Manager
    this.auth = new Auth(
      this,
      (user) => this.handleAuthSuccess(user),
      (msg, type) => this.showToast(msg, type)
    );
    
    this.altarComponent = null;
    
    this.init();
  }
  
  init() {
    // Nav links setup
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.showTab(tab);
      });
    });
    
    // Ambient Sound button click
    const ambientBtn = document.getElementById('ambient-toggle');
    if (ambientBtn) {
      ambientBtn.addEventListener('click', () => {
        this.toggleAmbientAudio();
      });
    }
    
    // Comparison Tray Action triggers
    const trayCompareBtn = document.getElementById('tray-compare-btn');
    if (trayCompareBtn) {
      trayCompareBtn.addEventListener('click', () => {
        this.showTab('comparison');
      });
    }
    
    const trayClearBtn = document.getElementById('tray-clear-btn');
    if (trayClearBtn) {
      trayClearBtn.addEventListener('click', () => {
        this.clearComparison();
      });
    }
    
    // Initialize user nav UI header state
    this.updateUserNavUI();
    
    // Initialize default tab
    this.showTab('quiz');
  }
  
  showTab(tabName) {
    this.activeTab = tabName;
    
    // Update headers active tabs visual states
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      const active = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('active', active);
    });
    
    // Toggle active sections
    const sections = document.querySelectorAll('.tab-panel');
    sections.forEach(section => {
      const id = section.getAttribute('id');
      const active = id === `${tabName}-section`;
      section.classList.toggle('active', active);
    });
    
    // Load components for specific tabs
    if (tabName === 'quiz') {
      this.loadQuizTab();
    } else if (tabName === 'explorer') {
      this.loadExplorerTab();
    } else if (tabName === 'comparison') {
      this.loadComparisonTab();
    } else if (tabName === 'altar') {
      this.loadAltarTab();
    }
  }
  
  loadQuizTab() {
    const section = document.getElementById('quiz-section');
    if (!section) return;
    
    if (this.quizResults) {
      // Show saved results
      new Result(
        'quiz-section',
        this.quizResults,
        // Retake Quiz callback
        () => {
          this.quizResults = null;
          this.loadQuizTab();
        },
        // Detailed Crystal Selection callback (e.g. from runner ups)
        (gemId) => {
          // Open details in sidebar drawer
          const explorer = new Explorer(
            'explorer-section',
            () => {},
            () => false,
            () => {},
            () => {},
            () => false
          );
          explorer.openDrawer(gemId);
        },
        // Toggle Compare callback
        (gem) => {
          this.toggleCompare(gem);
        },
        // Toggle favorite callback
        (gemId) => this.toggleFavorite(gemId),
        // Is favorited helper
        (gemId) => this.isFavorited(gemId)
      );
    } else {
      // Run quiz wizard
      new Quiz('quiz-section', (results) => {
        this.quizResults = results;
        
        // Calibrate synthesiser pitch to recommended gemstone's Solfeggio frequency
        const freq = results.primaryMatch.audio.frequency;
        this.synth.setFrequency(freq);
        
        // Show result panel
        this.loadQuizTab();
      });
    }
  }
  
  loadExplorerTab() {
    new Explorer(
      'explorer-section',
      // Toggle comparison
      (gem) => this.toggleCompare(gem),
      // Is compared helper
      (gemId) => this.comparedGemIds.includes(gemId),
      // Switch to comparison tab
      () => this.showTab('comparison'),
      // Toggle favorite callback
      (gemId) => this.toggleFavorite(gemId),
      // Is favorited helper
      (gemId) => this.isFavorited(gemId)
    );
  }
  
  loadAltarTab() {
    this.altarComponent = new Altar(
      'altar-section',
      this.currentUser,
      this.favorites,
      // onUnlock
      () => this.auth.show('signup', 'Align your cosmic profile to unlock your Altar'),
      // onToggleFavorite
      (gemId) => this.toggleFavorite(gemId),
      // onOpenDrawer
      (gemId) => {
        const explorer = new Explorer(
          'explorer-section',
          () => {},
          () => false,
          () => {},
          () => {},
          () => false
        );
        explorer.openDrawer(gemId);
      },
      // onNavigate
      (tab) => this.showTab(tab)
    );
  }
  
  loadComparisonTab() {
    const comparedObjects = gemstones.filter(g => this.comparedGemIds.includes(g.id));
    new Comparison(
      'comparison-section',
      comparedObjects,
      // Remove callback
      (gemId) => this.removeGemFromCompare(gemId),
      // Navigate callback
      (tab) => this.showTab(tab)
    );
  }
  
  toggleCompare(gemstone) {
    const idx = this.comparedGemIds.indexOf(gemstone.id);
    if (idx === -1) {
      this.comparedGemIds.push(gemstone.id);
    } else {
      this.comparedGemIds.splice(idx, 1);
    }
    
    this.updateComparisonTray();
    
    // If on comparison board right now, update it
    if (this.activeTab === 'comparison') {
      this.loadComparisonTab();
    }
  }
  
  removeGemFromCompare(gemId) {
    const idx = this.comparedGemIds.indexOf(gemId);
    if (idx !== -1) {
      this.comparedGemIds.splice(idx, 1);
    }
    this.updateComparisonTray();
    
    // Refresh active panel
    if (this.activeTab === 'comparison') {
      this.loadComparisonTab();
    } else if (this.activeTab === 'explorer') {
      this.loadExplorerTab();
    }
  }
  
  clearComparison() {
    this.comparedGemIds = [];
    this.updateComparisonTray();
    
    // Refresh active panels
    if (this.activeTab === 'comparison') {
      this.loadComparisonTab();
    } else if (this.activeTab === 'explorer') {
      this.loadExplorerTab();
    }
  }
  
  updateComparisonTray() {
    const tray = document.getElementById('comparison-tray');
    const trayCount = document.getElementById('tray-count');
    
    if (!tray || !trayCount) return;
    
    const count = this.comparedGemIds.length;
    if (count > 0) {
      trayCount.innerHTML = `<i class="fa-solid fa-circle-nodes"></i> ${count} Crystal${count > 1 ? 's' : ''} Selected`;
      tray.classList.add('visible');
    } else {
      tray.classList.remove('visible');
    }
  }
  
  toggleAmbientAudio() {
    const btn = document.getElementById('ambient-toggle');
    if (!btn) return;
    
    if (this.synth.isPlaying) {
      this.synth.stop();
      btn.classList.remove('active');
      btn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i> <span>Cosmic Ambient</span>`;
    } else {
      this.synth.start();
      btn.classList.add('active');
      btn.innerHTML = `<i class="fa-solid fa-volume-high"></i> <span>Cosmic Ambient</span>`;
    }
  }
  
  updateUserNavUI() {
    const userContainer = document.getElementById('user-nav-container');
    const lockIcon = document.getElementById('altar-lock-icon');
    
    if (!userContainer) return;
    
    if (this.currentUser) {
      // Logged in
      if (lockIcon) lockIcon.style.display = 'none';
      
      const zodiacs = {
        Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
        Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
      };
      const zodiacSymbol = zodiacs[this.currentUser.zodiac] || "🌟";
      
      userContainer.innerHTML = `
        <div class="user-profile-menu" id="user-menu-dropdown">
          <button class="user-profile-btn">
            <span>${zodiacSymbol}</span>
            <span>${this.currentUser.username}</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 0.75rem;"></i>
          </button>
          
          <div class="user-dropdown">
            <div class="user-dropdown-header">
              <div class="username">${this.currentUser.username}</div>
              <div>Aligned to ${this.currentUser.zodiac}</div>
            </div>
            <button class="user-dropdown-item" id="drop-altar-btn">
              <i class="fa-solid fa-hands-holding-circle"></i> My Altar
            </button>
            <button class="user-dropdown-item logout-item" id="drop-logout-btn">
              <i class="fa-solid fa-right-from-bracket"></i> Sign Out
            </button>
          </div>
        </div>
      `;
      
      // Bind dropdown menu buttons
      const dropAltar = userContainer.querySelector('#drop-altar-btn');
      if (dropAltar) {
        dropAltar.addEventListener('click', () => {
          this.showTab('altar');
        });
      }
      
      const dropLogout = userContainer.querySelector('#drop-logout-btn');
      if (dropLogout) {
        dropLogout.addEventListener('click', () => {
          this.handleLogout();
        });
      }
    } else {
      // Logged out
      if (lockIcon) lockIcon.style.display = 'inline-block';
      
      userContainer.innerHTML = `
        <button class="nav-btn auth-btn" id="nav-login-btn">
          <i class="fa-solid fa-user-astronaut"></i> Sign In
        </button>
      `;
      
      const loginBtn = userContainer.querySelector('#nav-login-btn');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          this.auth.show('signin');
        });
      }
    }
  }
  
  handleAuthSuccess(user) {
    this.currentUser = user;
    // Load favorites from local storage
    this.favorites = JSON.parse(localStorage.getItem(`auragems_favs_${user.email}`)) || [];
    
    this.updateUserNavUI();
    
    // Sync other components
    if (this.altarComponent) {
      this.altarComponent.updateUser(this.currentUser, this.favorites);
    }
    
    // Refresh currently open tab
    if (this.activeTab === 'altar') {
      this.loadAltarTab();
    } else if (this.activeTab === 'explorer') {
      this.loadExplorerTab();
    } else if (this.activeTab === 'quiz') {
      this.loadQuizTab();
    }
  }
  
  handleLogout() {
    this.currentUser = null;
    this.favorites = [];
    localStorage.removeItem('auragems_current_user');
    
    this.updateUserNavUI();
    this.showToast('You have signed out. Safe journeys, Seeker.', 'info');
    
    // Switch to quiz if they were on Altar
    if (this.activeTab === 'altar') {
      this.showTab('quiz');
    } else {
      // Refresh current views
      this.showTab(this.activeTab);
    }
  }
  
  toggleFavorite(gemId) {
    if (!this.currentUser) {
      this.auth.show('signup', 'Align your cosmic signature to save crystals to your altar');
      return false;
    }
    
    const idx = this.favorites.indexOf(gemId);
    let favorited = false;
    if (idx === -1) {
      this.favorites.push(gemId);
      this.showToast('Crystal bound to your altar configurations.', 'success');
      favorited = true;
    } else {
      this.favorites.splice(idx, 1);
      this.showToast('Crystal released from your altar.', 'info');
    }
    
    localStorage.setItem(`auragems_favs_${this.currentUser.email}`, JSON.stringify(this.favorites));
    
    // Play synthesis chime to register spiritual alignment
    this.synth.playChime();
    
    // Refresh active views to sync favorites hearts
    if (this.activeTab === 'explorer') {
      this.loadExplorerTab();
    } else if (this.activeTab === 'altar') {
      this.loadAltarTab();
    }
    
    return favorited;
  }
  
  isFavorited(gemId) {
    return this.favorites.includes(gemId);
  }
  
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-solid fa-circle-check';
    if (type === 'error') iconClass = 'fa-solid fa-circle-exclamation';
    else if (type === 'info') iconClass = 'fa-solid fa-circle-info';
    
    toast.innerHTML = `
      <i class="${iconClass}"></i>
      <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation frame to slide in
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      // Wait for slide out animation
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 4000);
  }
}

// Instantiate on load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
