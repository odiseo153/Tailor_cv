class ParticleSystem {
  constructor(container, options = {}) {
    this.container = container;
    this.count = options.count || 50;
    this.speed = options.speed || 0.5;
    this.colors = options.colors || ['#00d4ff', '#6366f1', '#ffffff'];
    this.size = options.size || 2;
    this.particles = [];
    this.animationFrame = null;
  }

  createParticle(i) {
    const el = document.createElement('div');
    el.className = 'particle';
    const size = Math.random() * this.size + 1;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;
    
    el.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      left: ${x}%;
      top: ${y}%;
      opacity: ${Math.random() * 0.5 + 0.1};
      box-shadow: 0 0 ${size * 2}px ${color};
      animation: float ${duration}s linear ${delay}s infinite;
    `;
    
    this.container.appendChild(el);
    return { el, x, y, duration, delay };
  }

  init() {
    for (let i = 0; i < this.count; i++) {
      this.particles.push(this.createParticle(i));
    }
    this.addKeyframes();
    return this;
  }

  addKeyframes() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translate(0, 0); opacity: 0.1; }
        25% { transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * -30 - 10}px); opacity: 0.6; }
        50% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * -50 - 20}px); opacity: 0.3; }
        75% { transform: translate(${Math.random() * -40 + 20}px, ${Math.random() * -20 - 5}px); opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
  }

  destroy() {
    this.particles.forEach(p => p.el.remove());
    this.particles = [];
  }
}

window.ParticleSystem = ParticleSystem;