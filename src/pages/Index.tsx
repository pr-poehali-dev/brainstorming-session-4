import { useState, useRef, useEffect } from "react"
import Icon from "@/components/ui/icon"
import { Button } from "@/components/ui/button"

const CHAT_URL = "https://functions.poehali.dev/e339e526-58a9-42d4-a156-0f3fca2920d9"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface FAQ {
  question: string
  answer: string
}

const Index = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const scrollToChat = () => chatRef.current?.scrollIntoView({ behavior: "smooth" })

  const sendMessage = async (text?: string) => {
    const messageText = (text ?? input).trim()
    if (!messageText || loading) return

    const newMessages: Message[] = [...messages, { role: "user", content: messageText }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }])
      } else {
        setMessages([...newMessages, { role: "assistant", content: "Упс, что-то пошло не так. Попробуйте ещё раз." }])
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Не удалось связаться с нейросетью. Попробуйте позже." }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    "Напиши план поста для Instagram",
    "Объясни квантовую физику простыми словами",
    "Придумай идею для подарка на день рождения",
    "Помоги составить резюме",
  ]

  const features = [
    { icon: "Zap", title: "Мгновенные ответы", text: "Получайте развёрнутые ответы за секунды на любой вопрос." },
    { icon: "Brain", title: "Умная нейросеть", text: "Современная AI-модель понимает контекст и нюансы." },
    { icon: "MessageSquare", title: "Живой диалог", text: "Общайтесь естественно — Byashik помнит ход беседы." },
    { icon: "Globe", title: "Любые темы", text: "Код, тексты, идеи, переводы, обучение — всё в одном месте." },
  ]

  const faqs: FAQ[] = [
    {
      question: "Что умеет Byashik?",
      answer:
        "Byashik отвечает на вопросы, помогает писать тексты и код, объясняет сложные темы простыми словами, придумывает идеи, переводит и многое другое. Просто спросите — и получите ответ.",
    },
    {
      question: "Нужна ли регистрация?",
      answer:
        "Нет, начать общение можно прямо сейчас. Просто напишите свой вопрос в чат на этой странице и получите ответ от нейросети.",
    },
    {
      question: "На каком языке отвечает ассистент?",
      answer:
        "Byashik свободно общается на русском языке и понимает запросы любой сложности. Он адаптирует ответы под ваш стиль общения.",
    },
    {
      question: "Безопасны ли мои данные?",
      answer:
        "Мы заботимся о конфиденциальности. Ваши сообщения используются только для генерации ответа и не передаются третьим лицам в рекламных целях.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0B0F12] text-white">
      {/* Hero Section */}
      <div className="relative min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://cdn.poehali.dev/projects/131b9c83-1f29-432a-aaa4-839b142111be/files/4e3a814e-0bdc-4d24-abd2-94191e4b7b7c.jpg)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-[#0B0F12]" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between p-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/40 ring-1 ring-white/20 backdrop-blur rounded-full">
            <Icon name="Sparkles" className="w-5 h-5 text-purple-400" />
            <span className="font-semibold tracking-wide">Byashik</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {["Возможности", "Чат", "Вопросы"].map((item) => (
              <a
                key={item}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (item === "Чат") scrollToChat()
                }}
                className="px-4 py-2 bg-black/40 ring-1 ring-white/20 backdrop-blur rounded-full hover:bg-black/50 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={scrollToChat}
              className="bg-white text-black hover:bg-white/90 rounded-full px-6"
            >
              Начать
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 text-center">
          <div className="mb-6 px-4 py-2 bg-black/40 ring-1 ring-white/20 backdrop-blur rounded-full flex items-center gap-2">
            <Icon name="Bot" className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium">AI-ассистент нового поколения</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-light tracking-tight mb-6 text-balance">
            Спросите что угодно.
          </h1>

          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mb-12 leading-relaxed text-pretty">
            Byashik — умная нейросеть, которая ответит на любой ваш вопрос, поможет с текстами, кодом и идеями. Просто начните диалог.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button
              size="lg"
              onClick={scrollToChat}
              className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-4 text-lg"
            >
              Задать вопрос
            </Button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-black/40 ring-1 ring-white/20 backdrop-blur rounded-full">
            <Icon name="Zap" className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Ответы за секунды, без регистрации</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-black/20 ring-1 ring-white/15 backdrop-blur p-8 text-center hover:ring-purple-400/40 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 ring-1 ring-white/20 mb-6">
                  <Icon name={f.icon} className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{f.title}</h3>
                <p className="text-white/80 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section ref={chatRef} className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              Поговорите с Byashik
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto text-pretty">
              Задайте вопрос и получите ответ от нейросети прямо сейчас.
            </p>
          </div>

          <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-4 md:p-6">
            {/* Messages */}
            <div className="h-[420px] overflow-y-auto px-1 md:px-3 py-2 space-y-4">
              {messages.length === 0 && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 ring-1 ring-white/20 mb-6">
                    <Icon name="Sparkles" className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white/70 mb-6">Не знаете с чего начать? Попробуйте:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-left text-sm px-4 py-3 rounded-xl bg-black/30 ring-1 ring-white/15 hover:ring-purple-400/40 hover:bg-black/40 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start gap-3 max-w-[85%] ${
                      m.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ring-1 ring-white/20 ${
                        m.role === "user"
                          ? "bg-white text-black"
                          : "bg-gradient-to-br from-purple-500/40 to-cyan-500/40"
                      }`}
                    >
                      <Icon name={m.role === "user" ? "User" : "Bot"} className="w-5 h-5" />
                    </div>
                    <div
                      className={`px-4 py-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-white text-black"
                          : "bg-black/40 ring-1 ring-white/15 text-white/95"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ring-1 ring-white/20 bg-gradient-to-br from-purple-500/40 to-cyan-500/40">
                      <Icon name="Bot" className="w-5 h-5" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-black/40 ring-1 ring-white/15">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="mt-4 flex items-center gap-3 bg-black/40 ring-1 ring-white/15 rounded-2xl p-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Напишите свой вопрос..."
                className="flex-1 bg-transparent px-4 py-2 outline-none placeholder:text-white/40"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="bg-white text-black hover:bg-white/90 rounded-xl px-4 disabled:opacity-50"
              >
                <Icon name="Send" className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              Частые вопросы
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl bg-black/20 ring-1 ring-white/15 backdrop-blur overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg font-medium pr-4">{faq.question}</span>
                  <Icon
                    name={openFaq === index ? "Minus" : "Plus"}
                    className="w-5 h-5 flex-shrink-0"
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-white/80 leading-relaxed">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Icon name="Sparkles" className="w-5 h-5 text-purple-400" />
            <span className="font-semibold tracking-wide">Byashik</span>
          </div>
          <p className="text-white/60 text-sm">© 2026 Byashik. Умный AI-ассистент.</p>
          <Button onClick={scrollToChat} className="bg-white text-black hover:bg-white/90 rounded-full px-6">
            Начать диалог
          </Button>
        </div>
      </footer>
    </div>
  )
}

export default Index
