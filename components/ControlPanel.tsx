"use client";
import type { FieldMode } from "@/lib/fieldMath";

interface Props {
  mode: FieldMode;
  setMode: (m: FieldMode) => void;
  freq: number;
  setFreq: (v: number) => void;
  amp: number;
  setAmp: (v: number) => void;
  speed: number;
  setSpeed: (v: number) => void;
  showE: boolean;
  setShowE: (v: boolean) => void;
  showB: boolean;
  setShowB: (v: boolean) => void;
  showS: boolean;
  setShowS: (v: boolean) => void;
  showA: boolean;
  setShowA: (v: boolean) => void;
  showWave: boolean;
  setShowWave: (v: boolean) => void;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  // live readouts
  ePeak: string;
  bPeak: string;
  lambda: string;
  sAvg: string;
}

const MODES: { id: FieldMode; label: string }[] = [
  { id: "plane", label: "plane wave" },
  { id: "standing", label: "standing" },
  { id: "dipole", label: "dipole" },
  { id: "circular", label: "circular pol" },
];

const MAXWELL = [
  {
    name: "Gauss's law (electric)",
    math: "∇·E = ρ/ε₀",
    desc: "Electric field lines originate from positive charges and terminate on negative charges.",
    modes: ["plane", "dipole", "standing", "circular"] as FieldMode[],
  },
  {
    name: "Gauss's law (magnetic)",
    math: "∇·B = 0",
    desc: "No magnetic monopoles. B field lines always form closed loops.",
    modes: ["plane", "standing", "circular"] as FieldMode[],
  },
  {
    name: "Faraday's law",
    math: "∇×E = −∂B/∂t",
    desc: "A time-varying B field induces a curling E field — the basis of induction.",
    modes: ["plane", "standing", "circular", "dipole"] as FieldMode[],
  },
  {
    name: "Ampère–Maxwell law",
    math: "∇×B = μ₀(J + ε₀∂E/∂t)",
    desc: "Maxwell's addition of ∂E/∂t was the key insight that predicted EM waves.",
    modes: ["plane", "standing", "circular", "dipole"] as FieldMode[],
  },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        width: 30,
        height: 16,
        background: on ? "var(--blue)" : "var(--border)",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background .2s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 14 : 2,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "white",
          transition: "left .2s",
          display: "block",
        }}
      />
    </button>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        marginRight: 6,
        flexShrink: 0,
      }}
    />
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: "var(--text2)",
          marginBottom: 5,
        }}
      >
        <span>{label}</span>
        <span style={{ color: "var(--text)" }}>
          {value.toFixed(1)}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

