/**
 * AURA DEVELOPMENT — CORE APPLICATION LOGIC
 * Каталог проектов, фильтрация, модальные окна и интерфейсные микро-взаимодействия
 */

// База данных проектов девелопера
const AURA_PROJECTS = [
  {
    id: 'skyline',
    category: 'highrise',
    categoryLabel: 'Жилой комплекс премиум-класса',
    title: 'Skyline Aura Towers',
    tagline: 'Архитектурный манифест высотной эстетики и каскадных садов',
    location: 'Центральный район, Набережная Резидентов',
    priceFrom: 'от 28 500 000 ₽',
    priceRaw: 28500000,
    area: '65 – 340 м²',
    floors: '52 этажа',
    ceiling: '3.65 – 4.80 м',
    completion: 'IV кв. 2026',
    status: 'Строительство 18-го этажа',
    badge: 'Флагманский проект',
    image: 'assets/images/project_skyline.jpg',
    features: [
      'Панорамное остекление во всю стену Reynaers Hi-Finity',
      'Приватный лаундж резидентов с 25-метровым бассейном на 30 этаже',
      'Трёхуровневый подземный паркинг с бесконтактным доступом и EV-зарядками',
      'Индивидуальная система очистки воздуха медицинского класса HEPA H13'
    ],
    planDetails: {
      type: 'Апартамент 3-комнатный (Sky Residence)',
      totalArea: '142.4 м²',
      livingArea: '88.5 м²',
      kitchenArea: '28.2 м²',
      terraceArea: '18.6 м²'
    }
  },
  {
    id: 'pinecrest',
    category: 'villa',
    categoryLabel: 'Приватная лесная резиденция',
    title: 'Pinecrest Forest Villa',
    tagline: 'Органическая модернистская архитектура среди вековых реликтовых сосен',
    location: 'Западное направление, сосновый бор (18 км от города)',
    priceFrom: 'от 85 000 000 ₽',
    priceRaw: 85000000,
    area: '420 – 850 м²',
    floors: '2 этажа + цоколь',
    ceiling: '4.20 м',
    completion: 'Сдан в эксплуатацию',
    status: 'Готов к заселению',
    badge: 'Готовая вилла',
    image: 'assets/images/project_pinecrest.jpg',
    features: [
      'Приватный подогреваемый infinity-бассейн из черного сланца',
      'СПА-комплекс с финской сауной, хаммамом и массажным кабинетом',
      'Консольная гостиная с дровяным камином и панорамным выходом в сад',
      'Закрытый паркинг на 4 автомобиля с комнатой для охраны'
    ],
    planDetails: {
      type: 'Вилла Grand Forest Master',
      totalArea: '560.0 м²',
      livingArea: '340.0 м²',
      kitchenArea: '45.0 м²',
      terraceArea: '120.0 м²'
    }
  },
  {
    id: 'lumen',
    category: 'club',
    categoryLabel: 'Клубный дом на первой береговой линии',
    title: 'Lumen Imperial Club House',
    tagline: 'Камерный дом на 24 резиденции с персональным яхтенным причалом',
    location: 'Королевская гавань, приватная набережная',
    priceFrom: 'от 54 000 000 ₽',
    priceRaw: 54000000,
    area: '140 – 450 м²',
    floors: '5 этажей',
    ceiling: '4.00 м',
    completion: 'II кв. 2026',
    status: 'Монтаж фасадов из травертина',
    badge: 'Первая линия',
    image: 'assets/images/project_lumen.jpg',
    features: [
      'Частный оборудованный пирс с парковочными местами для яхт',
      'Облицовка натуральным итальянским травертином и латунью',
      'Персональный консьерж-сервис и приватная сигарная комната',
      'Лифтовой холл с персональным ключом прямо в апартаменты'
    ],
    planDetails: {
      type: 'Резиденция Marina View',
      totalArea: '210.8 м²',
      livingArea: '135.2 м²',
      kitchenArea: '36.0 м²',
      terraceArea: '42.0 м²'
    }
  },
  {
    id: 'verde',
    category: 'villa',
    categoryLabel: 'Эко-поселок авторских резиденций',
    title: 'Verde Valley Eco-Residences',
    tagline: 'Экологический оазис с зеленой сертификацией LEED Platinum',
    location: 'Долина рек, природный заказник (12 км)',
    priceFrom: 'от 42 000 000 ₽',
    priceRaw: 42000000,
    area: '280 – 510 м²',
    floors: '2 этажа',
    ceiling: '3.80 м',
    completion: 'III кв. 2026',
    status: 'Отделка фасадных объемов',
    badge: 'Эко-девелопмент',
    image: 'assets/images/stage_05_completed.jpg',
    features: [
      'Солнечные батареи и геотермальное отопление нулевого углеродного следа',
      'Эксплуатируемая зеленая кровля с садом трав и зоной йоги',
      'Умный дом Crestron с управлением освещением, микроклиматом и шторами',
      'Собственный благоустроенный парк 4 гектара с теннисными кортами'
    ],
    planDetails: {
      type: 'Эко-вилла Horizon',
      totalArea: '320.0 м²',
      livingArea: '190.0 м²',
      kitchenArea: '32.0 м²',
      terraceArea: '55.0 м²'
    }
  },
  {
    id: 'vertex',
    category: 'penthouse',
    categoryLabel: 'Коллекция двухуровневых пентхаусов',
    title: 'The Vertex Penthouse Suite',
    tagline: 'Вершина архитектурного превосходства с круговой панорамой 360°',
    location: 'Верхние уровни Skyline Towers (этажи 50–52)',
    priceFrom: 'от 145 000 000 ₽',
    priceRaw: 145000000,
    area: '520 – 780 м²',
    floors: '2 уровня',
    ceiling: '6.50 м (второй свет)',
    completion: 'IV кв. 2026',
    status: 'Устройство кровли и террас',
    badge: 'Exclusive Trophy',
    image: 'assets/images/stage_04_facade.jpg',
    features: [
      'Круговая приватная терраса с подогревом и джакузи под открытым небом',
      'Приватный скоростной лифт с биометрическим доступом',
      'Возможность посадки вертолета на кровлю комплекса',
      'Мастер-спальня 85 м² с двумя гардеробными и панорамной ванной'
    ],
    planDetails: {
      type: 'Двухуровневый Grand Penthouse',
      totalArea: '640.0 м²',
      livingArea: '410.0 м²',
      kitchenArea: '58.0 м²',
      terraceArea: '180.0 м²'
    }
  },
  {
    id: 'solstice',
    category: 'highrise',
    categoryLabel: 'Многофункциональный жилой квартал',
    title: 'Solstice Residences',
    tagline: 'Динамичный жилой комплекс с собственной торгово-пешеходной галереей',
    location: 'Бизнес-квартал, Южный бульвар',
    priceFrom: 'от 22 800 000 ₽',
    priceRaw: 22800000,
    area: '55 – 220 м²',
    floors: '34 этажа',
    ceiling: '3.40 м',
    completion: 'I кв. 2027',
    status: 'Нулевой цикл завершен',
    badge: 'Старт продаж',
    image: 'assets/images/stage_03_glazing.jpg',
    features: [
      'Детский образовательный кластер и фитнес-центр премиум-класса',
      'Двор без машин с ландшафтным геопластическим парком',
      'Квартиры с отделкой White Box высочайшего заводского качества',
      'Выгодные инвестиционные программы с доходностью от 18% годовых'
    ],
    planDetails: {
      type: '2-комнатные апартаменты',
      totalArea: '78.5 м²',
      livingArea: '48.0 м²',
      kitchenArea: '19.5 м²',
      terraceArea: '11.0 м²'
    }
  }
];

