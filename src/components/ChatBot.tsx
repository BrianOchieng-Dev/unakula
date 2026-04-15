import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GlassCard } from "./GlassCard";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatBotProps {
  onSendMessage: (message: string) => Promise<string>;
}

export function ChatBot({ onSendMessage }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your Ulikula? assistant. Hungry? Ask me for meal suggestions or where to find the best food in MMUST!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await onSendMessage(userMessage);
      if (response === "INAPPROPRIATE_CONTENT_DETECTED") {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "⚠️ **Safety Warning:** Your message contains inappropriate language or restricted topics. Please keep the conversation focused on food and student life at MMUST. Repeated violations may result in a ban." 
        }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: response }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] sm:w-[400px]"
          >
            <GlassCard className="h-[500px] flex flex-col overflow-hidden border-blue-500/30">
              <div className="p-4 border-b border-border flex items-center justify-between bg-blue-600/20">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 p-1.5 rounded-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Food Assistant</h3>
                    <p className="text-[10px] text-blue-500">Online & Ready to help</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full text-foreground hover:bg-accent"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-2 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          msg.role === "user" ? "bg-blue-600" : "bg-muted"
                        }`}>
                          {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm ${
                          msg.role === "user" 
                            ? "bg-blue-600 text-white rounded-tr-none" 
                            : "bg-muted text-foreground rounded-tl-none border border-border"
                        }`}>
                          <div className="prose dark:prose-invert prose-sm max-w-none">
                            <ReactMarkdown>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 items-center bg-muted p-3 rounded-2xl border border-border">
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                        <span className="text-xs text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-border bg-muted/50">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about food..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="bg-background border-border text-foreground focus:border-blue-500"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-500/40 flex items-center justify-center group"
      >
        <MessageSquare className={`w-6 h-6 text-white transition-transform duration-300 ${isOpen ? 'rotate-90 scale-0' : 'scale-100'}`} />
        <X className={`w-6 h-6 text-white absolute transition-transform duration-300 ${isOpen ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
      </Button>
    </div>
  );
}
