"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles } from "lucide-react"
import scrollIntoView from "smooth-scroll-into-view-if-needed"
import { useUser } from "./context/UserProvider"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useTranscription } from "./context/TranscriptionProvider"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  timestamp: string
  content: string
  sender: "human" | "ai"
}

interface RedisChatHistory {
  type: "human" | "ai"
  data: {
    content: string
    additional_kwargs?: Record<string, unknown>
    response_metadata?: Record<string, unknown>
  }
}

interface ChatHistoryResponse {
  chatHistory: string[]
}

interface QuestionsResponse {
  questions: string[]
}

export default function AIChatInterface() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const lastMessageRef = React.useRef<HTMLDivElement>(null)
  const loadingBubbleRef = React.useRef<HTMLDivElement>(null)
  const [isHistoryLoaded, setIsHistoryLoaded] = React.useState(false)

  const { userAvatar, userInitials, username } = useUser()
  const { taskId } = useTranscription()

  const chatHistoryQuery = useQuery<ChatHistoryResponse>({
    queryKey: ["chatHistory", taskId],
    queryFn: async () => {
      const url = new URL("http://10.20.62.96:5678/webhook/chat_history")
      url.searchParams.append("uuid", String(taskId))
      url.searchParams.append("username", username)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(
          `Error en la respuesta: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      return data
    },
    enabled: !!taskId,
  })

  const questionsQuery = useQuery<QuestionsResponse>({
    queryKey: ["questions", taskId],
    queryFn: async () => {
      const url = new URL("http://10.20.62.96:5678/webhook/generate_questions")
      url.searchParams.append("uuid", String(taskId))
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(
          `Error en la respuesta: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()

      return data[0]
    },
    enabled:
      !!taskId && messages.length === 0 && !chatHistoryQuery.data?.chatHistory,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  React.useEffect(() => {
    if (chatHistoryQuery.data?.chatHistory && !isHistoryLoaded) {
      try {
        const parsedMessages: Message[] = chatHistoryQuery.data.chatHistory
          .map(jsonString => {
            try {
              const historyItem = JSON.parse(jsonString) as RedisChatHistory
              return {
                timestamp: Date.now().toString(),
                content: historyItem.data.content,
                sender: historyItem.type,
              } as Message
            } catch (e) {
              console.error("Error parsing message:", e)
              return null
            }
          })
          .filter((msg): msg is Message => msg !== null)

        if (parsedMessages.length > 0) {
          setMessages(parsedMessages)
          setIsHistoryLoaded(true)
          // Scroll to the last message after a short delay to ensure rendering
          setTimeout(() => {
            const lastMessage = document.querySelector(
              '[data-last-message="true"]'
            )
            if (lastMessage) {
              scrollIntoView(lastMessage, {
                scrollMode: "if-needed",
                block: "end",
                inline: "nearest",
                behavior: "smooth",
              })
            }
          }, 100)
        }
      } catch (e) {
        console.error("Error processing chat history:", e)
      }
    }
  }, [chatHistoryQuery.data, isHistoryLoaded])

  const chatMutation = useMutation({
    mutationFn: async (chatInput: string) => {
      const response = await fetch("http://10.20.62.96:5678/webhook/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatInput, uuid: taskId, username }),
      })

      if (!response.ok) {
        throw new Error(
          `Error en la respuesta: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()

      // Handle non-array responses
      const responseArray = Array.isArray(data) ? data : [data]

      // Check if we have a valid response with output
      if (responseArray.length === 0 || !responseArray[0]?.output) {
        throw new Error("Respuesta inválida del servidor")
      }

      return responseArray[0].output
    },
  })

  const scrollToElement = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      scrollIntoView(ref.current, {
        scrollMode: "if-needed",
        block: "end",
        inline: "nearest",
        behavior: "smooth",
      })
    }
  }

  const handleSend = async (message?: string) => {
    if (input.trim() || message) {
      const newMessage: Message = {
        timestamp: Date.now().toString(),
        content: message ?? input.trim(),
        sender: "human",
      }
      setMessages(prev => [...prev, newMessage])
      setInput("")

      // Scroll to the loading bubble
      setTimeout(() => scrollToElement(loadingBubbleRef), 100)

      try {
        const response = await chatMutation.mutateAsync(message ?? input.trim())
        const aiResponse: Message = {
          timestamp: Date.now().toString(),
          content: response,
          sender: "ai",
        }
        setMessages(prev => [...prev, aiResponse])

        // Scroll to the AI's response
        setTimeout(() => scrollToElement(lastMessageRef), 100)
      } catch (error) {
        const errorMessage: Message = {
          timestamp: Date.now().toString(),
          content:
            error instanceof Error
              ? error.message
              : "Error desconocido al procesar tu mensaje",
          sender: "ai",
        }
        setMessages(prev => [...prev, errorMessage])

        // Scroll to the error message
        setTimeout(() => scrollToElement(lastMessageRef), 100)
      }
    }
  }
  return (
    <Card className='w-[500px] max-w-[500px] mx-auto'>
      <CardHeader>
        <CardTitle>Conversar con el llamado</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-[400px] pr-4' ref={scrollAreaRef}>
          {chatHistoryQuery.isLoading && (
            <div className='flex justify-center items-center py-2 mb-4'>
              <Sparkles className='h-6 w-6 animate-sparkle' />
              <span className='ml-2 text-muted-foreground'>
                Cargando historial...
              </span>
            </div>
          )}
          {chatHistoryQuery.isError && (
            <div className='flex justify-center items-center py-2 mb-4 text-destructive text-sm'>
              No se pudo cargar el historial del chat
            </div>
          )}
          <div className='space-y-4'>
            {messages.map((message, index) => (
              <div
                key={`${message.timestamp}-${index}`}
                className={`flex ${message.sender === "human" ? "justify-end" : "justify-start"}`}
                ref={index === messages.length - 1 ? lastMessageRef : null}
                data-last-message={
                  index === messages.length - 1 ? "true" : "false"
                }
              >
                <div
                  className={`flex items-end space-x-2 ${message.sender === "human" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}
                >
                  <Avatar>
                    <AvatarImage
                      src={
                        message.sender === "human"
                          ? userAvatar
                          : "/placeholder.svg?height=40&width=40&text=AI"
                      }
                    />
                    <AvatarFallback>
                      {message.sender === "human" ? userInitials : "AI"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[70%] ${
                      message.sender === "human"
                        ? "bg-primary text-primary-foreground"
                        : message.content.startsWith("Error") ||
                            message.content.startsWith("Lo siento")
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-muted"
                    }`}
                  >
                    {message.sender === "ai" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Remove paragraph margins for more compact chat bubbles
                          p: ({ children }) => (
                            <p className='mb-0'>{children}</p>
                          ),
                          // Add styling for code blocks
                          pre: ({ children }) => (
                            <pre className='bg-muted-foreground/10 rounded-md p-2 overflow-x-auto'>
                              {children}
                            </pre>
                          ),
                          // Style inline code
                          code: ({ children }) => (
                            <code className='bg-muted-foreground/10 rounded-sm px-1 py-0.5'>
                              {children}
                            </code>
                          ),
                          // Style links
                          a: ({ children, href }) => (
                            <a
                              href={href}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-500 hover:underline hover:underline-offset-2 transition-all'
                            >
                              {children}
                            </a>
                          ),
                          // Headers styling
                          h1: ({ children }) => (
                            <h1 className='text-2xl font-bold mt-6 mb-2 first:mt-0'>
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className='text-xl font-bold mt-5 mb-2 first:mt-0'>
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className='text-lg font-semibold mt-4 mb-2 first:mt-0'>
                              {children}
                            </h3>
                          ),
                          h4: ({ children }) => (
                            <h4 className='text-base font-semibold mt-3 mb-2 first:mt-0'>
                              {children}
                            </h4>
                          ),
                          h5: ({ children }) => (
                            <h5 className='text-sm font-semibold mt-3 mb-1 first:mt-0'>
                              {children}
                            </h5>
                          ),
                          h6: ({ children }) => (
                            <h6 className='text-sm font-medium mt-3 mb-1 first:mt-0'>
                              {children}
                            </h6>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className='flex justify-start' ref={loadingBubbleRef}>
                <div className='flex items-center space-x-2'>
                  <Avatar>
                    <AvatarImage src='' />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className='flex gap-2 bg-muted rounded-lg px-4 py-2 items-center'>
                    <Sparkles className='h-4 w-4 animate-sparkle' />
                    <span className='text-sm text-muted-foreground'>
                      {getAILoadingPhrase()}...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className='flex flex-col gap-2'>
        <AnimatePresence mode='wait'>
          {questionsQuery.data &&
            messages.length === 0 &&
            questionsQuery.data.questions?.map((question, index) => (
              <motion.div
                key={question}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 + index * 0.1 }}
                className='w-full'
              >
                <Button
                  variant='ghost'
                  className='w-full text-xs text-wrap'
                  onClick={() => handleSend(question)}
                >
                  {question}
                </Button>
              </motion.div>
            ))}
        </AnimatePresence>

        <form
          onSubmit={e => {
            e.preventDefault()
            handleSend()
          }}
          className='flex w-full space-x-2'
        >
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder='Escribe tu mensaje...'
            className='flex-grow'
          />
          <Button type='submit' disabled={chatMutation.isPending}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

function getAILoadingPhrase() {
  const words = [
    "Razonando",
    "Pensando",
    "Analizando el llamado",
    "Analizando",
    "Generando respuesta",
  ]
  return words[Math.floor(Math.random() * words.length)]
}
