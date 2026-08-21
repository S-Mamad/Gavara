"use client";

/**
 * finesse · Engine A (WebGL) · Fibonacci → KNN → signal traversal
 * Family: Particle/network (meaningful) — not the connected-dot constellation slop.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { usePrefs } from "@/context/PrefsContext";
import { useContextAware } from "@/context/ContextAwareContext";
import { cn } from "@/lib/utils";

type HeroNetworkEngineProps = {
  className?: string;
  /** Scroll progress 0–1 from parent (optional) */
  scrollProgress?: number;
};

function hash(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function makeSpriteTexture(THREE: typeof import("three")) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(176,194,219,0.85)");
  g.addColorStop(0.7, "rgba(143,164,196,0.25)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function HeroNetworkEngine({
  className,
  scrollProgress = 0,
}: HeroNetworkEngineProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  const reduceMotion = useReducedMotion();
  const { forceReducedMotion } = usePrefs();
  const { heavyEffectsOff } = useContextAware();
  const quiet =
    reduceMotion === true || forceReducedMotion || heavyEffectsOff;

  scrollRef.current = scrollProgress;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const THREE = await import("three");
      if (disposed || !mountRef.current) return;

      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x09090b, 0.045);

      const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 80);
      camera.position.set(0, 0.35, 9.2);

      // --- Fibonacci sphere nodes (perturbed) ---
      const N = quiet ? 72 : 160;
      const nodes: InstanceType<typeof THREE.Vector3>[] = [];
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / Math.max(N - 1, 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = Math.PI * (3 - Math.sqrt(5)) * i;
        const noise = 0.62 + hash(i) * 0.5 + Math.sin(i * 0.7) * 0.1;
        nodes.push(
          new THREE.Vector3(
            Math.cos(theta) * r,
            y,
            Math.sin(theta) * r,
          ).multiplyScalar(noise * 3.55),
        );
      }

      // KNN edges (K=3)
      const edgeSet = new Set<string>();
      const edges: { a: number; b: number }[] = [];
      for (let i = 0; i < N; i++) {
        const dists: { j: number; d: number }[] = [];
        for (let j = 0; j < N; j++) {
          if (i === j) continue;
          dists.push({ j, d: nodes[i].distanceTo(nodes[j]) });
        }
        dists.sort((a, b) => a.d - b.d);
        for (let k = 0; k < 3; k++) {
          const j = dists[k].j;
          const key = i < j ? `${i}:${j}` : `${j}:${i}`;
          if (edgeSet.has(key)) continue;
          edgeSet.add(key);
          edges.push({ a: i, b: j });
        }
      }

      const linePos = new Float32Array(edges.length * 6);
      edges.forEach((e, idx) => {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const o = idx * 6;
        linePos[o] = a.x;
        linePos[o + 1] = a.y;
        linePos[o + 2] = a.z;
        linePos[o + 3] = b.x;
        linePos[o + 4] = b.y;
        linePos[o + 5] = b.z;
      });
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
      const lines = new THREE.LineSegments(
        lineGeo,
        new THREE.LineBasicMaterial({
          color: 0x8fa4c4,
          transparent: true,
          opacity: 0.22,
          depthWrite: false,
        }),
      );
      scene.add(lines);

      const sprite = makeSpriteTexture(THREE);
      const nodePos = new Float32Array(N * 3);
      nodes.forEach((p, i) => {
        nodePos[i * 3] = p.x;
        nodePos[i * 3 + 1] = p.y;
        nodePos[i * 3 + 2] = p.z;
      });
      const nodeGeo = new THREE.BufferGeometry();
      nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3));
      const nodesMesh = new THREE.Points(
        nodeGeo,
        new THREE.PointsMaterial({
          size: quiet ? 0.12 : 0.16,
          map: sprite ?? undefined,
          transparent: true,
          depthWrite: false,
          color: 0xb0c2db,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
        }),
      );
      scene.add(nodesMesh);

      // Signal travellers along edges
      const TRAVELLERS = quiet ? 0 : 22;
      const travelPos = new Float32Array(Math.max(TRAVELLERS, 1) * 3);
      const travelGeo = new THREE.BufferGeometry();
      travelGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(travelPos, 3).setUsage(THREE.DynamicDrawUsage),
      );
      const travellers = new THREE.Points(
        travelGeo,
        new THREE.PointsMaterial({
          size: 0.28,
          map: sprite ?? undefined,
          transparent: true,
          depthWrite: false,
          color: 0xc4a574,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
        }),
      );
      if (TRAVELLERS > 0) scene.add(travellers);

      type Traveller = { edge: number; t: number; speed: number };
      const pool: Traveller[] = Array.from({ length: TRAVELLERS }, (_, i) => ({
        edge: Math.floor(hash(i + 9) * edges.length),
        t: hash(i + 3),
        speed: 0.18 + hash(i + 17) * 0.35,
      }));

      // Far starfield depth cue
      const STAR = quiet ? 400 : 1400;
      const starPos = new Float32Array(STAR * 3);
      for (let i = 0; i < STAR; i++) {
        const r = 18 + hash(i) * 28;
        const y = (hash(i + 1) - 0.5) * 2;
        const th = hash(i + 2) * Math.PI * 2;
        const rr = Math.sqrt(Math.max(0, 1 - y * y));
        starPos[i * 3] = Math.cos(th) * rr * r;
        starPos[i * 3 + 1] = y * r * 0.55;
        starPos[i * 3 + 2] = Math.sin(th) * rr * r;
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      scene.add(
        new THREE.Points(
          starGeo,
          new THREE.PointsMaterial({
            size: 0.035,
            color: 0x6e7f99,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
          }),
        ),
      );

      // Floating steel plates (geometric identity — not purple blobs)
      const plates = new THREE.Group();
      for (let i = 0; i < 5; i++) {
        const geo = new THREE.PlaneGeometry(
          1.1 + hash(i) * 0.8,
          0.7 + hash(i + 4) * 0.5,
        );
        const mat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x8fa4c4 : 0xc4a574,
          transparent: true,
          opacity: 0.07,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
          (hash(i + 2) - 0.5) * 7,
          (hash(i + 5) - 0.5) * 4,
          -2 - hash(i + 8) * 5,
        );
        mesh.rotation.set(hash(i) * 0.4, hash(i + 1) * 0.8, hash(i + 3) * 0.2);
        plates.add(mesh);
      }
      scene.add(plates);

      let mx = 0;
      let my = 0;
      let tx = 0;
      let ty = 0;
      const fine = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      ).matches;

      const onMove = (e: PointerEvent) => {
        if (!fine || e.pointerType === "touch") return;
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
      };

      const onResize = () => {
        const w = mount.clientWidth || window.innerWidth;
        const h = mount.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w, h);
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("resize", onResize);

      const clock = new THREE.Clock();
      const tmp = new THREE.Vector3();

      const paint = () => {
        if (disposed) return;
        const t = clock.getElapsedTime();
        const scroll = scrollRef.current;

        mx += (tx - mx) * 0.05;
        my += (ty - my) * 0.05;

        const camZ = 9.2 - scroll * 3.2;
        camera.position.x = mx * 0.85;
        camera.position.y = 0.35 - my * 0.45 + scroll * 0.2;
        camera.position.z = camZ;
        camera.lookAt(mx * 0.2, -my * 0.1, 0);

        lines.rotation.y = t * 0.04 + scroll * 0.35;
        nodesMesh.rotation.y = lines.rotation.y;
        plates.rotation.y = -t * 0.025;
        plates.rotation.x = Math.sin(t * 0.2) * 0.04;

        if (TRAVELLERS > 0) {
          const attr = travelGeo.getAttribute("position") as InstanceType<
            typeof THREE.BufferAttribute
          >;
          for (let i = 0; i < TRAVELLERS; i++) {
            const tr = pool[i];
            tr.t += tr.speed * 0.016;
            if (tr.t >= 1) {
              tr.t = 0;
              tr.edge = Math.floor(Math.random() * edges.length);
              tr.speed = 0.18 + Math.random() * 0.35;
            }
            const e = edges[tr.edge];
            tmp.lerpVectors(nodes[e.a], nodes[e.b], tr.t);
            attr.setXYZ(i, tmp.x, tmp.y, tmp.z);
          }
          attr.needsUpdate = true;
          const mat = travellers.material as InstanceType<
            typeof THREE.PointsMaterial
          >;
          mat.opacity = 0.55 + Math.sin(t * 2) * 0.15;
        }

        renderer.render(scene, camera);
        if (!quiet) raf = requestAnimationFrame(paint);
      };

      paint();
      if (quiet) {
        // composed still — one frame only
      }

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        lineGeo.dispose();
        nodeGeo.dispose();
        travelGeo.dispose();
        starGeo.dispose();
        sprite?.dispose();
        (lines.material as InstanceType<typeof THREE.Material>).dispose();
        (nodesMesh.material as InstanceType<typeof THREE.Material>).dispose();
        (travellers.material as InstanceType<typeof THREE.Material>).dispose();
        if (renderer.domElement.parentElement === mount) {
          mount.removeChild(renderer.domElement);
        }
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [quiet]);

  return (
    <div
      ref={mountRef}
      className={cn("absolute inset-0 overflow-hidden", className)}
      aria-hidden
    />
  );
}