export default function ControlPanel(props: Props) {
  const { mode, freq, amp, speed, showE, showB, showS, showWave, isPaused } =
    props;

  return (
    <div
      className="w-full md:w-[280px] shrink-0 bg-[#070a18] border-t md:border-t-0 md:border-l border-[rgba(80,140,255,0.15)] flex flex-col md:overflow-y-auto z-10"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* Mode */}
      <div
        style={{
          borderBottom: "0.5px solid var(--border)",
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: ".12em",
            color: "var(--text2)",
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          Field Mode
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => props.setMode(m.id)}
              style={{
                padding: "7px 6px",
                borderRadius: 6,
                fontSize: 10,
                border:
                  mode === m.id
                    ? "0.5px solid var(--blue)"
                    : "0.5px solid var(--border)",
                background:
                  mode === m.id ? "rgba(74,158,255,0.12)" : "transparent",
                color: mode === m.id ? "var(--blue)" : "var(--text2)",
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: ".04em",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visibility */}
      <div
        style={{
          borderBottom: "0.5px solid var(--border)",
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: ".12em",
            color: "var(--text2)",
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          Field Components
        </div>
        {[
          {
            key: "E",
            label: "E field (electric)",
            color: "#4a9eff",
            val: showE,
            set: props.setShowE,
          },
          {
            key: "B",
            label: "B field (magnetic)",
            color: "#ff8c3a",
            val: showB,
            set: props.setShowB,
          },
          {
            key: "S",
            label: "Poynting S = E×B",
            color: "#3affb0",
            val: showS,
            set: props.setShowS,
          },
          {
            key: "C",
            label: "Continuous Wave (Green)",
            color: "#00ff00",
            val: props.showA,
            set: props.setShowA,
          },
          {
            key: "W",
            label: "Wavefronts",
            color: "#ff4a7a",
            val: showWave,
            set: props.setShowWave,
          },
        ].map((row) => (
          <div
            key={row.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
              fontSize: 11,
              color: "var(--text2)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <Dot color={row.color} />
              {row.label}
            </span>
            <Toggle on={row.val} onClick={() => row.set(!row.val)} />
          </div>
        ))}
      </div>

      {/* Parameters */}
      <div
        style={{
          borderBottom: "0.5px solid var(--border)",
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: ".12em",
            color: "var(--text2)",
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          Wave Parameters
        </div>
        <SliderRow
          label="frequency ω"
          value={freq}
          min={0.2}
          max={4}
          step={0.1}
          unit=" rad/s"
          onChange={props.setFreq}
        />
        <SliderRow
          label="amplitude A"
          value={amp}
          min={0.2}
          max={2}
          step={0.1}
          unit=""
          onChange={props.setAmp}
        />
        <SliderRow
          label="wave speed c"
          value={speed}
          min={0.1}
          max={3}
          step={0.1}
          unit=" c"
          onChange={props.setSpeed}
        />
      </div>

      {/* Playback */}
      <div
        style={{
          borderBottom: "0.5px solid var(--border)",
          padding: "12px 16px",
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: ".12em",
            color: "var(--text2)",
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          Playback
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={isPaused ? props.onResume : props.onPause}
            style={{
              flex: 1,
              padding: "6px 0",
              fontSize: 10,
              borderRadius: 6,
              cursor: "pointer",
              border: "0.5px solid var(--border-hi)",
              background: "rgba(74,158,255,0.1)",
              color: "var(--blue)",
              fontFamily: "inherit",
            }}
          >
            {isPaused ? "▶ resume" : "⏸ pause"}
          </button>
          <button
            onClick={props.onReset}
            style={{
              flex: 1,
              padding: "6px 0",
              fontSize: 10,
              borderRadius: 6,
              cursor: "pointer",
              border: "0.5px solid var(--border)",
              background: "transparent",
              color: "var(--text2)",
              fontFamily: "inherit",
            }}
          >
            ↺ reset
          </button>
        </div>
      </div>

      {/* Maxwell's equations */}
      <div style={{ padding: "14px 16px", flex: 1 }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: ".12em",
            color: "var(--text2)",
            marginBottom: 12,
            textTransform: "uppercase",
          }}
        >
          Maxwell&apos;s Equations
        </div>
        {MAXWELL.map((eq, i) => {
          const active = eq.modes.includes(mode);
          return (
            <div
              key={i}
              style={{
                marginBottom: 10,
                padding: "10px 11px",
                borderRadius: 7,
                border: active
                  ? "0.5px solid rgba(74,158,255,0.45)"
                  : "0.5px solid var(--border)",
                background: active
                  ? "rgba(74,158,255,0.06)"
                  : "rgba(10,15,35,0.6)",
                transition: "all .25s",
              }}
            >
              <div
                style={{
                  fontFamily: "'Crimson Pro',serif",
                  fontStyle: "italic",
                  fontSize: 11,
                  color: "var(--text2)",
                  marginBottom: 4,
                }}
              >
                {eq.name}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: active ? "var(--blue)" : "var(--text2)",
                  marginBottom: 4,
                  letterSpacing: ".02em",
                }}
              >
                {eq.math}
              </div>
              <div
                style={{ fontSize: 10, color: "var(--text2)", lineHeight: 1.6 }}
              >
                {eq.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live readouts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          padding: "12px 16px",
          borderTop: "0.5px solid var(--border)",
          flexShrink: 0,
        }}
      >
        {[
          { label: "|E| peak", val: props.ePeak },
          { label: "|B| peak", val: props.bPeak },
          { label: "λ", val: props.lambda },
          { label: "|S| avg", val: props.sAvg },
        ].map((r) => (
          <div
            key={r.label}
            style={{
              background: "rgba(10,15,35,0.8)",
              borderRadius: 6,
              padding: "7px 9px",
              border: "0.5px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "var(--text2)",
                marginBottom: 3,
                letterSpacing: ".06em",
              }}
            >
              {r.label}
            </div>
            <div
              style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}
            >
              {r.val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
