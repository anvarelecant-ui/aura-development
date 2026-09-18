/**
 * AURA DEVELOPMENT — CONSTRUCTION TIMELAPSE CONTROLLER
 * Поэтапное возведение объекта, управляемое скроллом (Scroll-Driven & Interactive)
 */

class ConstructionTimelapse {
  constructor() {
    this.config = window.CONSTRUCTION_ANIMATION_CONFIG || {};
    this.stages = this.config.stages || [];
    this.currentStageIndex = 0;
    this.targetStageIndex = 0;
    this.isPlaying = false;
    this.playTimer = null;
    this.isBlueprintMode = false;

    // DOM Elements
    this.section = document.getElementById('construction-timelapse-section');
    this.track = document.getElementById('timelapse-scroll-track');
    this.viewport = document.getElementById('timelapse-sticky-viewport');
    this.stageLayers = [];
    this.titleEl = document.getElementById('hud-stage-title');
    this.badgeEl = document.getElementById('hud-stage-badge');
    this.descEl = document.getElementById('hud-stage-desc');
    this.elevationEl = document.getElementById('hud-elevation-value');
    this.progressFillEl = document.getElementById('hud-progress-fill');
    this.progressPercentEl = document.getElementById('hud-progress-percent');
    this.specsContainer = document.getElementById('hud-specs-list');
    this.stageNavButtons = [];
    this.playBtn = document.getElementById('timelapse-play-btn');
    this.scrubberInput = document.getElementById('timelapse-scrubber');
    this.blueprintToggleBtn = document.getElementById('timelapse-blueprint-toggle');

    if (this.section) {
      this.init();
    }
  }

  init() {
    this.buildLayers();
    this.buildNavTabs();
    this.setupEventListeners();
    this.updateHUD(0, true);
    this.onScroll();
  }

  buildLayers() {
    const layersContainer = document.getElementById('timelapse-visual-layers');
    if (!layersContainer) return;

    layersContainer.innerHTML = '';
    this.stageLayers = [];

    this.stages.forEach((stage, idx) => {
      const layer = document.createElement('div');
      layer.className = `timelapse-stage-layer ${idx === 0 ? 'active' : ''}`;
      layer.dataset.index = idx;

      layer.innerHTML = `
        <div class="layer-image-wrapper">
          <img src="${stage.image}" alt="${stage.title}" class="timelapse-stage-img" loading="eager" />
          <div class="blueprint-grid-overlay"></div>
          <div class="laser-scan-line"></div>
          <div class="blueprint-annotations">
            <span class="annotation-tag top-left">${stage.badge} // REV_${stage.id}</span>
            <span class="annotation-tag bottom-right">Z-AXIS: ${stage.elevation}</span>
          </div>
        </div>
      `;

      layersContainer.appendChild(layer);
      this.stageLayers.push(layer);
    });
  }

  buildNavTabs() {
    const navContainer = document.getElementById('timelapse-stage-nav');
    if (!navContainer) return;

    navContainer.innerHTML = '';
    this.stageNavButtons = [];

    this.stages.forEach((stage, idx) => {
      const btn = document.createElement('button');
      btn.className = `timelapse-nav-btn ${idx === 0 ? 'active' : ''}`;
      btn.dataset.index = idx;
      btn.innerHTML = `
        <span class="btn-number">${stage.id}</span>
        <span class="btn-label">${stage.shortTitle}</span>
      `;

      btn.addEventListener('click', () => {
        this.scrollToStage(idx);
      });

      navContainer.appendChild(btn);
      this.stageNavButtons.push(btn);
    });
  }

