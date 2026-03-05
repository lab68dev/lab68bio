"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import {
  MousePointerClick,
  Link2,
  LayoutGrid,
  Zap,
  Smartphone,
  Palette,
  UserPlus,
  Paintbrush,
  Globe,
  Check,
  ArrowRight,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  NEON DATABASE PROXY MOCK                                                  */
/* -------------------------------------------------------------------------- */

interface PipelineStat {
  value: string;
  label: string;
}

class NeonProxy {
  private static instance: NeonProxy | null = null;
  private cache: Map<string, { data: PipelineStat[]; ts: number }> = new Map();
  private ttl = 3000;

  static getInstance(): NeonProxy {
    if (!NeonProxy.instance) {
      NeonProxy.instance = new NeonProxy();
    }
    return NeonProxy.instance;
  }

  private generateStats(): PipelineStat[] {
    return [
      {
        value: `${(Math.random() * 50 + 10).toFixed(0)}K+`,
        label: "CREATORS",
      },
      {
        value: `${(Math.random() * 200 + 100).toFixed(0)}+`,
        label: "COMPONENTS",
      },
      {
        value: `${(Math.random() * 3 + 1).toFixed(1)}M`,
        label: "PAGES BUILT",
      },
      {
        value: `${(99.9 + Math.random() * 0.09).toFixed(1)}%`,
        label: "UPTIME",
      },
    ];
  }

  async query(key: string): Promise<PipelineStat[]> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.ts < this.ttl) {
      return cached.data;
    }
    await new Promise((r) => setTimeout(r, 8 + Math.random() * 12));
    const data = this.generateStats();
    this.cache.set(key, { data, ts: Date.now() });
    return data;
  }
}

