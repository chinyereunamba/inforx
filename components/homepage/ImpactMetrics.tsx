"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Users, Clock, Globe, Shield } from "lucide-react";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ImpactStat {
  id: string;
  icon: any;
  value: string;
  label: string;
  description: string;
  color: string;
}

const impactStats: ImpactStat[] = [
  {
    id: "patients",
    icon: Users,
    value: "50K+",
    label: "Patients Helped", 
    description: "Nigerians trust InfoRx",
    color: "text-sky-600",
  },
  {
    id: "response-time",
    icon: Clock,
    value: "3s",
    label: "Avg Response Time",
    description: "Lightning-fast AI analysis",
    color: "text-emerald-600",
  },
  {
    id: "access",
    icon: Globe,
    value: "Nationwide",
    label: "Access",
    description: "Available across Nigeria", 
    color: "text-blue-600",
  },
  {
    id: "compliance",
    icon: Shield,
    value: "HIPAA",
    label: "Compliant",
    description: "Secure & private",
    color: "text-emerald-600",
  },
];

export default function ImpactMetrics() {
  const [animatedValues, setAnimatedValues] = useState<Record<string, string>>(
    {}
  );
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const statsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Counter animation function
  const animateCounter = (
    finalValue: string,
    callback: (current: string) => void
  ) => {
    if (finalValue.includes("K+")) {
      const numValue = parseInt(finalValue.replace("K+", "")) * 1000;
      let current = 0;
      const increment = numValue / 80;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= numValue) {
          current = numValue;
          clearInterval(timer);
        }
        const displayValue =
          current >= 1000
            ? Math.floor(current / 1000) + "K+"
            : Math.floor(current).toString();
        callback(displayValue);
      }, 16);
    } else {
      callback(finalValue); // For non-numeric values like "3s", "Nationwide", "HIPAA"
    }
  };

  useEffect(() => {
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
          },
        }
      );

      // Card (stat) animation only
      statsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { 
              opacity: 0, 
              y: 50, 
              scale: 0.9,
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
  }, []);

  // Counter animation: separate effect, separate ScrollTrigger for each card
  useEffect(() => {
    if (typeof window === "undefined" || !gsap || !ScrollTrigger) return;
    const triggers: ScrollTrigger[] = [];
    statsRef.current.forEach((card, index) => {
      if (!card) return;
      const stat = impactStats[index];
      if (animatedValues[stat.id]) return; // Already animated
      const trigger = ScrollTrigger.create({
        trigger: card,
        start: "top 85%",
        once: true,
        onEnter: () => {
          animateCounter(stat.value, (currentValue) => {
            setAnimatedValues((prev) => ({
              ...prev,
              [stat.id]: currentValue,
            }));
          });
        },
      });
      triggers.push(trigger);
    });
    return () => {
      triggers.forEach((t) => t.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animatedValues]);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-slate-50"
      aria-labelledby="impact-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="impact-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Transforming Healthcare Across Nigeria
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Real impact, measurable results for Nigerian communities
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {impactStats.map((stat, index) => {
            const IconComponent = stat.icon;
            const displayValue = animatedValues[stat.id] || "0";
            
            return (
              <div
                key={stat.id}
                ref={(el) => {
                  if (el) statsRef.current[index] = el; 
                }}
                className="bg-white rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center border border-slate-100"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-white to-slate-50 mb-4 md:mb-6 ${stat.color.replace('blue', 'sky')}`}
                >
                  <IconComponent className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                
                <div
                  className="text-2xl md:text-4xl font-bold text-slate-900 mb-2"
                  aria-live="polite"
                >
                  {displayValue}
                </div>
                
                <h3 className="text-sm md:text-lg font-semibold text-slate-800 mb-1">
                  {stat.label}
                </h3>
                
                <p className="text-xs md:text-sm text-slate-600 font-noto">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
