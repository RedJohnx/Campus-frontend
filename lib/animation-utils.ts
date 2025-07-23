/**
 * Animation utility functions and constants for the enhanced design system
 */

import { useState, useEffect } from 'react';

// Animation duration constants
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
} as const;

// Easing functions - using Framer Motion compatible values
export const EASING = {
  smooth: "easeOut",
  bounce: "backOut",
  snappy: "easeInOut", 
  elastic: "anticipate",
  linear: "linear",
  easeIn: "easeIn",
  easeOut: "easeOut",
  easeInOut: "easeInOut",
} as const;

// Common animation variants for Framer Motion
export const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.smooth },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: ANIMATION_DURATION.normal / 1000 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
  transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.smooth },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
  transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.smooth },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: ANIMATION_DURATION.fast / 1000, ease: EASING.bounce },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: ANIMATION_DURATION.normal / 1000 },
};

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: ANIMATION_DURATION.slow / 1000, ease: EASING.smooth },
};

// Modal/Dialog variants
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: ANIMATION_DURATION.fast / 1000 },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
  transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.bounce },
};

// Hover animation variants
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: ANIMATION_DURATION.fast / 1000, ease: EASING.bounce },
};

export const hoverLift = {
  whileHover: { y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' },
  transition: { duration: ANIMATION_DURATION.fast / 1000 },
};

// Loading animation variants
export const pulseAnimation = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const spinAnimation = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Utility function to check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// React hook for motion preferences with real-time updates
export const useMotionPreference = () => {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced;
};

// Utility function to get animation duration based on user preference
export const getAnimationDuration = (duration: keyof typeof ANIMATION_DURATION): number => {
  return prefersReducedMotion() ? 0 : ANIMATION_DURATION[duration];
};

// Utility function to create staggered animations
export const createStaggerAnimation = (itemCount: number, staggerDelay: number = 0.1) => ({
  animate: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  },
});

// Number counting animation utility
export const createCountAnimation = (from: number, to: number, duration: number = 1000) => ({
  from,
  to,
  duration: prefersReducedMotion() ? 0 : duration,
});