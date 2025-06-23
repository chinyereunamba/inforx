'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle, AlertCircle, Clock, Stethoscope, FileText, Zap, Heart } from 'lucide-react';
import type { DemoCard } from '@/lib/types/demo';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const demoCards: DemoCard[] = [
  {
    id: 'ai-diagnosis',
    title: 'AI-Powered Diagnosis',
    description: 'Get instant preliminary diagnosis from symptoms',
    beforeState: {
      title: 'Confused About Symptoms',
      content: 'Patient has headache, fever, and fatigue but unsure what it means or what to do next.',
      status: 'confused'
    },
    afterState: {
      title: 'Clear Understanding',
      content: 'AI identifies potential viral infection with 89% confidence and provides immediate care recommendations.',
      status: 'clear'
    },
    step: 1,
    category: 'diagnosis'
  },
  {
    id: 'prescription-analysis',
    title: 'Prescription Analysis',
    description: 'Understand your medications in simple terms',
    beforeState: {
      title: 'Medical Jargon Confusion',
      content: 'Complex prescription with dosages, timing, and medical terms that are hard to understand.',
      status: 'uncertain'
    },
    afterState: {
      title: 'Simple Instructions',
      content: 'Clear breakdown of each medication, when to take them, and what to expect, plus side effect warnings.',
      status: 'informed'
    },
    step: 2,
    category: 'prescription'
  },
  {
    id: 'lab-interpretation',
    title: 'Lab Results Explained',
    description: 'Decode complex lab reports instantly',
    beforeState: {
      title: 'Numbers & Ranges',
      content: 'Blood test shows multiple values outside normal ranges but patient doesn\'t understand implications.',
      status: 'concerned'
    },
    afterState: {
      title: 'Actionable Insights',
      content: 'Clear explanation of what each result means for health, which values need attention, and next steps.',
      status: 'confident'
    },
    step: 3,
    category: 'lab-results'
  },
  {
    id: 'emergency-triage',
    title: 'Emergency Triage',
    description: '24/7 emergency assessment and guidance',
    beforeState: {
      title: 'Emergency Uncertainty',
      content: 'Severe chest pain and shortness of breath - should they call ambulance or go to urgent care?',
      status: 'concerned'
    },
    afterState: {
      title: 'Immediate Action Plan',
      content: 'AI flags high-risk symptoms, recommends immediate 911 call, and provides pre-hospital care instructions.',
      status: 'clear'
    },
    step: 4,
    category: 'emergency'
  }
];

const categoryIcons = {
  diagnosis: Stethoscope,
  prescription: FileText,
  'lab-results': Zap,
  emergency: Heart
};

const statusIcons = {
  confused: AlertCircle,
  concerned: AlertCircle,
  uncertain: Clock,
  clear: CheckCircle,
  confident: CheckCircle,
  informed: CheckCircle
};

const statusColors = {
  confused: 'text-red-500 bg-red-50 border-red-200',
  concerned: 'text-orange-500 bg-orange-50 border-orange-200',
  uncertain: 'text-yellow-500 bg-yellow-50 border-yellow-200',
  clear: 'text-emerald-500 bg-emerald-50 border-emerald-200',
  confident: 'text-emerald-500 bg-emerald-50 border-emerald-200',
  informed: 'text-emerald-500 bg-emerald-50 border-emerald-200'
};

