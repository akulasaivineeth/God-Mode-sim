/**
 * Citizen inspector — UX-001 / NPC-DEC-001 (spec §28).
 *
 * Plain English: a read-only panel showing the selected citizen's needs, current
 * activity, and — crucially — the traceable reasoning behind their last decision:
 * every candidate action with its utility score and factor breakdown, and which
 * one was selected. It updates live while the simulation runs (it does not pause
 * the citizen).
 */
import { useDiagnosticsStore } from '../stores/diagnosticsStore';
import type { Need } from '@/simulation/model/types';

const NEED_ORDER: Need[] = ['energy', 'hunger', 'thirst', 'bladder', 'hygiene'];
const NEED_LABEL: Record<Need, string> = {
  energy: 'Energy',
  hunger: 'Fullness',
  thirst: 'Hydration',
  bladder: 'Bladder',
  hygiene: 'Hygiene',
};

function barColor(value: number): string {
  if (value >= 50) return '#5fb96a';
  if (value >= 25) return '#d8b84a';
  return '#d8654a';
}

function NeedBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 3 }}>
        <div
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            height: '100%',
            background: barColor(value),
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );
}

export function CitizenInspector() {
  const citizen = useDiagnosticsStore((s) => s.renderSnapshot?.citizen ?? null);
  const open = useDiagnosticsStore((s) => s.citizenSelected);
  const setSelected = useDiagnosticsStore((s) => s.setCitizenSelected);

  if (!citizen || !open) {
    return null;
  }

  const decision = citizen.lastDecision;

  return (
    <aside
      data-testid="citizen-inspector"
      style={{
        position: 'fixed',
        top: 12,
        left: 150,
        width: 300,
        maxHeight: '88vh',
        overflowY: 'auto',
        padding: 12,
        background: 'rgba(12, 14, 18, 0.9)',
        color: '#d8dee9',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12,
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.08)',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 700 }}>{citizen.name} — Inspector</span>
        <button
          data-testid="inspector-close"
          onClick={() => setSelected(false)}
          style={{
            cursor: 'pointer',
            background: 'transparent',
            color: '#9aa3ab',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 4,
            fontSize: 11,
            padding: '1px 6px',
          }}
        >
          ✕
        </button>
      </div>

      <div data-testid="inspector-activity" style={{ marginBottom: 8, color: '#e8c15a' }}>
        {citizen.activity}
      </div>

      <div style={{ fontWeight: 600, margin: '6px 0 4px' }}>Needs</div>
      {NEED_ORDER.map((need) => (
        <NeedBar key={need} label={NEED_LABEL[need]} value={citizen.needs[need]} />
      ))}

      <div style={{ fontWeight: 600, margin: '10px 0 4px' }}>
        Last decision {decision ? `(${decision.layer})` : ''}
      </div>
      {decision ? (
        <div>
          <div style={{ marginBottom: 6 }}>
            Selected: <strong data-testid="inspector-selected">{decision.selected}</strong>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#9aa3ab' }}>
                <th style={{ textAlign: 'left', fontWeight: 500 }}>action</th>
                <th style={{ textAlign: 'right', fontWeight: 500 }}>score</th>
              </tr>
            </thead>
            <tbody>
              {decision.candidates.map((c) => (
                <tr
                  key={c.action}
                  style={{
                    color: c.action === decision.selected ? '#e8c15a' : '#d8dee9',
                    fontWeight: c.action === decision.selected ? 700 : 400,
                  }}
                >
                  <td>{c.action}</td>
                  <td style={{ textAlign: 'right' }}>{c.score}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {(() => {
            const sel = decision.candidates.find((c) => c.action === decision.selected);
            if (!sel) return null;
            return (
              <div style={{ marginTop: 8 }}>
                <div style={{ color: '#9aa3ab', marginBottom: 2 }}>Selected factor breakdown:</div>
                {sel.factors.map((f, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{f.label}</span>
                    <span>{f.value}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      ) : (
        <div style={{ color: '#9aa3ab' }}>No decision yet.</div>
      )}
    </aside>
  );
}
