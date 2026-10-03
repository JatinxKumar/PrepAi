// import React, { useEffect, useRef } from 'react';

// export default function CursorGlow() {
//   const ringRef = useRef(null);

//   useEffect(() => {
//     const ring = ringRef.current;

//     if (!ring) return;

//     // Track real-time mouse position
//     let mouseX = 0;
//     let mouseY = 0;

//     // Position of outer ring (with interpolation lag)
//     let ringX = 0;
//     let ringY = 0;

//     let isVisible = false;

//     const move = (e) => {
//       mouseX = e.clientX;
//       mouseY = e.clientY;

//       // Make it visible on the first move
//       if (!isVisible) {
//         isVisible = true;
//         ring.style.opacity = '1';
//       }
//     };

//     // Smooth animation loop for the outer trailing ring
//     let animationFrameId;
//     const updateRing = () => {
//       const ease = 0.30; // Smooth trailing delay speed (lower = slower trail)
//       ringX += (mouseX - ringX) * ease;
//       ringY += (mouseY - ringY) * ease;

//       ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

//       animationFrameId = requestAnimationFrame(updateRing);
//     };

//     // Hover interactions with buttons, links and clickable elements
//     const handleMouseOver = (e) => {
//       const target = e.target;
//       if (target && target.closest('a, button, [role="button"], input, select, textarea, .hover-target, a *, button *')) {
//         ring.classList.add('cursor-hover');
//       } else {
//         ring.classList.remove('cursor-hover');
//       }
//     };

//     // Hide custom cursor when mouse leaves the viewport
//     const handleMouseLeave = () => {
//       isVisible = false;
//       ring.style.opacity = '0';
//     };

//     window.addEventListener('mousemove', move);
//     window.addEventListener('mouseover', handleMouseOver);
//     document.addEventListener('mouseleave', handleMouseLeave);

//     // Start with 0 opacity so there is no jumpy initial render in the top-left
//     ring.style.opacity = '0';

//     // Add smooth CSS transition definitions for sizing/opacity changes
//     ring.style.transition = 'opacity 0.2s ease, width 0.2s ease, height 0.2s ease, border-color 0.2s ease, background-color 0.2s ease';

//     animationFrameId = requestAnimationFrame(updateRing);

//     return () => {
//       window.removeEventListener('mousemove', move);
//       window.removeEventListener('mouseover', handleMouseOver);
//       document.removeEventListener('mouseleave', handleMouseLeave);
//       cancelAnimationFrame(animationFrameId);
//     };
//   }, []);

//   return (
//     <>
//       <div ref={ringRef} className="custom-cursor-ring" />
//     </>
//   );
// }


import React, { useEffect, useRef } from "react";

export default function CursorGlow() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!dot || !ring) return;

    // Only enable custom cursor on devices
    // that actually have a precise mouse/pointer.
    const supportsCustomCursor =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!supportsCustomCursor) {
      return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Outer ring position.
    // This is intentionally slightly behind
    // the real mouse position for a premium feel.
    let ringX = mouseX;
    let ringY = mouseY;

    let isMouseInside = false;
    let animationFrameId = null;

    // --------------------------------------------------
    // Mouse movement
    // --------------------------------------------------

    const handleMouseMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      // The center dot follows the mouse immediately.
      // This prevents the cursor from feeling delayed.
      dot.style.transform = `translate3d(
        ${mouseX}px,
        ${mouseY}px,
        0
      ) translate(-50%, -50%)`;

      // Show cursor after first mouse movement.
      if (!isMouseInside) {
        isMouseInside = true;

        dot.classList.add("cursor-visible");
        ring.classList.add("cursor-visible");

        // Prevent the ring from jumping from the
        // top-left corner when it first appears.
        ringX = mouseX;
        ringY = mouseY;
      }
    };

    // --------------------------------------------------
    // Smooth outer ring animation
    // --------------------------------------------------

    const animateRing = () => {
      /*
        0.35 gives a subtle premium trailing effect.

        Lower values:
        0.10 = very slow / noticeable lag
        0.15 = your old laggy cursor
        0.25 = smooth
        0.35 = responsive + premium
        0.50 = almost instant
        1.00 = completely instant
      */

      const ease = 0.35;

      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;

      ring.style.transform = `translate3d(
        ${ringX}px,
        ${ringY}px,
        0
      ) translate(-50%, -50%)`;

      animationFrameId = requestAnimationFrame(animateRing);
    };

    // --------------------------------------------------
    // Detect interactive elements
    // --------------------------------------------------

    const handleMouseOver = (event) => {
      const target = event.target;

      if (!target) return;

      const interactiveElement = target.closest(
        `
        a,
        button,
        input,
        textarea,
        select,
        [role="button"],
        [data-cursor="hover"],
        .hover-target
        `
      );

      if (interactiveElement) {
        ring.classList.add("cursor-hover");
        dot.classList.add("cursor-hover");
      } else {
        ring.classList.remove("cursor-hover");
        dot.classList.remove("cursor-hover");
      }
    };

    // --------------------------------------------------
    // Mouse leaves viewport
    // --------------------------------------------------

    const handleMouseLeave = () => {
      isMouseInside = false;

      dot.classList.remove("cursor-visible");
      ring.classList.remove("cursor-visible");

      dot.classList.remove("cursor-hover");
      ring.classList.remove("cursor-hover");
    };

    // --------------------------------------------------
    // Mouse enters viewport again
    // --------------------------------------------------

    const handleMouseEnter = () => {
      if (!isMouseInside) {
        dot.classList.add("cursor-visible");
        ring.classList.add("cursor-visible");
      }
    };

    // --------------------------------------------------
    // Event listeners
    // --------------------------------------------------

    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });

    window.addEventListener("mouseover", handleMouseOver, {
      passive: true,
    });

    document.addEventListener("mouseleave", handleMouseLeave);

    document.addEventListener("mouseenter", handleMouseEnter);

    // Start animation loop.
    animationFrameId = requestAnimationFrame(animateRing);

    // --------------------------------------------------
    // Cleanup
    // --------------------------------------------------

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);

      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <>
      {/* 
        Small center dot.

        This follows the real mouse position instantly.
        It gives the user a precise pointer reference.
      */}
      <div
        ref={dotRef}
        className="custom-cursor-dot"
        aria-hidden="true"
      />

      {/*
        Outer ring.

        This follows the mouse with a tiny delay
        to create the premium smooth effect.
      */}
      <div
        ref={ringRef}
        className="custom-cursor-ring"
        aria-hidden="true"
      />
    </>
  );
}