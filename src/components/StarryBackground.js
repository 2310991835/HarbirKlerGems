export class StarryBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.stars = [];
    this.numStars = 70;
    this.mouse = { x: null, y: null, radius: 150 };
    
    this.init();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseleave', () => this.handleMouseLeave());
  }
  
  init() {
    this.resize();
    this.stars = [];
    
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseDir: 1
      });
    }
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  handleMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }
  
  handleMouseLeave() {
    this.mouse.x = null;
    this.mouse.y = null;
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Transparent black paint to create trails
    this.ctx.fillStyle = '#06040a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background nebula-like aura
    this.drawNebula();
    
    // Draw and update stars
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      
      // Update pulse (twinkle effect)
      star.alpha += star.pulseSpeed * star.pulseDir;
      if (star.alpha > 0.8 || star.alpha < 0.2) {
        star.pulseDir *= -1;
      }
      
      // Move star
      star.x += star.vx;
      star.y += star.vy;
      
      // Bounce off walls
      if (star.x < 0 || star.x > this.canvas.width) star.vx *= -1;
      if (star.y < 0 || star.y > this.canvas.height) star.vy *= -1;
      
      // Mouse gravity effect
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - star.x;
        const dy = this.mouse.y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          // Soft pull
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          star.x += (dx / dist) * force * 0.5;
          star.y += (dy / dist) * force * 0.5;
        }
      }
      
      // Draw star
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      this.ctx.shadowBlur = star.radius * 4;
      this.ctx.shadowColor = '#7c5cff';
      this.ctx.fill();
      this.ctx.shadowBlur = 0; // reset
    }
    
    // Draw constellation lines
    this.drawLines();
  }
  
  drawNebula() {
    // Large slow-moving gradients representing cosmic aura dust
    const time = Date.now() * 0.0001;
    const g1X = this.canvas.width * (0.5 + 0.2 * Math.sin(time));
    const g1Y = this.canvas.height * (0.5 + 0.2 * Math.cos(time * 0.8));
    const g2X = this.canvas.width * (0.5 + 0.3 * Math.cos(time * 1.2));
    const g2Y = this.canvas.height * (0.5 + 0.1 * Math.sin(time * 0.5));
    
    // First aura (Purple)
    let grad1 = this.ctx.createRadialGradient(g1X, g1Y, 10, g1X, g1Y, Math.max(this.canvas.width, this.canvas.height) * 0.4);
    grad1.addColorStop(0, 'rgba(124, 92, 255, 0.04)');
    grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = grad1;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Second aura (Teal)
    let grad2 = this.ctx.createRadialGradient(g2X, g2Y, 10, g2X, g2Y, Math.max(this.canvas.width, this.canvas.height) * 0.3);
    grad2.addColorStop(0, 'rgba(0, 210, 196, 0.03)');
    grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = grad2;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  drawLines() {
    for (let i = 0; i < this.stars.length; i++) {
      for (let j = i + 1; j < this.stars.length; j++) {
        const starA = this.stars[i];
        const starB = this.stars[j];
        
        const dx = starA.x - starB.x;
        const dy = starA.y - starB.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Connect if close enough
        if (dist < 100) {
          const alpha = (1 - dist / 100) * 0.08;
          this.ctx.beginPath();
          this.ctx.moveTo(starA.x, starA.y);
          this.ctx.lineTo(starB.x, starB.y);
          this.ctx.strokeStyle = `rgba(124, 92, 255, ${alpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
      
      // Connect to mouse as well
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const star = this.stars[i];
        const dx = star.x - this.mouse.x;
        const dy = star.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.mouse.radius) {
          const alpha = (1 - dist / this.mouse.radius) * 0.12;
          this.ctx.beginPath();
          this.ctx.moveTo(star.x, star.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.strokeStyle = `rgba(0, 210, 196, ${alpha})`;
          this.ctx.lineWidth = 0.7;
          this.ctx.stroke();
        }
      }
    }
  }
}
