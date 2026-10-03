/**
 * AnalysisWave.jsx
 * ────────────────
 * Lightweight CSS-only waveform/pulse indicator,
 * inspired by Flow.ai's audio waveform widget.
 * Adapted for prepAi: shows "analysis in progress" feel.
 *
 * Pure CSS animation — zero JS overhead.
 */


const bars = Array.from({ length: 24 }, (_, i) => i);

export default function AnalysisWave() {
  return (
    <div className="analysis-wave-wrapper">
      <div className="analysis-wave-pill">
        <div className="wave-bars">
          {bars.map((i) => (
            <span
              key={i}
              className="wave-bar"
              style={{
                animationDelay: `${i * 0.07}s`,
                height: `${12 + Math.sin(i * 0.7) * 10}px`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
