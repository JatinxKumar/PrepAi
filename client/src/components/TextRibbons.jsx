/**
 * TextRibbons.jsx
 * ───────────────
 * Lightweight curved text ribbons that float around the hero section,
 * inspired by the Flow.ai website aesthetic.
 * 
 * Uses SVG <textPath> on elliptical paths with pure CSS animation.
 * Zero JavaScript animation loops — all GPU-accelerated CSS transforms.
 */

import React from 'react';
import './TextRibbons.css';

const ribbonTexts = [
  {
    id: 'ribbon-1',
    text: 'Reading package.json and runtime config · Mapping pages, routes, and UI surfaces · Building interview-ready explanation · Detecting frameworks and dependencies · ',
    direction: 'normal',
    duration: '60s',
    className: 'ribbon-top-left',
  },
  {
    id: 'ribbon-2',
    text: 'Analyzing code quality and architecture · Generating placement-ready bullets · Scoring project health and scalability · Preparing viva follow-up questions · ',
    direction: 'reverse',
    duration: '55s',
    className: 'ribbon-bottom-right',
  },
  {
    id: 'ribbon-3',
    text: 'AI agent reads your repo like a senior engineer · Turns implementation into sharp explanation · Resume builder pulls scope and outcomes · Mock interview simulates real pressure · ',
    direction: 'normal',
    duration: '70s',
    className: 'ribbon-mid',
  },
];

export default function TextRibbons() {
  return (
    <div className="text-ribbons-container" aria-hidden="true">
      {ribbonTexts.map((ribbon) => (
        <svg
          key={ribbon.id}
          className={`ribbon-svg ${ribbon.className}`}
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <path
              id={`${ribbon.id}-path`}
              d={getPathForRibbon(ribbon.className)}
              fill="none"
            />
          </defs>
          <text className="ribbon-text">
            <textPath
              href={`#${ribbon.id}-path`}
              startOffset="0%"
              style={{
                animation: `ribbonScroll ${ribbon.duration} linear infinite`,
                animationDirection: ribbon.direction,
              }}
            >
              {ribbon.text}
              {ribbon.text}
            </textPath>
          </text>
        </svg>
      ))}
    </div>
  );
}

function getPathForRibbon(className) {
  switch (className) {
    case 'ribbon-top-left':
      // Large sweeping curve from top-left area going across
      return 'M -100,200 C 150,50 400,-30 600,100 C 800,230 950,350 1300,180';
    case 'ribbon-bottom-right':
      // Curve from bottom-right sweeping upward
      return 'M 1300,650 C 1050,780 800,830 550,700 C 300,570 100,480 -100,620';
    case 'ribbon-mid':
      // Gentle S-curve through the middle area
      return 'M -50,450 C 200,350 400,500 600,420 C 800,340 1000,480 1250,400';
    default:
      return 'M 0,400 C 400,300 800,500 1200,400';
  }
}
