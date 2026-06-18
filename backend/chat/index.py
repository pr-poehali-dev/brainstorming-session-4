import json
import os
import urllib.request
import urllib.error


def handler(event: dict, context) -> dict:
    """Чат с нейросетью Byashik: принимает вопрос пользователя и возвращает ответ от AI."""
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
        }

    body_data = json.loads(event.get('body', '{}') or '{}')
    messages = body_data.get('messages', [])
    user_message = body_data.get('message', '')

    if not messages and user_message:
        messages = [{'role': 'user', 'content': user_message}]

    if not messages:
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Пустой запрос'}),
        }

    api_key = os.environ.get('OPENAI_API_KEY', '')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'API ключ не настроен'}),
        }

    system_prompt = {
        'role': 'system',
        'content': 'Ты — Byashik, дружелюбный и умный AI-ассистент. Отвечай ясно, полезно и по делу на русском языке.',
    }

    payload = {
        'model': 'meta-llama/llama-3.3-70b-instruct:free',
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

    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            answer = result['choices'][0]['message']['content']
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"OpenRouter HTTP error {e.code}: {error_body}")
        return {
            'statusCode': 502,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Ошибка нейросети', 'details': error_body}),
        }
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
        }

    return {
        'statusCode': 200,
        'headers': {**cors_headers, 'Content-Type': 'application/json'},
        'body': json.dumps({'reply': answer}, ensure_ascii=False),
    }