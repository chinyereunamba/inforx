'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, Clock, Building2 } from 'lucide-react';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Challenge {
  id: string;
  icon: any;
  title: string;
  description: string;
  statistic: string;
  impact: string;
}

const healthcareChallenges: Challenge[] = [
  {
    id: 'medical-language',
    icon: FileText,
    title: 'Confusing Medical Language',
    description: 'Complex prescriptions and lab reports that patients cannot understand',
    statistic: '73%',
    impact: 'of patients can\'t read prescriptions'
  },
  {
    id: 'waiting-times',
    icon: Clock,
    title: 'Long Wait Times',
    description: 'Extended delays for consultations and rushed medical interactions',
    statistic: '7 mins',
    impact: 'average consultation time'
  },
  {
    id: 'access-gaps',
    icon: Building2,
    title: 'Access Gaps',
    description: 'Limited healthcare infrastructure in rural and underserved areas',
    statistic: '40%',
    impact: 'fewer professionals in rural areas'
  }
];

export default function HealthcareChallenges() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

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
          ease: 'power2.out',
          overwrite: true,
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
            once: true,
            onEnter: () => setHasAnimated(true)
          }
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
          ease: 'power2.out',
          overwrite: true,
          scrollTrigger: {
            trigger: subtitleRef.current,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );

      // Staggered card animations with hover setup
      cardsRef.current.forEach((card, index) => {
        if (card) {
          // Entrance animation
          gsap.fromTo(
            card,
            { 
              opacity: 0, 
              y: 50, 
              scale: 0.95,
              rotateY: 10
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotateY: 0,
              duration: 0.7,
              ease: 'back.out(1.7)',
              overwrite: true,
              scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none none',
                once: true
              },
              delay: index * 0.15
            }
          );

          // Setup hover animations
          const setupHoverAnimations = () => {
            const icon = card.querySelector('.challenge-icon');
            const content = card.querySelector('.challenge-content');

            card.addEventListener('mouseenter', () => {
              gsap.to(card, { 
                scale: 1.02, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
              gsap.to(icon, { 
                scale: 1.1, 
                rotation: 5, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
              gsap.to(content, { 
                y: -5, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
            });

            card.addEventListener('mouseleave', () => {
              gsap.to(card, { 
                scale: 1, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
              gsap.to(icon, { 
                scale: 1, 
                rotation: 0, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
              gsap.to(content, { 
                y: 0, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
            });
          };

          setupHoverAnimations();
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-white"
      aria-labelledby="challenges-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="challenges-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-6"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Top 3 Healthcare Challenges in Nigeria
          </h2>
          <p
            ref={subtitleRef}
            className="text-xl text-slate-600 max-w-3xl mx-auto"
          >
            Understanding the real challenges facing Nigerian healthcare helps us 
            build better solutions for every community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {healthcareChallenges.map((challenge, index) => {
            const IconComponent = challenge.icon;
            
            return (
              <div
                key={challenge.id}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el;
                }}
                className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 group cursor-pointer"
              >
                <div className="challenge-icon flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-6 group-hover:bg-red-200 transition-colors duration-300">
                  <IconComponent className="h-8 w-8 text-red-600" />
                </div>
                
                <div className="challenge-content">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-red-700 transition-colors duration-300">
                    {challenge.title}
                  </h3>
                  
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {challenge.description}
                  </p>

                  {/* Statistics */}
                  <div className="border-t border-slate-200 pt-4">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {challenge.statistic}
                    </div>
                    <div className="text-sm text-slate-600">
                      {challenge.impact}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}