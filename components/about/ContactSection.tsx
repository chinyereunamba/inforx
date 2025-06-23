'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, MapPin, Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightContentRef = useRef<HTMLDivElement>(null);

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

      // Left content slide in
      gsap.fromTo(
        leftContentRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          overwrite: true,
          scrollTrigger: {
            trigger: leftContentRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );

      // Right content slide in
      gsap.fromTo(
        rightContentRef.current,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          overwrite: true,
          scrollTrigger: {
            trigger: rightContentRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  const handleContactEmail = () => {
    const subject = encodeURIComponent('Partnership Inquiry - InfoRx Healthcare Platform');
    const body = encodeURIComponent(`Hello InfoRx Team,

I'm interested in learning more about InfoRx and potential collaboration opportunities.

Please provide more information about:
- Partnership opportunities
- Product demonstrations
- Implementation in our organization

Best regards,
`);
    
    window.location.href = `mailto:hello@inforx.ng?subject=${subject}&body=${body}`;
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'General inquiries and partnerships',
      contact: 'hello@inforx.ng',
      action: 'Send Email'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak with our team directly',
      contact: '+234 (0) 123 456 7890',
      action: 'Call Now'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp',
      description: 'Quick questions and support',
      contact: '+234 (0) 123 456 7890',
      action: 'Chat Now'
    }
  ];

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-white"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="contact-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-6"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Get in Touch
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Have a question or want to collaborate? We'd love to hear from you. 
            Let's work together to improve healthcare in Nigeria.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Contact Methods */}
          <div ref={leftContentRef}>
            <h3 className="text-2xl font-bold text-slate-900 mb-8">
              Let's Start a Conversation
            </h3>
            
            <div className="space-y-6 mb-8">
              {contactMethods.map((method) => {
                const IconComponent = method.icon;
                
                return (
                  <div
                    key={method.title}
                    className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-1">
                          {method.title}
                        </h4>
                        <p className="text-slate-600 text-sm mb-2">
                          {method.description}
                        </p>
                        <p className="text-slate-800 font-semibold mb-3">
                          {method.contact}
                        </p>
                        <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 transition-colors duration-200">
                          {method.action}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Location */}
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Our Location</h4>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Victoria Island, Lagos, Nigeria<br />
                <span className="text-slate-600 text-sm">Serving healthcare across all 36 states</span>
              </p>
            </div>
          </div>

          {/* Right Column - CTA Section */}
          <div ref={rightContentRef}>
            <div className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-6">
                Ready to Transform Healthcare Together?
              </h3>
              
              <p className="text-blue-100 leading-relaxed mb-8">
                Whether you're a healthcare institution, government body, or technology partner, 
                we're always looking for collaborators who share our vision of accessible 
                healthcare for all Nigerians.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                  <span className="text-blue-100">Partnership opportunities</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                  <span className="text-blue-100">Technology integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                  <span className="text-blue-100">Healthcare innovation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                  <span className="text-blue-100">Community impact programs</span>
                </div>
              </div>

              <Button
                onClick={handleContactEmail}
                size="lg"
                className="w-full bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Mail className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">24/7</div>
                <div className="text-slate-600 text-sm">Response Time</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">100+</div>
                <div className="text-slate-600 text-sm">Active Partners</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}