class App {
  constructor() {
    this.projects = AURA_PROJECTS;
    this.activeFilter = 'all';

    this.initSmoothScroll();
    this.initHeader();
    this.renderProjects();
    this.initFilters();
    this.initModals();
    this.initLeadForm();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  initSmoothScroll() {
    if (typeof Lenis !== 'undefined') {
      window.lenis = new Lenis({
        duration: 1.3,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
        infinite: false
      });

      function raf(time) {
        window.lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Connect Lenis to construction timelapse onScroll
      window.lenis.on('scroll', () => {
        if (window.constructionTimelapse) {
          window.constructionTimelapse.onScroll();
        }
      });

      // Ultra-smooth anchor clicks
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href');
          if (targetId && targetId.length > 1) {
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
              e.preventDefault();
              window.lenis.scrollTo(targetEl, { offset: -30, duration: 1.4 });
            }
          }
        });
      });
    }
  }

  initHeader() {
    const header = document.querySelector('.site-header');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu-list');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });

    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
      });

      // Close mobile menu on link click
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
          mobileToggle.classList.remove('active');
        });
      });
    }
  }

  renderProjects() {
    const container = document.getElementById('projects-grid-container');
    if (!container) return;

    const filtered = this.activeFilter === 'all'
      ? this.projects
      : this.projects.filter(p => p.category === this.activeFilter);

    container.innerHTML = filtered.map(p => `
      <article class="project-card" data-category="${p.category}" id="project-card-${p.id}">
        <div class="project-media">
          <img src="${p.image}" alt="${p.title}" class="project-thumb" loading="lazy" />
          <div class="project-badge">${p.badge}</div>
          <div class="project-completion-tag">${p.completion}</div>
          <div class="project-overlay-actions">
            <button class="project-quick-view-btn" onclick="window.openProjectModal('${p.id}')">
              <i data-lucide="maximize-2"></i>
              <span>Спецификация и планировка</span>
            </button>
          </div>
        </div>

        <div class="project-info">
          <div class="project-meta-top">
            <span class="project-cat">${p.categoryLabel}</span>
            <span class="project-status-dot" title="${p.status}"></span>
          </div>

          <h3 class="project-name">${p.title}</h3>
          <p class="project-location"><i data-lucide="map-pin"></i> ${p.location}</p>

          <div class="project-specs-grid">
            <div class="spec-col">
              <span class="spec-lbl">Площади</span>
              <span class="spec-val">${p.area}</span>
            </div>
            <div class="spec-col">
              <span class="spec-lbl">Потолки</span>
              <span class="spec-val">${p.ceiling}</span>
            </div>
            <div class="spec-col">
              <span class="spec-lbl">Стоимость</span>
              <span class="spec-val price-highlight">${p.priceFrom}</span>
            </div>
          </div>

          <div class="project-actions-row">
            <button class="btn-card-details" onclick="window.openProjectModal('${p.id}')">
              <span>Изучить резиденцию</span>
              <i data-lucide="arrow-up-right"></i>
            </button>
            <button class="btn-card-ai" onclick="window.aiConsultant.openWithQuery('Расскажи подробно о проекте ${p.title} и какие есть скидки?')">
              <i data-lucide="sparkles"></i>
              <span>Спросить ИИ</span>
            </button>
          </div>
        </div>
      </article>
    `).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  initFilters() {
    const filterBtns = document.querySelectorAll('.project-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.getAttribute('data-filter');
        this.renderProjects();
      });
    });
  }

  initModals() {
    window.openProjectModal = (projectId) => {
      const project = this.projects.find(p => p.id === projectId);
      if (!project) return;

      const modal = document.getElementById('project-detail-modal');
      const modalBody = document.getElementById('modal-project-content');
      if (!modal || !modalBody) return;

      modalBody.innerHTML = `
        <div class="modal-detail-grid">
          <div class="modal-media-col">
            <div class="modal-image-wrap">
              <img src="${project.image}" alt="${project.title}" class="modal-main-image" />
              <div class="modal-badge-float">${project.badge}</div>
            </div>

            <div class="modal-floorplan-box">
              <div class="floorplan-header">
                <h4>${project.planDetails.type}</h4>
                <span class="floorplan-total">${project.planDetails.totalArea}</span>
              </div>
              <div class="floorplan-svg-visual">
                <svg viewBox="0 0 400 240" class="floorplan-svg">
                  <!-- Architectural floorplan blueprint lines -->
                  <rect x="20" y="20" width="360" height="200" fill="rgba(203, 166, 104, 0.04)" stroke="rgba(203, 166, 104, 0.4)" stroke-width="2" />
                  <line x1="160" y1="20" x2="160" y2="160" stroke="rgba(203, 166, 104, 0.4)" stroke-width="1.5" />
                  <line x1="20" y1="120" x2="160" y2="120" stroke="rgba(203, 166, 104, 0.4)" stroke-width="1.5" />
                  <line x1="260" y1="20" x2="260" y2="160" stroke="rgba(203, 166, 104, 0.4)" stroke-width="1.5" />
                  <line x1="160" y1="160" x2="380" y2="160" stroke="rgba(203, 166, 104, 0.4)" stroke-width="1.5" stroke-dasharray="4,4" />
                  
                  <!-- Room labels -->
                  <text x="75" y="65" fill="#cba668" font-size="11" font-family="monospace" text-anchor="middle">МАСТЕР-СПАЛЬНЯ</text>
                  <text x="75" y="80" fill="rgba(255,255,255,0.6)" font-size="10" font-family="monospace" text-anchor="middle">${project.planDetails.livingArea}</text>
                  
                  <text x="75" y="160" fill="#cba668" font-size="11" font-family="monospace" text-anchor="middle">ВАННАЯ & SPA</text>
                  <text x="210" y="85" fill="#cba668" font-size="11" font-family="monospace" text-anchor="middle">КУХНЯ-ГОСТИНАЯ</text>
                  <text x="210" y="100" fill="rgba(255,255,255,0.6)" font-size="10" font-family="monospace" text-anchor="middle">${project.planDetails.kitchenArea}</text>

                  <text x="320" y="85" fill="#cba668" font-size="11" font-family="monospace" text-anchor="middle">КАБИНЕТ</text>
                  <text x="270" y="195" fill="#00f0ff" font-size="11" font-family="monospace" text-anchor="middle">ТЕРРАСА // REYNAERS GLAZING</text>
                  <text x="270" y="210" fill="rgba(255,255,255,0.6)" font-size="10" font-family="monospace" text-anchor="middle">${project.planDetails.terraceArea}</text>
                </svg>
              </div>
            </div>
          </div>

          <div class="modal-info-col">
            <span class="modal-kicker">${project.categoryLabel}</span>
            <h2 class="modal-title">${project.title}</h2>
            <p class="modal-tagline">${project.tagline}</p>
            <p class="modal-location"><i data-lucide="map-pin"></i> ${project.location}</p>

            <div class="modal-specs-table">
              <div class="modal-spec-row">
                <span>Срок сдачи объекта</span>
                <strong>${project.completion} (${project.status})</strong>
              </div>
              <div class="modal-spec-row">
                <span>Диапазон площадей</span>
                <strong>${project.area}</strong>
              </div>
              <div class="modal-spec-row">
                <span>Высота этажей и потолков</span>
                <strong>${project.floors} • потолки ${project.ceiling}</strong>
              </div>
              <div class="modal-spec-row">
                <span>Стартовая стоимость</span>
                <strong class="price-highlight">${project.priceFrom}</strong>
              </div>
            </div>

            <div class="modal-features-list">
              <h4>Инженерные особенности:</h4>
              <ul>
                ${project.features.map(f => `<li><i data-lucide="check-circle-2"></i> <span>${f}</span></li>`).join('')}
              </ul>
            </div>

            <div class="modal-actions-box">
              <button class="btn-primary-action" onclick="window.openBookingModal('${project.title}')">
                <span>Записаться на закрытый показ</span>
                <i data-lucide="arrow-right"></i>
              </button>
              <button class="btn-outline-action" onclick="window.aiConsultant.openWithQuery('Рассчитай график рассрочки для ${project.title}')">
                <i data-lucide="sparkles"></i>
                <span>Обсудить с ИИ-консультантом</span>
              </button>
            </div>
          </div>
        </div>
      `;

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      if (window.lucide) {
        window.lucide.createIcons();
      }
    };

    window.closeProjectModal = () => {
      const modal = document.getElementById('project-detail-modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    };

    // Close on backdrop click
    document.querySelectorAll('.aura-modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    // Booking modal
    window.openBookingModal = (projectTitle = '') => {
      const modal = document.getElementById('booking-modal');
      const inputProject = document.getElementById('booking-project-name');
      if (inputProject && projectTitle) {
        inputProject.value = projectTitle;
      }
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    };

    window.closeBookingModal = () => {
      const modal = document.getElementById('booking-modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    };
  }

  initLeadForm() {
    const form = document.getElementById('booking-lead-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = form.querySelector('input[type="tel"]').value;
      const name = form.querySelector('input[name="name"]')?.value || 'Клиент';
      const project = form.querySelector('input[name="project"]')?.value || 'Флагманский проект';

      // Feedback animation
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.innerHTML = '<i data-lucide="check"></i> <span>Заявка принята! Ожидайте звонка</span>';
      submitBtn.style.background = '#22c55e';
      submitBtn.style.borderColor = '#22c55e';

      setTimeout(() => {
        window.closeBookingModal();
        // Also inform AI assistant
        if (window.aiConsultant) {
          window.aiConsultant.toggleChat(true);
          window.aiConsultant.addMessageToUI(`Спасибо, **${name}**! Ваша заявка по объекту **«${project}»** успешно передана главному архитектору проекта. Мы свяжемся с вами по телефону ${phone} в течение 5 минут.`, 'bot');
        }
      }, 1200);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.auraApp = new App();
});
