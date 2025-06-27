"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, Users, Target } from "lucide-react";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AboutIntroSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (hasAnimated) return;

    const ctx = gsap.context(() => {
      // Sequential animations
      const tl = gsap.timeline({
        onComplete: () => setHasAnimated(true),
      });

      // Title animation
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          overwrite: true,
        }
      )
        // Subtitle animation
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            overwrite: true,
          },
          "-=0.4"
        )
        // Vision statement
        .fromTo(
          visionRef.current,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
            overwrite: true,
          },
          "-=0.3"
        )
        // Values cards stagger
        .fromTo(
          valuesRef.current,
          { opacity: 0, y: 40, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.15,
            ease: "power2.out",
            overwrite: true,
          },
          "-=0.2"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  const values = [
    {
      icon: Heart,
      title: "Health Equity",
      description:
        "Making quality healthcare accessible to every Nigerian, regardless of location or economic status",
    },
    {
      icon: Users,
      title: "Community First",
      description:
        "Building solutions that understand and serve the unique needs of Nigerian communities",
    },
    {
      icon: Target,
      title: "Innovation",
      description:
        "Leveraging cutting-edge AI technology to solve real healthcare challenges in Nigeria",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-24 bg-gradient-to-br from-blue-50 via-white to-emerald-50 overflow-hidden"
      role="banner"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-noto text-slate-900 mb-8 leading-tight"
          >
            Our Mission at
            <span
              className="text-blue-500 block"
              style={{ fontFamily: "Noto Sans, system-ui, sans-serif" }}
            >
              InfoRx
            </span>
          </h1>

          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-12"
          >
            We're on a mission to simplify healthcare through intelligent
            innovation in Nigeria. By bridging the gap between complex medical
            information and patient understanding, we're making quality
            healthcare accessible to every Nigerian community.
          </p>

          {/* Vision Statement */}
          <div
            ref={visionRef}
            className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-2xl p-8 shadow-xl mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Vision</h2>
            <p className="text-xl md:text-2xl font-normal leading-relaxed">
              "Accessible, understandable healthcare for all Nigerians."
            </p>
          </div>

          {/* Core Values */}
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;

              return (
                <div
                  key={value.title}
                  ref={(el) => {
                    if (el) valuesRef.current[index] = el;
                  }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {value.title}
                  </h3>

                  <p className="text-slate-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
