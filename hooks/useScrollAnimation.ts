"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { AnimationConfig, ScrollTriggerConfig } from "@/lib/types/about";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const useScrollAnimation = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementsRef = useRef<HTMLElement[]>([]);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  const fadeInAnimation = (
    elements: HTMLElement[],
    config: AnimationConfig & {
      scrollTrigger?: Partial<ScrollTriggerConfig>;
    } = {
      duration: 0.8,
      delay: 0,
      ease: "power2.out",
    }
  ) => {
    if (!elements.length || hasAnimated) return;

    return gsap.fromTo(
      elements,
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration: config.duration,
        delay: config.delay,
        ease: config.ease,
        scrollTrigger: {
          trigger: elements[0],
          start: "top 85%",
          end: "bottom 20%",
          toggleActions: "play none none none",
          once: true,
          onEnter: () => setHasAnimated(true),
          ...config.scrollTrigger,
        },
      }
    );
  };

  const staggerChildren = (
    parent: HTMLElement,
    children: string,
    config: AnimationConfig & {
      scrollTrigger?: Partial<ScrollTriggerConfig>;
    } = {
      duration: 0.6,
      stagger: 0.15,
      ease: "power2.out",
    }
  ) => {
    if (!parent || hasAnimated) return;

    return gsap.fromTo(
      parent.querySelectorAll(children),
      {
        opacity: 0,
        y: 50,
        scale: 0.9,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: config.duration,
        stagger: config.stagger,
        ease: config.ease,
        scrollTrigger: {
          trigger: parent,
          start: "top 70%",
          end: "bottom 20%",
          toggleActions: "play none none none",
          once: true,
          onEnter: () => setHasAnimated(true),
          ...config.scrollTrigger,
        },
      }
    );
  };

  const slideInFromLeft = (
    elements: HTMLElement[],
    config: AnimationConfig & {
      scrollTrigger?: Partial<ScrollTriggerConfig>;
    } = {
      duration: 0.8,
      ease: "power2.out",
    }
  ) => {
    if (!elements.length || hasAnimated) return;

    return gsap.fromTo(
      elements,
      {
        opacity: 0,
        x: -50,
      },
      {
        opacity: 1,
        x: 0,
        duration: config.duration,
        ease: config.ease,
        scrollTrigger: {
          trigger: elements[0],
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none none",
          once: true,
          onEnter: () => setHasAnimated(true),
          ...config.scrollTrigger,
        },
      }
    );
  };

  const slideInFromRight = (
    elements: HTMLElement[],
    config: AnimationConfig & {
      scrollTrigger?: Partial<ScrollTriggerConfig>;
    } = {
      duration: 0.8,
      ease: "power2.out",
    }
  ) => {
    if (!elements.length || hasAnimated) return;

    return gsap.fromTo(
      elements,
      {
        opacity: 0,
        x: 50,
      },
      {
        opacity: 1,
        x: 0,
        duration: config.duration,
        ease: config.ease,
        scrollTrigger: {
          trigger: elements[0],
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none none",
          once: true,
          onEnter: () => setHasAnimated(true),
          ...config.scrollTrigger,
        },
      }
    );
  };

  useEffect(() => {
    // Cleanup function to revert all animations
    return () => {
      if (elementsRef.current.length > 0) {
        gsap.set(elementsRef.current, { clearProps: "all" });
      }
      // Kill all ScrollTriggers to prevent memory leaks
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return {
    addToRefs,
    fadeInAnimation,
    staggerChildren,
    slideInFromLeft,
    slideInFromRight,
    hasAnimated,
    elementsRef,
  };
};
