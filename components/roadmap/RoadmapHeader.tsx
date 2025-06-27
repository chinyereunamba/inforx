'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Target, Zap } from 'lucide-react';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function RoadmapHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      // Title animation
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', overwrite: true }
      )
      // Subtitle animation
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', overwrite: true },
        '-=0.4'
      )
      // Stats stagger animation
      .fromTo(
        statsRef.current,
        { opacity: 0, y: 20, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.5, 
          ease: 'back.out(1.7)',
          stagger: 0.1,
          overwrite: true
        },
        '-=0.3'
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { icon: Target, label: 'MVP Target', value: 'July 2025', color: 'text-emerald-600' },
    { icon: Calendar, label: 'Current Phase', value: 'MVP Phase 1', color: 'text-sky-600' },
    { icon: Zap, label: 'Features Ready', value: '12+ Complete', color: 'text-emerald-600' }
  ];

  return (
    <header 
      ref={headerRef}
      className="relative bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-20 lg:py-32 overflow-hidden"
      role="banner"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sky-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-noto text-slate-900 mb-6 leading-tight"
            
          >
            InfoRx Development
            <span className="text-sky-500 block">Roadmap</span>
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-12"
          >
            Our strategic vision for revolutionizing healthcare technology in Nigeria. 
            Track our progress and see what's coming next.
          </p>

          {/* Progress indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={stat.label}
                  ref={(el) => {
                    if (el) statsRef.current[index] = el;
                  }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-white to-slate-50 mb-4 ${stat.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}