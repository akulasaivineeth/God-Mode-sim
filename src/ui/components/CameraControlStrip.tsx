/**
 * VIS-002 player camera strip — presets plus zoom / recenter controls.
 */
import type { CSSProperties } from 'react';
import type { CameraView } from '@/rendering/cameraPresets';
import { dollyPlayerCamera } from '@/rendering/cameraPlayerControl';

const CAMERA_VIEWS: { id: CameraView; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'angled', label: 'Angled' },
  { id: 'street', label: 'Street' },
];

interface CameraControlStripProps {
  activeView: CameraView;
  onSelectView: (view: CameraView) => void;
  onReset: () => void;
}

const btnBase: CSSProperties = {
  padding: '5px 10px',
  cursor: 'pointer',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 6,
  fontWeight: 500,
};

export function CameraControlStrip({ activeView, onSelectView, onReset }: CameraControlStripProps) {
  return (
    <div
      data-testid="camera-controls"
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 8,
        background: 'rgba(12, 14, 18, 0.88)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 11,
          color: '#9aa3ab',
        }}
      >
        Camera
      </div>
      {CAMERA_VIEWS.map((view) => {
        const active = view.id === activeView;
        return (
          <button
            key={view.id}
            type="button"
            data-testid={`camera-${view.id}`}
            onClick={() => onSelectView(view.id)}
            style={{
              ...btnBase,
              color: active ? '#0b0d10' : '#d8dee9',
              background: active ? '#8fb6e0' : 'rgba(255,255,255,0.06)',
              fontWeight: active ? 700 : 500,
            }}
          >
            {view.label}
          </button>
        );
      })}
      <div
        data-testid="camera-zoom-controls"
        style={{ display: 'flex', gap: 4, marginTop: 2 }}
      >
        <button
          type="button"
          data-testid="camera-zoom-in"
          aria-label="Zoom in"
          onClick={() => dollyPlayerCamera(0.82)}
          style={{
            ...btnBase,
            flex: 1,
            color: '#d8dee9',
            background: 'rgba(255,255,255,0.08)',
            fontSize: 16,
            lineHeight: 1,
            padding: '4px 0',
          }}
        >
          +
        </button>
        <button
          type="button"
          data-testid="camera-zoom-out"
          aria-label="Zoom out"
          onClick={() => dollyPlayerCamera(1.22)}
          style={{
            ...btnBase,
            flex: 1,
            color: '#d8dee9',
            background: 'rgba(255,255,255,0.08)',
            fontSize: 16,
            lineHeight: 1,
            padding: '4px 0',
          }}
        >
          −
        </button>
        <button
          type="button"
          data-testid="camera-reset"
          onClick={onReset}
          style={{
            ...btnBase,
            flex: 2,
            color: '#d8dee9',
            background: 'rgba(255,255,255,0.06)',
            fontSize: 11,
          }}
        >
          Reset
        </button>
      </div>
      <div
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 10,
          color: '#6b7480',
          maxWidth: 148,
          lineHeight: 1.35,
        }}
      >
        Drag orbit · right/middle pan · scroll zoom · pinch on touch
      </div>
    </div>
  );
}
