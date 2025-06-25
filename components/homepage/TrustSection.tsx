"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield, Award, Users, CheckCircle, Star, Quote } from "lucide-react";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TrustIndicator {
  id: string;
  icon: any;
  title: string;
  description: string;
  badge?: string;
}

const trustIndicators: TrustIndicator[] = [
  {
    id: "compliance",
    icon: Shield,
    title: "HIPAA Compliant",
    description:
      "Bank-level security and data protection for all medical information",
    badge: "Certified",
  },
  {
    id: "certification",
    icon: Award,
    title: "Nigerian Medical Association Approved",
    description: "Officially recognized by Nigerian healthcare authorities",
    badge: "Approved",
  },
  {
    id: "professionals",
    icon: Users,
    title: "500+ Certified Doctors",
    description: "Licensed Nigerian medical professionals available 24/7",
    badge: "Verified",
  },
  {
    id: "accuracy",
    icon: CheckCircle,
    title: "99.2% Diagnostic Accuracy",
    description:
      "Clinically validated AI models trained on Nigerian health data",
    badge: "Validated",
  },
];

export default function TrustSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightContentRef = useRef<HTMLDivElement>(null);
  const trustCardsRef = useRef<HTMLDivElement[]>([]);

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

      // Left content (trust indicators)
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

      // Right content (testimonial)
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

      // Staggered trust cards
      trustCardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            {
              opacity: 0,
              y: 30,
              scale: 0.95,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              ease: "back.out(1.7)",
              overwrite: true,
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "bottom 20%",
                toggleActions: "play none none none",
                once: true,
              },
              delay: index * 0.1,
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-emerald-50 to-sky-50"
      aria-labelledby="trust-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="trust-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-6"
          >
            Trusted by Healthcare Professionals
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Built with the highest standards of security, accuracy, and cultural
            relevance for Nigerian healthcare.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Trust Indicators */}
          <div ref={leftContentRef} className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">
              Why Healthcare Professionals Choose InfoRx
            </h3>

            <div className="grid gap-6">
              {trustIndicators.map((indicator, index) => {
                const IconComponent = indicator.icon;

                return (
                  <div
                    key={indicator.id}
                    ref={(el) => {
                      if (el) trustCardsRef.current[index] = el;
                    }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-emerald-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-slate-900">
                            {indicator.title}
                          </h4>
                          {indicator.badge && (
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
                              {indicator.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {indicator.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Testimonial */}
          <div ref={rightContentRef}>
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-sky-100">
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
                <span className="text-slate-600 ml-2">
                  (4.9/5 from 2,000+ reviews)
                </span>
              </div>

              <Quote className="h-8 w-8 text-emerald-500 mb-4" />

              <p className="text-lg text-slate-600 mb-6">
                &ldquo;InfoRx has transformed how we approach patient care. The
                AI&apos;s ability to explain complex medical terms in simple
                language has improved patient understanding
                significantly.&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-sky-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">DR</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    Dr. Adaora Okafor
                  </div>
                  <div className="text-slate-600">Chief Medical Officer</div>
                  <div className="text-slate-500 text-sm">
                    Lagos State Primary Healthcare Board
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Trust Badges */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-md text-center border border-slate-200">
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  ISO 27001
                </div>
                <div className="text-sm text-slate-600">Security Certified</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md text-center border border-slate-200">
                <div className="text-2xl font-bold text-sky-600 mb-1">WHO</div>
                <div className="text-sm text-slate-600">Recognized Partner</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Bar */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Trusted by Leading Nigerian Healthcare Institutions
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-8 text-slate-600">
              <div className="font-semibold">
                University of Lagos Teaching Hospital
              </div>
              <div className="font-semibold">Lagos State Health Ministry</div>
              <div className="font-semibold">Federal Medical Centre</div>
              <div className="font-semibold">Nigerian Medical Association</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