  setupEventListeners() {
    // Scroll listener with RAF throttling
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.onScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Scrubber input
    if (this.scrubberInput) {
      this.scrubberInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.setStageFromPercent(val);
      });
    }

    // Play/Pause button
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        this.togglePlay();
      });
    }

    // Blueprint / Render toggle
    if (this.blueprintToggleBtn) {
      this.blueprintToggleBtn.addEventListener('click', () => {
        this.toggleBlueprintMode();
      });
    }
  }

  onScroll() {
    if (!this.track) return;

    const rect = this.track.getBoundingClientRect();
    const trackHeight = this.track.offsetHeight - window.innerHeight;

    if (trackHeight <= 0) return;

    // How far the track has scrolled past the top
    const scrolled = -rect.top;
    let progress = scrolled / trackHeight;
    progress = Math.max(0, Math.min(1, progress));

    // Update scrubber if user is scrolling manually
    if (this.scrubberInput && !this.isPlaying) {
      this.scrubberInput.value = (progress * 100).toFixed(1);
    }

    // Determine target stage
    const numStages = this.stages.length;
    const rawStage = progress * (numStages - 1);
    const stageIndex = Math.round(rawStage);

    if (stageIndex !== this.currentStageIndex) {
      this.setStage(stageIndex);
    }
  }

  setStageFromPercent(percent) {
    const numStages = this.stages.length;
    const stageIndex = Math.min(numStages - 1, Math.floor((percent / 100) * numStages));
    this.setStage(stageIndex);
  }

  scrollToStage(index) {
    if (!this.track) return;
    const trackTop = this.track.offsetTop;
    const trackHeight = this.track.offsetHeight - window.innerHeight;
    const targetScroll = trackTop + (index / (this.stages.length - 1)) * trackHeight;

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }

  setStage(index) {
    if (index === this.currentStageIndex && this.stageLayers[index]?.classList.contains('active')) {
      return;
    }

    this.currentStageIndex = index;

    // Update layer visibility with directional architectural effect
    this.stageLayers.forEach((layer, idx) => {
      if (idx === index) {
        layer.classList.add('active');
        layer.style.opacity = '1';
        layer.style.transform = 'scale(1)';
        layer.style.pointerEvents = 'auto';
      } else {
        layer.classList.remove('active');
        layer.style.opacity = '0';
        layer.style.transform = idx < index ? 'scale(1.04)' : 'scale(0.96)';
        layer.style.pointerEvents = 'none';
      }
    });

    // Update nav buttons
    this.stageNavButtons.forEach((btn, idx) => {
      btn.classList.toggle('active', idx === index);
    });

    this.updateHUD(index);
  }

  updateHUD(index, force = false) {
    const stage = this.stages[index];
    if (!stage) return;

    if (this.titleEl) {
      this.titleEl.style.opacity = '0';
      setTimeout(() => {
        this.titleEl.textContent = stage.title;
        this.titleEl.style.opacity = '1';
      }, 150);
    }

    if (this.badgeEl) {
      this.badgeEl.textContent = stage.badge;
    }

    if (this.descEl) {
      this.descEl.textContent = stage.description;
    }

    if (this.elevationEl) {
      this.elevationEl.textContent = stage.elevation;
    }

    if (this.progressFillEl) {
      this.progressFillEl.style.width = `${stage.progress}%`;
    }

    if (this.progressPercentEl) {
      this.progressPercentEl.textContent = `${stage.progress}%`;
    }

    // Specs list
    if (this.specsContainer && stage.specs) {
      this.specsContainer.innerHTML = stage.specs
        .map(spec => `
          <div class="hud-spec-item">
            <span class="hud-spec-label">${spec.label}</span>
            <span class="hud-spec-value">${spec.value}</span>
          </div>
        `)
        .join('');
    }
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    if (this.playBtn) {
      this.playBtn.innerHTML = this.isPlaying
        ? '<i data-lucide="pause"></i><span>Пауза</span>'
        : '<i data-lucide="play"></i><span>Автопоказ</span>';
      if (window.lucide) lucide.createIcons();
    }

    if (this.isPlaying) {
      this.playNextStage();
    } else {
      clearTimeout(this.playTimer);
    }
  }

  playNextStage() {
    if (!this.isPlaying) return;

    let nextIndex = (this.currentStageIndex + 1) % this.stages.length;
    this.scrollToStage(nextIndex);

    this.playTimer = setTimeout(() => {
      this.playNextStage();
    }, this.config.settings.autoPlaySpeed || 3200);
  }

  toggleBlueprintMode() {
    this.isBlueprintMode = !this.isBlueprintMode;
    const visualWrapper = document.getElementById('timelapse-visual-layers');

    if (visualWrapper) {
      visualWrapper.classList.toggle('blueprint-mode', this.isBlueprintMode);
    }

    if (this.blueprintToggleBtn) {
      this.blueprintToggleBtn.classList.toggle('active', this.isBlueprintMode);
      this.blueprintToggleBtn.innerHTML = this.isBlueprintMode
        ? '<i data-lucide="eye"></i><span>Режим: Чертеж (CAD)</span>'
        : '<i data-lucide="layers"></i><span>Режим: Фото-рендер</span>';
      if (window.lucide) lucide.createIcons();
    }
  }
}

// Global activation
document.addEventListener('DOMContentLoaded', () => {
  window.constructionTimelapse = new ConstructionTimelapse();
});
