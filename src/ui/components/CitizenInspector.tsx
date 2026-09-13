import type { RenderCitizen, RenderSnapshot } from '@/rendering/types';
import type { UtilityTrace } from '@/simulation/core/citizens/types';

interface CitizenInspectorProps {
  renderSnapshot: RenderSnapshot | null;
  selectedCitizen: RenderCitizen | null;
}

function NeedBar({ label, value, invert = false }: { label: string; value: number; invert?: boolean }) {
  const display = invert ? value : value;
  const pct = invert
    ? Math.max(0, Math.min(100, value))
    : Math.max(0, Math.min(100, value));
  const urgency = invert ? 100 - pct : pct;
  const color = urgency >= 75 ? '#e07a6d' : urgency >= 50 ? '#d9b15a' : '#7fbf8a';
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#b8c0c8' }}>
        <span>{label}</span>
        <span>{Math.round(display)}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color }} />
      </div>
    </div>
  );
}

function UtilityBreakdown({ trace }: { trace: UtilityTrace }) {
  const selected =
    trace.candidates.find(
      (candidate) =>
        candidate.action === trace.selectedAction && candidate.targetFacilityId === trace.targetFacilityId,
    ) ?? trace.candidates[0];

  return (
    <div style={{ marginTop: 12 }} data-testid="utility-breakdown">
      <div style={{ fontSize: 11, color: '#9aa3ab', marginBottom: 6 }}>
        Layer {trace.layer} · {trace.selectedAction}
        {trace.targetFacilityId ? ` @ ${trace.targetFacilityId}` : ''}
      </div>
      {selected?.contributors.map((entry) => (
        <div
          key={entry.factor}
          data-testid={`utility-factor-${entry.factor}`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#d8dee9',
            padding: '2px 0',
          }}
        >
          <span>{entry.factor}</span>
          <span>{entry.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

export function CitizenInspector({ renderSnapshot, selectedCitizen }: CitizenInspectorProps) {
  if (!renderSnapshot || !selectedCitizen) {
    return (
      <div
        data-testid="citizen-inspector-empty"
        style={{
          position: 'fixed',
          right: 12,
          top: 12,
          width: 280,
          padding: 12,
          background: 'rgba(12, 14, 18, 0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          color: '#9aa3ab',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 12,
          zIndex: 10,
        }}
      >
        Click Alex in the world to inspect needs and utility scores.
      </div>
    );
  }

  const needs = selectedCitizen.needs;
  const trace = renderSnapshot.inspectorTrace;

  return (
    <div
      data-testid="citizen-inspector"
      style={{
        position: 'fixed',
        right: 12,
        top: 12,
        width: 300,
        maxHeight: '80vh',
        overflow: 'auto',
        padding: 12,
        background: 'rgba(12, 14, 18, 0.92)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 13,
          color: '#e8edf2',
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        {selectedCitizen.displayName}
      </div>
      <div style={{ fontSize: 11, color: '#8fb6e0', marginBottom: 10 }} data-testid="citizen-current-action">
        {selectedCitizen.action}
        {selectedCitizen.currentFacilityId ? ` · ${selectedCitizen.currentFacilityId}` : ' · traveling'}
      </div>

      <NeedBar label="Hunger" value={needs.hunger} />
      <NeedBar label="Thirst" value={needs.thirst} />
      <NeedBar label="Bladder" value={needs.bladder} />
      <NeedBar label="Energy" value={needs.energy} invert />
      <NeedBar label="Hygiene" value={needs.hygiene} invert />

      {trace ? <UtilityBreakdown trace={trace} /> : null}
    </div>
  );
}
