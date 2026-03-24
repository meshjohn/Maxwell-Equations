"use client";

import { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";

// ─── Axis lines (uses primitive to avoid <line> → SVGLineElement TS conflict) ─
function AxisLines() {
  const lines = useMemo(() => [
    { p1: [-9, 0, 0] as const, p2: [9, 0, 0] as const, color: 0x1a2244 },
    { p1: [0, -5, 0] as const, p2: [0, 5, 0] as const, color: 0x1a2244 },
    { p1: [0, 0, -9] as const, p2: [0, 0, 9] as const, color: 0x334488 },
  ].map(({ p1, p2, color }) => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...p1),
      new THREE.Vector3(...p2),
    ]);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 });
    return new THREE.Line(geo, mat);
  }), []);

  return <>{lines.map((l, i) => <primitive key={i} object={l} />)}</>;
}

import PlaneWave from "./PlaneWave";
import StandingWave from "./StandingWave";
import DipoleField from "./DipoleField";
import CircularField from "./CircularField";
import Wavefronts from "./Wavefronts";
import ControlPanel from "./ControlPanel";

import { useFieldClock } from "@/hooks/useFieldClock";
import type { FieldMode } from "@/lib/fieldMath";

// ─── Top bar ─────────────────────────────────────────────────
function TopBar({ mode, fps }: { mode: FieldMode; fps: number }) {
  const labels: Record<FieldMode, string> = {
    plane: "PLANE WAVE",
    standing: "STANDING WAVE",
    dipole: "DIPOLE RADIATION",
    circular: "CIRCULAR POLARIZATION",
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 18px",
        borderBottom: "0.5px solid rgba(80,140,255,0.15)",
        background: "#070a18",
        flexShrink: 0,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <span
        style={{
          fontFamily: "'Crimson Pro',serif",
          fontWeight: 300,
          fontStyle: "italic",
          fontSize: 17,
          letterSpacing: ".04em",
          color: "rgba(200,220,255,0.92)",
        }}
      >
        Electromagnetic Field Simulator
      </span>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span
          style={{
            fontSize: 10,
            padding: "3px 8px",
            borderRadius: 4,
            border: "0.5px solid rgba(80,140,255,0.4)",
            color: "#4a9eff",
            letterSpacing: ".08em",
          }}
        >
          {labels[mode]}
        </span>
        <span
          style={{
            fontSize: 10,
            padding: "3px 8px",
            borderRadius: 4,
            border: "0.5px solid rgba(80,140,255,0.2)",
            color: "rgba(140,170,220,0.6)",
            letterSpacing: ".06em",
          }}
        >
          {fps} fps
        </span>
      </div>
    </div>
  );
}

