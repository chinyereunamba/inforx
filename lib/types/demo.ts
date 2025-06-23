// Demo page specific types and interfaces
export interface DemoCard {
  id: string;
  title: string;
  description: string;
  beforeState: {
    title: string;
    content: string;
    status: 'confused' | 'concerned' | 'uncertain';
  };
  afterState: {
    title: string;
    content: string;
    status: 'clear' | 'confident' | 'informed';
  };
  step: number;
  category: 'diagnosis' | 'prescription' | 'lab-results' | 'emergency';
}

export interface FeatureCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  benefits: string[];
  metrics?: {
    label: string;
    value: string;
  };
}

export interface SuccessMetric {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: string;
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