"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Linkedin, Twitter, Github } from "lucide-react";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TeamSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const teamCardsRef = useRef<HTMLDivElement[]>([]);

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

      // Team cards stagger animation
      teamCardsRef.current.forEach((card, index) => {
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
              delay: index * 0.15,
            }
          );

          // Setup hover animations
          const setupHoverAnimations = () => {
            const avatar = card.querySelector(".team-avatar");
            const content = card.querySelector(".team-content");
            const bio = card.querySelector(".team-bio");

            card.addEventListener("mouseenter", () => {
              gsap.to(card, {
                scale: 1.02,
                duration: 0.3,
                ease: "power2.out",
              });
              gsap.to(avatar, {
                scale: 1.1,
                duration: 0.3,
                ease: "power2.out",
              });
              gsap.to(bio, {
                opacity: 1,
                height: "auto",
                duration: 0.3,
                ease: "power2.out",
              });
            });

            card.addEventListener("mouseleave", () => {
              gsap.to(card, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out",
              });
              gsap.to(avatar, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out",
              });
              gsap.to(bio, {
                opacity: 0,
                height: 0,
                duration: 0.3,
                ease: "power2.out",
              });
            });
          };

          setupHoverAnimations();
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  const teamMembers = [
    {
      id: "founder-ceo",
      name: "Chinyere Unamba",
      role: "Founder & CEO",
      bio: "Medical Student and hobby programer. Passionate about the future and advancement of technology in Healthcare",
      image: "CU",
      color: "from-emerald-500 to-emerald-600",
      quote: "Building the healthcare platform Nigeria deserves.",
    },
    {
      id: "co-founder",
      name: "Dr. Adaora Okafor",
      role: "Founder & CEO",
      bio: "Medical doctor with 10+ years experience in Nigerian healthcare. Former consultant at Lagos University Teaching Hospital.",
      image: "AO",
      color: "from-blue-500 to-blue-600",
      quote: "Building the healthcare platform Nigeria deserves.",
    },
    {
      id: "cto",
      name: "Chinedu Okoli",
      role: "Chief Technology Officer",
      bio: "AI engineer with expertise in healthcare technology. Previously led engineering teams at top Nigerian fintech companies.",
      image: "CO",
      color: "from-emerald-500 to-emerald-600",
      quote: "Technology should make healthcare simple, not complex.",
    },
    {
      id: "cmo",
      name: "Fatima Abdullahi",
      role: "Chief Medical Officer",
      bio: "Public health specialist focused on improving healthcare access in underserved communities across Northern Nigeria.",
      image: "FA",
      color: "from-blue-500 to-blue-600",
      quote: "Every Nigerian deserves quality healthcare information.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-white"
      aria-labelledby="team-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="team-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 font-noto"
          >
            Meet the Team Behind InfoRx
          </h2>
          <p className="text-lg text-slate-600 mb-8 font-noto">
            Meet the passionate team behind InfoRx. We&apos;re a diverse group
            of healthcare professionals, technologists, and community advocates
            united by a common mission: making quality healthcare accessible to
            every Nigerian.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              ref={(el) => {
                if (el) teamCardsRef.current[index] = el;
              }}
              className="flip-card bg-gradient-to-br from-slate-50 to-white rounded-2xl p-0 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onMouseEnter={() => setHoveredCard(member.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ perspective: "1200px" }}
            >
              <div
                className={`flip-card-inner rounded-2xl transition-transform duration-700 ease-in-out ${
                  hoveredCard === member.id ? "flipped" : ""
                }`}
                style={{ transformStyle: "preserve-3d", minHeight: 300 }}
              >
                {/* Front Face */}
                <div
                  className="flip-card-front rounded-2xl p-6"
                  style={{
                    backfaceVisibility: "hidden",
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <div className="text-center mb-6">
                    <div
                      className={`team-avatar w-20 h-20 bg-gradient-to-br ${member.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                    >
                      <span className="text-2xl font-bold text-white">
                        {member.image}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      {member.name}
                    </h3>

                    <p className="text-emerald-600 font-semibold mb-3">
                      {member.role}
                    </p>

                    {/* Quote */}
                    <blockquote className="text-sm text-slate-600 italic mb-4">
                      "{member.quote}"
                    </blockquote>
                  </div>
                </div>
                {/* Back Face */}
                <div
                  className="flip-card-back rounded-2xl p-6 flex bg-white flex-col justify-center items-center"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <div className="team-bio opacity-100 h-auto overflow-visible transition-none">
                    <p className="text-sm text-slate-600 leading-relaxed mb-4 text-center">
                      {member.bio}
                    </p>
                    {/* Social Links */}
                    <div className="flex justify-center gap-3">
                      <button className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors duration-200">
                        <Linkedin className="h-4 w-4 text-slate-600" />
                      </button>
                      <button className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors duration-200">
                        <Twitter className="h-4 w-4 text-slate-600" />
                      </button>
                      <button className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors duration-200">
                        <Github className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Team Quote */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Our Commitment</h3>
            <p className="text-xl leading-relaxed">
              "We're not just building technology – we're building bridges
              between complex medical information and the people who need to
              understand it most."
            </p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .flip-card {
          position: relative;
          min-height: 280px;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
      `}</style>
    </section>
  );
}
