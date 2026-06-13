export class Auth {
  constructor(appInstance, onAuthSuccess, onToast) {
    this.app = appInstance;
    this.onAuthSuccess = onAuthSuccess;
    this.onToast = onToast;
    this.modal = null;
    this.overlay = null;
    this.currentMode = 'signin'; // 'signin' or 'signup'
    
    this.init();
  }
  
  init() {
    // Check if modal containers exist, if not create them
    this.overlay = document.getElementById('auth-overlay');
    this.modal = document.getElementById('auth-modal');
    
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'auth-overlay';
      this.overlay.className = 'auth-overlay';
      document.body.appendChild(this.overlay);
    }
    
    if (!this.modal) {
      this.modal = document.createElement('div');
      this.modal.id = 'auth-modal';
      this.modal.className = 'auth-modal';
      document.body.appendChild(this.modal);
    }
    
    // Bind overlay click to close
    this.overlay.addEventListener('click', () => this.close());
    
    this.render();
  }
  
  show(mode = 'signin', subTitle = '') {
    this.currentMode = mode;
    this.render();
    
    if (subTitle) {
      const sub = this.modal.querySelector('.auth-subtitle');
      if (sub) sub.innerText = subTitle;
    }
    
    this.overlay.classList.add('open');
    this.modal.classList.add('open');
    
    // Play synth note to signify modal entrance
    if (this.app && this.app.synth) {
      this.app.synth.playChime();
    }
  }
  
  close() {
    this.overlay.classList.remove('open');
    this.modal.classList.remove('open');
  }
  
  render() {
    const isSignIn = this.currentMode === 'signin';
    
    this.modal.innerHTML = `
      <button class="auth-modal-close" id="auth-close-btn" title="Close Alignments"><i class="fa-solid fa-xmark"></i></button>
      <div class="auth-title">${isSignIn ? 'Calibrate Profile' : 'Align Profile'}</div>
      <div class="auth-subtitle">${isSignIn ? 'Enter your credentials to align your altar' : 'Create your celestial profile to save crystals'}</div>
      
      <div class="auth-tabs">
        <button class="auth-tab ${isSignIn ? 'active' : ''}" id="tab-signin">Sign In</button>
        <button class="auth-tab ${!isSignIn ? 'active' : ''}" id="tab-signup">Create Profile</button>
      </div>
      
      <form class="auth-form" id="auth-form-el" novalidate>
        ${!isSignIn ? `
          <div class="form-group">
            <label for="auth-username">Seeker Name</label>
            <div class="input-wrapper">
              <input type="text" id="auth-username" class="auth-input" placeholder="e.g. Luna Star" required>
              <i class="fa-solid fa-user-tag"></i>
            </div>
            <div class="auth-error" id="err-username">Name must be at least 2 characters</div>
          </div>
        ` : ''}
        
        <div class="form-group">
          <label for="auth-email">Cosmic Email</label>
          <div class="input-wrapper">
            <input type="email" id="auth-email" class="auth-input" placeholder="you@domain.com" required>
            <i class="fa-solid fa-envelope"></i>
          </div>
          <div class="auth-error" id="err-email">Please enter a valid stellar email</div>
        </div>
        
        <div class="form-group">
          <label for="auth-password">Password Code</label>
          <div class="input-wrapper">
            <input type="password" id="auth-password" class="auth-input" placeholder="••••••••" required>
            <i class="fa-solid fa-key"></i>
            <i class="fa-solid fa-eye pw-toggle" id="pw-visibility-btn"></i>
          </div>
          <div class="auth-error" id="err-password">Password must be at least 6 characters</div>
        </div>
        
        ${!isSignIn ? `
          <div class="form-group">
            <label for="auth-zodiac">Zodiac Resonance</label>
            <div class="input-wrapper zodiac-select-wrapper">
              <select id="auth-zodiac" class="auth-input" style="padding-right: 2rem;" required>
                <option value="" disabled selected>Select your celestial sign</option>
                <option value="Aries">♈ Aries (Mar 21 - Apr 19)</option>
                <option value="Taurus">♉ Taurus (Apr 20 - May 20)</option>
                <option value="Gemini">♊ Gemini (May 21 - Jun 20)</option>
                <option value="Cancer">♋ Cancer (Jun 21 - Jul 22)</option>
                <option value="Leo">♌ Leo (Jul 23 - Aug 22)</option>
                <option value="Virgo">♍ Virgo (Aug 23 - Sep 22)</option>
                <option value="Libra">♎ Libra (Sep 23 - Oct 22)</option>
                <option value="Scorpio">♏ Scorpio (Oct 23 - Nov 21)</option>
                <option value="Sagittarius">♐ Sagittarius (Nov 22 - Dec 21)</option>
                <option value="Capricorn">♑ Capricorn (Dec 22 - Jan 19)</option>
                <option value="Aquarius">♒ Aquarius (Jan 20 - Feb 18)</option>
                <option value="Pisces">♓ Pisces (Feb 19 - Mar 20)</option>
              </select>
              <i class="fa-solid fa-star-and-crescent"></i>
            </div>
            <div class="auth-error" id="err-zodiac">Please align with your zodiac sign</div>
          </div>
        ` : ''}
        
        <button type="submit" class="btn-primary" style="margin-top: 1rem; width: 100%; justify-content: center;">
          ${isSignIn ? 'Authenticate Core <i class="fa-solid fa-unlock"></i>' : 'Unlock Cosmic Vault <i class="fa-solid fa-wand-magic-sparkles"></i>'}
        </button>
      </form>
    `;
    
    this.bindEvents();
  }
  
  bindEvents() {
    const closeBtn = this.modal.querySelector('#auth-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    
    const tabSignIn = this.modal.querySelector('#tab-signin');
    if (tabSignIn) {
      tabSignIn.addEventListener('click', () => {
        if (this.currentMode !== 'signin') {
          this.currentMode = 'signin';
          this.render();
        }
      });
    }
    
    const tabSignUp = this.modal.querySelector('#tab-signup');
    if (tabSignUp) {
      tabSignUp.addEventListener('click', () => {
        if (this.currentMode !== 'signup') {
          this.currentMode = 'signup';
          this.render();
        }
      });
    }
    
    const pwToggle = this.modal.querySelector('#pw-visibility-btn');
    if (pwToggle) {
      pwToggle.addEventListener('click', () => {
        const input = this.modal.querySelector('#auth-password');
        if (input) {
          const isPw = input.type === 'password';
          input.type = isPw ? 'text' : 'password';
          pwToggle.className = `fa-solid ${isPw ? 'fa-eye-slash' : 'fa-eye'} pw-toggle`;
        }
      });
    }
    
    const form = this.modal.querySelector('#auth-form-el');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }
  }
  
  handleSubmit() {
    const isSignIn = this.currentMode === 'signin';
    const emailInput = this.modal.querySelector('#auth-email');
    const passwordInput = this.modal.querySelector('#auth-password');
    const usernameInput = this.modal.querySelector('#auth-username');
    const zodiacInput = this.modal.querySelector('#auth-zodiac');
    
    let isValid = true;
    
    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput || !emailRegex.test(emailInput.value.trim())) {
      this.showError('email');
      isValid = false;
    } else {
      this.hideError('email');
    }
    
    // Validate Password
    if (!passwordInput || passwordInput.value.length < 6) {
      this.showError('password');
      isValid = false;
    } else {
      this.hideError('password');
    }
    
    if (!isSignIn) {
      // Validate Username
      if (!usernameInput || usernameInput.value.trim().length < 2) {
        this.showError('username');
        isValid = false;
      } else {
        this.hideError('username');
      }
      
      // Validate Zodiac
      if (!zodiacInput || !zodiacInput.value) {
        this.showError('zodiac');
        isValid = false;
      } else {
        this.hideError('zodiac');
      }
    }
    
    if (!isValid) return;
    
    // Action logic
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    
    // Fetch users registry
    let users = JSON.parse(localStorage.getItem('auragems_users')) || {};
    
    if (isSignIn) {
      // Login flow
      const user = users[email];
      if (!user) {
        this.onToast('Stellar signature not found. Create a profile!', 'error');
        return;
      }
      
      if (user.password !== password) {
        this.onToast('Invalid credentials. The cosmos requires correct alignments.', 'error');
        return;
      }
      
      // Success!
      localStorage.setItem('auragems_current_user', JSON.stringify(user));
      this.onToast(`Welcome back, Adept ${user.username}! Your altar is active.`, 'success');
      this.close();
      this.onAuthSuccess(user);
    } else {
      // Sign Up flow
      if (users[email]) {
        this.onToast('Email is already aligned to another signature.', 'error');
        return;
      }
      
      const username = usernameInput.value.trim();
      const zodiac = zodiacInput.value;
      
      const newUser = {
        username,
        email,
        password,
        zodiac,
        registeredAt: new Date().toISOString()
      };
      
      users[email] = newUser;
      localStorage.setItem('auragems_users', JSON.stringify(users));
      localStorage.setItem('auragems_current_user', JSON.stringify(newUser));
      
      this.onToast(`Stellar profile created! Welcome, Seeker ${username}.`, 'success');
      this.close();
      this.onAuthSuccess(newUser);
    }
  }
  
  showError(field) {
    const errorEl = this.modal.querySelector(`#err-${field}`);
    const inputEl = this.modal.querySelector(`#auth-${field}`);
    if (errorEl) errorEl.style.display = 'block';
    if (inputEl) inputEl.classList.add('invalid');
  }
  
  hideError(field) {
    const errorEl = this.modal.querySelector(`#err-${field}`);
    const inputEl = this.modal.querySelector(`#auth-${field}`);
    if (errorEl) errorEl.style.display = 'none';
    if (inputEl) inputEl.classList.remove('invalid');
  }
}
