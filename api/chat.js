const SYSTEM_PROMPT = `
Ты — главный финансовый советник и голосовой ИИ-консультант премиальной девелоперской компании AURA Development (AURA Intelligence).
Ты свободно владеешь тремя языками: Русским (Russian), Английским (English) и Узбекским (O'zbek tili).

КРИТИЧЕСКИ ВАЖНО:
1. ВСЕГДА отвечай на ТОМ ЖЕ ЯЗЫКЕ, на котором обратился клиент:
   - Если клиент обращается на УЗБЕКСКОМ — отвечай на чистом узбекском литературном языке (lotin yozuvida).
   - Если клиент обращается на АНГЛИЙСКОМ — отвечай на безупречном деловом английском.
   - Если на РУССКОМ — отвечай на благородном русском языке.
2. НИКОГДА не упоминай слова 'Gemini', 'Flash', 'OpenRouter' или сторонние бренды ИИ. Ты — собственная разработка AURA Intelligence.
3. НИКОГДА не отвечай шаблонно. СРАЗУ давай точный ответ на вопрос по существу.
4. Пиши текст живым, уверенным языком, удобным для восприятия на слух.

БАЗА ЗНАНИЙ:
• Skyline Aura Towers: 52 этажа, центр города, набережная. Цены от 28.5 млн ₽.
• Pinecrest Forest Villa: виллы в реликтовом сосновом бору, infinity-pool, спа. Готовы к заселению! Цены от 85 млн ₽.
• Lumen Imperial Club House: клубный дом на 24 резиденции с мариной для яхт. Цены от 54 млн ₽.
• Verde Valley Eco-Residences: эко-виллы LEED Platinum, от 42 млн ₽.
• The Vertex Penthouse Suite: пентхаусы 520–780 м², от 145 млн ₽.
• Финансы: Рассрочка 0% до 36 месяцев (взнос от 20%), субсидированная ипотека от 4.8%, эскроу-счета (ФЗ-214).
`;

const VOICE_CALL_SYSTEM_PROMPT = `
Ты — личный советник по недвижимости AURA Development в режиме ЖИВОГО ГОЛОСОВОГО ЗВОНКА (AURA Intelligence).
Отвечай СТРОГО на языке клиента (RU / EN / UZ).
Строго 1–3 естественных ёмких предложения (35–55 слов), без формул, без спецсимволов markdown. Задай один встречный вопрос в конце.
`;

function detectCard(text) {
  const t = (text || '').toLowerCase();
  let priceNum = 0;
  const match = text.match(/(\d[\d\s]{5,})\s*₽?/);
  if (match) {
    priceNum = parseInt(match[1].replace(/\s+/g, ''), 10) || 0;
  }

  if (priceNum >= 75000000 || /вилл|дом|коттедж|pinecrest|лес|villa|o'rmon/.test(t)) {
    return {
      id: 'pinecrest',
      title: 'Pinecrest Forest Villa',
      tag: 'В вашем бюджете • Сосновый бор',
      area: 'от 420 до 850 м²',
      price: 'от 85 000 000 ₽',
      image: 'assets/images/project_pinecrest.jpg'
    };
  } else if (priceNum >= 50000000 || /lumen|клубн|яхт|марин|пирс|набережн/.test(t)) {
    return {
      id: 'lumen',
      title: 'Lumen Imperial Club House',
      tag: 'Клубный дом • Первая линия',
      area: 'от 140 до 450 м²',
      price: 'от 54 000 000 ₽',
      image: 'assets/images/project_lumen.jpg'
    };
  } else if (/пентхаус|vertex|вертолет/.test(t)) {
    return {
      id: 'vertex',
      title: 'The Vertex Penthouse',
      tag: 'Exclusive Trophy Penthouse',
      area: '520 – 780 м²',
      price: 'от 145 000 000 ₽',
      image: 'assets/images/stage_04_facade.jpg'
    };
  } else if (priceNum > 0 || /skyline|жк|башн|многоэтаж|квартир|апартамент|рассчитай|платеж/.test(t)) {
    return {
      id: 'skyline',
      title: 'Skyline Aura Towers',
      tag: 'В вашем бюджете • Премиум ЖК',
      area: 'от 65 до 340 м²',
      price: 'от 28 500 000 ₽',
      image: 'assets/images/project_skyline.jpg'
    };
  }
  return null;
}

