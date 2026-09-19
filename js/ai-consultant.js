/**
 * AURA DEVELOPMENT — AI CONCIERGE & ARCHITECTURAL CONSULTANT
 * Полноценный интеллектуальный консультант девелопера с интеграцией LLM API
 * и автономной экспертной базой знаний
 */

class AIConsultant {
  constructor() {
    this.isOpen = false;
    this.isTyping = false;
    this.unreadCount = 1;
    this.history = [];

    // Multilingual State ('ru' | 'en' | 'uz')
    this.currentLang = 'ru';

    // Voice AI State
    this.isVoiceAutoPlay = false;
    this.isListening = false;
    this.isSpeaking = false;
    this.recognition = null;
    this.currentSpeakingBtn = null;

    // DOM Elements
    this.widget = document.getElementById('ai-chat-widget');
    this.triggerBtn = document.getElementById('ai-chat-trigger');
    this.window = document.getElementById('ai-chat-window');
    this.closeBtn = document.getElementById('ai-chat-close');
    this.messagesContainer = document.getElementById('ai-chat-messages');
    this.inputField = document.getElementById('ai-chat-input');
    this.sendBtn = document.getElementById('ai-chat-send');
    this.chipsContainer = document.getElementById('ai-chat-chips');
    this.badgeEl = document.getElementById('ai-chat-badge');

    // Voice DOM Elements
    this.micBtn = document.getElementById('ai-chat-mic');
    this.voiceStatus = document.getElementById('ai-voice-status');

    this.init();
  }

  init() {
    if (!this.triggerBtn) return;

    this.triggerBtn.addEventListener('click', () => this.toggleChat());
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.toggleChat(false));
    this.initLanguageSwitchers();

