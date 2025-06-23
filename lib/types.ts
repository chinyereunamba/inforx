// Global type definitions for MediGuide homepage
export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ProcessStep {
  id: string;
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface ImpactStat {
  id: string;
  label: string;
  value: string;
  description: string;
}

export interface AnimationConfig {
  duration: number;
  delay?: number;
  ease?: string;
}

// GSAP Timeline types
export interface GSAPTimelineVars {
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number;
}