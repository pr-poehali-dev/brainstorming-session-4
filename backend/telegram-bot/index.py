import json
import os
import urllib.request
import urllib.error


def send_telegram_message(bot_token: str, chat_id: int, text: str):
    """Отправляет сообщение в Telegram."""
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = json.dumps({"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}).encode()
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())


def ask_ai(api_key: str, messages: list) -> str:
    """Запрашивает ответ у нейросети через OpenRouter."""
    system_prompt = {
        "role": "system",
        "content": "Ты — Byashik, дружелюбный и умный AI-ассистент. Отвечай ясно, полезно и по делу на русском языке.",
    }
    payload = json.dumps({
        "model": "nousresearch/hermes-3-llama-3.1-405b:free",
        "messages": [system_prompt] + messages,
        "temperature": 0.7,
    }).encode()

    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=payload,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=25) as resp:
        result = json.loads(resp.read())
        return result["choices"][0]["message"]["content"]


def handler(event: dict, context) -> dict:
    """Telegram webhook для бота Byashik: получает сообщения и отвечает через нейросеть."""
    cors_headers = {"Access-Control-Allow-Origin": "*"}

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    api_key = os.environ.get("OPENAI_API_KEY", "")

    if not bot_token:
        return {"statusCode": 500, "headers": cors_headers, "body": json.dumps({"error": "Bot token missing"})}

    body = json.loads(event.get("body", "{}") or "{}")
    message = body.get("message", {})

    if not message:
        return {"statusCode": 200, "headers": cors_headers, "body": "ok"}

    chat_id = message.get("chat", {}).get("id")
    user_text = message.get("text", "").strip()
    first_name = message.get("from", {}).get("first_name", "")

    if not chat_id or not user_text:
        return {"statusCode": 200, "headers": cors_headers, "body": "ok"}

    if user_text == "/start":
        send_telegram_message(bot_token, chat_id, f"Привет, {first_name}! 👋 Я *Byashik* — твой умный AI-ассистент.\n\nПросто напиши мне что-нибудь, и я отвечу!")
        return {"statusCode": 200, "headers": cors_headers, "body": "ok"}

    if not api_key:
        send_telegram_message(bot_token, chat_id, "Нейросеть временно недоступна. Попробуйте позже.")
        return {"statusCode": 200, "headers": cors_headers, "body": "ok"}

    try:
        reply = ask_ai(api_key, [{"role": "user", "content": user_text}])
        send_telegram_message(bot_token, chat_id, reply)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"AI error {e.code}: {error_body}")
        send_telegram_message(bot_token, chat_id, "Нейросеть сейчас перегружена, попробуйте через минуту.")
    except Exception as e:
        print(f"Error: {e}")
        send_telegram_message(bot_token, chat_id, "Что-то пошло не так. Попробуйте ещё раз.")

    return {"statusCode": 200, "headers": cors_headers, "body": "ok"}
