export class CosmicSynth {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    
    // Drone nodes
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneFilter = null;
    this.lfo = null;
    
    // Delay effect
    this.delayNode = null;
    this.delayFeedback = null;
    
    // Timer for random chimes
    this.chimeInterval = null;
    
    // Current base frequency
    this.baseFrequency = 136.1; // Cosmic Ohm frequency
    this.solfeggioFrequencies = [396, 417, 528, 639, 741, 852, 963];
  }
  
  init() {
    // Lazy initialize AudioContext on user interaction
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    
    // Setup Delay Effect for spatial chimes
    this.delayNode = this.ctx.createDelay(1.0);
    this.delayNode.delayTime.value = 0.6;
    
    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.value = 0.4;
    
    // Delay loop: delay -> feedback -> delay
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    
    // Connect delay output to master gain
    this.delayNode.connect(this.masterGain);
  }
  
  start() {
    if (!this.ctx) this.init();
    if (this.isPlaying) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    this.isPlaying = true;
    
    // Fade in master volume
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 2.0); // Soft level
    
    // Start Drone
    this.startDrone();
    
    // Start Random Chime generator
    this.scheduleNextChime();
  }
  
  stop() {
    if (!this.isPlaying) return;
    
    // Fade out master volume
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
    
    setTimeout(() => {
      this.stopDrone();
      if (this.chimeInterval) {
        clearTimeout(this.chimeInterval);
        this.chimeInterval = null;
      }
      this.isPlaying = false;
    }, 1600);
  }
  
  startDrone() {
    const now = this.ctx.currentTime;
    
    // Filter to sweep drone frequencies
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.value = 250;
    this.droneFilter.Q.value = 3;
    this.droneFilter.connect(this.masterGain);
    
    // LFO to sweep filter frequency
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 0.08; // Very slow LFO
    
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 120; // range of sweep
    
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.droneFilter.frequency);
    this.lfo.start(now);
    
    // Main Drone Osc 1 (Sine)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sine';
    this.droneOsc1.frequency.value = this.baseFrequency;
    
    // Detuned Drone Osc 2 (Triangle)
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.value = this.baseFrequency * 1.005; // Faint detuning
    
    const oscGain1 = this.ctx.createGain();
    oscGain1.gain.value = 0.55;
    
    const oscGain2 = this.ctx.createGain();
    oscGain2.gain.value = 0.25; // quieter for triangle
    
    this.droneOsc1.connect(oscGain1);
    this.droneOsc2.connect(oscGain2);
    
    oscGain1.connect(this.droneFilter);
    oscGain2.connect(this.droneFilter);
    
    this.droneOsc1.start(now);
    this.droneOsc2.start(now);
  }
  
  stopDrone() {
    try {
      if (this.droneOsc1) { this.droneOsc1.stop(); this.droneOsc1 = null; }
      if (this.droneOsc2) { this.droneOsc2.stop(); this.droneOsc2 = null; }
      if (this.lfo) { this.lfo.stop(); this.lfo = null; }
    } catch (e) {
      console.warn("Drone stopping error:", e);
    }
  }
  
  setFrequency(solfeggioFreq) {
    this.baseFrequency = solfeggioFreq / 4; // Drop down 2 octaves for pleasant low-end drone
    
    if (this.isPlaying && this.ctx) {
      const now = this.ctx.currentTime;
      // Glide the frequency smoothly
      if (this.droneOsc1) {
        this.droneOsc1.frequency.setValueAtTime(this.droneOsc1.frequency.value, now);
        this.droneOsc1.frequency.exponentialRampToValueAtTime(this.baseFrequency, now + 2.0);
      }
      if (this.droneOsc2) {
        this.droneOsc2.frequency.setValueAtTime(this.droneOsc2.frequency.value, now);
        this.droneOsc2.frequency.exponentialRampToValueAtTime(this.baseFrequency * 1.005, now + 2.0);
      }
    }
  }
  
  scheduleNextChime() {
    if (!this.isPlaying) return;
    
    const delay = Math.random() * 4000 + 3000; // 3 to 7 seconds
    this.chimeInterval = setTimeout(() => {
      this.playChime();
      this.scheduleNextChime();
    }, delay);
  }
  
  playChime() {
    if (!this.isPlaying || !this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    // Choose a random solfeggio pitch for chime, relative to current base
    const possibleChimes = [1, 1.2, 1.5, 1.8, 2, 2.4, 3].map(ratio => this.baseFrequency * 4 * ratio);
    const freq = possibleChimes[Math.floor(Math.random() * possibleChimes.length)];
    
    // Create oscillator and its envelope
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    
    // Quick soft attack, long decay
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05); // low volume
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.0); // 3 seconds decay
    
    osc.connect(gainNode);
    // Send to delay block, delay is connected to master
    gainNode.connect(this.delayNode);
    // Also send direct to master for crisp front hit
    gainNode.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 3.2);
  }
}