    if (this.sendBtn && this.inputField) {
      this.sendBtn.addEventListener('click', () => this.handleSendMessage());
      this.inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    // Initialize Voice Recognition & Synthesis & Live Call
    this.initSpeechRecognition();
    this.initSpeechSynthesis();
    this.initVoiceCallElements();

    this.renderChips([
      'Сколько стоят квартиры и виллы?',
      'ЖК Skyline Towers',
      'Условия рассрочки 0%',
      'Вилла в лесу Pinecrest',
      'Технологии остекления',
      'Записаться на показ'
    ]);

    // Setup triggers across the landing page for direct AI queries
    document.querySelectorAll('[data-ai-query]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const query = el.getAttribute('data-ai-query');
        this.openWithQuery(query);
      });
    });
  }

  /* ================= MULTILINGUAL LOCALIZATION (RU, EN, UZ) ================= */
  initLanguageSwitchers() {
    document.querySelectorAll('.ai-lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = btn.getAttribute('data-lang');
        this.setLanguage(lang);
      });
    });
  }

  setLanguage(lang) {
    if (!['ru', 'en', 'uz'].includes(lang)) return;
    this.currentLang = lang;

    // Update active pill highlight across both chat window and call modal
    document.querySelectorAll('.ai-lang-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });

    // Update speech recognition language
    const recLang = this.getRecognitionLang();
    if (this.recognition) this.recognition.lang = recLang;
    if (this.callRecognition) this.callRecognition.lang = recLang;

    // Update chat chips
    const chatChips = this.getLocalizedChatChips();
    this.renderChips(chatChips);

    // Update chat input placeholder
    if (this.inputField) {
      this.inputField.placeholder = this.getLocalizedInputPlaceholder();
    }

    // Update chat initial greeting if history is still fresh
    const greetingEl = document.getElementById('ai-initial-greeting');
    if (greetingEl && this.history.length === 0) {
      greetingEl.innerHTML = this.getLocalizedGreeting();
    }

    // Update call modal subtitle & suggestions
    const callSubBot = document.getElementById('ai-call-sub-bot');
    const callWelcome = this.getLocalizedCallWelcome();
    if (callSubBot) {
      callSubBot.textContent = callWelcome;
    }

    const suggLabel = document.getElementById('ai-call-sugg-label');
    if (suggLabel) {
      suggLabel.textContent = this.getLocalizedCallSuggLabel();
    }

    const callChipsContainer = document.getElementById('ai-call-chips-container');
    if (callChipsContainer) {
      const chips = this.getLocalizedCallChips();
      callChipsContainer.innerHTML = '';
      chips.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'ai-call-chip';
        btn.setAttribute('data-call-suggest', c.query);
        btn.textContent = `«${c.title}»`;
        btn.addEventListener('click', () => {
          this.handleCallUserQuery(c.query);
        });
        callChipsContainer.appendChild(btn);
      });
    }

    // Localize call action button labels
    const micLabel = document.getElementById('ai-call-mic-label');
    const endLabel = document.getElementById('ai-call-end-label');
    const speakLabel = document.getElementById('ai-call-speak-label');
    if (micLabel) micLabel.textContent = lang === 'en' ? 'Microphone' : (lang === 'uz' ? 'Mikrofon' : 'Микрофон');
    if (endLabel) endLabel.textContent = lang === 'en' ? 'End Call' : (lang === 'uz' ? 'Tugatish' : 'Завершить');
    if (speakLabel) speakLabel.textContent = lang === 'en' ? 'Speak' : (lang === 'uz' ? 'Gapirish' : 'Сказать');

    // Update state label if currently in active call
    if (this.isInCall) {
      const stateLabels = this.getLocalizedStateLabels();
      if (stateLabels[this.currentCallState]) {
        this.setCallState(this.currentCallState, stateLabels[this.currentCallState]);
      }
    }
  }

  getRecognitionLang() {
    if (this.currentLang === 'en') return 'en-US';
    if (this.currentLang === 'uz') return 'uz-UZ';
    return 'ru-RU';
  }

  getLocalizedGreeting() {
    if (this.currentLang === 'en') {
      return 'Hello! I am your personal architectural advisor and voice AI for <strong>AURA Development</strong>.<br><br>You can chat here or click <strong>"Call"</strong> above for a live hands-free conversation. I will gladly guide you through our residences, engineering innovations, or calculate 0% installment plans.<br><br>Which project or financing program would you like to explore?';
    }
    if (this.currentLang === 'uz') {
      return 'Assalomu alaykum! Men <strong>AURA Development</strong> kompaniyasining shaxsiy arxitektura maslahatchisi va ovozli intellektual yordamchisiman.<br><br>Siz bu yerda yozishishingiz yoki uzluksiz jonli suhbat uchun yuqoridagi <strong>"Qo\'ng\'iroq"</strong> tugmasini bosishingiz mumkin. Men sizga nufuzli loyihalarimiz, muhandislik yechimlari yoki 0% foizsiz bo\'lib to\'lash bo\'yicha bajonidil ma\'lumot beraman.<br><br>Qaysi loyiha yoki to\'lov shartlari haqida batafsil ma\'lumot olishni xohlaysiz?';
    }
    return 'Здравствуйте! Я — персональный архитектурный консультант и голосовой ассистент девелоперской компании <strong>AURA Development</strong>.<br><br>Вы можете общаться в чате или нажать <strong>«Позвонить»</strong> сверху для живого непрерывного разговора вслух. Я с радостью сориентирую вас по резиденциям, инженерным технологиям или рассчитаю рассрочку 0%.<br><br>О каком проекте или финансовой программе рассказать подробнее?';
  }

  getLocalizedCallWelcome() {
    if (this.currentLang === 'en') {
      return '«Hello! I am on the line. Feel free to speak completely naturally about our residences, architecture, materials, prices, or 0% installment plans.»';
    }
    if (this.currentLang === 'uz') {
      return '«Assalomu alaykum! Men aloqadaman. Loyihalarimiz, oilangiz uchun villalar, qurilish materiallari yoki foizsiz bo\'lib to\'lash haqida bemalol so\'rashingiz mumkin.»';
    }
    return '«Здравствуйте! Я на связи. Вы можете говорить со мной абсолютно свободно своими словами — о семье, детях, питомцах, ценах, материалах или рассрочке.»';
  }

  getLocalizedCallSuggLabel() {
    if (this.currentLang === 'en') return 'Speak freely into the mic on any topic or pick an idea:';
    if (this.currentLang === 'uz') return 'Mikrofonga istalgan mavzuda bemalol gapiring yoki mavzuni tanlang:';
    return 'Говорите в микрофон свободно на любую тему или выберите идею:';
  }

  getLocalizedCallChips() {
    if (this.currentLang === 'en') {
      return [
        { title: 'Best for family with kids & pet?', query: 'What do you recommend for a large family with two kids and a dog?' },
        { title: 'Structural materials & windows', query: 'What materials are used for the building frame and facades?' },
        { title: '0% installment vs mortgage', query: 'What are the key advantages of your 0% developer installment plan?' },
        { title: 'Private villas with heated pool', query: 'Tell me about the Pinecrest forest villas with private pool' }
      ];
    }
    if (this.currentLang === 'uz') {
      return [
        { title: 'Katta oila va bolalar uchun nima ma\'qul?', query: 'Ikki nafar farzand va katta oila uchun qaysi turar-joy ma\'qul?' },
        { title: 'Bino karkasi va seysmiklik', query: 'Binolar qanday beton va oynalardan quriladi, seysmik chidamliligi qanday?' },
        { title: '0% foizsiz to\'lov afzalliklari', query: '0% foizsiz muddatli to\'lov shartlari qanday?' },
        { title: 'Hovuzli xususiy villalar', query: 'Pinecrest o\'rmon villalari va xususiy basseyn haqida gapirib bering' }
      ];
    }
    return [
      { title: 'Что для семьи с детьми и собакой?', query: 'Что посоветуешь для большой семьи с двумя детьми и собакой?' },
      { title: 'Материалы каркаса и окон', query: 'Из каких материалов сделан каркас и фасады домов?' },
      { title: 'Выгода рассрочки 0%', query: 'В чем реальная выгода рассрочки 0% перед ипотекой?' },
      { title: 'Виллы с теплым бассейном', query: 'Расскажи про виллы в лесу с теплым бассейном' }
    ];
  }

  getLocalizedChatChips() {
    if (this.currentLang === 'en') {
      return [
        'How much do residences cost?',
        'Skyline Aura Towers',
        '0% Installment 36 months',
        'Pinecrest Forest Villa',
        'Reynaers facade glazing',
        'Schedule a private visit'
      ];
    }
    if (this.currentLang === 'uz') {
      return [
        'Xonadonlar va villalar narxlari',
        'Skyline Aura Towers osmono\'par binosi',
        '36 oygacha 0% foizsiz to\'lov',
        'Pinecrest o\'rmon villalari',
        'Muhandislik va oyna texnologiyalari',
        'Taqdimotga yozilish'
      ];
    }
    return [
      'Сколько стоят квартиры и виллы?',
      'ЖК Skyline Towers',
      'Условия рассрочки 0%',
      'Вилла в лесу Pinecrest',
      'Технологии остекления',
      'Записаться на показ'
    ];
  }

  getLocalizedStateLabels() {
    if (this.currentLang === 'en') {
      return {
        listening: 'Listening to you... Speak now',
        thinking: 'AURA is thinking...',
        speaking: 'AURA is speaking...',
        muted: 'Microphone muted',
        idle: 'Use Chrome for voice dialogue'
      };
    }
    if (this.currentLang === 'uz') {
      return {
        listening: 'Sizni tinglayapman... Gapiring',
        thinking: 'AURA o\'ylamoqda...',
        speaking: 'AURA javob bermoqda...',
        muted: 'Mikrofon o\'chirilgan',
        idle: 'Ovozli muloqot uchun Chrome brauzeridan foydalaning'
      };
    }
    return {
      listening: 'Слушаю вас... Говорите',
      thinking: 'AURA думает...',
      speaking: 'AURA говорит...',
      muted: 'Микрофон отключен',
      idle: 'Используйте Chrome для голосового диалога'
    };
  }

  getLocalizedInputPlaceholder() {
    if (this.currentLang === 'en') return 'Ask a question or tap microphone...';
    if (this.currentLang === 'uz') return 'Savol bering yoki mikrofonni bosing...';
    return 'Спросите или нажмите микрофон...';
  }

  selectVoiceForLanguage(utterance) {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    if (this.currentLang === 'en') {
      utterance.lang = 'en-US';
      const enVoice = voices.find(v => v.lang && (v.lang === 'en-US' || v.lang.startsWith('en')));
      if (enVoice) utterance.voice = enVoice;
    } else if (this.currentLang === 'uz') {
      utterance.lang = 'uz-UZ';
      const uzVoice = voices.find(v => v.lang && (v.lang === 'uz-UZ' || v.lang.startsWith('uz')))
        || voices.find(v => v.lang && (v.lang.startsWith('tr') || v.lang.startsWith('ru') || v.lang.startsWith('en')));
      if (uzVoice) utterance.voice = uzVoice;
    } else {
      utterance.lang = 'ru-RU';
      const ruVoice = voices.find(v => v.lang && (v.lang === 'ru-RU' || v.lang.startsWith('ru')));
      if (ruVoice) utterance.voice = ruVoice;
    }
  }

  toggleChat(forceState) {
    this.isOpen = typeof forceState === 'boolean' ? forceState : !this.isOpen;
    if (this.widget) {
      this.widget.classList.toggle('active', this.isOpen);
    }
    if (this.isOpen) {
      this.unreadCount = 0;
      if (this.badgeEl) this.badgeEl.style.display = 'none';
      if (this.inputField) {
        setTimeout(() => {
          this.inputField.focus({ preventScroll: true });
        }, 150);
      }
      this.scrollToBottom();
    } else {
      this.stopSpeaking();
      this.resetListening();
    }
  }

  openWithQuery(queryText) {
    this.toggleChat(true);
    this.sendMessage(queryText, true);
  }

  renderChips(chips) {
    if (!this.chipsContainer) return;
    this.chipsContainer.innerHTML = '';
    chips.forEach(chipText => {
      const btn = document.createElement('button');
      btn.className = 'ai-chip-btn';
      btn.textContent = chipText;
      btn.addEventListener('click', () => {
        this.sendMessage(chipText, true);
      });
      this.chipsContainer.appendChild(btn);
    });
  }

  handleSendMessage() {
    const text = this.inputField.value.trim();
    if (!text || this.isTyping) return;
    this.inputField.value = '';
    this.sendMessage(text, true);
  }

  async sendMessage(text, isUser = true) {
    this.stopSpeaking();
    this.addMessageToUI(text, isUser ? 'user' : 'bot');
    this.history.push({ sender: isUser ? 'user' : 'bot', text: text });

    if (isUser) {
      this.showTypingIndicator();

      // 1. Попытка запроса к Gemini Flash через бэкенд
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonStringifySafe({ message: text, history: this.history, mode: 'text', lang: this.currentLang }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          this.hideTypingIndicator();
          if (data && data.reply) {
            this.history.push({ sender: 'bot', text: data.reply });
            this.addMessageToUI(data.reply, 'bot', data.card, this.generateQuickActions(text));
            return;
          }
        }
      } catch (e) {
        console.log('Using local intelligent domain engine:', e);
      }

      // 2. Экспертный семантический ответ по существу (Fallback)
      setTimeout(() => {
        const responseData = this.generateDirectExpertResponse(text);
        this.hideTypingIndicator();
        this.history.push({ sender: 'bot', text: responseData.text });
        this.addMessageToUI(responseData.text, 'bot', responseData.card, responseData.quickActions);
      }, 500);
    }
  }

  addMessageToUI(content, sender = 'bot', card = null, quickActions = null) {
    const msgEl = document.createElement('div');
    msgEl.className = `ai-message ${sender}-message`;

    let cardHtml = '';
    if (card) {
      cardHtml = `
        <div class="ai-project-card">
          <img src="${card.image}" alt="${card.title}" class="ai-card-thumb" />
          <div class="ai-card-content">
            <span class="ai-card-tag">${card.tag}</span>
            <h4 class="ai-card-title">${card.title}</h4>
            <div class="ai-card-meta">
              <span>${card.area}</span> • <span>${card.price}</span>
            </div>
            <button class="ai-card-action" onclick="window.openProjectModal('${card.id}')">Смотреть планировку</button>
          </div>
        </div>
      `;
    }

    let actionsHtml = '';
    if (quickActions && quickActions.length) {
      actionsHtml = `
        <div class="ai-message-actions">
          ${quickActions.map(action => `
            <button class="ai-action-link" onclick="window.aiConsultant.openWithQuery('${action.query}')">
              ${action.label}
            </button>
          `).join('')}
        </div>
      `;
    }

    msgEl.innerHTML = `
      <div class="ai-bubble">
        <div class="ai-bubble-text">${this.formatMarkdown(content)}</div>
        ${cardHtml}
        ${actionsHtml}
      </div>
      <span class="ai-msg-time">${this.getCurrentTime()}</span>
    `;

    this.messagesContainer.appendChild(msgEl);
    if (window.lucide) window.lucide.createIcons();
    this.scrollToBottom();
  }

  /* ---------------- VOICE RECOGNITION (STT) ---------------- */
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (this.micBtn) {
        this.micBtn.title = 'Голосовой ввод доступен в Google Chrome и Яндекс Браузере';
      }
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'ru-RU';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.micBtn) this.micBtn.classList.add('listening');
        if (this.voiceStatus) this.voiceStatus.style.display = 'flex';
        this.stopSpeaking();
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          this.inputField.value = transcript;
          setTimeout(() => {
            this.handleSendMessage();
          }, 300);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
        this.resetListening();
      };

      this.recognition.onend = () => {
        this.resetListening();
      };

      if (this.micBtn) {
        this.micBtn.addEventListener('click', () => {
          if (this.isListening) {
            this.recognition.stop();
          } else {
            try {
              this.recognition.start();
            } catch (e) {
              console.warn('Could not start voice recognition:', e);
            }
          }
        });
      }
    } catch (e) {
      console.warn('Speech recognition init failed:', e);
    }
  }

  resetListening() {
    this.isListening = false;
    if (this.micBtn) this.micBtn.classList.remove('listening');
    if (this.voiceStatus) this.voiceStatus.style.display = 'none';
  }

  /* ---------------- VOICE SYNTHESIS (TTS) ---------------- */
  initSpeechSynthesis() {
    if (!('speechSynthesis' in window)) return;
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
  }

  cleanTextForSpeech(raw) {
    if (!raw) return '';
    return raw
      .replace(/\[\s*P\s*=.*?\]/gs, 'по формуле аннуитетного платежа')
      .replace(/\\\[.*?\\\]/gs, '')
      .replace(/\\\(/g, '')
      .replace(/\\\)/g, '')
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')
      .replace(/•/g, '')
      .replace(/₽\/мес/g, 'рублей в месяц')
      .replace(/₽/g, 'рублей')
      .replace(/%/g, 'процентов')
      .replace(/м²/g, 'квадратных метров')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  speakText(text, btnElement = null) {
    if (!('speechSynthesis' in window)) return;
    this.stopSpeaking();

    const cleanText = this.cleanTextForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    this.selectVoiceForLanguage(utterance);

    this.currentSpeakingBtn = btnElement;
    if (btnElement) {
      btnElement.classList.add('speaking');
      btnElement.innerHTML = '<i data-lucide="square"></i> <span>Стоп</span>';
      if (window.lucide) window.lucide.createIcons();
    }

    utterance.onend = () => {
      this.stopSpeaking();
    };

    utterance.onerror = () => {
      this.stopSpeaking();
    };

    this.isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.currentAudioPlayer) {
      try {
        this.currentAudioPlayer.pause();
        this.currentAudioPlayer.currentTime = 0;
      } catch(e) {}
      this.currentAudioPlayer = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    if (this.currentSpeakingBtn) {
      this.currentSpeakingBtn.classList.remove('speaking');
      this.currentSpeakingBtn.innerHTML = '<i data-lucide="volume-2"></i> <span>Озвучить</span>';
      if (window.lucide) window.lucide.createIcons();
      this.currentSpeakingBtn = null;
    }
  }

  showTypingIndicator() {
    this.isTyping = true;
    const typingEl = document.createElement('div');
    typingEl.id = 'ai-typing-indicator';
    typingEl.className = 'ai-message bot-message';
    typingEl.innerHTML = `
      <div class="ai-bubble typing-bubble">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    this.messagesContainer.appendChild(typingEl);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    this.isTyping = false;
    const el = document.getElementById('ai-typing-indicator');
    if (el) el.remove();
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  getCurrentTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  formatMarkdown(str) {
    if (!str) return '';
    let formatted = str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n• /g, '<br>• ')
      .replace(/\n- /g, '<br>— ');
    return formatted;
  }

  generateQuickActions(query) {
    const q = query.toLowerCase();
    if (q.includes('вилл') || q.includes('pinecrest')) {
      return [
        { label: 'Смотреть планировку виллы', query: 'Покажи планировку виллы Pinecrest' },
        { label: 'Заказать Maybach-трансфер', query: 'Заказать VIP-трансфер на виллу' }
      ];
    } else if (q.includes('skyline') || q.includes('жк')) {
      return [
        { label: 'Смотреть планировку апартаментов', query: 'Покажи планировку апартаментов в Skyline Towers' },
        { label: 'График рассрочки 0%', query: 'Как устроен график рассрочки 0%?' }
      ];
    } else {
      return [
        { label: 'Каталог всех цен', query: 'Сколько стоят квартиры и виллы?' },
        { label: 'Условия рассрочки 0%', query: 'Расскажи про беспроцентную рассрочку 0%' }
      ];
    }
  }

  /**
   * Точный, фактологический ответ по существу вопроса без шаблонных фраз
   */
  generateDirectExpertResponse(query) {
    const q = query.toLowerCase();

    // 0. Запрос расчета из калькулятора (стоимость, первый взнос, платеж)
    if (q.includes('рассчитай покупку') || q.includes('ежемесячный платеж') || q.includes('первым взносом') || q.includes('платеж около') || q.includes('рассчитай')) {
      const priceMatch = query.match(/за\s+([\d\s]+)\s*₽/);
      const dpMatch = query.match(/взносом\s+([\d]+)%/);
      const paymentMatch = query.match(/около\s+([\d\s]+)\s*₽/);

      const priceStr = priceMatch ? priceMatch[1].trim() : '30 000 000';
      const dpStr = dpMatch ? dpMatch[1].trim() : '20';
      const paymentStr = paymentMatch ? paymentMatch[1].trim() : '136 281';
      const priceNum = parseInt(priceStr.replace(/\s/g, '')) || 30000000;

      const isHighBudget = priceNum >= 75000000;
      const targetTitle = isHighBudget ? 'Pinecrest Forest Villa' : 'Skyline Aura Towers';
      const targetDesc = isHighBudget
        ? 'авторская лесная резиденция **Pinecrest Forest Villa** (560 м² на участке 35 соток с вековыми соснами, подогреваемым infinity-бассейном и собственным спа-комплексом. Объект сдан и готов к заселению!). Либо эксклюзивный двухуровневый пентхаус The Vertex.'
        : 'высотный комплекс **Skyline Aura Towers** (панорамные апартаменты от 65 до 340 м² с видами на набережную, садами на высоте 110 м и собственным бассейном), либо эко-виллы **Verde Valley** от 42 млн ₽.';

      const targetCard = isHighBudget ? {
        id: 'pinecrest',
        title: 'Pinecrest Forest Villa',
        tag: 'В вашем бюджете • Сдана',
        area: 'от 420 до 850 м²',
        price: 'от 85 000 000 ₽',
        image: 'assets/images/project_pinecrest.jpg'
      } : {
        id: 'skyline',
        title: 'Skyline Aura Towers',
        tag: 'В вашем бюджете • Премиум ЖК',
        area: 'от 65 до 340 м²',
        price: 'от 28 500 000 ₽',
        image: 'assets/images/project_skyline.jpg'
      };

      return {
        text: `### Финансовый анализ вашего расчета:\n\n` +
              `• **Стоимость резиденции:** **${priceStr} ₽**\n` +
              `• **Первоначальный взнос (${dpStr}%):** от **${Math.round(priceNum * parseInt(dpStr) / 100).toLocaleString('ru-RU')} ₽**\n` +
              `• **Ежемесячный платеж по субсидированной ипотеке (4.8%):** **${paymentStr} ₽/мес**\n` +
              `• **Требуемый доход для одобрения:** от **${Math.round((parseInt(paymentStr.replace(/\s/g, '')) || 140000) * 2.2).toLocaleString('ru-RU')} ₽/мес**\n\n` +
              `### Подходящие объекты AURA под этот бюджет:\n` +
              `В бюджете **${priceStr} ₽** идеальным выбором является ${targetDesc}\n\n` +
              `### Альтернатива — Рассрочка 0% от девелопера:\n` +
              `Мы можем предложить прямую **беспроцентную рассрочку на 36 месяцев**: первый взнос от 20%, равные платежи раз в квартал, **0% переплаты банку**!\n\n` +
              `Хотите зафиксировать расчетную ставку 4.8% и записаться на закрытый показ резиденции?`,
        card: targetCard,
        quickActions: [
          { label: 'Зафиксировать ставку 4.8%', query: 'Зафиксировать ставку 4.8% и одобрить расчет' },
          { label: 'Условия рассрочки 0%', query: 'Условия беспроцентной рассрочки 0%' },
          { label: 'Заказать Maybach-показ', query: 'Заказать VIP-трансфер на показ' }
        ]
      };
    }

    // 1. Цены, стоимость, бюджет, сколько стоит
    if (q.includes('цен') || q.includes('стоим') || q.includes('скольк') || q.includes('прайс') || q.includes('бюджет') || q.includes('рубл')) {
      return {
        text: 'Прайс-лист на объекты **AURA Development** на 2026 год:\n\n' +
              '• **ЖК Solstice Residences** (34 этажа) — от **22 800 000 ₽** (апартаменты от 55 до 220 м²)\n' +
              '• **ЖК Skyline Aura Towers** (52 этажа, центр) — от **28 500 000 ₽** (от 65 до 340 м²)\n' +
              '• **Эко-поселок Verde Valley** — от **42 000 000 ₽** (виллы от 280 м²)\n' +
              '• **Клубный дом Lumen Imperial** (набережная, яхты) — от **54 000 000 ₽** (от 140 м²)\n' +
              '• **Виллы в сосновом бору Pinecrest** — от **85 000 000 ₽** (готовы к заселению, 420–850 м², бассейн)\n' +
              '• **Пентхаусы The Vertex** — от **145 000 000 ₽** (двухуровневые 520–780 м² с вертолетной площадкой)\n\n' +
              'При единовременной 100% оплате действует скидка **до 7%** или бесплатный машиноместо в паркинге.',
        card: {
          id: 'skyline',
          title: 'Skyline Aura Towers',
          tag: 'Стартовая цена от 28.5 млн ₽',
          area: 'от 65 до 340 м²',
          price: 'от 28 500 000 ₽',
          image: 'assets/images/project_skyline.jpg'
        },
        quickActions: [
          { label: 'Рассчитать рассрочку 0%', query: 'Условия беспроцентной рассрочки 0%' },
          { label: 'Забронировать визит', query: 'Записаться на показ' }
        ]
      };
    }

    // 2. ЖК Skyline Towers / Многоэтажные дома / Башни / Высотки
    if (q.includes('skyline') || q.includes('жк') || q.includes('башн') || q.includes('многоэтаж') || q.includes('высотк') || q.includes('квартир') || q.includes('апартамент')) {
      return {
        text: 'Флагманский комплекс **Skyline Aura Towers** — высотная доминанта из двух башен по **52 этажа** на набережной в центре города.\n\n' +
              '• **Планировки:** от 1-комнатных студий 65 м² до семейных резиденций 340 м²\n' +
              '• **Потолки:** от 3.65 м (в чистоте)\n' +
              '• **Инфраструктура:** приватный клуб резидентов с 25-метровым панорамным бассейном на 30 этаже, сады на высоте 110 м, 3-уровневый подземный паркинг\n' +
              '• **Остекление:** бельгийские фасады Reynaers Hi-Finity от пола до потолка\n' +
              '• **Срок ввода:** IV квартал 2026 года (текущая готовность — 18 этаж каркаса)\n' +
              '• **Стоимость:** от **28 500 000 ₽**.',
        card: {
          id: 'skyline',
          title: 'Skyline Aura Towers',
          tag: 'Премиум ЖК • Центр',
          area: 'от 65 до 340 м²',
          price: 'от 28 500 000 ₽',
          image: 'assets/images/project_skyline.jpg'
        },
        quickActions: [
          { label: 'Смотреть планировку этажа', query: 'Покажи планировку Skyline Towers' },
          { label: 'Условия покупки в рассрочку', query: 'Как купить квартиру в рассрочку?' }
        ]
      };
    }

    // 3. Виллы / Дома / Коттеджи / Pinecrest / Загородное жилье
    if (q.includes('вилл') || q.includes('дом') || q.includes('коттедж') || q.includes('pinecrest') || q.includes('лес') || q.includes('бассейн') || q.includes('участок')) {
      return {
        text: 'Проект загородных резиденций **Pinecrest Forest Villa** — это ансамбль авторских модернистских вилл в реликтовом сосновом бору (18 км по скоростному шоссе):\n\n' +
              '• **Статус:** дома полностью построены и **сданы в эксплуатацию** (готовы к заселению)\n' +
              '• **Участки:** от 25 до 60 соток с сохраненными вековыми соснами\n' +
              '• **Площадь:** от 420 до 850 м² (2 этажа + цокольный винный погреб и гараж на 4 авто)\n' +
              '• **Оснащение:** персональный подогреваемый infinity-pool, спа-комплекс с финской сауной и хаммамом, терраса с дровяным камином\n' +
              '• **Стоимость:** от **85 000 000 ₽**.',
        card: {
          id: 'pinecrest',
          title: 'Pinecrest Forest Villa',
          tag: 'Готовая вилла • Реликтовый бор',
          area: 'от 420 до 850 м²',
          price: 'от 85 000 000 ₽',
          image: 'assets/images/project_pinecrest.jpg'
        },
        quickActions: [
          { label: 'Заказать трансфер на виллу', query: 'Организовать просмотр виллы Pinecrest' },
          { label: 'Узнать про рассрочку на дом', query: 'Условия рассрочки на виллу' }
        ]
      };
    }

    // 4. Клубный дом / Lumen Imperial / Набережная / Яхты
    if (q.includes('lumen') || q.includes('клубн') || q.includes('набережн') || q.includes('яхт') || q.includes('марин') || q.includes('пирс')) {
      return {
        text: '**Lumen Imperial Club House** — камерный клубный дом всего на **24 резиденции** на первой береговой линии Королевской гавани:\n\n' +
              '• **Привилегия:** собственный оборудованный пирс с причалами для яхт резидентов\n' +
              '• **Архитектура:** фасады из белого римского травертина и литой латуни\n' +
              '• **Площадь квартир:** от 140 до 450 м² с потолками 4.0 метра\n' +
              '• **Сервис:** персональный лифт в апартаменты, консьерж 24/7, сигарная комната\n' +
              '• **Срок сдачи:** II квартал 2026 года\n' +
              '• **Стоимость:** от **54 000 000 ₽**.',
        card: {
          id: 'lumen',
          title: 'Lumen Imperial Club House',
          tag: 'Клубный дом • Первая линия',
          area: 'от 140 до 450 м²',
          price: 'от 54 000 000 ₽',
          image: 'assets/images/project_lumen.jpg'
        },
        quickActions: [
          { label: 'Записаться на встречу', query: 'Записаться на презентацию Lumen Imperial' }
        ]
      };
    }

    // 5. Рассрочка, ипотека, условия покупки, банк, первоначальный взнос
    if (q.includes('рассрочк') || q.includes('ипотек') || q.includes('услови') || q.includes('первый взнос') || q.includes('эскроу') || q.includes('кредит') || q.includes('купить')) {
      return {
        text: 'Покупка недвижимости в **AURA Development** доступна по 3 программам:\n\n' +
              '1. **Беспроцентная рассрочка 0% от девелопера:**\n' +
              '   • Срок: до **36 месяцев** (до завершения строительства)\n' +
              '   • Первоначальный взнос: от **20%**\n' +
              '   • График выплат: равными ежеквартальными или ежемесячными траншами без переплат и скрытых комиссий.\n\n' +
              '2. **Субсидированная ставка от банков-партнеров:**\n' +
              '   • От **4.8%** годовых (Сбербанк, ВТБ, Альфа-Банк) на весь период строительства.\n\n' +
              '3. **100% защита по ФЗ-214:**\n' +
              '   • Ваши деньги блокируются на эскроу-счете до момента ввода дома в эксплуатацию.\n\n' +
              '4. **Trade-In:** зачет вашей существующей квартиры с выкупом до 100% стоимости.',
        quickActions: [
          { label: 'Калькулятор платежей', query: 'Открыть ипотечный калькулятор' },
          { label: 'Оставить заявку на рассрочку', query: 'Оставить заявку на беспроцентную рассрочку' }
        ]
      };
    }

    // 6. О компании, кто застройщик, надежность, гарантии, опыт
    if (q.includes('компани') || q.includes('застройщик') || q.includes('кто вы') || q.includes('надежн') || q.includes('опыт') || q.includes('гаранти') || q.includes('документ')) {
      return {
        text: '**AURA Development** — девелоперская группа высшей категории надежности:\n\n' +
              '• **18 лет** на рынке элитной и премиальной недвижимости\n' +
              '• **1 450 000 м²** реализовано и передано резидентам\n' +
              '• **100% объектов сдано строго в срок**, без единого дня задержки\n' +
              '• **24 международные награды** (European Property Awards, WAF Awards)\n' +
              '• Проектирование ведется по стандарту BIM LOD 500 с непрерывным лабораторным контролем прочности бетона и материалов.',
        quickActions: [
          { label: 'Посмотреть объекты', query: 'Покажи все проекты' },
          { label: 'Контакты руководства', query: 'Где находится офис компании?' }
        ]
      };
    }

    // 7. Технологии, материалы, шумоизоляция, остекление, экология
    if (q.includes('технолог') || q.includes('материал') || q.includes('остеклен') || q.includes('шум') || q.includes('окн') || q.includes('бетон') || q.includes('воздух') || q.includes('reynaers')) {
      return {
        text: 'Ключевые инженерные стандарты **AURA Development**:\n\n' +
              '• **Монолитный каркас B35 W8** с сейсмостойкостью до 9 баллов (расчетный срок службы — 150+ лет).\n' +
              '• **Панорамные фасады Reynaers Hi-Finity (Бельгия)**: раздвижные порталы со скрытыми направляющими, триплекс 42 мм и защита от перегрева с сохранением 100% прозрачности.\n' +
              '• **Акустический комфорт 62 дБ**: технология «плавающего пола» на базе базальтовых плит Rockwool Floor Batts гарантирует полную тишину уровня студии звукозаписи.\n' +
              '• **Чистый микроклимат**: вентиляция Daikin с медицинскими фильтрами **HEPA H13**, задерживающими 99.97% пыли, смога и микрочастиц.',
        quickActions: [
          { label: 'Смотреть скролл-таймлапс', query: 'Покажи этапы строительства' }
        ]
      };
    }

    // 8. Контакты, где офис, телефон, как доехать, показ
    if (q.includes('контакт') || q.includes('телефон') || q.includes('адрес') || q.includes('где вы') || q.includes('офис') || q.includes('шоурум') || q.includes('показ') || q.includes('визит')) {
      return {
        text: 'Флагманский офис и интерактивный шоурум **AURA Development**:\n\n' +
              '• **Адрес:** Москва-Сити, Пресненская набережная, 12, Башня «Федерация Восток», 48 этаж\n' +
              '• **VIP-линия:** **+7 (495) 820-00-11** (ежедневно с 09:00 до 22:00)\n' +
              '• **Email:** residences@aura-development.ru\n' +
              '• **Сервис:** для клиентов доступен персональный трансфер на **Mercedes-Maybach** до офиса или на объект строительства.\n\n' +
              'Укажите ваш телефон или время, и мы подготовим для вас персональный закрытый показ!',
        quickActions: [
          { label: 'Забронировать VIP-визит', query: 'Забронировать показ на завтра' }
        ]
      };
    }

    // 9. Универсальный содержательный ответ на любой другой запрос
    return {
      text: 'В портфолио **AURA Development** сейчас открыты продажи в 3 флагманских форматах:\n\n' +
            '1. **Высотные апартаменты в центре:** ЖК *Skyline Towers* (52 этажа, парк на высоте 110 м, от **28.5 млн ₽**)\n' +
            '2. **Приватные виллы в сосновом бору:** *Pinecrest Forest* (готовые дома с бассейном от 420 м², от **85 млн ₽**)\n' +
            '3. **Клубный дом на первой береговой линии:** *Lumen Imperial* (24 резиденции с яхтенным причалом, от **54 млн ₽**)\n\n' +
            'Все объекты строятся по ФЗ-214 через эскроу-счета, доступна **беспроцентная рассрочка 0%** до 36 месяцев.\n\n' +
            'Какой формат жилья вам ближе — центр города, первая линия у воды или загородная вилла в лесу?',
      card: {
        id: 'skyline',
        title: 'Skyline Aura Towers',
        tag: 'Высотный флагман',
        area: 'от 65 до 340 м²',
        price: 'от 28 500 000 ₽',
        image: 'assets/images/project_skyline.jpg'
      },
      quickActions: [
        { label: 'Прайс-лист всех объектов', query: 'Сколько стоят квартиры и виллы?' },
        { label: 'Условия рассрочки 0%', query: 'Условия беспроцентной рассрочки 0%' },
        { label: 'Записаться на показ', query: 'Записаться на показ' }
      ]
    };
  }

  /* ================= LIVE CONVERSATIONAL VOICE CALL (GEMINI LIVE) ================= */
  initVoiceCallElements() {
    this.callModal = document.getElementById('ai-voice-call-modal');
    this.callTimerEl = document.getElementById('ai-call-timer');
    this.callCloseBtn = document.getElementById('ai-call-close');
    this.callOrb = document.getElementById('ai-call-orb');
    this.callOrbTouch = document.getElementById('ai-call-orb-touch-area');
    this.callStateLabel = document.getElementById('ai-call-state');
    this.callSubUser = document.getElementById('ai-call-sub-user');
    this.callSubBot = document.getElementById('ai-call-sub-bot');
    this.callMicToggle = document.getElementById('ai-call-mic-toggle');
    this.callEndBtn = document.getElementById('ai-call-end-btn');
    this.callInterruptBtn = document.getElementById('ai-call-interrupt-btn');
    this.startCallHeaderBtn = document.getElementById('ai-start-call-header-btn');
    this.startCallInviteBtn = document.getElementById('ai-call-start-btn');

    this.isInCall = false;
    this.callTimerInterval = null;
    this.callStartTime = 0;
    this.callHistory = [];
    this.isMicMuted = false;
    this.currentCallState = 'idle';

    if (this.startCallHeaderBtn) {
      this.startCallHeaderBtn.addEventListener('click', () => this.startVoiceCall());
    }
    if (this.startCallInviteBtn) {
      this.startCallInviteBtn.addEventListener('click', () => this.startVoiceCall());
    }
    if (this.callCloseBtn) {
      this.callCloseBtn.addEventListener('click', () => this.endVoiceCall());
    }
    if (this.callEndBtn) {
      this.callEndBtn.addEventListener('click', () => this.endVoiceCall());
    }
    if (this.callInterruptBtn) {
      this.callInterruptBtn.addEventListener('click', () => this.interruptAndListen());
    }
    if (this.callOrbTouch) {
      this.callOrbTouch.addEventListener('click', () => this.interruptAndListen());
    }
    if (this.callMicToggle) {
      this.callMicToggle.addEventListener('click', () => this.toggleCallMic());
    }

    // Call suggestion chips
    document.querySelectorAll('[data-call-suggest]').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-call-suggest');
        this.handleCallUserQuery(text);
      });
    });
  }

  startVoiceCall() {
    this.isInCall = true;
    this.toggleChat(false); // Hide standard chat window during call
    if (this.callModal) {
      this.callModal.style.display = 'flex';
      requestAnimationFrame(() => this.callModal.classList.add('active'));
    }

    // Start timer
    this.callStartTime = Date.now();
    this.updateCallTimer();
    this.callTimerInterval = setInterval(() => this.updateCallTimer(), 1000);

    const rawWelcome = this.getLocalizedCallWelcome();
    const welcome = rawWelcome.replace(/[«»]/g, '');
    if (this.callSubBot) this.callSubBot.textContent = rawWelcome;
    if (this.callSubUser) this.callSubUser.textContent = '';
    
    this.callHistory = [{ sender: 'bot', text: welcome }];

    // Greet user with voice, then AUTOMATICALLY open the microphone for natural conversation!
    const stateLabels = this.getLocalizedStateLabels();
    this.setCallState('speaking', stateLabels.speaking || 'AURA говорит...');
    const welcomeAudio = `assets/audio/welcome_${this.currentLang}.mp3`;
    this.speakVoiceCall(welcome, () => {
      if (this.isInCall) {
        this.startCallListening();
      }
    }, welcomeAudio);
  }

  endVoiceCall() {
    if (!this.isInCall) return;
    this.isInCall = false;

    if (this.callTimerInterval) clearInterval(this.callTimerInterval);
    this.stopSpeaking();
    if (this.callRecognition) {
      try { this.callRecognition.abort(); } catch(e) {}
    }

    if (this.callModal) {
      this.callModal.classList.remove('active');
      setTimeout(() => {
        this.callModal.style.display = 'none';
      }, 300);
    }

    if (this.callHistory.length > 1) {
      const summaryMsg = this.currentLang === 'en'
        ? `📞 **Voice call ended** (${this.callTimerEl ? this.callTimerEl.textContent : '00:30'})\n\nConversation saved. You may continue here in chat or call anytime.`
        : (this.currentLang === 'uz'
          ? `📞 **Ovozli qo'ng'iroq yakunlandi** (${this.callTimerEl ? this.callTimerEl.textContent : '00:30'})\n\nSuhbat saqlandi. Muloqotni chatda davom ettirishingiz yoki qayta qo'ng'iroq qilishingiz mumkin.`
          : `📞 **Голосовой звонок завершен** (${this.callTimerEl ? this.callTimerEl.textContent : '00:30'})\n\nДиалог сохранен в историю. При необходимости вы можете продолжить общение в чате или позвонить снова.`);
      this.addMessageToUI(summaryMsg, 'bot');
    }
  }

  startCallListening() {
    if (!this.isInCall || this.isMicMuted) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const stateLabels = this.getLocalizedStateLabels();
      this.setCallState('idle', stateLabels.idle || 'Используйте Chrome для голосового диалога');
      return;
    }

    this.stopSpeaking();
    const stateLabels = this.getLocalizedStateLabels();
    this.setCallState('listening', stateLabels.listening || 'Слушаю вас... Говорите');

    if (!this.callRecognition) {
      this.callRecognition = new SpeechRecognition();
      this.callRecognition.continuous = false;
      this.callRecognition.interimResults = true;

      this.callRecognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const prefix = this.currentLang === 'en' ? 'You: ' : (this.currentLang === 'uz' ? 'Siz: ' : 'Вы: ');
        if (this.callSubUser) {
          this.callSubUser.textContent = `${prefix}${final || interim}`;
        }
        if (final && final.trim()) {
          this.handleCallUserQuery(final.trim());
        }
      };

      this.callRecognition.onerror = (event) => {
        console.warn('Call recognition error:', event.error);
        if (this.isInCall && event.error !== 'aborted') {
          setTimeout(() => {
            if (this.isInCall && !this.isSpeaking) {
              this.startCallListening();
            }
          }, 800);
        }
      };

      this.callRecognition.onend = () => {
        if (this.isInCall && !this.isSpeaking && this.currentCallState === 'listening') {
          setTimeout(() => {
            if (this.isInCall && !this.isSpeaking) {
              try { this.callRecognition.start(); } catch(e) {}
            }
          }, 400);
        }
      };
    }

    // Always keep recognition language synced with currentLang
    this.callRecognition.lang = this.getRecognitionLang();

    try {
      this.callRecognition.start();
    } catch(e) {
      // Already active
    }
  }

  interruptAndListen() {
    if (!this.isInCall) return;
    this.stopSpeaking();
    this.startCallListening();
  }

  async handleCallUserQuery(queryText) {
    if (!queryText || !this.isInCall) return;

    if (this.callRecognition) {
      try { this.callRecognition.stop(); } catch(e) {}
    }

    const stateLabels = this.getLocalizedStateLabels();
    this.setCallState('thinking', stateLabels.thinking || 'AURA думает...');
    this.callHistory.push({ sender: 'user', text: queryText });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          history: this.callHistory,
          mode: 'voice_call',
          lang: this.currentLang
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.reply) {
          this.handleCallBotReply(data.reply, data.audio);
          return;
        }
      }
    } catch(err) {
      console.warn('Call query fetch error:', err);
    }

    // Fallback response for live call
    const fallback = this.getVoiceCallFallback(queryText);
    this.handleCallBotReply(fallback);
  }

  handleCallBotReply(replyText, audioSrc = null) {
    if (!this.isInCall) return;

    this.callHistory.push({ sender: 'bot', text: replyText });
    if (this.callSubBot) {
      this.callSubBot.textContent = `«${replyText}»`;
    }

    const stateLabels = this.getLocalizedStateLabels();
    this.setCallState('speaking', stateLabels.speaking || 'AURA говорит...');
    this.speakVoiceCall(replyText, () => {
      // AUTOMATIC TURN-TAKING: Resume listening after bot finishes speaking!
      if (this.isInCall) {
        this.startCallListening();
      }
    }, audioSrc);
  }

  speakVoiceCall(text, onComplete, audioSrc = null) {
    this.stopSpeaking();

    // 1. Check if direct audio or pre-rendered neural audio file is available
    let soundSrc = audioSrc;
    if (!soundSrc) {
      soundSrc = this.getPreRenderedAudio(text, this.currentLang);
    }

    if (soundSrc) {
      try {
        const audio = new Audio(soundSrc);
        this.currentAudioPlayer = audio;
        this.isSpeaking = true;

        audio.onended = () => {
          this.isSpeaking = false;
          this.currentAudioPlayer = null;
          if (onComplete) onComplete();
        };

        audio.onerror = (e) => {
          console.warn('Neural audio playback failed, falling back to browser speech:', e);
          this.currentAudioPlayer = null;
          this.speakBrowserVoice(text, onComplete);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Audio play prevented, fallback to browser speech:', err);
            this.speakBrowserVoice(text, onComplete);
          });
        }
        return;
      } catch (err) {
        console.warn('Error creating audio player:', err);
      }
    }

    // 2. Fallback to browser speech synthesis
    this.speakBrowserVoice(text, onComplete);
  }

  speakBrowserVoice(text, onComplete) {
    if (!('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }

    window.speechSynthesis.cancel();
    const clean = this.cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    this.selectVoiceForLanguage(utterance);

    this.isSpeaking = true;

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onComplete) onComplete();
    };

    window.speechSynthesis.speak(utterance);
  }

  selectVoiceForLanguage(utterance) {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return;

    const lang = this.currentLang || 'ru';
    let targetLangCode = 'ru-RU';
    if (lang === 'uz') targetLangCode = 'uz-UZ';
    else if (lang === 'en') targetLangCode = 'en-US';

    utterance.lang = targetLangCode;
    let voice = voices.find(v => v.lang === targetLangCode);
    if (!voice && lang === 'uz') {
      voice = voices.find(v => v.lang.startsWith('uz')) || voices.find(v => v.lang.startsWith('tr'));
    }
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(lang));
    }
    if (voice) {
      utterance.voice = voice;
    }
  }

  getPreRenderedAudio(text, lang = 'ru') {
    const t = (text || '').toLowerCase();
    const l = lang || this.currentLang || 'ru';
    let key = null;

    if (t.includes('приветствоват') || t.includes('xush kelibsiz') || t.includes('welcome to aura') || t.includes('добро пожаловать') || t.includes('assalomu alaykum')) {
      key = 'welcome';
    } else if (t.includes('рассрочк') || t.includes('muddatli') || t.includes('installment') || t.includes('ипотек') || t.includes('ipoteka') || t.includes('0%')) {
      key = 'installment';
    } else if (t.includes('калькулятор') || t.includes('kalkulyator') || t.includes('аудит') || t.includes('audit')) {
      key = 'calc';
    } else if (t.includes('цен') || t.includes('narx') || t.includes('price') || t.includes('стоим') || t.includes('бюджет') || t.includes('qiymat')) {
      key = 'price';
    } else if (t.includes('материал') || t.includes('seysmik') || t.includes('b35') || t.includes('инженер') || t.includes('sifat') || t.includes('shisha') || t.includes('oyna')) {
      key = 'quality';
    } else if (t.includes('skyline')) {
      key = 'skyline';
    } else if (t.includes('pinecrest')) {
      key = 'pinecrest';
    } else if (t.includes('lumen')) {
      key = 'lumen';
    }

    if (key) {
      return `assets/audio/${key}_${l}.mp3`;
    }
    return null;
  }

  getLocalizedCallWelcome() {
    if (this.currentLang === 'uz') {
      return '«Assalomu alaykum! AURA Development kompaniyasining ovozli maslahatchisi xizmatingizda. Qaysi loyihamiz haqida ma\'lumot beray?»';
    } else if (this.currentLang === 'en') {
      return '«Hello and welcome to AURA Development. I am your personal real estate advisor. Which landmark shall we explore today?»';
    }
    return '«Здравствуйте! Рада приветствовать вас в AURA Development. О каком объекте вам рассказать подробнее?»';
  }

  getLocalizedStateLabels() {
    if (this.currentLang === 'uz') {
      return {
        listening: "Sizni tinglayapman... Gapiring",
        thinking: "AURA o'ylamoqda...",
        speaking: "AURA gapirmoqda...",
        idle: "Qo'ng'iroqqa tayyor",
        muted: "Mikrofon o'chirilgan"
      };
    } else if (this.currentLang === 'en') {
      return {
        listening: "Listening to you... Speak now",
        thinking: "AURA is thinking...",
        speaking: "AURA is speaking...",
        idle: "Ready for call",
        muted: "Microphone muted"
      };
    }
    return {
      listening: "Слушаю вас... Говорите",
      thinking: "AURA думает...",
      speaking: "AURA говорит...",
      idle: "Готов к разговору",
      muted: "Микрофон отключен"
    };
  }

  getRecognitionLang() {
    if (this.currentLang === 'uz') return 'uz-UZ';
    if (this.currentLang === 'en') return 'en-US';
    return 'ru-RU';
  }

  setCallState(state, label) {
    this.currentCallState = state;
    if (this.callStateLabel) this.callStateLabel.textContent = label;
    if (this.callOrb) {
      this.callOrb.className = `ai-call-orb state-${state}`;
    }
  }

  updateCallTimer() {
    if (!this.callTimerEl) return;
    const elapsed = Math.floor((Date.now() - this.callStartTime) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    this.callTimerEl.textContent = `${m}:${s}`;
  }

  toggleCallMic() {
    this.isMicMuted = !this.isMicMuted;
    if (this.callMicToggle) {
      this.callMicToggle.classList.toggle('muted', this.isMicMuted);
      const icon = this.callMicToggle.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', this.isMicMuted ? 'mic-off' : 'mic');
        if (window.lucide) window.lucide.createIcons();
      }
    }
    if (this.isMicMuted) {
      if (this.callRecognition) try { this.callRecognition.stop(); } catch(e) {}
      const stateLabels = this.getLocalizedStateLabels();
      this.setCallState('muted', stateLabels.muted || 'Микрофон отключен');
    } else {
      this.startCallListening();
    }
  }

  getVoiceCallFallback(query) {
    const q = query.toLowerCase();

    if (this.currentLang === 'uz' || q.includes('qancha') || q.includes('narxi') || q.includes('loyiha') || q.includes('salom')) {
      if (q.includes('narx') || q.includes('qancha') || q.includes('qiymat')) {
        return 'Skyline Towers loyihamizda narxlar yigirma sakkiz yarim million rubldan, Pinecrest villalari esa sakson besh million rubldan boshlanadi. Qaysi loyiha sizga ma\'qul?';
      } else if (q.includes('villa') || q.includes('o\'rmon') || q.includes('hovuz') || q.includes('pinecrest')) {
        return 'Pinecrest villalari qarag\'ayzor ichida joylashgan bo\'lib, o\'zining isitiladigan basseyni va spa majmuasiga ega. Uylar to\'liq tayyor. Ko\'rish uchun ro\'yxatdan o\'tmoqchimisiz?';
      } else if (q.includes('bo\'lib') || q.includes('to\'lov') || q.includes('foizsiz') || q.includes('ipoteka') || q.includes('muddatli')) {
        return 'Bizda o\'ttiz olti oygacha nol foizli muddatli to\'lov va to\'rt butun o\'ndan sakkiz foizli imtiyozli ipoteka mavjud. Shaxsiy hisob-kitob qilib beraymi?';
      } else if (q.includes('skyline') || q.includes('minora') || q.includes('bino')) {
        return 'Skyline Towers — daryo bo\'yida qad rostlagan ellik ikki qavatli osmono\'par bino. Unda panoramali qishki bog\'lar va o\'ttizinchi qavatda osma basseyn mavjud. Rejalarni ko\'rishni xohlaysizmi?';
      } else if (q.includes('lumen')) {
        return 'Lumen Residence — klub shaklidagi kam qavatli bino. Har bir xonadonda shaxsiy terrasalar, kaminlar va aqlli uy tizimi mavjud.';
      } else if (q.includes('sifat') || q.includes('material') || q.includes('shisha') || q.includes('beton')) {
        return 'Binolarimizda B35 markali zilzilabardosh beton, Guardian Glass akustik oynalari va Kone tezyurar aqlli liftlari o\'rnatilgan. Barcha muhandislik yevropa standartlariga javob beradi.';
      } else if (q.includes('kalkulyator') || q.includes('hisob')) {
        return 'Ipoteka va investitsiya kalkulyatori dastlabki to\'lov, oylik to\'lov hamda yillik kapitallashuvni aniq hisoblab beradi. Uni ochib beraymi?';
      }
      return 'AURA Development nufuzli turar-joy majmualari va hashamatli villalar quradi. Skyline Towers yoki Pinecrest villalari haqida gapirib beraymi?';
    }

    if (this.currentLang === 'en' || q.includes('price') || q.includes('cost') || q.includes('how much') || q.includes('hello')) {
      if (q.includes('price') || q.includes('cost') || q.includes('how much') || q.includes('budget')) {
        return 'Prices at Skyline Towers start from 28.5 million rubles, while Pinecrest Forest Villas start from 85 million. Which project aligns with your lifestyle?';
      } else if (q.includes('villa') || q.includes('pinecrest') || q.includes('forest') || q.includes('pool')) {
        return 'Pinecrest Villas are located in a pristine pine forest with private heated infinity pools. Would you like to schedule a private viewing?';
      } else if (q.includes('installment') || q.includes('mortgage') || q.includes('0%') || q.includes('financing')) {
        return 'We offer a zero percent interest developer installment plan for up to 36 months. Would you like a personalized calculation?';
      } else if (q.includes('skyline') || q.includes('tower')) {
        return 'Skyline Towers is a 52-story waterfront landmark featuring panoramic winter gardens and an infinity pool on the 30th floor. Would you like to review floor plans?';
      } else if (q.includes('lumen')) {
        return 'Lumen Residence is an exclusive boutique club house featuring private garden terraces, natural fireplaces, and bespoke smart home automation.';
      } else if (q.includes('quality') || q.includes('material') || q.includes('glass') || q.includes('engineering')) {
        return 'We build with B35 seismic-resistant concrete, Guardian Glass acoustic facades, and high-speed Kone smart elevators conforming to highest European standards.';
      } else if (q.includes('calculator') || q.includes('calc')) {
        return 'Our financial audit calculator computes your down payment, monthly installments, and estimated capitalization. Shall I open it for you?';
      }
      return 'AURA Development builds iconic architectural landmarks and private forest estates. Shall I tell you more about Skyline Towers or Pinecrest Villas?';
    }

    if (q.includes('цен') || q.includes('стоим') || q.includes('скольк') || q.includes('бюджет')) {
      return 'Цены в Skyline Towers начинаются от 28.5 миллионов рублей, а загородные виллы в бору Pinecrest от 85 миллионов. Под какой бюджет подбираем резиденцию?';
    } else if (q.includes('вилл') || q.includes('дом') || q.includes('pinecrest') || q.includes('лес') || q.includes('пайн')) {
      return 'Виллы Pinecrest расположены в реликтовом сосновом бору, площадь от 420 метров с персональным бассейном и спа. Дома уже сданы. Хотите записаться на закрытый просмотр?';
    } else if (q.includes('рассрочк') || q.includes('ипотек') || q.includes('0%') || q.includes('услови')) {
      return 'У нас действует беспроцентная рассрочка на 36 месяцев без переплат от застройщика и субсидированная ставка от 4.8%. Рассчитать персональный график платежей?';
    } else if (q.includes('skyline') || q.includes('скайлайн') || q.includes('башн')) {
      return 'Skyline Towers — это 52 этажа на набережной с панорамными садами и бассейном на 30 этаже. Сдача в 2026 году. Показать вам планировки?';
    } else if (q.includes('lumen') || q.includes('люмен') || q.includes('клубн')) {
      return 'Клубный дом Lumen Residence — это приватный особняк на 24 резиденции с каминами, приватными террасами и консьерж-сервисом мирового уровня.';
    } else if (q.includes('материал') || q.includes('качеств') || q.includes('стекл') || q.includes('инженер')) {
      return 'Мы используем сейсмостойкий монолит B35, панорамное шумоподавляющее остекление Guardian Glass и бесшумные лифты Kone по высшим европейским стандартам.';
    } else if (q.includes('калькулятор') || q.includes('расчет') || q.includes('посчит')) {
      return 'Наш интерактивный калькулятор точно рассчитает первоначальный взнос, ежемесячный платеж и прогнозируемую доходность. Открыть калькулятор?';
    }
    return 'Компания AURA строит флагманские жилые комплексы и премиальные виллы. Рассказать о башнях Skyline Towers или лесных виллах в сосновом бору?';
  }
}

// Utility helper
function jsonStringifySafe(obj) {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return '{}';
  }
}

// Initialize globally
document.addEventListener('DOMContentLoaded', () => {
  window.aiConsultant = new AIConsultant();
});
