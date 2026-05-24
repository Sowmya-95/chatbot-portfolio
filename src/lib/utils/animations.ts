import { gsap } from 'gsap';

// Reusable GSAP easing presets
export const springConfig = {
  gentle: 'elastic.out(0.5, 0.3)',
  bouncy: 'elastic.out(1, 0.3)',
  smooth: 'power3.out',
  snap: 'back.out(1.7)'
};

// 3D tilt effect on mouse move — disabled on touch devices
export function create3DTilt(element: HTMLElement, intensity = 10) {
  if ('ontouchstart' in window) return { destroy() {} };

  const onMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(element, {
      rotateY: x * intensity,
      rotateX: -y * intensity,
      transformPerspective: 800,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const onLeave = () => {
    gsap.to(element, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: springConfig.gentle
    });
  };

  element.style.transformStyle = 'preserve-3d';
  element.addEventListener('mousemove', onMove);
  element.addEventListener('mouseleave', onLeave);

  return {
    destroy() {
      element.removeEventListener('mousemove', onMove);
      element.removeEventListener('mouseleave', onLeave);
    }
  };
}

// Magnetic hover — element shifts toward cursor
export function createMagneticHover(element: HTMLElement, strength = 0.3) {
  if ('ontouchstart' in window) return { destroy() {} };

  const onMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    gsap.to(element, {
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const onLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: springConfig.gentle
    });
  };

  element.addEventListener('mousemove', onMove);
  element.addEventListener('mouseleave', onLeave);

  return {
    destroy() {
      element.removeEventListener('mousemove', onMove);
      element.removeEventListener('mouseleave', onLeave);
    }
  };
}

// Click ripple effect
export function createRipple(event: MouseEvent, element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height);

  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${event.clientX - rect.left - size / 2}px;
    top: ${event.clientY - rect.top - size / 2}px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 245, 255, 0.4) 0%, transparent 70%);
    pointer-events: none;
    z-index: 100;
  `;

  element.style.position = element.style.position || 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);

  gsap.fromTo(ripple,
    { scale: 0, opacity: 1 },
    { scale: 2.5, opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => ripple.remove() }
  );
}
