# AURA Development — Luxury Real Estate & AI Voice Concierge

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fanvarelecant-ui%2Faura-development)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Live_Demo-success?logo=github)](https://anvarelecant-ui.github.io/aura-development/)
[![Stack](https://img.shields.io/badge/Stack-HTML5_%7C_CSS3_%7C_Vanilla_JS_%7C_Web_Speech_API-blue)](#tech-stack)

> **AURA Development** — флагманская веб-платформа девелоперской компании премиального сегмента. Сочетает швейцарскую типографику, кинематографичный покадровый BIM-таймлапс строительства при скролле, интерактивный калькулятор инвестиций и ипотеки, а также голосового ИИ-консультанта в режиме живого звонка.

---

## 🌟 Ключевые возможности

### 1. 🏗 Покадровый BIM-таймлапс строительства
- Синхронизированный со скроллом пользователя процесс возведения объекта: от котлована и фундамента до монолита, фасадных порталов и благоустройства.
- Архитектурная шкала этапов, высотные отметки, технические спецификации на каждом шаге.

### 2. 🎙 AURA Live Voice Call (Голосовой ИИ-звонок)
- Интерактивный режим hands-free звонка с непрерывным распознаванием речи (`SpeechRecognition`) и синтезом речи (`SpeechSynthesis`).
- **Трехъязычная поддержка (RU / EN / UZ):** мгновенное переключение языка в шапке и автоматическое ведение диалога на выбранном языке.
- Автономный семантический движок предметной области недвижимости + поддержка LLM через `/api/chat`.

### 3. 🏦 Интерактивный калькулятор инвестиций
- Расчет субсидированной ипотеки от 4.8% и беспроцентной рассрочки 0% до 36 месяцев.
- Мгновенная передача расчета в ИИ-аудит одной кнопкой («Рассчитать с ИИ»).

### 4. 🏛 Каталог резиденций и планировочные решения
- Резиденции **Skyline Aura Towers**, **Pinecrest Forest Villa**, **Lumen Imperial Club House**, **The Vertex Penthouse**.
- Модальные окна с архитектурными экспликациями и фильтрацией.

---

## 🛠 Технологический стек

- **Frontend:** 100% Vanilla HTML5, CSS3 (Custom Properties, Glassmorphism, BEM), ES6+ JavaScript.
- **Speech Technologies:** Web Speech API (`webkitSpeechRecognition`, `speechSynthesis`).
- **Serverless / Backend:** 
  - Vercel Serverless Function (`api/chat.js`).
  - Python Local Development Server (`server.py`) с поддержкой OpenRouter / Google Gemini API.
- **Хостинг:** Готов для деплоя на **Vercel** и **GitHub Pages**.

---

## 🚀 Быстрый запуск

### Вариант 1: Локальный запуск (Python)
```bash
git clone https://github.com/anvarelecant-ui/aura-development.git
cd aura-development
python server.py
# Откройте в браузере: http://localhost:8088
```

### Вариант 2: Деплой на Vercel
Нажмите кнопку **Deploy with Vercel** в начале файла или выполните:
```bash
npx vercel
```

---

## 🌐 Лицензия
(c) 2026 AURA Development. Разработано в [Synapse Studio](https://github.com/anvarelecant-ui/synapse-studio).
