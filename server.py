import os
import json
import re
import base64
import asyncio
import urllib.request
import urllib.error
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

try:
    import edge_tts
    HAS_EDGE_TTS = True
except ImportError:
    HAS_EDGE_TTS = False

VOICE_CONFIG = {
    'uz': ('uz-UZ-MadinaNeural', '-4%'),
    'ru': ('ru-RU-SvetlanaNeural', '-4%'),
    'en': ('en-US-AvaNeural', '-4%')
}

def generate_neural_audio_base64(text, lang='ru'):
    if not HAS_EDGE_TTS or not text:
        return None
    try:
        voice, rate = VOICE_CONFIG.get(lang, VOICE_CONFIG['ru'])
        clean = re.sub(r'[*#_`•«»]', '', text)
        clean = re.sub(r'\s{2,}', ' ', clean).strip()
        if not clean:
            return None
        
        async def _synth():
            comm = edge_tts.Communicate(clean, voice, rate=rate)
            audio_bytes = bytearray()
            async for chunk in comm.stream():
                if chunk['type'] == 'audio':
                    audio_bytes.extend(chunk['data'])
            return base64.b64encode(audio_bytes).decode('utf-8')
            
        b64 = asyncio.run(_synth())
        return f"data:audio/mp3;base64,{b64}"
    except Exception as e:
        print("Neural TTS error:", e)
        return None

PORT = 8088
DIR = os.path.dirname(os.path.abspath(__file__))

