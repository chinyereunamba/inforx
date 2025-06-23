// About page specific types and interfaces
export interface SectionProps {
  title: string;
  description: string;
  className?: string;
}

export interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface ProblemPoint {
  id: string;
  title: string;
  description: string;
  impact: string;
}

export interface SolutionFeature {
  id: string;
  title: string;
  description: string;
  benefit: string;
}

export interface AnimationConfig {
  duration: number;
  delay?: number;
  ease?: string;
  stagger?: number;
}

// GSAP ScrollTrigger configuration
export interface ScrollTriggerConfig {
  trigger: string | Element;
  start: string;
  end: string;
  toggleActions: string;
  scrub?: boolean;
}