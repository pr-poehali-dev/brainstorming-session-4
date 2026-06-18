import json
import os
import urllib.request
import urllib.error


def tg_send(token: str, chat_id: int, text: str):
    """Отправить сообщение в Telegram."""
    payload = {'chat_id': chat_id, 'text': text, 'parse_mode': 'Markdown'}
    req = urllib.request.Request(
        f'https://api.telegram.org/bot{token}/sendMessage',
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read())


def ask_ai(messages: list, api_key: str) -> str:
    """Отправить запрос к нейросети OpenRouter."""
    system_prompt = {
        'role': 'system',
        'content': 'Ты — Byashik, дружелюбный и умный AI-ассистент. Отвечай ясно, полезно и по делу на русском языке.',
    }
    payload = {
        'model': 'nousresearch/hermes-3-llama-3.1-405b:free',
        'messages': [system_prompt] + messages,
        'temperature': 0.7,
    }
    req = urllib.request.Request(
        'https://openrouter.ai/api/v1/chat/completions',
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
        },
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=25) as r:
        result = json.loads(r.read().decode('utf-8'))
        return result['choices'][0]['message']['content']


def handler(event: dict, context) -> dict:
    """Webhook для Telegram бота Byashik — получает сообщения и отвечает через нейросеть."""
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    api_key = os.environ.get('OPENAI_API_KEY', '')

    body = json.loads(event.get('body', '{}') or '{}')
    message = body.get('message', {})
    chat_id = message.get('chat', {}).get('id')
    text = message.get('text', '')

    if not chat_id or not text:
        return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps({'ok': True})}

    if text == '/start':
        tg_send(token, chat_id, '👋 Привет! Я *Byashik* — умный AI-ассистент. Задайте мне любой вопрос!')
        return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps({'ok': True})}

    try:
        reply = ask_ai([{'role': 'user', 'content': text}], api_key)
        tg_send(token, chat_id, reply)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"AI error {e.code}: {error_body}")
        tg_send(token, chat_id, 'Извините, нейросеть сейчас перегружена. Попробуйте через минуту.')
    except Exception as e:
        print(f"Error: {e}")
        tg_send(token, chat_id, 'Что-то пошло не так. Попробуйте ещё раз.')

    return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps({'ok': True})}
