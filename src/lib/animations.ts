import { MotiTransition } from 'moti';

// Fade in animation
export const fadeIn = {
  from: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { type: 'timing', duration: 300 },
} as const;

// Fade in with delay
export const fadeInWithDelay = (delay: number) =>
  ({
    from: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { type: 'timing', duration: 300, delay },
  } as const);

// Slide up and fade in
export const slideUpAndFadeIn = {
  from: { opacity: 0, translateY: 10 },
  animate: { opacity: 1, translateY: 0 },
  transition: { type: 'timing', duration: 300 },
} as const;

// Slide up and fade in with delay
export const slideUpAndFadeInWithDelay = (delay: number) =>
  ({
    from: { opacity: 0, translateY: 10 },
    animate: { opacity: 1, translateY: 0 },
    transition: { type: 'timing', duration: 300, delay },
  } as const);

// Spring animation for cards
export const springInWithDelay = (delay: number) =>
  ({
    from: { opacity: 0, translateY: 10 },
    animate: { opacity: 1, translateY: 0 },
    transition: { type: 'spring', delay, damping: 15, mass: 0.8 },
  } as const);

// Welcome message animation
export const welcomeAnimation = {
  from: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { type: 'timing', duration: 800 },
} as const;

// Loading bar animation
export const loadingBarAnimation = (delay: number) =>
  ({
    from: {
      height: 0,
      opacity: 0.4,
    },
    animate: {
      height: 20,
      opacity: 1,
    },
    transition: {
      type: 'spring',
      delay,
      damping: 10,
      mass: 0.8,
    },
  } as const);
