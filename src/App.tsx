import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { create } from 'zustand';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Network, GitMerge, Activity, Maximize, Cpu, Play, Square, RotateCcw, Info, Search, Layers, GitFork, Sun, Moon } from 'lucide-react';
import { dijkstra } from './algorithms/dijkstra';
import { bellmanFord } from './algorithms/bellmanFord';
import { bfs } from './algorithms/bfs';
import { dfs } from './algorithms/dfs';
import { floydWarshall } from './algorithms/floydWarshall';
import { kruskal } from './algorithms/kruskal';
import type { AlgorithmStep } from './algorithms/types';

// ------------------------------------------------------------------
// 1. TYPES & DATA STRUCTURES
// ------------------------------------------------------------------
type NodeData = {
  id: string;
  label: string;
  position: [number, number, number];
  type: 'academic' | 'dorms' | 'logistics' | 'core';
};

type EdgeData = {
  id: string;
  source: string;
  target: string;
  weight: number;
};

const CAMPUS_NODES: NodeData[] = [
  { id: 'cs', label: 'Computer Science', position: [0, 0, 0], type: 'core' },
  { id: 'lib', label: 'Main Library', position: [-4, 1, -3], type: 'academic' },
  { id: 'eng', label: 'Engineering', position: [3, -0.5, -4], type: 'academic' },
  { id: 'med', label: 'Medical Wing', position: [6, 2, 2], type: 'academic' },
  { id: 'dormA', label: 'North Dorms', position: [-6, -1, 4], type: 'dorms' },
  { id: 'dormB', label: 'South Dorms', position: [2, 0.5, 6], type: 'dorms' },
  { id: 'gym', label: 'Athletics Center', position: [5, -2, 5], type: 'logistics' },
  { id: 'cafe', label: 'Student Union', position: [-2, 0, 3], type: 'core' },
  { id: 'admin', label: 'Administration', position: [-5, 2, -1], type: 'logistics' },
  { id: 'park', label: 'Central Park', position: [1, -1, 2], type: 'logistics' },
];

// Deterministic campus edges with Euclidean distance weights
const CAMPUS_EDGES: EdgeData[] = [
  { id: 'cs-lib',     source: 'cs',    target: 'lib',   weight: 5.1 },
  { id: 'cs-eng',     source: 'cs',    target: 'eng',   weight: 5.0 },
  { id: 'cs-cafe',    source: 'cs',    target: 'cafe',  weight: 3.6 },
  { id: 'cs-park',    source: 'cs',    target: 'park',  weight: 2.4 },
  { id: 'lib-admin',  source: 'lib',   target: 'admin', weight: 2.4 },
  { id: 'lib-eng',    source: 'lib',   target: 'eng',   weight: 7.2 },
  { id: 'eng-med',    source: 'eng',   target: 'med',   weight: 7.2 },
  { id: 'med-gym',    source: 'med',   target: 'gym',   weight: 5.1 },
  { id: 'med-dormB',  source: 'med',   target: 'dormB', weight: 5.9 },
  { id: 'dormA-cafe', source: 'dormA', target: 'cafe',  weight: 4.2 },
  { id: 'dormA-admin',source: 'dormA', target: 'admin', weight: 5.9 },
  { id: 'dormB-gym',  source: 'dormB', target: 'gym',   weight: 4.0 },
  { id: 'dormB-park', source: 'dormB', target: 'park',  weight: 4.4 },
  { id: 'cafe-park',  source: 'cafe',  target: 'park',  weight: 3.3 },
  { id: 'park-gym',   source: 'park',  target: 'gym',   weight: 5.1 },
];

// ------------------------------------------------------------------
// 2. STATE MANAGEMENT (ZUSTAND)
// ------------------------------------------------------------------
interface GraphState {
  nodes: NodeData[];
  edges: EdgeData[];
  startNode: string | null;
  endNode: string | null;
  activeAlgo: string;
  simulationStatus: 'idle' | 'running' | 'completed';
  visitedNodes: string[];
  activeEdges: string[];
  pathEdges: string[];
  stepMessage: string;
  currentStep: number;
  totalSteps: number;
  hoveredNode: NodeData | null;
  theme: 'dark' | 'light';
  setHoveredNode: (node: NodeData | null) => void;
  setAlgo: (algo: string) => void;
  toggleNodeSelection: (id: string) => void;
  resetSimulation: () => void;
  runAlgorithmStepByStep: () => Promise<void>;
  toggleTheme: () => void;
}

const NEEDS_TARGET = ['dijkstra', 'bellman_ford', 'floyd_warshall'];
const NEEDS_SOURCE = ['dijkstra', 'bellman_ford', 'bfs', 'dfs', 'floyd_warshall'];

