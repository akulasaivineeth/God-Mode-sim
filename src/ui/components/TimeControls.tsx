/**
 * Time controls — SIM-TIME-002 / SIM-TIME-003.
 *
 * Plain English: The speed buttons (Pause … 1000×). Selecting one tells the
 * SimulationDriver how fast simulated time should flow. This is a UI surface;
 * it holds no simulation authority.
 */
import { SIM_SPEEDS, type SimSpeed } from '@/simulation/core/speed';
import { useDiagnosticsStore } from '../stores/diagnosticsStore';

interface TimeControlsProps {
  onSelectSpeed: (speed: SimSpeed) => void;
}

function speedLabel(speed: SimSpeed): string {
  return speed === 0 ? 'Pause' : `${speed}×`;
}

export function TimeControls({ onSelectSpeed }: TimeControlsProps) {
  const speed = useDiagnosticsStore((state) => state.speed);

  return (
    <div
      data-testid="time-controls"
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 6,
        padding: 8,
        background: 'rgba(12, 14, 18, 0.88)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        zIndex: 10,
      }}
    >
      {SIM_SPEEDS.map((option) => {
        const active = option === speed;
        return (
          <button
            key={option}
            data-testid={`speed-${option}`}
            aria-pressed={active}
            onClick={() => onSelectSpeed(option)}
            style={{
              minWidth: option === 0 ? 64 : 52,
              padding: '6px 10px',
              cursor: 'pointer',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 12,
              color: active ? '#0b0d10' : '#d8dee9',
              background: active ? '#e8c15a' : 'rgba(255,255,255,0.06)',
              border: active ? '1px solid #e8c15a' : '1px solid rgba(255,255,255,0.12)',
              borderRadius: 6,
              fontWeight: active ? 700 : 500,
            }}
          >
            {speedLabel(option)}
          </button>
        );
      })}
    </div>
  );
}
