"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { api } from "@/lib/api"
import type { ChatMessage } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  Send,
  MessageSquare,
  Database,
  Sparkles,
  Activity,
  Zap,
  Bot,
  User,
  Cpu,
  Brain,
  Copy,
  Check,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import ReactMarkdown from "react-markdown"

export default function AIAssistantPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState<"online" | "offline">("offline")
  const [isTyping, setIsTyping] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAIStatus()
    // Add welcome message with animation
    setTimeout(() => {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `# Hello ${user?.name || "there"}! 🚀 

I'm your **AI-powered Campus Assets assistant**. I can help you with:

## 🔍 **Natural Language Queries**
Ask me anything about your resources in plain English

## ⚡ **Smart CRUD Operations** 
Update data using natural language commands

## 📊 **Analytics & Insights**
Get intelligent reports and data summaries

## 🤖 **Real-time Assistance**
Instant responses to your questions

---

### What would you like to explore today?`,
          timestamp: new Date().toISOString(),
        },
      ])
    }, 500)
  }, [user?.name])

  const checkAIStatus = async () => {
    try {
      const response = await api.get("/ai/status")
      setAiStatus(response.data.groq_api_configured ? "online" : "offline")
    } catch (error) {
      setAiStatus("offline")
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      toast.success("Message copied to clipboard!")
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      toast.error("Failed to copy message")
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const messageId = Date.now().toString()
    const userMessage: ChatMessage = {
      id: messageId,
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)
    setIsTyping(true)

    try {
      const response = await api.post("/ai/chat", {
        query: input,
        session_id: null,
      })

      // Simulate typing delay for better UX
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.data.response,
          timestamp: new Date().toISOString(),
          resources: response.data.resources,
          statistics: response.data.statistics,
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsTyping(false)
      }, 1000)
    } catch (error) {
      setTimeout(() => {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `## ❌ Error

I apologize, but I encountered an error while processing your request. 

**Please try again** or contact support if the issue persists.

---
*Error details: Connection timeout or server unavailable*`,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMessage])
        setIsTyping(false)
      }, 1000)
    } finally {
      setLoading(false)
    }
  }

  const handleCRUDOperation = async (instruction: string, department: string) => {
    if (!instruction.trim() || !department.trim() || loading) return

    const messageId = Date.now().toString()
    const userMessage: ChatMessage = {
      id: messageId,
      role: "user",
      content: `## 🔧 CRUD Operation Request

**Instruction:** ${instruction}

**Target Department:** ${department}`,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setIsTyping(true)

    try {
      const response = await api.post("/ai/crud", {
        instruction,
        department,
      })

      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `crud-${Date.now()}`,
          role: "assistant",
          content: `## ✅ Operation Completed Successfully!

### ${response.data.operation}
The operation has been **executed successfully**.

### Details:
${response.data.details}

---
✨ *The changes have been applied to your database and are now live.*`,
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsTyping(false)
      }, 1500)
    } catch (error: any) {
      setTimeout(() => {
        const errorMessage: ChatMessage = {
          id: `crud-error-${Date.now()}`,
          role: "assistant",
          content: `## ❌ Operation Failed

### Error Details:
${error.response?.data?.error || "An unexpected error occurred"}

### Suggestions:
- Check your input parameters
- Verify department name spelling
- Try again with a simpler instruction
- Contact support if the issue persists

---
*Please review your request and try again.*`,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMessage])
        setIsTyping(false)
      }, 1500)
    } finally {
      setLoading(false)
    }
  }

  const quickExamples = [
    { text: "Show me resources in CSE department", icon: "🏢" },
    { text: "What's the total asset value?", icon: "💰" },
    { text: "Find the most expensive equipment", icon: "🔍" },
    { text: "Generate monthly report", icon: "📊" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                  <Brain className="w-8 h-8" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Assistant</h1>
                <p className="text-blue-100 mt-1">Intelligent campus asset management powered by AI</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2 text-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${aiStatus === "online" ? "bg-green-400" : "bg-red-400"} animate-pulse`}
                  ></div>
                  <span className="font-medium">{aiStatus === "online" ? "AI Online" : "AI Offline"}</span>
                </div>
                <p className="text-xs text-blue-200 mt-1">Response time: ~1.2s</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100/50">
                  <TabsTrigger
                    value="chat"
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat Mode</span>
                  </TabsTrigger>
                  {user?.role === "admin" && (
                    <TabsTrigger
                      value="crud"
                      className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Database className="w-4 h-4" />
                      <span>CRUD Operations</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <TabsContent value="chat" className="flex-1 flex flex-col p-6 pt-0">
                {/* Messages with Scroll */}
                <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gradient-to-b from-gray-50/50 to-white rounded-2xl mb-4 max-h-[400px]">
                  {messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div
                        className={`max-w-xs lg:max-w-2xl flex items-start space-x-3 ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.role === "user"
                              ? "bg-gradient-to-br from-blue-500 to-purple-500"
                              : "bg-gradient-to-br from-green-500 to-teal-500"
                          }`}
                        >
                          {message.role === "user" ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>

                        {/* Message */}
                        <div
                          className={`relative group px-4 py-3 rounded-2xl shadow-sm ${
                            message.role === "user"
                              ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-br-md"
                              : "bg-white border border-gray-200 rounded-bl-md"
                          }`}
                        >
                          {/* Copy Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ${
                              message.role === "user"
                                ? "hover:bg-white/20 text-white"
                                : "hover:bg-gray-100 text-gray-600"
                            }`}
                            onClick={() => copyToClipboard(message.content, message.id || index.toString())}
                          >
                            {copiedMessageId === (message.id || index.toString()) ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>

                          {/* Message Content with Markdown */}
                          <div
                            className={`text-sm leading-relaxed pr-8 ${message.role === "user" ? "text-white" : "text-gray-800"}`}
                          >
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-2">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-3">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-base font-medium mb-2 mt-2">{children}</h3>,
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => (
                                  <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                                ),
                                li: ({ children }) => <li className="ml-2">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                code: ({ children }) => (
                                  <code
                                    className={`px-1 py-0.5 rounded text-xs font-mono ${
                                      message.role === "user" ? "bg-white/20" : "bg-gray-100"
                                    }`}
                                  >
                                    {children}
                                  </code>
                                ),
                                hr: () => <hr className="my-3 border-gray-300" />,
                                blockquote: ({ children }) => (
                                  <blockquote
                                    className={`border-l-4 pl-4 my-2 ${
                                      message.role === "user" ? "border-white/40" : "border-gray-300"
                                    }`}
                                  >
                                    {children}
                                  </blockquote>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>

                          {message.resources && message.resources.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <div className="text-xs font-semibold text-gray-600">Related Resources:</div>
                              {message.resources.slice(0, 3).map((resource, idx) => (
                                <div key={idx} className="text-xs bg-blue-50 p-3 rounded-lg border border-blue-100">
                                  <div className="font-semibold text-blue-900">{resource.device_name}</div>
                                  <div className="text-blue-700 mt-1">
                                    📍 {resource.department} - {resource.location}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {message.statistics && (
                            <div className="mt-3 text-xs bg-green-50 p-3 rounded-lg border border-green-100">
                              <div className="font-semibold text-green-900 mb-2">📊 Statistics:</div>
                              <div className="space-y-1 text-green-700">
                                <div>Resources: {message.statistics.total_resources}</div>
                                <div>Total Value: ₹{message.statistics.total_cost.toLocaleString()}</div>
                              </div>
                            </div>
                          )}

                          <div
                            className={`text-xs opacity-70 mt-2 ${message.role === "user" ? "text-white/70" : "text-gray-500"}`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start animate-in slide-in-from-bottom-2">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything about your campus assets..."
                      disabled={loading || aiStatus === "offline"}
                      className="h-12 pl-4 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Sparkles className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || aiStatus === "offline"}
                    className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </TabsContent>

              {user?.role === "admin" && (
                <TabsContent value="crud" className="flex-1 flex flex-col p-6 pt-0">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl mb-6 border border-blue-100">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                      <Cpu className="w-5 h-5" />
                      <span>Natural Language CRUD Operations</span>
                    </h3>
                    <p className="text-sm text-blue-700 mb-3">Transform plain English into database operations:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-600">
                      <div className="bg-white/50 p-3 rounded-lg">
                        <strong>Create:</strong> "Add 5 laptops to CSE Lab A-101, cost ₹50,000 each"
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg">
                        <strong>Update:</strong> "Update cost to ₹75,000 for all projectors in Electronics"
                      </div>
                    </div>
                  </div>

                  <CRUDForm onSubmit={handleCRUDOperation} loading={loading} />
                </TabsContent>
              )}
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Examples */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Quick Examples</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickExamples.map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-4 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 hover:scale-105"
                  onClick={() => setInput(example.text)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{example.icon}</span>
                    <span className="text-gray-700">{example.text}</span>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  )
}

interface CRUDFormProps {
  onSubmit: (instruction: string, department: string) => void
  loading: boolean
}

function CRUDForm({ onSubmit, loading }: CRUDFormProps) {
  const [instruction, setInstruction] = useState("")
  const [department, setDepartment] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (instruction.trim() && department.trim()) {
      onSubmit(instruction, department)
      setInstruction("")
      setDepartment("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Operation Instruction</label>
        <Input
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g., Add 5 laptops to Lab A-101, cost ₹50,000 each"
          disabled={loading}
          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Target Department</label>
        <Input
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="e.g., Computer Science and Engineering"
          disabled={loading}
          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
        />
      </div>

      <Button
        type="submit"
        disabled={loading || !instruction.trim() || !department.trim()}
        className="w-full h-12 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Processing Operation...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Execute Operation</span>
          </div>
        )}
      </Button>
    </form>
  )
}
