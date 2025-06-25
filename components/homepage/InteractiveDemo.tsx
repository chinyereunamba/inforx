"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MessageSquare, User, Bot, Send, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: string;
}

const demoConversation: ChatMessage[] = [
  {
    id: "1",
    type: "user",
    content:
      "I have a persistent headache and mild fever for 2 days. Should I be worried?",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    type: "ai",
    content:
      "Based on your symptoms, this could indicate a viral infection or tension headache. Let me analyze this further...",
    timestamp: "10:30 AM",
  },
  {
    id: "3",
    type: "ai",
    content:
      "📘 **Analysis**: Your symptoms suggest a mild viral infection. The combination of headache and low-grade fever is common with viral illnesses.\n\n💡 **Recommendations**: \n• Rest and stay hydrated\n• Take paracetamol for fever\n• Monitor temperature\n\n⚠️ **Seek medical care if**: Fever exceeds 39°C, severe headache, or neck stiffness develops.",
    timestamp: "10:31 AM",
  },
];

export default function InteractiveDemo() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [demoStarted, setDemoStarted] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Simulate typing animation
  const simulateTyping = async (message: ChatMessage, index: number) => {
    if (message.type === "ai") {
      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsTyping(false);
    }

    setVisibleMessages((prev) => [...prev, message]);

    // Auto-scroll to latest message
    setTimeout(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    }, 100);
  };

  const startDemo = async () => {
    if (demoStarted) return;
    setDemoStarted(true);
    setVisibleMessages([]);

    for (let i = 0; i < demoConversation.length; i++) {
      await simulateTyping(demoConversation[i], i);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  };

  useEffect(() => {
    if (hasAnimated) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          overwrite: true,
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
            end: "bottom 20%",
            toggleActions: "play none none none",
            once: true,
            onEnter: () => setHasAnimated(true),
          },
        }
      );

      // Demo interface animation
      gsap.fromTo(
        demoRef.current,
        {
          opacity: 0,
          y: 50,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          overwrite: true,
          scrollTrigger: {
            trigger: demoRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none none",
            once: true,
            onEnter: () => {
              // Auto-start demo after animation
              setTimeout(startDemo, 1000);
            },
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated, demoStarted, startDemo]);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-white"
      aria-labelledby="demo-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="demo-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-6"
          >
            See InfoRx AI in Action
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Watch how our AI provides instant, accurate medical guidance
            tailored to Nigerian healthcare needs.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div
            ref={demoRef}
            className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-sky-500 to-emerald-500 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">InfoRx AI Assistant</h3>
                  <p className="text-sky-100 text-sm">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Online • Responds in seconds
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div
              ref={messagesRef}
              className="h-96 overflow-y-auto p-6 space-y-4"
            >
              {!demoStarted && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-emerald-600" />
                  </div>
                  <p className="text-slate-600 mb-4">
                    Ready to see AI-powered healthcare in action?
                  </p>
                  <Button
                    onClick={startDemo}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Demo
                  </Button>
                </div>
              )}

              {visibleMessages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      message.type === "user" ? "order-2" : "order-1"
                    }`}
                  >
                    <div
                      className={`flex items-start gap-3 ${
                        message.type === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === "user"
                            ? "bg-emerald-500 text-white"
                            : "bg-sky-100 text-sky-600"
                        }`}
                      >
                        {message.type === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.type === "user"
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        <div className="text-sm whitespace-pre-line">
                          {message.content}
                        </div>
                        <div
                          className={`text-xs mt-2 ${
                            message.type === "user"
                              ? "text-emerald-100"
                              : "text-slate-500"
                          }`}
                        >
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-sky-600" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input (Disabled for demo) */}
            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="This is a demo - try the full version!"
                  className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-slate-500 bg-slate-50"
                  disabled
                />
                <button className="bg-slate-300 text-slate-500 p-2 rounded-lg cursor-not-allowed">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* CTA Below Demo */}
          <div className="text-center mt-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Ready to try the full AI assistant?
            </h3>
            <p className="text-lg text-slate-600 mb-6">
              Experience comprehensive healthcare AI with document analysis,
              multi-language support, and real doctor consultations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold"
                asChild
              >
                <Link href="/interpreter">Try Full AI Interpreter</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-sky-500 text-sky-600 hover:bg-sky-50 px-8 py-3 rounded-xl font-semibold"
                asChild
              >
                <Link href="/dashboard">Explore Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