# Load OpenRouter API Key from Credentials.env
def get_api_keys():
    cred_paths = [
        os.path.join(DIR, '..', 'Agents', 'Credentials.env'),
        os.path.join(DIR, '..', 'Credentials.env'),
        os.path.join(DIR, 'Credentials.env')
    ]
    openrouter_key = os.environ.get('OPENROUTER_API_KEY')
    gemini_key = os.environ.get('GEMINI_API_KEY')

    for cp in cred_paths:
        if os.path.exists(cp):
            with open(cp, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.startswith('OPENROUTER_API_KEY=') and not openrouter_key:
                        openrouter_key = line.split('=', 1)[1].strip().strip('"').strip("'")
                    elif line.startswith('GEMINI_API_KEY=') and not gemini_key:
                        gemini_key = line.split('=', 1)[1].strip().strip('"').strip("'")
    return openrouter_key, gemini_key

OPENROUTER_API_KEY, GEMINI_API_KEY = get_api_keys()

SYSTEM_PROMPT = """
Ты — главный финансовый советник и голосовой ИИ-консультант премиальной девелоперской компании AURA Development (AURA Intelligence).
Ты свободно владеешь тремя языками: Русским (Russian), Английским (English) и Узбекским (O'zbek tili).

КРИТИЧЕСКИ ВАЖНО:
1. ВСЕГДА отвечай на ТОМ ЖЕ ЯЗЫКЕ, на котором обратился клиент:
   - Если клиент обращается на УЗБЕКСКОМ (O'zbek tili: "salom", "qancha", "narxi", "loyihalar", "bo'lib to'lash", "assalomu alaykum" va h.k.) — отвечай на чистом, красивом узбекском литературном языке (lotin yozuvida).
   - Если клиент обращается на АНГЛИЙСКОМ (English) — отвечай на безупречном деловом английском.
   - Если на РУССКОМ — отвечай на благородном, статучном русском языке.
2. НИКОГДА не упоминай слова 'Gemini', 'Flash', 'OpenRouter' или сторонние бренды ИИ. Ты — собственная разработка AURA Intelligence.
3. НИКОГДА не отвечай шаблонно ("я робот", "чем помочь"). СРАЗУ давай точный ответ на вопрос по существу.
4. Пиши текст живым, уверенным языком, удобным для восприятия на слух, без формул.

БАЗА ЗНАНИЙ AURA DEVELOPMENT:
1. Объекты:
   • Skyline Aura Towers — 52 этажа, центр города, набережная. Панорамные сады на высоте 110 м, бассейн на 30 этаже, 3-уровневый подземный паркинг. Площади 65–340 м², потолки 3.65–4.8 м. Сдача: IV кв. 2026. Цены от 28.5 млн ₽.
   • Pinecrest Forest Villa — коллекция модернистских вилл в реликтовом сосновом бору (18 км от города). Участки 25–60 соток, площади вилл 420–850 м², персональный infinity-pool с подогревом, спа-комплекс (сауна, хаммам), каминный зал, гараж на 4 авто. СДАНЫ, готовы к заселению! Цены от 85 млн ₽ до 120 млн ₽.
   • Lumen Imperial Club House — ультра-камерный клубный дом всего на 24 резиденции на первой береговой линии с персональной мариной и причалом для яхт. Облицовка римским травертином и латунью, консьерж 24/7, потолки 4.0 м. Площади 140–450 м². Сдача: II кв. 2026. Цены от 54 млн ₽.
   • Verde Valley Eco-Residences — поселок авторских двухэтажных эко-вилл LEED Platinum с зелеными эксплуатируемыми крышами, солнечными батареями. Площади 280–510 м², цены от 42 млн ₽.
   • The Vertex Penthouse Suite — эксклюзивные двухуровневые пентхаусы (50–52 этажи Skyline Towers), площадь 520–780 м², потолки 6.5 м (второй свет), круговая терраса 360° с подогревом и джакузи, вертолетная площадка. Цены от 145 млн ₽.
   • Solstice Residences — жилой комплекс (34 этажа), площади 55–220 м², старт продаж, цены от 22.8 млн ₽.

2. Финансовые программы:
   • Беспроцентная рассрочка 0% (0% foizsiz bo'lib to'lash / 0% interest installment) от застройщика до 36 месяцев: первый взнос от 20%, равные платежи, переплата 0 ₽.
   • Субсидированная ипотека от 4.8% годовых (Сбербанк, ВТБ, Альфа-Банк).
   • 100% гарантия по ФЗ-214 через государственные эскроу-счета (eskrou kafolati).
   • Trade-In элитного жилья с зачетом до 100% стоимости.
   • Индивидуальная скидка до 5–7% при 100% оплате.

3. Инженерия и сервис:
   • Монолитный каркас B35 W8, сейсмостойкость до 9 баллов (150+ лет службы).
   • Бельгийские панорамные фасадные порталы Reynaers Hi-Finity и Schüco с триплексом 42 мм и Low-E защитой.
   • Шумоизоляция 62 дБ ("плавающий пол" на базальтовых плитах — тишина студии звукозаписи).
   • Приточный микроклимат Daikin с медицинской фильтрацией воздуха HEPA H13 (99.97% очистки).
   • Офис: Москва-Сити, Башня «Федерация Восток», 48 этаж. VIP-телефон: +7 (495) 820-00-11.
"""

VOICE_CALL_SYSTEM_PROMPT = """
Ты — личный советник по недвижимости и главный архитектор девелоперской компании AURA Development в режиме ЖИВОГО ГОЛОСОВОГО ЗВОНКА (AURA Intelligence).
Клиент говорит с тобой голосом в реальном времени.

МУЛЬТИЯЗЫЧНОСТЬ (РУССКИЙ, ENGLISH, O'ZBEK TILI):
1. Отвечай СТРОГО на том языке, на котором обратился клиент или который выбран в параметре:
   - O'ZBEK TILI: agar mijoz o'zbekcha gapirsa yoki savol bersa, javobni faqat toza, samimiy va chiroyli o'zbek adabiy tilida bergin! (Masalan: "Skyline Towers loyihamizda narxlar 28.5 million rubldan boshlanadi. 36 oygacha foizsiz bo'lib to'lash imkoni mavjud.").
   - ENGLISH: If the client speaks or asks in English, reply in polite, fluent, high-end British/American English.
   - РУССКИЙ: Если клиент говорит по-русски, отвечай на чистом, благородном русском языке.
2. НИКАКОГО УПОМИНАНИЯ СТОРОННИХ БРЕНДОВ ИИ: никогда не говори 'Gemini', 'Flash', 'OpenRouter' и т.д. Ты — интеллектуальная система AURA Development.
3. ДЛИНА ОТВЕТА В ЗВОНКЕ: строго 1–3 естественных ёмких предложения (35–55 слов), без длинных монологов, чтобы собеседнику было приятно слушать.
4. НИКАКОГО MARKDOWN В РЕЧИ: запрещены звездочки **, знаки #, формулы, тире-списки. Только чистая живая разговорная речь!
5. Задавай в конце реплики один естественный встречный вопрос, чтобы поддерживать живой разговор.

ЗНАНИЯ ОБ ОБЪЕКТАХ:
- Skyline Aura Towers: 52 qavatli osmono'par bino (52 этажа), shahar markazi va daryo bo'yi, narxi 28.5 mln rubldan.
- Pinecrest Forest Villa: qarag'ay o'rmonidagi hashamatli tayyor villalar (виллы в реликтовом бору), xususiy isitiladigan basseyn va spa, 85 mln rubldan.
- Lumen Imperial: yaxta marinasi bo'lgan klub uyi (клубный дом с мариной на 24 резиденции), 54 mln rubldan.
- To'lov shartlari (Условия): 36 oygacha 0% foizsiz bo'lib to'lash (рассрочка 0% до 36 мес), 4.8% ipoteka, 100% eskrou kafolati (эскроу-счета).
- Sifat (Качество): B35 monolit karkas, 9 ballik seysmik chidamlilik, Belgiyaning Reynaers oynalari, 62 dB shovqin izolyatsiyasi.
"""

class AuraRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def end_headers(self):
        # Prevent browser caching of development code
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(post_data)
                user_msg = data.get('message', '').strip()
                history = data.get('history', [])
                mode = data.get('mode', 'text')
                lang = data.get('lang', 'ru')
                
                response_text = self.generate_llm_response(user_msg, history, mode, lang)
                card = self.detect_relevant_card(user_msg)
                
                audio_b64 = None
                if mode == 'voice_call':
                    audio_b64 = generate_neural_audio_base64(response_text, lang)
                
                resp = json.dumps({'reply': response_text, 'card': card, 'audio': audio_b64}, ensure_ascii=False)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(resp.encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
            return
        
        self.send_error(404, "Endpoint not found")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def generate_llm_response(self, user_msg, history, mode='text', lang='ru'):
        active_prompt = VOICE_CALL_SYSTEM_PROMPT if mode == 'voice_call' else SYSTEM_PROMPT
        if lang == 'uz':
            active_prompt += "\n\nMUHIM QOIDA: Foydalanuvchi O'ZBEK tilini tanlagan. Javobni faqat toza, samimiy va chiroyli o'zbek adabiy tilida (lotin alifbosida) bergin!"
        elif lang == 'en':
            active_prompt += "\n\nCRITICAL INSTRUCTION: The user selected ENGLISH. You must reply exclusively in fluent, high-end, elegant English."
        else:
            active_prompt += "\n\nИНСТРУКЦИЯ: Отвечай на чистом, благородном русском языке."

        # 1. Попытка через Google AI Studio Direct API (если задан GEMINI_API_KEY)
        if GEMINI_API_KEY:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
                prompt_text = active_prompt + "\n\n"
                for h in history[-4:]:
                    role = "Клиент" if h.get('sender') == 'user' else "ИИ-Консультант"
                    prompt_text += f"{role}: {h.get('text', '')}\n"
                prompt_text += f"Клиент: {user_msg}\nИИ-Консультант:"

                payload = {
                    "contents": [{"parts": [{"text": prompt_text}]}],
                    "generationConfig": {
                        "temperature": 0.6 if mode == 'voice_call' else 0.5,
                        "maxOutputTokens": 1500
                    }
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode('utf-8'),
                    headers={'Content-Type': 'application/json'}
                )
                with urllib.request.urlopen(req, timeout=12) as response:
                    res_data = json.loads(response.read().decode('utf-8'))
                    return res_data['candidates'][0]['content']['parts'][0]['text']
            except Exception as g_err:
                print("Direct Gemini API error, falling back to OpenRouter Gemini Flash:", g_err)

        # 2. Подключение через OpenRouter Google Gemini Flash (google/gemini-3.8-flash)
        if OPENROUTER_API_KEY:
            messages = [{'role': 'system', 'content': active_prompt}]
            for h in history[-6:]:
                role = 'assistant' if h.get('sender') == 'bot' else 'user'
                messages.append({'role': role, 'content': h.get('text', '')})
            messages.append({'role': 'user', 'content': user_msg})

            payload = {
                'model': 'google/gemini-3.8-flash',
                'messages': messages,
                'temperature': 0.6 if mode == 'voice_call' else 0.5,
                'max_tokens': 1500
            }

            req = urllib.request.Request(
                'https://openrouter.ai/api/v1/chat/completions',
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                    'Content-Type': 'application/json'
                }
            )

            try:
                with urllib.request.urlopen(req, timeout=25) as response:
                    res_data = json.loads(response.read().decode('utf-8'))
                    content = res_data['choices'][0]['message'].get('content')
                    if content:
                        return content
            except Exception as err:
                print("OpenRouter Gemini Flash error, falling back to local engine:", err)

        return self.fallback_rule_engine(user_msg, mode, lang)

    def detect_relevant_card(self, text):
        t = text.lower()
        price_num = 0
        price_match = re.search(r'(\d[\d\s]{5,})\s*₽?', text)
        if price_match:
            try:
                price_num = int(price_match.group(1).replace(' ', ''))
            except:
                pass

        if price_num >= 75000000 or any(w in t for w in ['вилл', 'дом', 'коттедж', 'pinecrest', 'лес', 'villa', 'o\'rmon']):
            return {
                'id': 'pinecrest',
                'title': 'Pinecrest Forest Villa',
                'tag': 'В вашем бюджете • Сосновый бор',
                'area': 'от 420 до 850 м²',
                'price': 'от 85 000 000 ₽',
                'image': 'assets/images/project_pinecrest.jpg'
            }
        elif price_num >= 50000000 or any(w in t for w in ['lumen', 'клубн', 'яхт', 'марин', 'пирс', 'набережн']):
            return {
                'id': 'lumen',
                'title': 'Lumen Imperial Club House',
                'tag': 'Клубный дом • Первая линия',
                'area': 'от 140 до 450 м²',
                'price': 'от 54 000 000 ₽',
                'image': 'assets/images/project_lumen.jpg'
            }
        elif any(w in t for w in ['пентхаус', 'vertex', 'вертолет']):
            return {
                'id': 'vertex',
                'title': 'The Vertex Penthouse',
                'tag': 'Exclusive Trophy Penthouse',
                'area': '520 – 780 м²',
                'price': 'от 145 000 000 ₽',
                'image': 'assets/images/stage_04_facade.jpg'
            }
        elif price_num > 0 or any(w in t for w in ['skyline', 'жк', 'башн', 'многоэтаж', 'квартир', 'апартамент', 'рассчитай', 'платеж']):
            return {
                'id': 'skyline',
                'title': 'Skyline Aura Towers',
                'tag': 'В вашем бюджете • Премиум ЖК',
                'area': 'от 65 до 340 м²',
                'price': 'от 28 500 000 ₽',
                'image': 'assets/images/project_skyline.jpg'
            }
        return None

    def fallback_rule_engine(self, query, mode='text', lang='ru'):
        q = query.lower()

        # Uzbek fallback
        if lang == 'uz' or any(w in q for w in ['qancha', 'narxi', 'loyiha', 'bormi', 'salom', 'assalomu', 'villalar', 'uylar', 'qurilish', 'muddatli']):
            if mode == 'voice_call':
                if any(w in q for w in ['narx', 'qancha', 'qiymat', 'mablag']):
                    return "Skyline Towers loyihamizda narxlar yigirma sakkiz yarim million rubldan, Pinecrest villalari esa sakson besh million rubldan boshlanadi. Qaysi loyiha sizga ma'qul?"
                elif any(w in q for w in ['villa', 'o\'rmon', 'qarag\'ay', 'hovuz', 'basseyn']):
                    return "Pinecrest villalari qarag'ay o'rmonida joylashgan bo'lib, o'zining isitiladigan basseyni va spa-kompleksiga ega. Uylar to'liq tayyor. Ko'rish uchun ro'yxatdan o'tmoqchimisiz?"
                elif any(w in q for w in ['skyline', 'bino', 'osmono\'par', 'qavat']):
                    return "Skyline Towers — ellik ikki qavatli zamonaviy osmono'par bino bo'lib, o'ttizinchi qavatida panoramali basseyn joylashgan. Rejalashtirish chizmalarini ko'rsataymi?"
                elif any(w in q for w in ['bo\'lib', 'tolov', 'muddatli', 'foizsiz', 'ipoteka']):
                    return "Bizda 36 oygacha 0 foizli foizsiz muddatli to'lov va 4.8 foizli imtiyozli ipoteka mavjud. Shaxsiy to'lov jadvalini hisoblab beraymi?"
                else:
                    return "AURA Development nufuzli turar-joy majmualari va hashamatli villalar quradi. Skyline Towers binosi yoki Pinecrest villalari haqida gapirib beraymi?"
            else:
                return (
                    "**AURA Development** premium toifadagi turar-joy majmualari va xususiy villalar loyihalarini taqdim etadi:\n\n"
                    "• **Skyline Aura Towers** — 52 qavatli bino, narxlar **28 500 000 ₽** dan\n"
                    "• **Pinecrest Forest Villa** — qarag'ayzor ichidagi tayyor villalar, **85 000 000 ₽** dan\n"
                    "• **Lumen Imperial Club House** — xususiy yaxta marinasiga ega klub uyi, **54 000 000 ₽** dan\n\n"
                    "**To'lov shartlari:** 36 oygacha 0% foizsiz muddatli to'lov (boshlang'ich to'lov 20% dan) yoki 4.8% ipoteka."
                )

        # English fallback
        if lang == 'en' or any(w in q for w in ['price', 'cost', 'how much', 'hello', 'villa', 'apartment', 'tower', 'installment']):
            if mode == 'voice_call':
                if any(w in q for w in ['price', 'cost', 'how much']):
                    return "Prices at Skyline Towers start from 28.5 million rubles, while our private Pinecrest Forest Villas start from 85 million. Which project aligns with your lifestyle?"
                elif any(w in q for w in ['villa', 'pinecrest', 'forest', 'pool']):
                    return "Pinecrest Villas are located in a pristine pine forest, featuring private heated infinity pools and spas. The residences are completed and ready for move-in. Would you like to schedule a private visit?"
                elif any(w in q for w in ['skyline', 'tower', 'apartment']):
                    return "Skyline Towers is a 52-story architectural landmark featuring sky gardens and a 30th-floor pool. Would you like to explore available floor plans?"
                elif any(w in q for w in ['installment', 'mortgage', 'rate', 'payment']):
                    return "We offer a zero percent interest developer installment plan for up to 36 months, as well as subsidized mortgages from 4.8 percent. Would you like a personalized calculation?"
                else:
                    return "AURA Development builds flagship luxury residences and private forest villas. Shall I tell you more about Skyline Towers or Pinecrest Villas?"
            else:
                return (
                    "**AURA Development** presents iconic luxury residences:\n\n"
                    "• **Skyline Aura Towers** — 52-story landmark, from **28,500,000 ₽**\n"
                    "• **Pinecrest Forest Villa** — turnkey estates in pine forest, from **85,000,000 ₽**\n"
                    "• **Lumen Imperial Club House** — private yacht marina residences, from **54,000,000 ₽**\n\n"
                    "**Financing:** 0% developer installment up to 36 months or subsidized mortgages from 4.8%."
                )

        # Russian fallback
        if mode == 'voice_call':
            if any(w in q for w in ['цен', 'стоим', 'сколько', 'прайс']):
                return "Цены в ЖК Skyline Towers начинаются от 28.5 миллионов рублей, а загородные виллы в бору Pinecrest — от 85 миллионов. Под какой бюджет подбираем резиденцию?"
            elif any(w in q for w in ['вилл', 'дом', 'pinecrest', 'лес', 'бассейн']):
                return "Виллы Pinecrest расположены в реликтовом бору, площадь от 420 метров, с персональным бассейном и спа. Дома уже сданы. Хотите записаться на просмотр?"
            elif any(w in q for w in ['skyline', 'жк', 'башн', 'квартир']):
                return "Skyline Towers — это 52 этажа на набережной с панорамными садами и бассейном на 30 этаже. Сдача в 2026 году. Показать вам планировки?"
            elif any(w in q for w in ['рассрочк', 'ипотек', '0%', 'ставка']):
                return "У нас действует рассрочка 0% до 36 месяцев без переплат от застройщика и субсидированная ипотека от 4.8%. Рассчитать персональный график платежей?"
            else:
                return "Компания AURA строит флагманские жилые комплексы и премиальные виллы. Рассказать о башнях Skyline Towers или лесных резиденциях Pinecrest?"

        # Анализ прямого расчета из калькулятора
        if any(w in q for w in ['рассчитай покупку', 'ежемесячный платеж', 'первым взносом', 'сумму займа']):
            price_match = re.search(r'за\s+([\d\s]+)\s*₽', query)
            dp_match = re.search(r'взносом\s+([\d]+)%', query)
            payment_match = re.search(r'около\s+([\d\s]+)\s*₽', query)
            
            price_str = price_match.group(1).strip() if price_match else "100 000 000"
            dp_str = dp_match.group(1).strip() if dp_match else "15"
            payment_str = payment_match.group(1).strip() if payment_match else "551 614"

            return (
                f"### Финансовый аудит вашего расчета:\n\n"
                f"• **Стоимость резиденции:** **{price_str} ₽**\n"
                f"• **Первоначальный взнос ({dp_str}%):** ~**{int(int(price_str.replace(' ', '')) * int(dp_str) / 100):,} ₽**\n".replace(',', ' ') +
                f"• **Ежемесячный платеж по субсидированной ипотеке (4.8%):** **{payment_str} ₽/мес**\n"
                f"• **Необходимый подтвержденный доход:** от **890 000 ₽/мес**\n\n"
                f"### Какой объект идеально подходит под этот бюджет:\n"
                f"В бюджете около {price_str} ₽ нашим флагманским предложением является **Pinecrest Forest Villa** "
                f"(авторская вилла 560 м² в реликтовом сосновом бору с подогреваемым infinity-бассейном, участком 35 соток и спа-комплексом. Дом сдан и готов к заселению!). Либо эксклюзивный пентхаус на верхних этажах башни **Skyline Towers**.\n\n"
                f"### Альтернатива — Беспроцентная рассрочка 0% от застройщика:\n"
                f"Если вы не хотите привлекать банковский кредит, мы можем предложить **рассрочку 0% до 36 месяцев**: "
                f"первый взнос от 20%, остаток равными траншами без процентов и переплат банку.\n\n"
                f"Зафиксировать данный расчет и записаться на закрытую презентацию?"
            )

        if any(w in q for w in ['цен', 'стоим', 'сколько', 'прайс', 'бюджет']):
            return (
                "Актуальный диапазон цен на резиденции **AURA Development**:\n\n"
                "• **ЖК Solstice Residences** — от **22 800 000 ₽** (от 55 м²)\n"
                "• **ЖК Skyline Aura Towers** — от **28 500 000 ₽** (от 65 до 340 м²)\n"
                "• **Эко-поселок Verde Valley** — от **42 000 000 ₽** (от 280 м²)\n"
                "• **Клубный дом Lumen Imperial** — от **54 000 000 ₽** (от 140 м²)\n"
                "• **Виллы в лесу Pinecrest** — от **85 000 000 ₽** (готовы к заселению, 420–850 м²)\n"
                "• **Пентхаусы The Vertex** — от **145 000 000 ₽** (от 520 м²)\n\n"
                "Действует беспроцентная рассрочка 0% с первоначальным взносом от 20%."
            )
        elif any(w in q for w in ['рассрочк', 'ипотек', 'услови', 'кредит', 'процент']):
            return (
                "Условия финансирования в **AURA Development**:\n\n"
                "1. **Беспроцентная рассрочка 0%** от застройщика на срок до **36 месяцев**. Первый взнос от 20%, переплата 0%.\n"
                "2. **Субсидированная ипотека от 4.8%** годовых на весь период строительства от Сбербанка, ВТБ и Альфа-Банка.\n"
                "3. **100% безопасность расчетов** через государственные эскроу-счета (ФЗ-214).\n"
                "4. **Trade-In:** выкуп вашей текущей недвижимости в зачет новой резиденции."
            )
        elif any(w in q for w in ['компани', 'застройщик', 'надежн', 'кто вы', 'гаранти']):
            return (
                "**AURA Development** — девелоперская группа высшей категории надежности:\n\n"
                "• **18+ лет** успешной работы на рынке\n"
                "• **1 450 000 м²** реализованного и сданного жилья\n"
                "• **100% объектов** введены в эксплуатацию строго по графику\n"
                "• **24 международные архитектурные премии** (WAF, European Property Awards)\n"
                "• Все объекты аккредитованы ведущими банками и строятся с контролем BIM LOD 500."
            )
        elif any(w in q for w in ['материал', 'технолог', 'остеклен', 'шум', 'окн', 'бетон']):
            return (
                "Инженерные стандарты **AURA Development**:\n\n"
                "• **Монолитный каркас B35 W8** — расчетная сейсмостойкость до 9 баллов, срок службы свыше 150 лет.\n"
                "• **Остекление Reynaers Hi-Finity (Бельгия)** — панорамные раздвижные порталы с триплексом 42 мм и Low-E напылением.\n"
                "• **Шумоизоляция 62 дБ** — акустический плавающий пол на базальтовой плите (уровень студии звукозаписи).\n"
                "• **Климат Daikin VRV с фильтрацией HEPA H13** — очистка 99.97% пыли, аллергенов и смога."
            )
        else:
            return (
                "В портфолио **AURA Development** представлены жилые комплексы в центре (*Skyline Towers*), "
                "камерные клубные дома с яхтенной мариной (*Lumen Imperial*) и приватные виллы в реликтовом лесу (*Pinecrest*).\n\n"
                "Цены начинаются от **22.8 млн ₽** в жилых комплексах и от **85 млн ₽** за готовые виллы с бассейном. "
                "Доступна **рассрочка 0%** до 36 месяцев и субсидированная ипотека от **4.8%**.\n\n"
                "Какой тип недвижимости вас интересует: высотный комплекс, клубный дом или загородная вилла?"
            )

def run():
    server_address = ('', PORT)
    httpd = ThreadingHTTPServer(server_address, AuraRequestHandler)
    print(f"AURA Server running on http://localhost:{PORT}")
    try:
        while True:
            try:
                httpd.serve_forever()
            except Exception as ex:
                print("Server worker notice:", ex)
    except (KeyboardInterrupt, SystemExit):
        print("AURA Server stopped.")
    finally:
        try:
            httpd.server_close()
        except Exception:
            pass

if __name__ == '__main__':
    run()