const useGraphStore = create<GraphState>((set, get) => ({
  nodes: CAMPUS_NODES,
  edges: CAMPUS_EDGES,
  startNode: null,
  endNode: null,
  activeAlgo: 'dijkstra',
  simulationStatus: 'idle',
  visitedNodes: [],
  activeEdges: [],
  pathEdges: [],
  stepMessage: '',
  currentStep: 0,
  totalSteps: 0,
  hoveredNode: null,
  theme: 'dark',

  setHoveredNode: (node) => set({ hoveredNode: node }),

  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  setAlgo: (algo) => set({ activeAlgo: algo, simulationStatus: 'idle', visitedNodes: [], activeEdges: [], pathEdges: [], stepMessage: '', currentStep: 0, totalSteps: 0 }),

  toggleNodeSelection: (id) => set((state) => {
    if (state.simulationStatus === 'running') return {};
    const reset = { simulationStatus: 'idle' as const, visitedNodes: [], activeEdges: [], pathEdges: [], stepMessage: '', currentStep: 0, totalSteps: 0 };
    if (state.startNode === id) return { startNode: null, ...reset };
    if (state.endNode === id) return { endNode: null, ...reset };
    if (!state.startNode) return { startNode: id, ...reset };
    if (!state.endNode) return { endNode: id, ...reset };
    return { startNode: id, endNode: null, ...reset };
  }),

  resetSimulation: () => set({ simulationStatus: 'idle', visitedNodes: [], activeEdges: [], pathEdges: [], stepMessage: '', currentStep: 0, totalSteps: 0 }),

  runAlgorithmStepByStep: async () => {
    const { startNode, endNode, edges, activeAlgo } = get();
    const nodeIds = CAMPUS_NODES.map((n) => n.id);
    const graphEdges = edges.map((e) => ({ id: e.id, source: e.source, target: e.target, weight: e.weight }));

    // Validate inputs
    if (NEEDS_SOURCE.includes(activeAlgo) && !startNode) return;
    if (NEEDS_TARGET.includes(activeAlgo) && !endNode) return;

    set({ simulationStatus: 'running', visitedNodes: [], activeEdges: [], pathEdges: [], stepMessage: '', currentStep: 0, totalSteps: 0 });

    // Run the real algorithm to get all steps
    let steps: AlgorithmStep[] = [];
    switch (activeAlgo) {
      case 'dijkstra':
        steps = dijkstra(nodeIds, graphEdges, startNode!, endNode!).steps;
        break;
      case 'bellman_ford':
        steps = bellmanFord(nodeIds, graphEdges, startNode!, endNode!).steps;
        break;
      case 'bfs':
        steps = bfs(nodeIds, graphEdges, startNode!).steps;
        break;
      case 'dfs':
        steps = dfs(nodeIds, graphEdges, startNode!).steps;
        break;
      case 'floyd_warshall':
        steps = floydWarshall(nodeIds, graphEdges, startNode || null, endNode || null).steps;
        break;
      case 'mst':
        steps = kruskal(nodeIds, graphEdges).steps;
        break;
    }

    // Play back steps with animation delays
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      set({
        visitedNodes: step.visitedNodes,
        activeEdges: step.activeEdges,
        pathEdges: step.pathEdges,
        stepMessage: step.message,
        currentStep: i + 1,
        totalSteps: steps.length,
      });
      // Last step gets longer pause, normal steps get 200ms
      await sleep(i === steps.length - 1 ? 400 : 200);
    }

    set({ simulationStatus: 'completed' });
  },
}));

// ------------------------------------------------------------------
// 3. THEME COLORS
// ------------------------------------------------------------------

const getThemeColors = (theme: 'dark' | 'light') => ({
  dark: {
    bg: '#07080A',
    primary: '#00F0FF',
    secondary: '#8A2BE2',
    accent: '#FF2A2A',
    path: '#00FF88',
    muted: '#2A303C',
    text: '#FFFFFF',
    nodeMuted: '#2A303C',
    edgeMuted: '#3a4a5c',
    gridColor: '#121418',
  },
  light: {
    bg: '#F5F7FA',
    primary: '#0066CC',
    secondary: '#6B46C1',
    accent: '#DC2626',
    path: '#059669',
    muted: '#94A3B8',
    text: '#1E293B',
    nodeMuted: '#CBD5E1',
    edgeMuted: '#94A3B8',
    gridColor: '#E2E8F0',
  }
})[theme];

// ------------------------------------------------------------------
// 4. PURE THREE.JS RENDERER
// ------------------------------------------------------------------

