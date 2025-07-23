'use client';

import { motion, AnimatePresence, HTMLMotionProps, useMotionValue, useTransform, animate } from 'framer-motion';
import { ReactNode, forwardRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  fadeIn,
  fadeInUp,
  slideInRight,
  slideInLeft,
  scaleIn,
  staggerContainer,
  staggerItem,
  hoverScale,
  hoverLift,
  prefersReducedMotion,
  useMotionPreference,
  pageTransition,
  ANIMATION_DURATION,
  EASING,
} from '@/lib/animation-utils';

// FadeIn animation component
interface FadeInProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, delay = 0, duration = 0.3, className, ...props }, ref) => {
    const animationProps = prefersReducedMotion()
      ? { initial: false, animate: false }
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration, delay, ease: EASING.smooth },
        };

    return (
      <motion.div
        ref={ref}
        className={className}
        {...animationProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

FadeIn.displayName = 'FadeIn';

// SlideUp animation component
interface SlideUpProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}

export const SlideUp = forwardRef<HTMLDivElement, SlideUpProps>(
  ({ children, delay = 0, duration = 0.5, distance = 20, className, ...props }, ref) => {
    const animationProps = prefersReducedMotion()
      ? { initial: false, animate: false }
      : {
          initial: { opacity: 0, y: distance },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -distance },
          transition: { duration, delay, ease: EASING.smooth },
        };

    return (
      <motion.div
        ref={ref}
        className={className}
        {...animationProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

SlideUp.displayName = 'SlideUp';

// Stagger animation wrapper for lists and grids
interface StaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

export const Stagger: React.FC<StaggerProps> = ({
  children,
  className,
  staggerDelay = 0.1,
  initialDelay = 0,
}) => {
  const containerVariant = prefersReducedMotion()
    ? {}
    : {
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
          },
        },
      };

  const itemVariant = prefersReducedMotion()
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.4, ease: EASING.smooth }
        },
      };

  return (
    <motion.div
      className={className}
      variants={containerVariant}
      initial="initial"
      animate="animate"
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <motion.div key={index} variants={itemVariant}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={itemVariant}>{children}</motion.div>
      }
    </motion.div>
  );
};

// Enhanced Page transition component with multiple variants
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variant?: 'fade' | 'slide' | 'scale';
  duration?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className, 
  variant = 'fade',
  duration = 0.5 
}) => {
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
    },
  };

  const selectedVariant = variants[variant];
  const animationProps = prefersReducedMotion()
    ? {}
    : {
        ...selectedVariant,
        transition: { duration, ease: EASING.smooth },
      };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        {...animationProps}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Animated button component
interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: 'scale' | 'lift';
  className?: string;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, variant = 'scale', className, ...props }, ref) => {
    const variants = {
      scale: hoverScale,
      lift: hoverLift,
    };

    const selectedVariant = prefersReducedMotion() ? {} : variants[variant];

    return (
      <motion.button
        ref={ref}
        className={cn('focus:outline-none', className)}
        {...selectedVariant}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

// Animated card component
interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  hover = true,
}) => {
  const hoverProps = hover && !prefersReducedMotion()
    ? {
        whileHover: { y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <motion.div
      className={cn('card-modern', className)}
      {...hoverProps}
    >
      {children}
    </motion.div>
  );
};

// Loading spinner component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  const spinVariant = prefersReducedMotion()
    ? {}
    : {
        animate: { rotate: 360 },
        transition: { duration: 1, repeat: Infinity, ease: EASING.linear },
      };

  return (
    <motion.div
      className={cn(
        'border-primary-200 border-t-primary-600 rounded-full',
        sizeClasses[size],
        className
      )}
      {...spinVariant}
    />
  );
};

// Enhanced Animated counter component with better performance
interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  separator?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from = 0,
  to,
  duration = 1,
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = ',',
}) => {
  const [displayValue, setDisplayValue] = useState(from);
  const motionValue = useMotionValue(from);
  const rounded = useTransform(motionValue, (latest) => {
    const value = Number(latest.toFixed(decimals));
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).replace(/,/g, separator);
  });

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplayValue(to);
      return;
    }

    const controls = animate(motionValue, to, {
      duration,
      ease: EASING.smooth,
    });

    const unsubscribe = rounded.onChange((latest) => {
      setDisplayValue(latest);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [to, duration, motionValue, rounded]);

  if (prefersReducedMotion()) {
    const formattedValue = to.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).replace(/,/g, separator);
    
    return (
      <span className={className}>
        {prefix}{formattedValue}{suffix}
      </span>
    );
  }

  return (
    <motion.span className={className}>
      {prefix}{displayValue}{suffix}
    </motion.span>
  );
};

// Modal backdrop component
interface ModalBackdropProps {
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export const ModalBackdrop: React.FC<ModalBackdropProps> = ({
  children,
  onClose,
  className,
}) => {
  const backdropVariant = prefersReducedMotion()
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      };

  return (
    <motion.div
      className={cn(
        'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center',
        className
      )}
      onClick={onClose}
      {...backdropVariant}
    >
      {children}
    </motion.div>
  );
};

// Modal content component
interface ModalContentProps {
  children: ReactNode;
  className?: string;
}

export const ModalContent: React.FC<ModalContentProps> = ({ children, className }) => {
  const contentVariant = prefersReducedMotion()
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 10 },
        transition: { duration: 0.2, ease: EASING.easeOut },
      };

  return (
    <motion.div
      className={cn('bg-card rounded-lg shadow-strong max-w-md w-full mx-4', className)}
      onClick={(e) => e.stopPropagation()}
      {...contentVariant}
    >
      {children}
    </motion.div>
  );
};

// Skeleton loader component
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, lines = 1 }) => {
  if (lines === 1) {
    return <div className={cn('skeleton h-4', className)} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'skeleton h-4',
            i === lines - 1 && 'w-3/4', // Last line is shorter
            className
          )}
        />
      ))}
    </div>
  );
};

// Motion preference provider component
interface MotionConfigProps {
  children: ReactNode;
  reducedMotion?: boolean;
}

export const MotionConfig: React.FC<MotionConfigProps> = ({ 
  children, 
  reducedMotion 
}) => {
  const systemPreference = useMotionPreference();
  const shouldReduceMotion = reducedMotion ?? systemPreference;

  return (
    <div data-reduce-motion={shouldReduceMotion}>
      {children}
    </div>
  );
};