export default function InteractiveDemoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: true,
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );

      // Sequential card animations on scroll
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { 
              opacity: 0, 
              y: 50, 
              scale: 0.95 
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
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
              delay: index * 0.1
            }
          );

          // Hover animation setup
          const beforeCard = card.querySelector('.before-card');
          const afterCard = card.querySelector('.after-card');
          
          if (beforeCard && afterCard) {
            card.addEventListener('mouseenter', () => {
              gsap.to(beforeCard, { 
                scale: 0.98, 
                opacity: 0.7, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
              gsap.to(afterCard, { 
                scale: 1.02, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
            });

            card.addEventListener('mouseleave', () => {
              gsap.to(beforeCard, { 
                scale: 1, 
                opacity: 1, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
              gsap.to(afterCard, { 
                scale: 1, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
            });
          }
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="demo-section"
      ref={sectionRef}
      className="py-24 bg-white"
      aria-labelledby="demo-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="demo-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Interactive Demo Experience
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how InfoRx transforms confusion into clarity across different healthcare scenarios
          </p>
        </div>

        {/* Mobile: Horizontal scroll, Desktop: 2x2 Grid */}
        <div className="lg:hidden">
          {/* Mobile Carousel */}
          <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory">
            {demoCards.map((card, index) => {
              const CategoryIcon = categoryIcons[card.category];
              const BeforeIcon = statusIcons[card.beforeState.status];
              const AfterIcon = statusIcons[card.afterState.status];
              
              return (
                <div
                  key={card.id}
                  ref={(el) => {
                    if (el) cardsRef.current[index] = el;
                  }}
                  className="flex-shrink-0 w-80 snap-center"
                >
                  <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6 h-full hover:shadow-xl transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <CategoryIcon className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
                            Step {card.step}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{card.title}</h3>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6">{card.description}</p>

                    {/* Before/After States */}
                    <div className="space-y-4">
                      {/* Before */}
                      <div className={`before-card p-4 rounded-lg border-2 ${statusColors[card.beforeState.status]}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <BeforeIcon className="h-5 w-5" />
                          <span className="font-semibold text-sm">BEFORE</span>
                        </div>
                        <h4 className="font-bold mb-2">{card.beforeState.title}</h4>
                        <p className="text-sm">{card.beforeState.content}</p>
                      </div>

                      {/* After */}
                      <div className={`after-card p-4 rounded-lg border-2 ${statusColors[card.afterState.status]}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <AfterIcon className="h-5 w-5" />
                          <span className="font-semibold text-sm">AFTER</span>
                        </div>
                        <h4 className="font-bold mb-2">{card.afterState.title}</h4>
                        <p className="text-sm">{card.afterState.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop: 2x2 Grid */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8">
          {demoCards.map((card, index) => {
            const CategoryIcon = categoryIcons[card.category];
            const BeforeIcon = statusIcons[card.beforeState.status];
            const AfterIcon = statusIcons[card.afterState.status];
            
            return (
              <div
                key={card.id}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el;
                }}
                className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-8 hover:shadow-xl transition-all duration-300 cursor-pointer"
                style={{ borderRadius: '12px' }}
                role="button"
                tabIndex={0}
                aria-label={`${card.title} demo`}
              >
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CategoryIcon className="h-7 w-7 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg">
                        Step {card.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{card.title}</h3>
                  </div>
                </div>

                <p className="text-gray-600 mb-8 text-lg">{card.description}</p>

                {/* Before/After States */}
                <div className="space-y-6">
                  {/* Before */}
                  <div className={`before-card p-6 rounded-lg border-2 ${statusColors[card.beforeState.status]} transition-all duration-300`}>
                    <div className="flex items-center gap-3 mb-3">
                      <BeforeIcon className="h-6 w-6" />
                      <span className="font-bold text-sm tracking-wide">BEFORE</span>
                    </div>
                    <h4 className="font-bold text-lg mb-3">{card.beforeState.title}</h4>
                    <p className="text-sm leading-relaxed">{card.beforeState.content}</p>
                  </div>

                  {/* After */}
                  <div className={`after-card p-6 rounded-lg border-2 ${statusColors[card.afterState.status]} transition-all duration-300`}>
                    <div className="flex items-center gap-3 mb-3">
                      <AfterIcon className="h-6 w-6" />
                      <span className="font-bold text-sm tracking-wide">AFTER</span>
                    </div>
                    <h4 className="font-bold text-lg mb-3">{card.afterState.title}</h4>
                    <p className="text-sm leading-relaxed">{card.afterState.content}</p>
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