const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const { toggleNodeSelection, setHoveredNode, theme } = useGraphStore();

  useEffect(() => {
    if (!mountRef.current || !labelsRef.current) return;

    const COLORS = getThemeColors(theme);

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.bg);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lights & Environment
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00F0FF, 1);
    dirLight1.position.set(10, 10, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8A2BE2, 0.5);
    dirLight2.position.set(-10, 10, -5);
    scene.add(dirLight2);

    const gridHelper = new THREE.GridHelper(30, 30, COLORS.gridColor, COLORS.gridColor);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    const group = new THREE.Group();
    scene.add(group);

    // 3. Create Graph Meshes
    const nodeMeshes: Record<string, THREE.Mesh> = {};
    const edgeLines: Record<string, THREE.Line> = {};

    // Edge midpoints in world space (before group rotation)
    const edgeMidpoints: Record<string, THREE.Vector3> = {};

    CAMPUS_EDGES.forEach(edge => {
      const source = CAMPUS_NODES.find(n => n.id === edge.source);
      const target = CAMPUS_NODES.find(n => n.id === edge.target);
      if (!source || !target) return;

      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...source.position),
        new THREE.Vector3(...target.position)
      ]);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(COLORS.edgeMuted),
        transparent: true,
        opacity: 0.7,
        linewidth: 1
      });
      const line = new THREE.Line(geometry, material);
      edgeLines[edge.id] = line;
      group.add(line);

      // Store midpoint in local group space
      edgeMidpoints[edge.id] = new THREE.Vector3(
        (source.position[0] + target.position[0]) / 2,
        (source.position[1] + target.position[1]) / 2,
        (source.position[2] + target.position[2]) / 2,
      );
    });

    // Build label DOM elements
    const labelEls: Record<string, HTMLDivElement> = {};
    const labelsContainer = labelsRef.current;
    const labelBg = theme === 'dark' ? 'rgba(7,8,10,0.75)' : 'rgba(255,255,255,0.9)';
    const labelBorder = theme === 'dark' ? 'rgba(58,74,92,0.8)' : 'rgba(148,163,184,0.8)';
    const labelColor = theme === 'dark' ? 'rgba(160,180,200,0.9)' : 'rgba(30,41,59,0.9)';
    
    CAMPUS_EDGES.forEach(edge => {
      const el = document.createElement('div');
      el.textContent = edge.weight.toFixed(1);
      el.style.cssText = `
        position: absolute;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 700;
        padding: 1px 5px;
        border-radius: 4px;
        pointer-events: none;
        transform: translate(-50%, -50%);
        background: ${labelBg};
        border: 1px solid ${labelBorder};
        color: ${labelColor};
        transition: all 0.3s ease;
        white-space: nowrap;
      `;
      labelsContainer.appendChild(el);
      labelEls[edge.id] = el;
    });

    const sphereGeo = new THREE.SphereGeometry(0.2, 32, 32);
    CAMPUS_NODES.forEach(node => {
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(COLORS.nodeMuted),
        emissive: new THREE.Color(COLORS.nodeMuted),
        emissiveIntensity: 0.5,
        toneMapped: false
      });
      const mesh = new THREE.Mesh(sphereGeo, material);
      mesh.position.set(...node.position);
      mesh.userData = { id: node.id, nodeData: node, basePosition: [...node.position] };
      nodeMeshes[node.id] = mesh;
      group.add(mesh);
    });

    // 4. Raycasting & Events
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredId: string | null = null;

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const onClick = () => {
      if (hoveredId) toggleNodeSelection(hoveredId);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    // 5. Zustand State Sync
    const unsubscribeStore = useGraphStore.subscribe((state) => {
      CAMPUS_NODES.forEach(node => {
        const mesh = nodeMeshes[node.id];
        if (!mesh) return;
        const mat = mesh.material as THREE.MeshStandardMaterial;

        const isStart = state.startNode === node.id;
        const isEnd = state.endNode === node.id;
        const isVisited = state.visitedNodes.includes(node.id);
        const isHovered = hoveredId === node.id;

        let color = COLORS.nodeMuted;
        if (isStart) color = COLORS.primary;
        else if (isEnd) color = COLORS.accent;
        else if (isVisited) color = COLORS.secondary;
        else if (isHovered) color = '#ffffff';

        mat.color.set(color);
        mat.emissive.set(color);
        mat.emissiveIntensity = isStart || isEnd || isVisited || isHovered ? 2 : 0.5;
      });

      CAMPUS_EDGES.forEach(edge => {
        const line = edgeLines[edge.id];
        if (!line) return;
        const mat = line.material as THREE.LineBasicMaterial;
        const isPath = state.pathEdges.includes(edge.id);
        const isActive = state.activeEdges.includes(edge.id);

        mat.color.set(isPath ? COLORS.path : isActive ? COLORS.primary : COLORS.edgeMuted);
        mat.opacity = isPath ? 1.0 : isActive ? 0.9 : 0.7;

        // Sync label color
        const el = labelEls[edge.id];
        if (el) {
          if (isPath) {
            el.style.color = '#00FF88';
            el.style.borderColor = 'rgba(0,255,136,0.6)';
          } else if (isActive) {
            el.style.color = '#00F0FF';
            el.style.borderColor = 'rgba(0,240,255,0.5)';
          } else {
            el.style.color = 'rgba(160,180,200,0.9)';
            el.style.borderColor = 'rgba(58,74,92,0.8)';
          }
        }
      });
    });

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    // 6. Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId: number;
    const _worldPos = new THREE.Vector3();

    const animateLoop = () => {
      animationFrameId = requestAnimationFrame(animateLoop);
      const elapsedTime = clock.getElapsedTime();

      // Raycaster logic
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(nodeMeshes));

      if (intersects.length > 0) {
        const newHoveredId = intersects[0].object.userData.id;
        if (hoveredId !== newHoveredId) {
          hoveredId = newHoveredId;
          setHoveredNode(intersects[0].object.userData.nodeData);
          document.body.style.cursor = 'pointer';
          
          const mesh = intersects[0].object as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.color.set('#ffffff');
          mat.emissive.set('#ffffff');
          mat.emissiveIntensity = 2;
        }
      } else {
        if (hoveredId !== null) {
          const state = useGraphStore.getState();
          const oldMesh = nodeMeshes[hoveredId];
          if (oldMesh) {
            const mat = oldMesh.material as THREE.MeshStandardMaterial;
            const isStart = state.startNode === hoveredId;
            const isEnd = state.endNode === hoveredId;
            const isVisited = state.visitedNodes.includes(hoveredId);
            
            let color = COLORS.nodeMuted;
            if (isStart) color = COLORS.primary;
            else if (isEnd) color = COLORS.accent;
            else if (isVisited) color = COLORS.secondary;

            mat.color.set(color);
            mat.emissive.set(color);
            mat.emissiveIntensity = isStart || isEnd || isVisited ? 2 : 0.5;
          }
          hoveredId = null;
          setHoveredNode(null);
          document.body.style.cursor = 'crosshair';
        }
      }

      // Parallax & Pulse Animations
      const state = useGraphStore.getState();
      Object.values(nodeMeshes).forEach(mesh => {
        const { id, basePosition } = mesh.userData;
        const isStart = state.startNode === id;
        const isEnd = state.endNode === id;

        mesh.position.y = basePosition[1] + Math.sin(elapsedTime * 2 + basePosition[0]) * 0.1;

        if (isStart || isEnd) {
          const scale = 1 + Math.sin(elapsedTime * 5) * 0.2;
          mesh.scale.set(scale, scale, scale);
        } else {
          mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
      });

      group.rotation.y = elapsedTime * 0.05;

      const targetX = mouse.x * 5;
      const targetY = 8 + mouse.y * 2;
      camera.position.lerp(new THREE.Vector3(targetX, targetY, 12), 0.05);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);

      // Project edge midpoints to screen and position labels
      const W = window.innerWidth;
      const H = window.innerHeight;
      CAMPUS_EDGES.forEach(edge => {
        const el = labelEls[edge.id];
        if (!el) return;
        // Transform local midpoint by group rotation
        _worldPos.copy(edgeMidpoints[edge.id]).applyEuler(group.rotation);
        _worldPos.project(camera);
        const x = (_worldPos.x * 0.5 + 0.5) * W;
        const y = (-_worldPos.y * 0.5 + 0.5) * H;
        // Hide if behind camera
        if (_worldPos.z > 1) {
          el.style.display = 'none';
        } else {
          el.style.display = 'block';
          el.style.left = `${x}px`;
          el.style.top = `${y}px`;
        }
      });
    };

    animateLoop();

    // 7. Cleanup
    return () => {
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(animationFrameId);
      unsubscribeStore();
      // Remove label elements
      Object.values(labelEls).forEach(el => el.remove());
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [toggleNodeSelection, setHoveredNode, theme]);

  return (
    <>
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-auto" />
      <div ref={labelsRef} className="absolute inset-0 z-[1] pointer-events-none" />
    </>
  );
};


