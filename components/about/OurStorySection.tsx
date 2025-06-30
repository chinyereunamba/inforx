"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Lightbulb, Rocket, Users, Award } from "lucide-react";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function OurStorySection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const timelineRef = useRef<HTMLDivElement[]>([]);

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

      // Timeline items stagger animation
      timelineRef.current.forEach((item, index) => {
        if (item) {
          gsap.fromTo(
            item,
            {
              opacity: 0,
              x: index % 2 === 0 ? -50 : 50,
              scale: 0.95,
            },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 0.7,
              ease: "back.out(1.7)",
              overwrite: true,
              scrollTrigger: {
                trigger: item,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none none",
                once: true,
              },
              delay: index * 0.2,
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  const milestones = [
    {
      year: "2024",
      title: "The Vision",
      description:
        "Founded to bridge Nigeria's healthcare gap by making medical information accessible to everyone, regardless of education or location.",
      icon: Lightbulb,
      color: "from-blue-500 to-blue-600",
    },
    {
      year: "2025",
      title: "AI Platform Launch",
      description:
        "Launched our AI-powered medical interpreter, capable of translating complex prescriptions and lab results into simple, understandable language.",
      icon: Rocket,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      year: "2025",
      title: "50K+ Users",
      description:
        "Reached over 50,000 Nigerians who now have better access to understanding their healthcare information and making informed decisions.",
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      year: "2025",
      title: "Recognition",
      description:
        "Received recognition from the Nigerian Medical Association and partnerships with major healthcare institutions across the country.",
      icon: Award,
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-white"
      aria-labelledby="story-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="story-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-6"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Our Story
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From a simple idea to transforming healthcare for millions of
            Nigerians
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="relative">
          {/* Center line for desktop */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-emerald-500 opacity-30"></div>

          <div className="space-y-12 lg:space-y-16">
            {milestones.map((milestone, index) => {
              const IconComponent = milestone.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={milestone.year}
                  ref={(el) => {
                    if (el) timelineRef.current[index] = el;
                  }}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Content Card */}
                  <div
                    className={`flex-1 ${
                      isEven ? "lg:text-right" : "lg:text-left"
                    }`}
                  >
                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4 justify-center lg:justify-start">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${milestone.color} rounded-xl flex items-center justify-center shadow-lg`}
                        >
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                          {milestone.year}
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-slate-900 mb-4">
                        {milestone.title}
                      </h3>

                      <p className="text-slate-600 leading-relaxed text-lg">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Node */}
                  <div className="hidden lg:flex relative">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full shadow-lg border-4 border-white"></div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden lg:block"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
