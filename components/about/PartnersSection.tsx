"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Building2, Award, Users, Heart } from "lucide-react";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function PartnersSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const partnersRef = useRef<HTMLDivElement[]>([]);
  const collaborationsRef = useRef<HTMLDivElement>(null);

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

      // Partners grid stagger animation
      partnersRef.current.forEach((partner, index) => {
        if (partner) {
          gsap.fromTo(
            partner,
            {
              opacity: 0,
              y: 40,
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
                trigger: partner,
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

      // Collaborations section
      gsap.fromTo(
        collaborationsRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          overwrite: true,
          scrollTrigger: {
            trigger: collaborationsRef.current,
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

  const partners = [
    {
      id: "nma",
      name: "Nigerian Medical Association",
      type: "Professional Body",
      description: "Official recognition and medical oversight",
      icon: Award,
      color: "from-blue-100 to-blue-200",
    },
    {
      id: "lagos-health",
      name: "Lagos State Ministry of Health",
      type: "Government Partnership",
      description: "Pilot programs in Lagos state healthcare centers",
      icon: Building2,
      color: "from-emerald-100 to-emerald-200",
    },
    {
      id: "federal-health",
      name: "Federal Ministry of Health",
      type: "National Recognition",
      description: "Collaboration on national healthcare digitization",
      icon: Building2,
      color: "from-blue-100 to-blue-200",
    },
    {
      id: "community-health",
      name: "Community Health Organizations",
      type: "Grassroots Partners",
      description: "Direct deployment in rural healthcare centers",
      icon: Heart,
      color: "from-emerald-100 to-emerald-200",
    },
    {
      id: "medical-schools",
      name: "Nigerian Medical Schools",
      type: "Academic Partners",
      description: "Research collaboration and medical validation",
      icon: Users,
      color: "from-blue-100 to-blue-200",
    },
    {
      id: "tech-accelerators",
      name: "Tech Innovation Hubs",
      type: "Technology Partners",
      description: "Support for scaling and technology development",
      icon: Building2,
      color: "from-emerald-100 to-emerald-200",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-slate-50 to-blue-50"
      aria-labelledby="partners-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="partners-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-6"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            In Partnership With Healthcare Leaders
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Working together with Nigeria's most trusted healthcare institutions
            to ensure quality, reliability, and widespread impact.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {partners.map((partner, index) => {
            const IconComponent = partner.icon;

            return (
              <div
                key={partner.id}
                ref={(el) => {
                  if (el) partnersRef.current[index] = el;
                }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${partner.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}
                >
                  <IconComponent className="h-8 w-8 text-slate-700" />
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {partner.name}
                  </h3>

                  <p className="text-emerald-600 font-semibold text-sm mb-3">
                    {partner.type}
                  </p>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    {partner.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Collaboration Summary */}
        <div ref={collaborationsRef}>
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Building a Stronger Healthcare Ecosystem
            </h3>

            <p className="text-lg text-slate-600 mb-8">
              We&apos;re proud to work with leading healthcare organizations
              across Nigeria. These partnerships ensure our platform meets the
              highest standards of medical accuracy and regulatory compliance.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">20+</div>
                <div className="text-slate-600">Healthcare Partners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  15
                </div>
                <div className="text-slate-600">States Covered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  200+
                </div>
                <div className="text-slate-600">Healthcare Centers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