function getFallbackReply(query, mode = 'text', lang = 'ru') {
  const q = (query || '').toLowerCase();

  // UZBEK
  if (lang === 'uz' || /qancha|narxi|loyiha|bormi|salom|assalomu|villalar|uylar|qurilish|muddatli/.test(q)) {
    if (mode === 'voice_call') {
      if (/narx|qancha|qiymat|mablag/.test(q)) {
        return "Skyline Towers loyihamizda narxlar yigirma sakkiz yarim million rubldan, Pinecrest villalari esa sakson besh million rubldan boshlanadi. Qaysi loyiha sizga ma'qul?";
      }
      return "AURA Development nufuzli turar-joy majmualari va hashamatli villalar quradi. Skyline Towers binosi yoki Pinecrest villalari haqida gapirib beraymi?";
    }
    return "**AURA Development** premium toifadagi turar-joy majmualari va xususiy villalar loyihalarini taqdim etadi:\n\n• **Skyline Aura Towers** — 52 qavatli bino, narxlar **28 500 000 ₽** dan\n• **Pinecrest Forest Villa** — qarag'ayzor ichidagi tayyor villalar, **85 000 000 ₽** dan\n• **Lumen Imperial Club House** — xususiy yaxta marinasiga ega klub uyi, **54 000 000 ₽** dan\n\n**To'lov shartlari:** 36 oygacha 0% foizsiz muddatli to'lov yoki 4.8% imtiyozli ipoteka.";
  }

  // ENGLISH
  if (lang === 'en' || /price|cost|how much|hello|villa|apartment|tower|installment/.test(q)) {
    if (mode === 'voice_call') {
      if (/price|cost|how much/.test(q)) {
        return "Prices at Skyline Towers start from 28.5 million rubles, while our private Pinecrest Forest Villas start from 85 million. Which project aligns with your lifestyle?";
      }
      return "AURA Development builds flagship luxury residences and private forest villas. Shall I tell you more about Skyline Towers or Pinecrest Villas?";
    }
    return "**AURA Development** presents iconic luxury residences:\n\n• **Skyline Aura Towers** — 52-story landmark, from **28,500,000 ₽**\n• **Pinecrest Forest Villa** — turnkey estates in pine forest, from **85,000,000 ₽**\n• **Lumen Imperial Club House** — private yacht marina residences, from **54,000,000 ₽**\n\n**Financing:** 0% developer installment up to 36 months or subsidized mortgages from 4.8%.";
  }

  // RUSSIAN
  if (mode === 'voice_call') {
    if (/цен|стоим|сколько|прайс/.test(q)) {
      return "Цены в ЖК Skyline Towers начинаются от 28.5 миллионов рублей, а загородные виллы в бору Pinecrest — от 85 миллионов. Под какой бюджет подбираем резиденцию?";
    } else if (/рассрочк|ипотек|0%|ставка/.test(q)) {
      return "У нас действует рассрочка 0% до 36 месяцев без переплат от застройщика и субсидированная ипотека от 4.8%. Рассчитать персональный график платежей?";
    }
    return "Компания AURA строит флагманские жилые комплексы и премиальные виллы. Рассказать о башнях Skyline Towers или лесных резиденциях Pinecrest?";
  }

  if (/цен|стоим|сколько|прайс|бюджет/.test(q)) {
    return "Актуальный диапазон цен на резиденции **AURA Development**:\n\n• **ЖК Solstice Residences** — от **22 800 000 ₽** (от 55 м²)\n• **ЖК Skyline Aura Towers** — от **28 500 000 ₽** (от 65 до 340 м²)\n• **Эко-поселок Verde Valley** — от **42 000 000 ₽** (от 280 м²)\n• **Клубный дом Lumen Imperial** — от **54 000 000 ₽** (от 140 м²)\n• **Виллы в лесу Pinecrest** — от **85 000 000 ₽** (готовы к заселению!)\n• **Пентхаусы The Vertex** — от **145 000 000 ₽**\n\nДействует беспроцентная рассрочка 0% с первоначальным взносом от 20%.";
  }

  if (/рассрочк|ипотек|услови|кредит|процент/.test(q)) {
    return "Условия финансирования в **AURA Development**:\n\n1. **Беспроцентная рассрочка 0%** от застройщика до 36 месяцев. Первый взнос от 20%.\n2. **Субсидированная ипотека от 4.8%** годовых на весь период строительства.\n3. **100% безопасность** расчетов через государственные эскроу-счета (ФЗ-214).\n4. **Trade-In:** выкуп вашей текущей недвижимости в зачет новой резиденции.";
  }

  return "**AURA Development** реализует премиальные архитектурные доминанты:\n\n• **Skyline Aura Towers** — 52 этажа, панорамные сады и бассейн на 30 этаже\n• **Pinecrest Forest Villa** — готовые резиденции в сосновом бору с личным подогреваемым infinity-бассейном\n• **Lumen Imperial Club House** — клубный дом с собственной мариной для яхт\n\nРассрочка 0% до 36 месяцев без переплат. Какой объект вас интересует?";
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message = '', history = [], mode = 'text', lang = 'ru' } = req.body || {};
    const card = detectCard(message);

    const apiKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let activePrompt = mode === 'voice_call' ? VOICE_CALL_SYSTEM_PROMPT : SYSTEM_PROMPT;
    if (lang === 'uz') {
      activePrompt += "\n\nMUHIM: Foydalanuvchi O'ZBEK tilini tanlagan. Javobni faqat toza, samimiy va chiroyli o'zbek adabiy tilida bergin!";
    } else if (lang === 'en') {
      activePrompt += "\n\nCRITICAL: The user selected ENGLISH. Reply exclusively in fluent, high-end, elegant English.";
    }

    // Try OpenRouter if available
    if (apiKey) {
      try {
        const messages = [{ role: 'system', content: activePrompt }];
        for (const h of history.slice(-6)) {
          messages.push({
            role: h.sender === 'bot' ? 'assistant' : 'user',
            content: h.text || ''
          });
        }
        messages.push({ role: 'user', content: message });

        const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages,
            temperature: mode === 'voice_call' ? 0.6 : 0.5,
            max_tokens: 1500
          })
        });

        if (openRouterRes.ok) {
          const data = await openRouterRes.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return res.status(200).json({ reply, card });
          }
        }
      } catch (e) {
        console.error('OpenRouter error, fallback to rule engine:', e);
      }
    }

    const fallbackReply = getFallbackReply(message, mode, lang);
    return res.status(200).json({ reply: fallbackReply, card });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message });
  }
}
