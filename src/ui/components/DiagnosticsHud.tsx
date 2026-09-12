import { useDiagnosticsStore } from '../stores/diagnosticsStore';

export function DiagnosticsHud() {
  const {
    seed,
    fps,
    lastWorkerStepMs,
    totalSteps,
    renderSnapshot,
    lastDigest,
    workerReady,
  } = useDiagnosticsStore();

  return (
    <aside
      data-testid="diagnostics-hud"
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        width: 280,
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
      <div style={{ fontWeight: 600, marginBottom: 8 }}>GOD MODE — M00 Diagnostics</div>
      <div>Worker: {workerReady ? 'ready' : 'initializing'}</div>
      <div>Seed: {seed || '—'}</div>
      <div>FPS: {fps.toFixed(1)}</div>
      <div>Worker step: {lastWorkerStepMs.toFixed(2)} ms</div>
      <div>Total steps: {totalSteps}</div>
      <div>Sim minute: {renderSnapshot?.simMinute ?? 0}</div>
      <div>Accumulator: {renderSnapshot?.accumulator ?? 0}</div>
      <div>Last choice: {renderSnapshot?.lastChoice ?? '—'}</div>
      <div style={{ marginTop: 8, wordBreak: 'break-all' }}>
        Digest: {lastDigest ?? '—'}
      </div>
    </aside>
  );
}