const ALGO_INFO: Record<string, { time: string; space: string }> = {
  dijkstra:      { time: 'O((V+E)logV)', space: 'O(V)' },
  bellman_ford:  { time: 'O(V·E)',       space: 'O(V)' },
  bfs:           { time: 'O(V+E)',       space: 'O(V)' },
  dfs:           { time: 'O(V+E)',       space: 'O(V)' },
  floyd_warshall:{ time: 'O(V³)',        space: 'O(V²)' },
  mst:           { time: 'O(E log E)',   space: 'O(V)' },
};

// ── Collapsible panel wrapper ──────────────────────────────────────
const Panel = ({
  title, icon, open, onToggle, accent = false, children, theme = 'dark',
}: {
  title: string; icon: React.ReactNode; open: boolean;
  onToggle: () => void; accent?: boolean; children: React.ReactNode; theme?: 'dark' | 'light';
}) => {
  const isDark = theme === 'dark';
  const baseBg = isDark ? 'bg-black/60' : 'bg-white/80';
  const baseBorder = isDark ? 'border-white/10' : 'border-gray-300';
  const accentBg = accent ? (isDark ? 'bg-cyan-950/20' : 'bg-cyan-50') : baseBg;
  const accentBorder = accent ? (isDark ? 'border-cyan-500/30' : 'border-cyan-300') : baseBorder;
  const iconColor = accent ? 'text-cyan-400' : (isDark ? 'text-white/40' : 'text-gray-500');
  const titleColor = accent ? (isDark ? 'text-cyan-300' : 'text-cyan-700') : (isDark ? 'text-white/60' : 'text-gray-700');
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';
  
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-500 ${accentBorder} ${accentBg} backdrop-blur-xl`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-left ${hoverBg} transition-colors`}
      >
        <div className="flex items-center gap-2">
          <span className={`${iconColor} transition-colors duration-500`}>{icon}</span>
          <span className={`text-xs font-mono uppercase tracking-widest font-semibold ${titleColor} transition-colors duration-500`}>{title}</span>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={isDark ? 'text-white/30' : 'text-gray-400'}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HUDOverlay = () => {
  const {
    activeAlgo, setAlgo, startNode, endNode,
    simulationStatus, runAlgorithmStepByStep, resetSimulation, hoveredNode,
    stepMessage, visitedNodes, toggleNodeSelection, currentStep, totalSteps, pathEdges, activeEdges,
    theme, toggleTheme,
  } = useGraphStore();

  const [algoOpen, setAlgoOpen] = useState(true);
  const [nodesOpen, setNodesOpen] = useState(true);

  const algorithms = [
    { id: 'dijkstra',       name: "Dijkstra's",    icon: <GitMerge size={14}/>, desc: 'Shortest path' },
    { id: 'bellman_ford',   name: 'Bellman-Ford',   icon: <GitFork size={14}/>,  desc: 'Handles negatives' },
    { id: 'bfs',            name: 'BFS',            icon: <Activity size={14}/>, desc: 'Level-order' },
    { id: 'dfs',            name: 'DFS',            icon: <Search size={14}/>,   desc: 'Depth-first' },
    { id: 'floyd_warshall', name: 'Floyd-Warshall', icon: <Layers size={14}/>,   desc: 'All-pairs O(V³)' },
    { id: 'mst',            name: 'Kruskal MST',    icon: <Network size={14}/>,  desc: 'Min span tree' },
  ];

  const needsSource = NEEDS_SOURCE.includes(activeAlgo);
  const needsTarget = NEEDS_TARGET.includes(activeAlgo);

  const canRun =
    simulationStatus !== 'running' &&
    (!needsSource || !!startNode) &&
    (!needsTarget || !!endNode);

  const handleRun = () => {
    if (simulationStatus === 'completed') resetSimulation();
    else runAlgorithmStepByStep();
  };

  const info = ALGO_INFO[activeAlgo] || { time: '—', space: '—' };
  const activeAlgoName = algorithms.find(a => a.id === activeAlgo)?.name ?? '';
  const startLabel = CAMPUS_NODES.find(n => n.id === startNode)?.label;
  const endLabel   = CAMPUS_NODES.find(n => n.id === endNode)?.label;

  // Theme-aware class names
  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-black/80' : 'bg-white/90';
  const borderClass = isDark ? 'border-white/10' : 'border-gray-300';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-white/40' : 'text-gray-500';

  return (
    <div className={`absolute inset-0 pointer-events-none z-10 transition-colors duration-500`}>

      {/* ── TOP BAR ── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3 pointer-events-none">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className={`text-xl font-bold tracking-tighter ${textClass} leading-none transition-colors duration-500`}>
            CAMPUS<span className="text-cyan-400">MATRIX</span>
          </h1>
          <p className={`${textMutedClass} font-mono text-[9px] mt-0.5 flex items-center gap-1 transition-colors duration-500`}>
            <Cpu size={9}/> ALGORITHMIC ROUTING SIMULATOR
          </p>
        </motion.div>

        {/* Centre — hovered node pill */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`${bgClass} backdrop-blur-md border border-cyan-500/30 rounded-full px-4 py-1.5 flex items-center gap-2 transition-colors duration-500`}
            >
              <Info size={11} className="text-cyan-400"/>
              <span className={`${textClass} text-xs font-semibold transition-colors duration-500`}>{hoveredNode.label}</span>
              <span className={`${textMutedClass} text-[10px] font-mono transition-colors duration-500`}>{hoveredNode.id.toUpperCase()}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right — stats pill + theme toggle */}
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className={`flex items-center gap-3 ${bgClass} backdrop-blur-md border ${borderClass} rounded-full px-4 py-1.5 font-mono text-[11px] ${textMutedClass} transition-colors duration-500`}
          >
            <span className={isDark ? 'text-white/70' : 'text-gray-700'}>{info.time}</span>
            <span className={isDark ? 'w-px h-3 bg-white/15' : 'w-px h-3 bg-gray-300'}/>
            <span className={isDark ? 'text-white/70' : 'text-gray-700'}>{info.space}</span>
            <span className={isDark ? 'w-px h-3 bg-white/15' : 'w-px h-3 bg-gray-300'}/>
            <span className="text-cyan-400">{CAMPUS_NODES.length}V / {CAMPUS_EDGES.length}E</span>
            <span className={isDark ? 'w-px h-3 bg-white/15' : 'w-px h-3 bg-gray-300'}/>
            <span>visited <span className="text-purple-400">{visitedNodes.length}</span></span>
          </motion.div>

          {/* Theme toggle button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.3 }}
            onClick={toggleTheme}
            className={`pointer-events-auto ${bgClass} backdrop-blur-md border ${borderClass} rounded-full p-2 hover:scale-110 transition-all duration-300 group`}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sun size={16} className="text-yellow-400 group-hover:text-yellow-300" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Moon size={16} className="text-indigo-600 group-hover:text-indigo-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* ── LEFT SIDEBAR ── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
        className="absolute top-16 left-4 w-64 flex flex-col gap-2 pointer-events-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* ① Algorithm panel */}
        <Panel
          title="Algorithm"
          icon={<GitMerge size={13}/>}
          open={algoOpen}
          onToggle={() => setAlgoOpen(o => !o)}
          theme={theme}
        >
          <div className="flex flex-col gap-1 mt-1">
            {algorithms.map(algo => {
              const isActive = activeAlgo === algo.id;
              const btnBg = isActive ? 'bg-cyan-500/10' : (isDark ? '' : 'bg-gray-50');
              const btnBorder = isActive ? (isDark ? 'border-cyan-400/30' : 'border-cyan-400/50') : 'border-transparent';
              const btnText = isActive ? textClass : (isDark ? 'text-white/45' : 'text-gray-600');
              const btnHover = isDark ? 'hover:bg-white/5 hover:text-white/80' : 'hover:bg-gray-100 hover:text-gray-900';
              const iconColor = isActive ? 'text-cyan-400' : (isDark ? 'text-white/25 group-hover:text-white/50' : 'text-gray-400 group-hover:text-gray-600');
              
              return (
                <button
                  key={algo.id}
                  onClick={() => setAlgo(algo.id)}
                  disabled={simulationStatus === 'running'}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all duration-300 text-left w-full group ${btnBg} ${btnBorder} ${btnText} ${btnHover} disabled:opacity-30`}
                >
                  <span className={`${iconColor} transition-colors duration-300`}>{algo.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold leading-none truncate">{algo.name}</div>
                    <div className={`text-[10px] mt-0.5 ${isDark ? 'text-white/30' : 'text-gray-500'}`}>{algo.desc}</div>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#00F0FF] shrink-0"/>}
                </button>
              );
            })}
          </div>
        </Panel>

        {/* ② Node selection panel */}
        <Panel
          title="Select Nodes"
          icon={<Network size={13}/>}
          open={nodesOpen}
          onToggle={() => setNodesOpen(o => !o)}
          accent
          theme={theme}
        >
          <div className="flex gap-2 mt-1">
            {/* Origin column */}
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-400/60 mb-1.5 px-1">Origin</div>
              <div className="flex flex-col gap-0.5">
                {CAMPUS_NODES.map(node => {
                  const isSel = startNode === node.id;
                  const isOff = !needsSource || simulationStatus === 'running' || endNode === node.id;
                  const btnText = isSel ? 'text-cyan-300' : isOff ? (isDark ? 'text-white/20' : 'text-gray-300') : (isDark ? 'text-white/40' : 'text-gray-600');
                  const btnBg = isSel ? 'bg-cyan-500/15' : '';
                  const btnHover = !isOff && !isSel ? (isDark ? 'hover:bg-white/8 hover:text-white/80' : 'hover:bg-gray-100 hover:text-gray-900') : '';
                  const dotBg = isSel ? 'bg-cyan-400 shadow-[0_0_5px_#00F0FF]' : (isDark ? 'bg-white/15' : 'bg-gray-300');
                  
                  return (
                    <button
                      key={node.id}
                      onClick={() => !isOff && toggleNodeSelection(node.id)}
                      disabled={isOff}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition-all duration-500 w-full ${btnBg} ${btnText} ${btnHover} ${isOff ? 'opacity-20 cursor-not-allowed' : ''}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-500 ${dotBg}`}/>
                      <span className="text-[11px] font-mono truncate">{node.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`w-px self-stretch transition-colors duration-500 ${isDark ? 'bg-white/8' : 'bg-gray-200'}`}/>

            {/* Destination column */}
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-mono uppercase tracking-widest text-red-400/60 mb-1.5 px-1">Dest.</div>
              <div className="flex flex-col gap-0.5">
                {CAMPUS_NODES.map(node => {
                  const isSel = endNode === node.id;
                  const isOff = !needsTarget || simulationStatus === 'running' || startNode === node.id;
                  const btnText = isSel ? 'text-red-300' : isOff ? (isDark ? 'text-white/20' : 'text-gray-300') : (isDark ? 'text-white/40' : 'text-gray-600');
                  const btnBg = isSel ? 'bg-red-500/15' : '';
                  const btnHover = !isOff && !isSel ? (isDark ? 'hover:bg-white/8 hover:text-white/80' : 'hover:bg-gray-100 hover:text-gray-900') : '';
                  const dotBg = isSel ? 'bg-red-400 shadow-[0_0_5px_#FF2A2A]' : (isDark ? 'bg-white/15' : 'bg-gray-300');
                  
                  return (
                    <button
                      key={node.id}
                      onClick={() => !isOff && toggleNodeSelection(node.id)}
                      disabled={isOff}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition-all duration-500 w-full ${btnBg} ${btnText} ${btnHover} ${isOff ? 'opacity-20 cursor-not-allowed' : ''}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-500 ${dotBg}`}/>
                      <span className="text-[11px] font-mono truncate">{node.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Panel>

        {/* ③ Run panel — always visible, compact */}
        <div className={`rounded-2xl border backdrop-blur-xl p-3 flex flex-col gap-2 transition-all duration-500 ${isDark ? 'border-white/10 bg-black/60' : 'border-gray-300 bg-white/80'}`}>
          {/* Route summary */}
          <div className="flex gap-2">
            <div className={`flex-1 rounded-xl px-3 py-2 min-w-0 transition-colors duration-500 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
              <div className="text-[9px] text-cyan-400/50 uppercase tracking-widest mb-0.5">From</div>
              <div className={`text-[11px] font-mono truncate transition-colors duration-500 ${startNode ? 'text-cyan-300' : (isDark ? 'text-white/15 animate-pulse' : 'text-gray-400 animate-pulse')}`}>
                {!needsSource ? 'N/A' : (startLabel ?? 'select…')}
              </div>
            </div>
            <div className={`flex items-center text-xs transition-colors duration-500 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>→</div>
            <div className={`flex-1 rounded-xl px-3 py-2 min-w-0 transition-colors duration-500 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
              <div className="text-[9px] text-red-400/50 uppercase tracking-widest mb-0.5">To</div>
              <div className={`text-[11px] font-mono truncate transition-colors duration-500 ${endNode ? 'text-red-300' : (isDark ? 'text-white/15' : 'text-gray-400')}`}>
                {!needsTarget ? 'N/A' : (endLabel ?? 'select…')}
              </div>
            </div>
          </div>

          {/* Active algo badge */}
          <div className="flex items-center gap-2 px-1">
            <span className={`text-[9px] font-mono uppercase tracking-widest transition-colors duration-500 ${isDark ? 'text-white/25' : 'text-gray-500'}`}>Protocol:</span>
            <span className="text-[11px] text-cyan-400 font-semibold">{activeAlgoName}</span>
          </div>

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={!canRun}
            className={`w-full rounded-xl py-2.5 flex justify-center items-center gap-2 font-bold text-sm transition-all duration-500
              disabled:opacity-30 disabled:cursor-not-allowed
              ${simulationStatus === 'completed'
                ? (isDark ? 'bg-white/10 border border-white/20 text-white hover:bg-white/15' : 'bg-gray-200 border border-gray-300 text-gray-900 hover:bg-gray-300')
                : 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30'
              }`}
          >
            {simulationStatus === 'idle'      && <><Play size={14} fill="currentColor"/> Run</>}
            {simulationStatus === 'running'   && <><Square size={14} fill="currentColor" className="animate-pulse"/> Running…</>}
            {simulationStatus === 'completed' && <><RotateCcw size={14}/> Reset</>}
          </button>
        </div>
      </motion.div>

      {/* ── BOTTOM RIGHT — rich log panel ── */}
      <div className="absolute bottom-5 right-5 w-72 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {(simulationStatus === 'running' || simulationStatus === 'completed') && (
            <motion.div
              key="log"
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className={`backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-500 ${isDark ? 'bg-black/80 border-white/10' : 'bg-white/90 border-gray-300'}`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between px-4 py-2.5 border-b transition-all duration-500 ${isDark ? 'border-white/8 bg-white/[0.02]' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${simulationStatus === 'running' ? 'bg-cyan-400 animate-pulse shadow-[0_0_6px_#00F0FF]' : 'bg-green-400 shadow-[0_0_6px_#00FF88]'}`}/>
                  <span className={`text-[10px] font-mono uppercase tracking-widest transition-colors duration-500 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
                    {simulationStatus === 'running' ? 'Executing' : 'Complete'}
                  </span>
                </div>
                <span className={`text-[10px] font-mono transition-colors duration-500 ${isDark ? 'text-white/30' : 'text-gray-500'}`}>
                  {algorithms.find(a => a.id === activeAlgo)?.name}
                </span>
              </div>

              {/* Progress bar */}
              {totalSteps > 0 && (
                <div className="px-4 pt-3 pb-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-[9px] font-mono uppercase tracking-widest transition-colors duration-500 ${isDark ? 'text-white/30' : 'text-gray-500'}`}>Progress</span>
                    <span className={`text-[9px] font-mono transition-colors duration-500 ${isDark ? 'text-white/40' : 'text-gray-600'}`}>{currentStep} / {totalSteps}</span>
                  </div>
                  <div className={`h-1 rounded-full overflow-hidden transition-colors duration-500 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                      animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                      transition={{ duration: 0.15 }}
                    />
                  </div>
                </div>
              )}

              {/* Stats row */}
              <div className={`grid grid-cols-3 gap-px mx-4 mt-3 rounded-xl overflow-hidden text-center transition-colors duration-500 ${isDark ? 'bg-white/5' : 'bg-gray-200'}`}>
                <div className={`py-2 px-1 transition-colors duration-500 ${isDark ? 'bg-black/60' : 'bg-white'}`}>
                  <div className={`text-[9px] uppercase tracking-widest mb-0.5 transition-colors duration-500 ${isDark ? 'text-white/25' : 'text-gray-500'}`}>Visited</div>
                  <div className="text-sm font-bold text-purple-400">{visitedNodes.length}</div>
                </div>
                <div className={`py-2 px-1 transition-colors duration-500 ${isDark ? 'bg-black/60' : 'bg-white'}`}>
                  <div className={`text-[9px] uppercase tracking-widest mb-0.5 transition-colors duration-500 ${isDark ? 'text-white/25' : 'text-gray-500'}`}>Explored</div>
                  <div className="text-sm font-bold text-cyan-400">{activeEdges.length}</div>
                </div>
                <div className={`py-2 px-1 transition-colors duration-500 ${isDark ? 'bg-black/60' : 'bg-white'}`}>
                  <div className={`text-[9px] uppercase tracking-widest mb-0.5 transition-colors duration-500 ${isDark ? 'text-white/25' : 'text-gray-500'}`}>Path</div>
                  <div className="text-sm font-bold text-green-400">{pathEdges.length}</div>
                </div>
              </div>

              {/* Log message */}
              {stepMessage && (
                <div className="px-4 py-3 mt-1">
                  <div className={`text-[9px] font-mono uppercase tracking-widest mb-1.5 transition-colors duration-500 ${isDark ? 'text-white/20' : 'text-gray-500'}`}>Last Operation</div>
                  <div className={`font-mono text-[11px] leading-relaxed rounded-xl px-3 py-2.5 transition-all duration-500 ${isDark ? 'text-cyan-300/90 bg-cyan-950/20 border border-cyan-500/10' : 'text-cyan-700 bg-cyan-50 border border-cyan-200'}`}>
                    {stepMessage}
                  </div>
                </div>
              )}

              {/* Visited nodes */}
              {visitedNodes.length > 0 && (
                <div className="px-4 pb-3">
                  <div className={`text-[9px] font-mono uppercase tracking-widest mb-1.5 transition-colors duration-500 ${isDark ? 'text-white/20' : 'text-gray-500'}`}>Visited Nodes</div>
                  <div className="flex flex-wrap gap-1">
                    {visitedNodes.map((id, i) => (
                      <span key={id} className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition-all duration-500 ${isDark ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300' : 'bg-purple-100 border border-purple-300 text-purple-700'}`}>
                        {i + 1}. {CAMPUS_NODES.find(n => n.id === id)?.label ?? id}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Final path edges */}
              {pathEdges.length > 0 && simulationStatus === 'completed' && (
                <div className="px-4 pb-4">
                  <div className={`text-[9px] font-mono uppercase tracking-widest mb-1.5 transition-colors duration-500 ${isDark ? 'text-white/20' : 'text-gray-500'}`}>Final Path</div>
                  <div className="flex flex-wrap gap-1">
                    {pathEdges.map(eid => {
                      const e = CAMPUS_EDGES.find(e => e.id === eid);
                      return e ? (
                        <span key={eid} className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition-all duration-500 ${isDark ? 'bg-green-500/10 border border-green-500/20 text-green-300' : 'bg-green-100 border border-green-300 text-green-700'}`}>
                          {e.source}→{e.target} <span className={isDark ? 'text-green-400/60' : 'text-green-600'}>{e.weight}</span>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-widest font-mono transition-colors duration-500 ${isDark ? 'text-white/15' : 'text-gray-400'}`}>
          <Maximize size={9}/> move mouse to pan
        </div>
      </div>

    </div>
  );
};

// ------------------------------------------------------------------
// 5. CINEMATIC LOADER
// ------------------------------------------------------------------

const Loader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const controls = animate(0, 100, {
      duration: 2,
      ease: "easeInOut",
      onUpdate: (value) => {
        setProgress(Math.floor(value));
      },
      onComplete: () => {
        setTimeout(onComplete, 500);
      }
    });
    return () => controls.stop();
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 bg-[#07080A] flex flex-col items-center justify-center pointer-events-none"
    >
      <div className="text-white font-mono text-6xl font-light mb-4 flex items-end">
        {progress.toString().padStart(3, '0')}<span className="text-2xl text-cyan-500 mb-1">%</span>
      </div>
      <div className="w-64 h-px bg-white/10 relative overflow-hidden">
        <motion.div 
          className="absolute inset-y-0 left-0 bg-cyan-500 shadow-[0_0_10px_#00F0FF]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/30 font-mono animate-pulse">
        Initializing Spatial Coordinates
      </div>
    </motion.div>
  );
};

// ------------------------------------------------------------------
// 6. MAIN APPLICATION WRAPPER
// ------------------------------------------------------------------

export default function App() {
  const [loading, setLoading] = useState(true);
  const theme = useGraphStore((state) => state.theme);

  // Inject fonts dynamically for zero-dependency preview
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@300;500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const bgColor = theme === 'dark' ? '#07080A' : '#F5F7FA';

  return (
    <div className="relative w-full h-screen overflow-hidden select-none transition-colors duration-500" style={{ fontFamily: 'Space Grotesk, sans-serif', backgroundColor: bgColor }}>
      <AnimatePresence>
        {loading && <Loader key="loader" onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <HUDOverlay />

      <ThreeScene />

      <style dangerouslySetInnerHTML={{__html: `
        body { cursor: crosshair; }
        ::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}
