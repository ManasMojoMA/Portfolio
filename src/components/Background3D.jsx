import { Canvas, useFrame } from '@react-three/fiber';
import { PointMaterial, Points } from '@react-three/drei';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import './Background3D.css';

/**
 * The hero background: disorder resolving into structure as you scroll.
 *
 * WHY THIS AND NOT A NICER PARTICLE FIELD
 *
 * It used to be a cloud of points drifting in a sphere. Pretty, and it said
 * nothing — a recruiter reads "found a Three.js example", because that is all a
 * drifting cloud can mean. The hero already asserts "I Automate. I Build. I
 * Transform.", three abstract verbs with no evidence behind them, and decoration
 * cannot supply evidence.
 *
 * So the particles now do the thing the copy claims. They begin genuinely
 * scattered and, over the first screen of scrolling, converge into a clean
 * lattice — a spreadsheet grid, which is exactly the artefact this work turns
 * chaos into. Mess becomes system, in front of the reader, in about a second.
 * That is an argument rather than an ornament.
 *
 * CONSTRAINTS THIS RESPECTS
 *
 *   It resolves within ONE viewport. Making someone scroll three screens of
 *   animation before reaching evidence would be creative in the worst sense.
 *
 *   It is still only decoration. useHeavyVisualsAllowed already withholds this
 *   whole scene from phones, slow connections, low-core devices and anyone who
 *   asked for reduced motion, and the hero must read perfectly without it. That
 *   guard is why this file may be interesting at all — nobody is forced to
 *   download it.
 *
 *   Nothing here re-renders React. Scroll and pointer go into refs, and the
 *   geometry is mutated in place, so the cost is one buffer upload per frame
 *   rather than a component tree.
 */

const COUNT = 3000;

/** Columns and rows of the resolved grid. Their product must equal COUNT. */
const COLS = 75;
const ROWS = 40;

function ParticleField() {
  const ref = useRef();
  const pointer = useRef({ x: 0, y: 0 });
  const scrolled = useRef(0);
  /** 0 = chaos, 1 = fully resolved. Eased separately so it never snaps. */
  const order = useRef(0);

  useEffect(() => {
    const onMove = (e) => {
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    const onScroll = () => {
      scrolled.current = window.scrollY;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  /** Where every particle starts: scattered through a sphere. */
  const chaos = useMemo(() => {
    const a = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = Math.cbrt(Math.random()) * 15;
      a[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      a[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      a[i * 3 + 2] = r * Math.cos(phi);
    }
    return a;
  }, []);

  /**
   * Where they end up: a regular grid.
   *
   * Deliberately a grid and not a sphere or a logo. A grid of rows and columns is
   * the one shape everyone in this audience already reads as "organised" — it is
   * what their own data looks like once somebody has sorted it out.
   */
  const ordered = useMemo(() => {
    const a = new Float32Array(COUNT * 3);
    const width = 26;
    const height = 13;
    for (let i = 0; i < COUNT; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      a[i * 3] = (col / (COLS - 1) - 0.5) * width;
      a[i * 3 + 1] = (row / (ROWS - 1) - 0.5) * height;
      // A shallow wave keeps it from looking like flat printed paper, and gives
      // the light something to catch as it settles.
      a[i * 3 + 2] = Math.sin(col * 0.25) * 0.5 + Math.cos(row * 0.3) * 0.4;
    }
    return a;
  }, []);

  /** Live positions, mutated every frame. Starts as a copy of chaos. */
  const live = useMemo(() => Float32Array.from(chaos), [chaos]);

  const colors = useMemo(() => {
    const a = new Float32Array(COUNT * 3);
    const blue = new THREE.Color('#2997ff');
    const violet = new THREE.Color('#6c5ce7');
    for (let i = 0; i < COUNT; i++) {
      const c = blue.clone().lerp(violet, Math.random());
      a[i * 3] = c.r;
      a[i * 3 + 1] = c.g;
      a[i * 3 + 2] = c.b;
    }
    return a;
  }, []);

  useFrame((state, delta) => {
    const points = ref.current;
    if (!points) return;

    // Resolve across the first 45% of a viewport.
    //
    // Tuned against the hero's own transforms rather than picked to feel right:
    // Hero.jsx fades its text out by scrollYProgress 0.25, which on a 900px
    // screen is 225px of scrolling. At the 80% span this started with, the grid
    // was still assembling at 720px — long after the reader had moved on to the
    // next section, so the one moment worth seeing happened behind content
    // nobody was looking away from. Finishing near 400px means the resolution
    // overlaps the text fade and lands while the hero still has their attention.
    const span = Math.max(window.innerHeight * 0.45, 1);
    const target = Math.min(1, Math.max(0, scrolled.current / span));

    // Ease toward the target rather than tracking it exactly: a trackpad emits
    // scroll in jerky bursts, and following them literally looks broken.
    order.current += (target - order.current) * Math.min(1, delta * 6);
    const t = order.current;

    // Smoothstep, so the grid arrives with a settle rather than a stop.
    const e = t * t * (3 - 2 * t);

    const px = pointer.current.x * (state.viewport.width / 2);
    const py = pointer.current.y * (state.viewport.height / 2);

    const arr = points.geometry.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      let x = chaos[i3] + (ordered[i3] - chaos[i3]) * e;
      let y = chaos[i3 + 1] + (ordered[i3 + 1] - chaos[i3 + 1]) * e;
      const z = chaos[i3 + 2] + (ordered[i3 + 2] - chaos[i3 + 2]) * e;

      // Pointer repulsion, strongest once the grid has formed — nudging a cloud
      // reads as noise, nudging a lattice reads as touching something solid.
      const dx = x - px;
      const dy = y - py;
      const d2 = dx * dx + dy * dy;
      if (d2 < 9) {
        const push = ((9 - d2) / 9) * 1.6 * e;
        const d = Math.sqrt(d2) || 1;
        x += (dx / d) * push;
        y += (dy / d) * push;
      }

      arr[i3] = x;
      arr[i3 + 1] = y;
      arr[i3 + 2] = z;
    }
    points.geometry.attributes.position.needsUpdate = true;

    // Chaos tumbles; order is still.
    //
    // Integrated, not recomputed from elapsed time. Multiplying elapsed*rate by
    // the drift factor looks correct written down and jumps backwards on screen:
    // as drift falls the whole accumulated angle is scaled down with it, so the
    // scene visibly rewinds while the reader scrolls. Adding a delta each frame
    // and unwinding separately keeps it monotonic.
    const drift = 1 - e;
    points.rotation.x -= delta * 0.05 * drift;
    points.rotation.y += delta * 0.04 * drift;

    // Unwind toward square-on as the grid resolves, so the ordered state faces
    // the reader rather than freezing at whatever angle it happened to reach.
    const settle = Math.min(1, delta * 3 * e);
    points.rotation.x -= points.rotation.x * settle;
    points.rotation.y -= points.rotation.y * settle;

    // A little parallax keeps it alive while the page is still.
    points.position.x += (pointer.current.x * 0.4 - points.position.x) * 0.04;
    points.position.y += (pointer.current.y * 0.4 - points.position.y) * 0.04;
  });

  return (
    <Points ref={ref} positions={live} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.05}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function Background3D() {
  return (
    <div className="background-3d-container">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <color attach="background" args={['#050505']} />
        {/* Fog hides the far edges of the grid so it reads as extending past the
            viewport rather than stopping at a hard rectangle. */}
        <fog attach="fog" args={['#050505', 8, 26]} />
        <ParticleField />
      </Canvas>
    </div>
  );
}
