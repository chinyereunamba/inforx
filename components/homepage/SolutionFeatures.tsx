"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Bot, Smartphone, MessageSquare, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SolutionFeature {
  id: string;
  icon: any;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

const solutionFeatures: SolutionFeature[] = [
  {
    id: "ai-explanations",
    icon: Bot,
    title: "AI-Powered Explanations",
    description:
      "Transform complex medical jargon into clear, understandable language instantly",
    color: "text-blue-600",
    bgColor: "from-blue-50 to-blue-100",
  },
  {
    id: "any-device",
    icon: Smartphone,
    title: "Available on Any Device",
    description:
      "Access healthcare insights from smartphones, tablets, or computers anywhere",
    color: "text-emerald-600",
    bgColor: "from-emerald-50 to-emerald-100",
  },
  {
    id: "local-language",
    icon: MessageSquare,
    title: "Local Language Support",
    description:
      "Get medical explanations in English, Pidgin, and other Nigerian languages",
    color: "text-blue-600",
    bgColor: "from-blue-50 to-blue-100",
  },
  {
    id: "personalized",
    icon: Brain,
    title: "Personalized Suggestions",
    description:
      "Receive tailored health recommendations based on your specific conditions",
    color: "text-emerald-600",
    bgColor: "from-emerald-50 to-emerald-100",
  },
];

export default function SolutionFeatures() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightContentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

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

      // Subtitle animation
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          overwrite: true,
          scrollTrigger: {
            trigger: subtitleRef.current,
            start: "top 85%",
            end: "bottom 20%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );

      // Left content (features grid)
      gsap.fromTo(
        leftContentRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
          overwrite: true,
          scrollTrigger: {
            trigger: leftContentRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );

      // Right content (CTA section)
      gsap.fromTo(
        rightContentRef.current,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
          overwrite: true,
          scrollTrigger: {
            trigger: rightContentRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );

      // CTA button with bounce effect
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
          overwrite: true,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
            end: "bottom 20%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-slate-50 to-blue-50"
      aria-labelledby="solutions-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="solutions-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 font-noto"
          >
            How InfoRx Solves This
          </h2>
          <p
            ref={subtitleRef}
            className="text-xl text-slate-600 max-w-3xl mx-auto"
          >
            Our AI-powered platform addresses each healthcare challenge with
            innovative solutions designed specifically for Nigerian communities.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Features Grid */}
          <div ref={leftContentRef} className="grid gap-6">
            {solutionFeatures.map((feature) => {
              const IconComponent = feature.icon;

              return (
                <div
                  key={feature.id}
                  className={`bg-gradient-to-br ${feature.bgColor} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border cursor-pointer group transform hover:scale-105`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm ${feature.color}`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>

                    <div className="flex-1">
                      <h3
                        className={`text-lg font-bold text-slate-900 mb-2 group-hover:${feature.color} transition-colors duration-300`}
                      >
                        {feature.title}
                      </h3>

                      <p className="text-slate-700 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column - CTA Section */}
          <div ref={rightContentRef} className="text-center lg:text-left">
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Experience the difference AI makes
              </h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                See how these powerful features work together to provide
                comprehensive healthcare solutions for every Nigerian.
              </p>

              <div ref={ctaRef} className="space-y-4">
                <Button
                  size="lg"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform"
                  asChild
                >
                  <Link href="/demo">See How It Works</Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                  asChild
                >
                  <Link href="/interpreter">Explore Features</Link>
                </Button>
              </div>

              {/* Trust indicator */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-2">
                  Trusted by healthcare professionals across Nigeria
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
                  <span>Lagos State Health Ministry</span>
                  <span>Nigerian Medical Association</span>
                  <span>Federal Ministry of Health</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