// ─── Canvas legend overlay ───────────────────────────────────
function Legend() {
  const items = [
    { color: "#4a9eff", label: "E — electric field" },
    { color: "#ff8c3a", label: "B — magnetic field" },
    { color: "#3affb0", label: "S — Poynting vector" },
    { color: "#00ff00", label: "C — Continuous Wave" },
    { color: "#ff4a7a", label: "wavefront" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        right: 14,
        background: "rgba(4,8,20,0.82)",
        border: "0.5px solid rgba(80,140,255,0.15)",
        borderRadius: 7,
        padding: "9px 12px",
        fontSize: 10,
        lineHeight: 2.2,
        pointerEvents: "none",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {items.map((it) => (
        <div key={it.label}>
          <span
            style={{
              display: "inline-block",
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: it.color,
              marginRight: 6,
              verticalAlign: "middle",
            }}
          />
          <span style={{ color: "rgba(180,210,255,0.75)" }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── HUD bottom-left ─────────────────────────────────────────
function Hud({ t, freq, speed }: { t: number; freq: number; speed: number }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 14,
        left: 14,
        fontSize: 10,
        color: "rgba(80,140,255,0.4)",
        lineHeight: 2,
        pointerEvents: "none",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      t = {t.toFixed(2)} s &nbsp;|&nbsp; ω = {freq.toFixed(1)} rad/s
      &nbsp;|&nbsp; speed = {speed.toFixed(1)} c
      <br />
      drag to rotate · scroll to zoom
    </div>
  );
}

// ─── Main Scene ───────────────────────────────────────────────
export default function Scene() {
  const [mode, setMode] = useState<FieldMode>("plane");
  const [freq, setFreq] = useState(1);
  const [amp, setAmp] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [showE, setShowE] = useState(true);
  const [showB, setShowB] = useState(true);
  const [showS, setShowS] = useState(false);
  const [showA, setShowA] = useState(false);
  const [showWave, setShowWave] = useState(false);
  const [fps, setFps] = useState(60);

  const { time, isPaused, pause, resume, reset } = useFieldClock(speed);

  // Live readouts derived from params
  const readouts = useMemo(() => {
    const ePeak = amp.toFixed(2) + " V/m";
    const bPeak = amp.toFixed(2) + " T";
    const k = (freq * 0.6) / speed;
    const lam = k > 0 ? ((2 * Math.PI) / k).toFixed(1) + " m" : "∞";
    const sAvg = (amp * amp * 0.5).toFixed(3) + " W/m²";
    return { ePeak, bPeak, lambda: lam, sAvg };
  }, [amp, freq, speed]);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#03050d] overflow-hidden">
      <TopBar mode={mode} fps={fps} />

      <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
        {/* 3D Canvas */}
        <div className="w-full h-[55vh] md:h-auto md:flex-1 relative shrink-0">
          <Canvas
            camera={{ position: [2, 7, 17], fov: 46 }}
            gl={{ antialias: true }}
            onCreated={({ gl }) => gl.setClearColor(new THREE.Color("#03050d"))}
          >
            {/* Lights */}
            <ambientLight intensity={0.35} />
            <directionalLight
              position={[6, 10, 7]}
              intensity={1.1}
              color="#88bbff"
            />
            <directionalLight
              position={[-5, -4, -4]}
              intensity={0.4}
              color="#ff9944"
            />

            {/* Grid */}
            <Grid
              args={[18, 18]}
              cellColor="#0d1530"
              sectionColor="#091020"
              fadeDistance={30}
            />

            {/* Axis lines */}
            <AxisLines />

            {/* Field components — only render active mode */}
            {mode === "plane" && (
              <PlaneWave
                time={time}
                freq={freq}
                amp={amp}
                showE={showE}
                showB={showB}
                showS={showS}
                showA={showA}
              />
            )}
            {mode === "standing" && (
              <StandingWave
                time={time}
                freq={freq}
                amp={amp}
                showE={showE}
                showB={showB}
              />
            )}
            {mode === "dipole" && (
              <DipoleField
                time={time}
                freq={freq}
                amp={amp}
                showE={showE}
                showB={showB}
              />
            )}
            {mode === "circular" && (
              <CircularField
                time={time}
                freq={freq}
                amp={amp}
                showE={showE}
                showB={showB}
              />
            )}

            {showWave && <Wavefronts time={time} speed={speed} mode={mode} />}

            <OrbitControls
              makeDefault
              enableDamping
              dampingFactor={0.06}
              touches={{
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_PAN,
              }}
            />
          </Canvas>

          <Legend />
          <Hud t={time} freq={freq} speed={speed} />
        </div>

        {/* Sidebar */}
        <ControlPanel
          mode={mode}
          setMode={setMode}
          freq={freq}
          setFreq={setFreq}
          amp={amp}
          setAmp={setAmp}
          speed={speed}
          setSpeed={setSpeed}
          showE={showE}
          setShowE={setShowE}
          showB={showB}
          setShowB={setShowB}
          showS={showS}
          setShowS={setShowS}
          showA={showA}
          setShowA={setShowA}
          showWave={showWave}
          setShowWave={setShowWave}
          isPaused={isPaused}
          onPause={pause}
          onResume={resume}
          onReset={reset}
          ePeak={readouts.ePeak}
          bPeak={readouts.bPeak}
          lambda={readouts.lambda}
          sAvg={readouts.sAvg}
        />
      </div>
    </div>
  );
}
