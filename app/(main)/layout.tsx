"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sectionRef = useRef<HTMLElement>(null);
  const scrollTopButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    

    gsap.fromTo(
      scrollTopButtonRef.current,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "body",
          start: "top -200px",
          end: "bottom bottom",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, [sectionRef]);
  return (
    <>
      <Navbar />
      {children} <Footer />
      <button
        ref={scrollTopButtonRef}
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 flex items-center justify-center"
        style={{ borderRadius: "50%" }}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-6 w-6" />
      </button>
    </>
  );
}