function useNeonStats(pollInterval = 2500) {
  const [stats, setStats] = useState<PipelineStat[]>([
    { value: "---", label: "CREATORS" },
    { value: "---", label: "COMPONENTS" },
    { value: "---", label: "PAGES BUILT" },
    { value: "---", label: "UPTIME" },
  ]);

  useEffect(() => {
    const proxy = NeonProxy.getInstance();
    let active = true;

    const poll = async () => {
      if (!active) return;
      const data = await proxy.query("pipeline_stats");
      if (active) setStats(data);
    };

    poll();
    const id = setInterval(poll, pollInterval);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [pollInterval]);

  return stats;
}

/* -------------------------------------------------------------------------- */
/*  ANIMATION FRAME HOOK                                                      */
/* -------------------------------------------------------------------------- */

function useAnimationFrame(callback: (dt: number) => void) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    let prev = performance.now();
    let raf: number;

    const loop = (now: number) => {
      const dt = Math.min(now - prev, 50);
      prev = now;
      cbRef.current(dt);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
}

/* -------------------------------------------------------------------------- */
/*  TECH BRACKET CORNERS COMPONENT                                            */
/* -------------------------------------------------------------------------- */

function TechBrackets({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const bracketStyle =
    "absolute w-[10px] h-[10px] pointer-events-none";
  const borderColor = "border-white/30";

  return (
    <div className={`relative ${className}`}>
      <span
        className={`${bracketStyle} top-0 left-0 border-t border-l ${borderColor}`}
      />
      <span
        className={`${bracketStyle} top-0 right-0 border-t border-r ${borderColor}`}
      />
      <span
        className={`${bracketStyle} bottom-0 left-0 border-b border-l ${borderColor}`}
      />
      <span
        className={`${bracketStyle} bottom-0 right-0 border-b border-r ${borderColor}`}
      />
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  BACKGROUND BIO-GRID CANVAS                                                */
/* -------------------------------------------------------------------------- */

function BioGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      draw();
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 0.5;

      const gridSize = 40;
      const isoAngle = Math.PI / 6;
      const cosA = Math.cos(isoAngle);
      const sinA = Math.sin(isoAngle);

      for (let x = -h; x < w + h; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h * cosA, h);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - h * cosA, h);
        ctx.stroke();
      }

      for (let y = 0; y < h; y += gridSize * sinA) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const helixCenterX = w * 0.25;
      const helixCenterY = h * 0.7;
      ctx.globalAlpha = 0.04;

      for (let i = 0; i < 60; i++) {
        const t = (i / 60) * Math.PI * 6;
        const y = helixCenterY - 200 + (i / 60) * 400;
        const x1 = helixCenterX + Math.sin(t) * 60;
        const x2 = helixCenterX + Math.sin(t + Math.PI) * 60;

        ctx.beginPath();
        ctx.arc(x1, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x2, y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        if (i % 4 === 0) {
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  LEFT PANE BLUEPRINT CIRCUIT                                               */
/* -------------------------------------------------------------------------- */

function BlueprintCircuit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 600;
    const h = 500;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 0.5;

    const drawNode = (x: number, y: number, r: number) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fill();
    };

    const drawLine = (
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const seed = 42;
    const pseudoRandom = (n: number) => {
      const x = Math.sin(n * 127.1 + seed) * 43758.5453;
      return x - Math.floor(x);
    };

    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < 24; i++) {
      const x = 50 + pseudoRandom(i * 3) * (w - 100);
      const y = 50 + pseudoRandom(i * 3 + 1) * (h - 100);
      nodes.push({ x, y });
      drawNode(x, y, 4 + pseudoRandom(i) * 10);
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && pseudoRandom(i * 100 + j) > 0.3) {
          const midX = (nodes[i].x + nodes[j].x) / 2;
          const midY = (nodes[i].y + nodes[j].y) / 2;
          const offsetX = pseudoRandom(i + j * 7) * 40 - 20;

          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          if (pseudoRandom(i * j) > 0.5) {
            ctx.lineTo(nodes[i].x, midY + offsetX);
            ctx.lineTo(nodes[j].x, midY + offsetX);
            ctx.lineTo(nodes[j].x, nodes[j].y);
          } else {
            ctx.lineTo(midX + offsetX, nodes[i].y);
            ctx.lineTo(midX + offsetX, nodes[j].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
          }
          ctx.stroke();
        }
      }
    }

    for (let i = 0; i < 6; i++) {
      const x = 80 + pseudoRandom(i * 17) * (w - 160);
      const y = 80 + pseudoRandom(i * 17 + 1) * (h - 160);
      const size = 20 + pseudoRandom(i * 17 + 2) * 30;

      ctx.strokeRect(x - size / 2, y - size / 2, size, size);
      drawLine(x - size / 2, y, x + size / 2, y);
      drawLine(x, y - size / 2, x, y + size / 2);
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={500}
      className="absolute bottom-0 left-0 opacity-100 pointer-events-none"
      style={{ width: "600px", height: "500px" }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  PARTICLE SYSTEM                                                           */
/* -------------------------------------------------------------------------- */

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  brightness: number;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const dimensionsRef = useRef({ w: 0, h: 0 });

  const initParticles = useCallback(() => {
    const particles: Particle[] = [];
    const count = 80000;

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.5) * 280;

      const asymmetry = 1 + 0.6 * Math.sin(theta * 3 + phi * 2);
      const adjustedR = r * asymmetry;

      particles.push({
        x: adjustedR * Math.sin(phi) * Math.cos(theta),
        y: adjustedR * Math.sin(phi) * Math.sin(theta) * 0.7,
        z: adjustedR * Math.cos(phi),
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        vz: (Math.random() - 0.5) * 0.15,
        life: Math.random() * 1000,
        maxLife: 600 + Math.random() * 800,
        brightness: 0.2 + Math.random() * 0.8,
      });
    }

    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    initParticles();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const w = rect.width;
      const h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      dimensionsRef.current = { w, h };
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    canvas.addEventListener("mousemove", handleMouse);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouse);
    };
  }, [initParticles]);

  useAnimationFrame((dt) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = dimensionsRef.current;
    if (w === 0 || h === 0) return;

    const dpr = window.devicePixelRatio || 1;

    timeRef.current += dt * 0.001;
    const t = timeRef.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(0, 0, w, h);

    const centerX = w * 0.5;
    const centerY = h * 0.45;
    const fov = 500;

    const rotY = t * 0.15 + (mx - 0.5) * 0.5;
    const rotX = (my - 0.5) * 0.3;

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    const particles = particlesRef.current;
    const imageData = ctx.getImageData(0, 0, w * dpr, h * dpr);
    const data = imageData.data;
    const imgW = imageData.width;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.life += dt * 0.06;
      if (p.life > p.maxLife) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.pow(Math.random(), 0.5) * 280;
        const asymmetry = 1 + 0.6 * Math.sin(theta * 3 + phi * 2);
        const adjustedR = r * asymmetry;

        p.x = adjustedR * Math.sin(phi) * Math.cos(theta);
        p.y = adjustedR * Math.sin(phi) * Math.sin(theta) * 0.7;
        p.z = adjustedR * Math.cos(phi);
        p.life = 0;
        p.brightness = 0.2 + Math.random() * 0.8;
      }

      const distFromCenter = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
      const flowAngle = t * 0.8 + distFromCenter * 0.008;
      const flowStrength = 0.03;

      p.vx += Math.cos(flowAngle) * flowStrength - p.vx * 0.02;
      p.vy += Math.sin(flowAngle * 0.7) * flowStrength * 0.3 - p.vy * 0.02;
      p.vz += Math.sin(flowAngle * 1.3) * flowStrength * 0.5 - p.vz * 0.02;

      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      let rx = p.x * cosY - p.z * sinY;
      let rz = p.x * sinY + p.z * cosY;
      let ry = p.y * cosX - rz * sinX;
      rz = p.y * sinX + rz * cosX;

      const scale = fov / (fov + rz + 400);
      const sx = centerX + rx * scale;
      const sy = centerY + ry * scale;

      if (sx < 0 || sx >= w || sy < 0 || sy >= h) continue;

      const lifeFade =
        p.life < 100 ? p.life / 100 : p.life > p.maxLife - 100 ? (p.maxLife - p.life) / 100 : 1;
      const depthFade = Math.max(0, Math.min(1, (rz + 600) / 800));
      const coreDist = distFromCenter / 280;
      const coreGlow = Math.exp(-coreDist * coreDist * 2);

      const alpha =
        p.brightness * lifeFade * depthFade * scale * 1.5 * (0.3 + coreGlow * 0.7);

      if (alpha < 0.01) continue;

      const val = Math.min(255, Math.floor(alpha * 255 * (0.6 + coreGlow * 0.4)));
      const px = Math.floor(sx * dpr);
      const py = Math.floor(sy * dpr);
      const idx = (py * imgW + px) * 4;

      if (idx >= 0 && idx < data.length - 3) {
        data[idx] = Math.min(255, data[idx] + val);
        data[idx + 1] = Math.min(255, data[idx + 1] + val);
        data[idx + 2] = Math.min(255, data[idx + 2] + val);
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      300
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.04)");
    gradient.addColorStop(0.4, "rgba(200, 200, 200, 0.02)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  });

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

/* -------------------------------------------------------------------------- */
/*  HUD LABEL COMPONENT                                                       */
/* -------------------------------------------------------------------------- */

interface HudLabelProps {
  label: string;
  value: string;
  top: string;
  left: string;
  lineEndX: string;
  lineEndY: string;
}

function HudLabel({ label, value, top, left, lineEndX, lineEndY }: HudLabelProps) {
  return (
    <div className="absolute pointer-events-none" style={{ top, left }}>
      <svg
        className="absolute top-1/2 left-1/2 overflow-visible"
        width="1"
        height="1"
        style={{ zIndex: 1 }}
      >
        <line
          x1="0"
          y1="0"
          x2={lineEndX}
          y2={lineEndY}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
        />
        <circle
          cx={lineEndX}
          cy={lineEndY}
          r="3"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
        <circle
          cx={lineEndX}
          cy={lineEndY}
          r="1"
          fill="rgba(255,255,255,0.4)"
        />
      </svg>

      <TechBrackets>
        <div
          className="px-3 py-1.5"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div
            className="text-[9px] tracking-[0.2em] uppercase mb-0.5"
            style={{
              fontFamily: "var(--font-ibm-plex), monospace",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            {label}
          </div>
          <div
            className="text-[11px] tracking-wider"
            style={{
              fontFamily: "var(--font-ibm-plex), monospace",
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            {value}
          </div>
        </div>
      </TechBrackets>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  GEOMETRIC LOGO                                                            */
/* -------------------------------------------------------------------------- */

function Logo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 28;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(24, 4);
    ctx.lineTo(24, 24);
    ctx.lineTo(4, 24);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(9, 9);
    ctx.lineTo(19, 9);
    ctx.lineTo(19, 19);
    ctx.lineTo(9, 19);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(9, 9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(24, 4);
    ctx.lineTo(19, 9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(24, 24);
    ctx.lineTo(19, 19);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, 24);
    ctx.lineTo(9, 19);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(14, 14, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fill();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={28}
      height={28}
      style={{ width: "28px", height: "28px" }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  FEATURES SECTION                                                          */
/* -------------------------------------------------------------------------- */

const features = [
  {
    icon: MousePointerClick,
    title: "Drag & Drop Builder",
    desc: "Snap components into place with an intuitive visual editor. No code, no fuss — just drag, drop, done.",
  },
  {
    icon: Link2,
    title: "Your Unique Link",
    desc: "Claim username.bio.lab68 and own a permanent home on the internet your audience can always find.",
  },
  {
    icon: LayoutGrid,
    title: "9+ Modular Blocks",
    desc: "Hero banners, about sections, portfolios, skill bars, contact forms — mix and match to tell your story.",
  },
  {
    icon: Zap,
    title: "One-Click Publish",
    desc: "Hit publish and your page goes live instantly. Update anytime — changes deploy in milliseconds.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Responsive",
    desc: "Every page looks stunning on every screen. Zero configuration, automatic adaptive layouts.",
  },
  {
    icon: Palette,
    title: "Endlessly Customizable",
    desc: "Fine-tune colors, fonts, spacing, and layout. Make it unmistakably yours with total creative control.",
  },
];

function FeaturesSection() {
  return (
    <section className="relative py-32 px-8" style={{ zIndex: 20 }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div
            className="text-[10px] tracking-[0.35em] uppercase mb-4"
            style={{
              fontFamily: "var(--font-ibm-plex), monospace",
              color: "rgba(255, 255, 255, 0.3)",
            }}
          >
            // WHAT YOU GET
          </div>
          <h2
            className="text-[clamp(1.8rem,3.5vw,3rem)] font-semibold mb-4"
            style={{
              fontFamily: "var(--font-archivo), sans-serif",
              color: "rgba(255, 255, 255, 0.95)",
            }}
          >
            Everything you need. Nothing you don&apos;t.
          </h2>
          <p
            className="text-sm max-w-xl mx-auto"
            style={{
              fontFamily: "var(--font-ibm-plex), monospace",
              color: "rgba(255, 255, 255, 0.35)",
            }}
          >
            Powerful building blocks designed to make your bio and portfolio
            page stand out — all wrapped in an interface that feels effortless.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <TechBrackets key={f.title} className="group">
              <div
                className="p-8 h-full transition-colors duration-300"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center mb-5"
                  style={{
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <f.icon
                    size={18}
                    strokeWidth={1.5}
                    style={{ color: "rgba(255, 255, 255, 0.6)" }}
                  />
                </div>
                <h3
                  className="text-sm font-semibold tracking-wide uppercase mb-3"
                  style={{
                    fontFamily: "var(--font-archivo), sans-serif",
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{
                    fontFamily: "var(--font-ibm-plex), monospace",
                    color: "rgba(255, 255, 255, 0.35)",
                  }}
                >
                  {f.desc}
                </p>
              </div>
            </TechBrackets>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  HOW IT WORKS SECTION                                                      */
/* -------------------------------------------------------------------------- */

const steps = [
  {
    num: "01",
    icon: UserPlus,
    title: "Create Your Account",
    desc: "Sign up in seconds. Choose a username — that becomes your permanent link: username.bio.lab68.",
  },
  {
    num: "02",
    icon: Paintbrush,
    title: "Design Your Page",
    desc: "Open the visual editor. Drag blocks onto your canvas, customize content, rearrange until it's perfect.",
  },
  {
    num: "03",
    icon: Globe,
    title: "Publish & Share",
    desc: "One click to go live. Share your link anywhere — social bios, email signatures, business cards.",
  },
];

function HowItWorksSection() {
  return (
    <section className="relative py-32 px-8" style={{ zIndex: 20 }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div
            className="text-[10px] tracking-[0.35em] uppercase mb-4"
            style={{
              fontFamily: "var(--font-ibm-plex), monospace",
              color: "rgba(255, 255, 255, 0.3)",
            }}
          >
            // HOW IT WORKS
          </div>
          <h2
            className="text-[clamp(1.8rem,3.5vw,3rem)] font-semibold"
            style={{
              fontFamily: "var(--font-archivo), sans-serif",
              color: "rgba(255, 255, 255, 0.95)",
            }}
          >
            Three steps. Zero friction.
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-8 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-px"
                  style={{ background: "rgba(255, 255, 255, 0.08)" }}
                />
              )}
              <TechBrackets className="text-center">
                <div
                  className="p-10"
                  style={{
                    background: "rgba(255, 255, 255, 0.015)",
                  }}
                >
                  <div
                    className="text-[11px] tracking-[0.3em] uppercase mb-6"
                    style={{
                      fontFamily: "var(--font-ibm-plex), monospace",
                      color: "rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    STEP {s.num}
                  </div>
                  <div
                    className="w-14 h-14 flex items-center justify-center mx-auto mb-6"
                    style={{
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <s.icon
                      size={22}
                      strokeWidth={1.5}
                      style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    />
                  </div>
                  <h3
                    className="text-sm font-semibold tracking-wide uppercase mb-3"
                    style={{
                      fontFamily: "var(--font-archivo), sans-serif",
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed max-w-xs mx-auto"
                    style={{
                      fontFamily: "var(--font-ibm-plex), monospace",
                      color: "rgba(255, 255, 255, 0.35)",
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              </TechBrackets>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  SHOWCASE / TEMPLATES SECTION                                              */
/* -------------------------------------------------------------------------- */

const showcasePages = [
  {
    name: "Sarah K.",
    slug: "sarah-k",
    role: "UX Designer & Illustrator",
    blocks: ["hero", "aboutMe", "portfolio", "socialLinks", "contact"],
    color: "rgba(255, 255, 255, 0.06)",
  },
  {
    name: "Marcus R.",
    slug: "marcus-r",
    role: "Full-Stack Developer",
    blocks: ["header", "hero", "skills", "experience", "resume"],
    color: "rgba(255, 255, 255, 0.04)",
  },
  {
    name: "Yuki T.",
    slug: "yuki-t",
    role: "Content Creator & Streamer",
    blocks: ["hero", "socialLinks", "aboutMe", "portfolio"],
    color: "rgba(255, 255, 255, 0.05)",
  },
  {
    name: "Alex M.",
    slug: "alex-m",
    role: "Freelance Photographer",
    blocks: ["header", "portfolio", "aboutMe", "contact", "socialLinks"],
    color: "rgba(255, 255, 255, 0.03)",
  },
];

function ShowcaseSection() {
  return (
    <section className="relative py-32 px-8" style={{ zIndex: 20 }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div
            className="text-[10px] tracking-[0.35em] uppercase mb-4"
            style={{
              fontFamily: "var(--font-ibm-plex), monospace",
              color: "rgba(255, 255, 255, 0.3)",
            }}
          >
            // REAL PEOPLE. REAL PAGES.
          </div>
          <h2
            className="text-[clamp(1.8rem,3.5vw,3rem)] font-semibold mb-4"
            style={{
              fontFamily: "var(--font-archivo), sans-serif",
              color: "rgba(255, 255, 255, 0.95)",
            }}
          >
            See what others are building.
          </h2>
          <p
            className="text-sm max-w-xl mx-auto"
            style={{
              fontFamily: "var(--font-ibm-plex), monospace",
              color: "rgba(255, 255, 255, 0.35)",
            }}
          >
            Designers, developers, creators, freelancers — everyone&apos;s building
            their corner of the internet with lab68bio.
          </p>
        </div>

        {/* Showcase grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {showcasePages.map((page) => (
            <TechBrackets key={page.slug} className="group cursor-pointer">
              <div
                className="p-6 transition-all duration-300 group-hover:bg-white/[0.04]"
                style={{ background: page.color }}
              >
                {/* Mini page preview */}
                <div
                  className="mb-5 p-4 space-y-2"
                  style={{
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    background: "rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {page.blocks.map((block) => (
                    <div
                      key={block}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="w-1.5 h-1.5"
                        style={{
                          background: "rgba(255, 255, 255, 0.2)",
                        }}
                      />
                      <div
                        className="h-1.5 flex-1"
                        style={{
                          background: "rgba(255, 255, 255, 0.06)",
                        }}
                      />
                      <span
                        className="text-[7px] tracking-[0.15em] uppercase"
                        style={{
                          fontFamily: "var(--font-ibm-plex), monospace",
                          color: "rgba(255, 255, 255, 0.15)",
                        }}
                      >
                        {block}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  className="text-xs font-semibold tracking-wide mb-1"
                  style={{
                    fontFamily: "var(--font-archivo), sans-serif",
                    color: "rgba(255, 255, 255, 0.85)",
                  }}
                >
                  {page.name}
                </div>
                <div
                  className="text-[10px] tracking-wider mb-3"
                  style={{
                    fontFamily: "var(--font-ibm-plex), monospace",
                    color: "rgba(255, 255, 255, 0.3)",
                  }}
                >
                  {page.role}
                </div>
                <div
                  className="text-[9px] tracking-[0.15em] uppercase flex items-center gap-1"
                  style={{
                    fontFamily: "var(--font-ibm-plex), monospace",
                    color: "rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {page.slug}.bio.lab68
                  <ArrowRight size={10} style={{ color: "rgba(255,255,255,0.2)" }} />
                </div>
              </div>
            </TechBrackets>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  PRICING SECTION                                                           */
/* -------------------------------------------------------------------------- */

const pricingTiers = [
  {
    name: "Starter",
    plan: "free" as const,
    price: "Free",
    period: "forever",
    desc: "Everything you need to get started with your bio page.",
    features: [
      "1 published page",
      "All 9 block types",
      "username.bio.lab68 link",
      "Drag & drop editor",
      "Mobile responsive",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    plan: "pro" as const,
    price: "$8",
    period: "/ month",
    desc: "For creators and professionals who want to stand out.",
    features: [
      "Unlimited pages",
      "Custom themes & fonts",
      "Analytics dashboard",
      "Priority support",
      "Remove lab68 branding",
      "Custom CSS injection",
    ],
    cta: "Go Pro",
    highlight: true,
  },
  {
    name: "Team",
    plan: "team" as const,
    price: "$24",
    period: "/ month",
    desc: "For agencies and teams managing multiple identities.",
    features: [
      "Everything in Pro",
      "5 team members",
      "Shared template library",
      "Bulk page management",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

function PricingSection() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleCheckout(plan: "free" | "pro" | "team") {
    if (plan === "free") {
      window.location.href = "/register";
      return;
    }
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        alert(data.error || "Something went wrong");
        return;
      }
      window.location.href = data.url;
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <section className="relative py-32 px-8" style={{ zIndex: 20 }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div
            className="text-[10px] tracking-[0.35em] uppercase mb-4"
            style={{
              fontFamily: "var(--font-ibm-plex), monospace",
              color: "rgba(255, 255, 255, 0.3)",
            }}
          >
            // SIMPLE PRICING
          </div>
          <h2
            className="text-[clamp(1.8rem,3.5vw,3rem)] font-semibold mb-4"
            style={{
              fontFamily: "var(--font-archivo), sans-serif",
              color: "rgba(255, 255, 255, 0.95)",
            }}
          >
            Start free. Scale when ready.
          </h2>
          <p
            className="text-sm max-w-lg mx-auto"
            style={{
              fontFamily: "var(--font-ibm-plex), monospace",
              color: "rgba(255, 255, 255, 0.35)",
            }}
          >
            No hidden fees. No credit card required. Build your page today and
            upgrade only when you need more.
          </p>
        </div>

        {/* Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingTiers.map((tier) => (
            <TechBrackets key={tier.name}>
              <div
                className="p-8 h-full flex flex-col"
                style={{
                  background: tier.highlight
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.015)",
                  border: tier.highlight
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "none",
                }}
              >
                {tier.highlight && (
                  <div
                    className="text-[8px] tracking-[0.3em] uppercase mb-4 self-start px-3 py-1"
                    style={{
                      fontFamily: "var(--font-ibm-plex), monospace",
                      color: "rgba(255, 255, 255, 0.9)",
                      background: "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}
                <div
                  className="text-[10px] tracking-[0.25em] uppercase mb-2"
                  style={{
                    fontFamily: "var(--font-ibm-plex), monospace",
                    color: "rgba(255, 255, 255, 0.4)",
                  }}
                >
                  {tier.name}
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span
                    className="text-3xl font-bold"
                    style={{
                      fontFamily: "var(--font-archivo), sans-serif",
                      color: "rgba(255, 255, 255, 0.95)",
                    }}
                  >
                    {tier.price}
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      fontFamily: "var(--font-ibm-plex), monospace",
                      color: "rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    {tier.period}
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed mb-8"
                  style={{
                    fontFamily: "var(--font-ibm-plex), monospace",
                    color: "rgba(255, 255, 255, 0.35)",
                  }}
                >
                  {tier.desc}
                </p>

                <ul className="space-y-3 mb-10 flex-1">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3">
                      <Check
                        size={12}
                        strokeWidth={2}
                        style={{ color: "rgba(255, 255, 255, 0.4)" }}
                        className="flex-shrink-0"
                      />
                      <span
                        className="text-xs"
                        style={{
                          fontFamily: "var(--font-ibm-plex), monospace",
                          color: "rgba(255, 255, 255, 0.5)",
                        }}
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleCheckout(tier.plan)}
                  disabled={loadingPlan === tier.plan}
                  className="w-full rounded-none text-[10px] tracking-[0.2em] uppercase h-10"
                  style={{
                    fontFamily: "var(--font-ibm-plex), monospace",
                    background: tier.highlight
                      ? "rgba(255, 255, 255, 0.9)"
                      : "rgba(255, 255, 255, 0.06)",
                    color: tier.highlight ? "#000" : "rgba(255, 255, 255, 0.7)",
                    border: tier.highlight
                      ? "none"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {loadingPlan === tier.plan ? "REDIRECTING..." : tier.cta}
                </Button>
              </div>
            </TechBrackets>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  CTA SECTION                                                               */
/* -------------------------------------------------------------------------- */

function CtaSection() {
  return (
    <section className="relative py-32 px-8" style={{ zIndex: 20 }}>
      <div className="max-w-3xl mx-auto text-center">
        <TechBrackets>
          <div
            className="py-20 px-12"
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <div
              className="text-[10px] tracking-[0.35em] uppercase mb-6"
              style={{
                fontFamily: "var(--font-ibm-plex), monospace",
                color: "rgba(255, 255, 255, 0.3)",
              }}
            >
              // READY TO BUILD?
            </div>
            <h2
              className="text-[clamp(1.8rem,3.5vw,3rem)] font-semibold mb-4"
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                color: "rgba(255, 255, 255, 0.95)",
              }}
            >
              Your internet identity starts here.
            </h2>
            <p
              className="text-sm mb-10 max-w-lg mx-auto"
              style={{
                fontFamily: "var(--font-ibm-plex), monospace",
                color: "rgba(255, 255, 255, 0.35)",
              }}
            >
              Join thousands of creators, developers, and professionals who
              use lab68bio to showcase their work. Free forever — no strings
              attached.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                className="rounded-none text-[11px] tracking-[0.2em] uppercase px-10 h-12"
                style={{
                  fontFamily: "var(--font-ibm-plex), monospace",
                  background: "rgba(255, 255, 255, 0.9)",
                  color: "#000",
                }}
              >
                Create Your Page <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
          </div>
        </TechBrackets>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  FOOTER                                                                    */
/* -------------------------------------------------------------------------- */

const footerLinks = [
  {
    heading: "Product",
    links: ["Features", "Templates", "Pricing", "Changelog", "Roadmap"],
  },
  {
    heading: "Resources",
    links: ["Documentation", "API Reference", "Blog", "Community", "Support"],
  },
  {
    heading: "Company",
    links: ["About", "Careers", "Brand", "Privacy Policy", "Terms of Service"],
  },
];

function FooterSection() {
  return (
    <footer className="relative py-16 px-8 border-t border-white/[0.04]" style={{ zIndex: 20 }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Logo />
              <span
                className="text-sm font-semibold tracking-[0.15em] uppercase"
                style={{
                  fontFamily: "var(--font-archivo), sans-serif",
                  color: "rgba(255, 255, 255, 0.9)",
                }}
              >
                lab68bio
              </span>
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{
                fontFamily: "var(--font-ibm-plex), monospace",
                color: "rgba(255, 255, 255, 0.3)",
              }}
            >
              The simplest way to build and share your bio &amp; portfolio page.
              Free, fast, and beautifully engineered.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.heading}>
              <div
                className="text-[9px] tracking-[0.3em] uppercase mb-4"
                style={{
                  fontFamily: "var(--font-ibm-plex), monospace",
                  color: "rgba(255, 255, 255, 0.25)",
                }}
              >
                {col.heading}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs transition-colors duration-200 hover:text-white/70"
                      style={{
                        fontFamily: "var(--font-ibm-plex), monospace",
                        color: "rgba(255, 255, 255, 0.35)",
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/[0.04]"
        >
          <span
            className="text-[10px] tracking-wider"
            style={{
              fontFamily: "var(--font-ibm-plex), monospace",
              color: "rgba(255, 255, 255, 0.2)",
            }}
          >
            &copy; {new Date().getFullYear()} lab68bio. All rights reserved.
          </span>
          <span
            className="text-[10px] tracking-wider mt-2 md:mt-0"
            style={{
              fontFamily: "var(--font-ibm-plex), monospace",
              color: "rgba(255, 255, 255, 0.15)",
            }}
          >
            Engineered with precision.
          </span>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  MAIN PAGE COMPONENT                                                       */
/* -------------------------------------------------------------------------- */

export default function HeroPage() {
  const stats = useNeonStats(2500);

  const hudLabels = useMemo(
    () => [
      {
        label: "DRAG & DROP",
        value: "COMPONENTS // READY",
        top: "12%",
        left: "8%",
        lineEndX: "80",
        lineEndY: "60",
      },
      {
        label: "CUSTOM THEMES",
        value: "UNLIMITED // STYLES",
        top: "22%",
        left: "65%",
        lineEndX: "-40",
        lineEndY: "50",
      },
      {
        label: "YOUR LINK",
        value: "USERNAME.BIO.LAB68",
        top: "68%",
        left: "10%",
        lineEndX: "70",
        lineEndY: "-40",
      },
      {
        label: "PUBLISH",
        value: "ONE CLICK // LIVE",
        top: "75%",
        left: "58%",
        lineEndX: "-30",
        lineEndY: "-50",
      },
    ],
    []
  );

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden bg-black select-none">
      <BioGridBackground />

      {/* TOP NAVIGATION */}
      <nav
        className="fixed top-0 left-0 w-full flex items-center justify-between px-8 h-16"
        style={{
          zIndex: 50,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* LEFT: LOGO */}
        <div className="flex items-center gap-3">
          <Logo />
          <span
            className="text-sm font-semibold tracking-[0.15em] uppercase"
            style={{
              fontFamily: "var(--font-archivo), sans-serif",
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            lab68bio
          </span>
        </div>

        {/* CENTER: NAV LINKS */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
          {[
            { label: "Features", href: "#features" },
            { label: "Templates", href: "#showcase" },
            { label: "Showcase", href: "#showcase" },
            { label: "Pricing", href: "#pricing" },
            { label: "Docs", href: "#" },
          ].map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs tracking-[0.12em] uppercase transition-colors duration-200 hover:text-white"
              style={{
                fontFamily: "var(--font-ibm-plex), monospace",
                color: "rgba(255, 255, 255, 0.4)",
                marginLeft: i === 2 || i === 3 ? "24px" : undefined,
                marginRight: i === 1 || i === 2 ? "24px" : undefined,
              }}
            >
              <span style={{ color: "rgba(255, 255, 255, 0.15)" }}>
                //&nbsp;
              </span>
              {item.label}
            </a>
          ))}
        </div>

        {/* RIGHT: LANG + BUTTON */}
        <div className="flex items-center gap-5">
          <button
            className="text-[10px] tracking-[0.15em] uppercase transition-colors hover:text-white"
            style={{
              fontFamily: "var(--font-ibm-plex), monospace",
              color: "rgba(255, 255, 255, 0.35)",
            }}
          >
            v EN
          </button>
          <a href="/register">
            <Button
              size="sm"
              className="rounded-none text-[10px] tracking-[0.2em] uppercase px-5 h-8"
              style={{
                fontFamily: "var(--font-ibm-plex), monospace",
                background: "rgba(255, 255, 255, 0.9)",
                color: "#000",
              }}
            >
              Get Started
            </Button>
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-screen">
        {/* CENTER DIVIDER (hero only) */}
        <div
          className="absolute top-0 left-1/2 w-px h-full -translate-x-1/2"
          style={{ background: "rgba(255, 255, 255, 0.06)", zIndex: 10 }}
        />

        {/* SPLIT LAYOUT */}
        <div className="relative flex w-full h-full" style={{ zIndex: 5 }}>
          {/* LEFT PANE */}
          <div className="relative w-1/2 h-full flex flex-col justify-center px-12 xl:px-16">
            <BlueprintCircuit />

            <div className="relative z-10 max-w-lg">
              {/* OVERLINE */}
              <div
                className="text-[10px] tracking-[0.35em] uppercase mb-8"
                style={{
                  fontFamily: "var(--font-ibm-plex), monospace",
                  color: "rgba(255, 255, 255, 0.3)",
                }}
              >
                // YOUR LINK. YOUR STORY. YOUR PORTFOLIO.
              </div>

              {/* HEADLINE */}
              <h1
                className="mb-6 leading-[1.05]"
                style={{ fontFamily: "var(--font-archivo), sans-serif" }}
              >
                <span
                  className="block text-[clamp(2rem,4.5vw,4rem)]"
                  style={{
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.95)",
                  }}
                >
                  Build your bio.
                </span>
                <span
                  className="block text-[clamp(2rem,4.5vw,4rem)]"
                  style={{
                    fontWeight: 200,
                    color: "rgba(255, 255, 255, 0.55)",
                  }}
                >
                  Share your portfolio. Instantly.
                </span>
              </h1>

              {/* DESCRIPTION */}
              <p
                className="text-[13px] leading-relaxed max-w-md mb-10"
                style={{
                  fontFamily: "var(--font-ibm-plex), monospace",
                  color: "rgba(255, 255, 255, 0.35)",
                }}
              >
                Drag-and-drop components to craft a stunning bio and portfolio
                page in minutes. Claim your unique username.bio.lab68 link and
                showcase your work, skills, and social presence — no coding
                required. Beautiful by default, fully customizable.
              </p>

              {/* BUTTONS */}
              <div className="flex items-center gap-4 mb-16">
                <TechBrackets>
                  <a href="/register">
                    <Button
                      size="lg"
                      className="rounded-none text-[11px] tracking-[0.2em] uppercase px-8 h-11"
                      style={{
                        fontFamily: "var(--font-ibm-plex), monospace",
                        background: "rgba(255, 255, 255, 0.06)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        color: "rgba(255, 255, 255, 0.85)",
                        border: "none",
                      }}
                    >
                      Start Building
                    </Button>
                  </a>
                </TechBrackets>

                <a href="#showcase">
                  <Button
                    size="lg"
                    className="rounded-none text-[11px] tracking-[0.2em] uppercase px-8 h-11"
                    style={{
                      fontFamily: "var(--font-ibm-plex), monospace",
                      background: "rgba(255, 255, 255, 0.9)",
                      color: "#000",
                    }}
                  >
                    See Examples
                  </Button>
                </a>
              </div>
            </div>

            {/* STATS ROW */}
            <div
              className="absolute bottom-8 left-8 right-4 z-10 grid grid-cols-4 gap-3"
              style={{ maxWidth: "calc(50vw - 48px)" }}
            >
              {stats.map((stat, i) => (
                <TechBrackets key={i}>
                  <div
                    className="px-4 py-3"
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                    }}
                  >
                    <div
                      className="text-lg font-bold tracking-wide mb-1"
                      style={{
                        fontFamily: "var(--font-archivo), sans-serif",
                        color: "rgba(255, 255, 255, 0.9)",
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-[8px] tracking-[0.25em] uppercase"
                      style={{
                        fontFamily: "var(--font-ibm-plex), monospace",
                        color: "rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                </TechBrackets>
              ))}
            </div>
          </div>

          {/* RIGHT PANE */}
          <div className="relative w-1/2 h-full overflow-hidden">
            {/* BACKLIGHT GLOW */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] rounded-full pointer-events-none"
              style={{
                width: "500px",
                height: "500px",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />

            <ParticleCanvas />

            {/* HUD LABELS */}
            {hudLabels.map((hud, i) => (
              <HudLabel key={i} {...hud} />
            ))}
          </div>
        </div>

        {/* HERO BOTTOM ACCENT */}
        <div
          className="absolute bottom-0 left-0 w-full h-px"
          style={{ background: "rgba(255, 255, 255, 0.06)", zIndex: 10 }}
        />
      </section>

      {/* PAGE SECTIONS */}
      <div id="features">
        <FeaturesSection />
      </div>
      <HowItWorksSection />
      <div id="showcase">
        <ShowcaseSection />
      </div>
      <div id="pricing">
        <PricingSection />
      </div>
      <CtaSection />
      <FooterSection />
    </div>
  );
}
