import { useDiagnosticsStore } from '../stores/diagnosticsStore';

function speedLabel(speed: number, paused: boolean): string {
  if (paused) return 'Paused';
  return `${speed}×`;
}

export function DiagnosticsHud() {
  const {
    seed,
    fps,
    lastWorkerStepMs,
    totalSteps,
    renderSnapshot,
    lastDigest,
    workerReady,
    speed,
    paused,
    animationsSuppressed,
  } = useDiagnosticsStore();

  const calendar = renderSnapshot?.calendar;

  return (
    <aside
      data-testid="diagnostics-hud"
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        width: 288,
        padding: 12,
        background: 'rgba(12, 14, 18, 0.88)',
        color: '#d8dee9',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12,
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.08)',
        zIndex: 10,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>GOD MODE — M01 Diagnostics</div>

      <div style={{ fontSize: 15, fontWeight: 700, color: '#e8c15a' }} data-testid="hud-clock">
        {calendar ? calendar.clockLabel : '--:--'}{' '}
        <span style={{ fontSize: 11, color: '#9aa3ab' }}>
          {calendar?.isDaytime ? 'day' : 'night'}
        </span>
      </div>
      <div data-testid="hud-date">
        {calendar
          ? `${calendar.weekday}, ${calendar.monthName} ${calendar.dayOfMonth}, Year ${calendar.year}`
          : '—'}
      </div>
      <div>Season: {calendar?.season ?? '—'}</div>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '8px 0' }} />

      <div>
        Speed: <span data-testid="hud-speed">{speedLabel(speed, paused)}</span>
        {animationsSuppressed ? ' (anim suppressed)' : ''}
      </div>
      <div>Sim minute: {renderSnapshot?.simMinute ?? 0}</div>
      <div>Worker: {workerReady ? 'ready' : 'initializing'}</div>
      <div>Seed: {seed || '—'}</div>
      <div>FPS: {fps.toFixed(1)}</div>
      <div>Worker step: {lastWorkerStepMs.toFixed(2)} ms</div>
      <div>Total step msgs: {totalSteps}</div>
      <div style={{ marginTop: 8, wordBreak: 'break-all' }}>Digest: {lastDigest ?? '—'}</div>
    </aside>
  );
}
