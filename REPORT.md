# CampusMatrix — Project Report

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Algorithm Implementations](#algorithm-implementations)
5. [Frontend Architecture](#frontend-architecture)
6. [File-by-File Breakdown](#file-by-file-breakdown)
7. [How Each Algorithm Works](#how-each-algorithm-works)
8. [Conclusion](#conclusion)

---

## 1. Project Overview

**CampusMatrix** is an interactive 3D graph algorithm visualization platform built with React, TypeScript, Three.js, and Tailwind CSS. The project demonstrates six fundamental graph algorithms through a visually stunning campus navigation system where nodes represent campus buildings and edges represent paths with weighted distances.

### Key Features
- **Real-time 3D Visualization**: Interactive rotating graph with animated nodes and edges
- **Step-by-Step Algorithm Execution**: Watch algorithms execute with detailed logs and progress tracking
- **Six Core Algorithms**: Dijkstra, Bellman-Ford, BFS, DFS, Floyd-Warshall, Kruskal's MST
- **Collapsible UI Panels**: Clean, modern interface with algorithm selection and node pickers
- **Edge Weight Labels**: Floating labels showing distances between nodes
- **Detailed Execution Log**: Real-time progress bar, visited nodes, explored edges, and final path display
- **C++ Reference Implementations**: Separate standalone C++ programs for academic reference (NOT used in the web app)

### Campus Graph
The graph consists of 10 nodes (campus buildings) and 15 weighted edges:
- **Nodes**: Computer Science, Library, Engineering, Medical Wing, North Dorms, South Dorms, Athletics Center, Student Union, Administration, Central Park
- **Edges**: Bidirectional paths with Euclidean distance weights (2.4 to 7.2 units)

---

## 2. Technology Stack

### Frontend
- **React 19.2.5**: UI framework with hooks and functional components
- **TypeScript 6.0.2**: Type-safe development with strict mode
- **Three.js 0.184.0**: 3D graphics rendering for the graph visualization
- **Zustand 5.0.12**: Lightweight state management (no Redux boilerplate)
- **Framer Motion 12.38.0**: Smooth animations for UI transitions
- **Tailwind CSS 4.2.4**: Utility-first styling with custom design system
- **Lucide React 1.9.0**: Modern icon library

### Build Tools
- **Vite 8.0.10**: Lightning-fast dev server and build tool
- **ESLint 10.2.1**: Code quality and consistency
- **TypeScript ESLint 8.58.2**: TypeScript-specific linting rules

### Development
- **Node.js**: Runtime environment
- **npm**: Package manager
- **C++ (g++ with C++17)**: Reference implementations

---

## 3. Project Structure

```
ADI DAA/
├── cpp/                          # C++ reference implementations
│   ├── dijkstra.cpp
│   ├── bellman_ford.cpp
│   ├── bfs_dfs.cpp
│   ├── floyd_warshall.cpp
│   └── kruskal_mst.cpp
├── src/
│   ├── algorithms/               # TypeScript algorithm implementations
│   │   ├── types.ts             # Shared interfaces and types
│   │   ├── dijkstra.ts
│   │   ├── bellmanFord.ts
│   │   ├── bfs.ts
│   │   ├── dfs.ts
│   │   ├── floydWarshall.ts
│   │   ├── kruskal.ts
│   │   └── index.ts             # Barrel export
│   ├── assets/                   # Images and static files
│   ├── App.tsx                   # Main application component
│   ├── App.css                   # Component styles
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Global styles
├── public/                       # Static assets
├── index.html                    # HTML entry point
├── package.json                  # Dependencies and scripts
├── vite.config.ts               # Vite configuration
├── tsconfig.app.json            # TypeScript config for app
├── tsconfig.json                # Base TypeScript config
├── tailwind.config.js           # Tailwind CSS config
├── eslint.config.js             # ESLint configuration
└── REPORT.md                    # This file

```

---

## 4. Algorithm Implementations

All algorithms are implemented in **TypeScript** for the web application. The C++ files in the `cpp/` folder are **separate standalone programs** provided as academic reference material — they are NOT used by the web app.

**The web application runs 100% in the browser using TypeScript implementations.**

Each TypeScript implementation returns step-by-step execution data for visualization.

### Algorithm Summary

| Algorithm | Time Complexity | Space Complexity | Use Case |
|-----------|----------------|------------------|----------|
| **Dijkstra** | O((V+E) log V) | O(V) | Shortest path, non-negative weights |
| **Bellman-Ford** | O(V·E) | O(V) | Shortest path, handles negative weights |
| **BFS** | O(V+E) | O(V) | Level-order traversal, unweighted shortest path |
| **DFS** | O(V+E) | O(V) | Depth-first exploration, connectivity |
| **Floyd-Warshall** | O(V³) | O(V²) | All-pairs shortest paths |
| **Kruskal's MST** | O(E log E) | O(V) | Minimum spanning tree |

---

## 5. Frontend Architecture

### State Management (Zustand)

The application uses Zustand for centralized state management with the following state:

```typescript
interface GraphState {
  nodes: NodeData[];              // Campus buildings
  edges: EdgeData[];              // Paths between buildings
  startNode: string | null;       // Selected origin
  endNode: string | null;         // Selected destination
  activeAlgo: string;             // Currently selected algorithm
  simulationStatus: 'idle' | 'running' | 'completed';
  visitedNodes: string[];         // Nodes visited during execution
  activeEdges: string[];          // Edges being explored
  pathEdges: string[];            // Final path edges
  stepMessage: string;            // Current step description
  currentStep: number;            // Current step index
  totalSteps: number;             // Total steps in algorithm
  hoveredNode: NodeData | null;   // Node under mouse cursor
}
```

### Component Architecture

**App.tsx** contains:
1. **ThreeScene**: Pure Three.js renderer (no React Three Fiber)
   - Creates 3D scene with camera, lights, and grid
   - Renders nodes as glowing spheres
   - Renders edges as lines with dynamic colors
   - Projects 3D positions to 2D for edge weight labels
   - Handles mouse interaction (hover, click)
   - Syncs with Zustand state for visual updates

2. **Panel**: Reusable collapsible panel component
   - Animated expand/collapse with Framer Motion
   - Customizable accent colors

3. **HUDOverlay**: Main UI overlay
   - Top bar: Logo, hovered node tooltip, stats
   - Left sidebar: Algorithm selector, node pickers, run button
   - Bottom right: Detailed execution log with progress bar

4. **Loader**: Cinematic loading screen with progress animation

---

## 6. File-by-File Breakdown

### `src/algorithms/types.ts`
Defines shared TypeScript interfaces:
- **GraphEdge**: Edge with id, source, target, weight
- **AlgorithmStep**: Snapshot of algorithm state at each step
- **AlgorithmResult**: Final result with steps, path, and total distance
- **findEdgeId()**: Utility to find edge ID between two nodes

### `src/algorithms/dijkstra.ts`
**Dijkstra's Shortest Path Algorithm**
- Builds adjacency list from edges
- Uses min-priority queue (simulated with array sort)
- Initializes distances to infinity, source to 0
- Extracts minimum distance node, marks as visited
- Relaxes all neighbors: if `dist[u] + weight < dist[v]`, update `dist[v]`
- Reconstructs path by backtracking through `prev` pointers
- Returns step-by-step execution log

**Key Operations**:
1. Initialize: `dist[source] = 0`, all others = ∞
2. Extract-Min: Get unvisited node with smallest distance
3. Relax: Update neighbor distances if shorter path found
4. Reconstruct: Backtrack from target to source using `prev`

### `src/algorithms/bellmanFord.ts`
**Bellman-Ford Shortest Path Algorithm**
- Handles negative edge weights (unlike Dijkstra)
- Relaxes ALL edges V-1 times (V = number of vertices)
- Creates bidirectional edge list for undirected graph
- Detects negative cycles with V-th relaxation pass
- Early termination if no updates in a pass

**Key Operations**:
1. Initialize: `dist[source] = 0`, all others = ∞
2. Relax V-1 times: For each edge (u,v), if `dist[u] + w < dist[v]`, update
3. Negative cycle check: If any edge can still be relaxed, cycle exists
4. Reconstruct path

### `src/algorithms/bfs.ts`
**Breadth-First Search Traversal**
- Uses FIFO queue for level-order exploration
- Guarantees shortest path in unweighted graphs
- Tracks level/depth of each node
- Marks nodes as visited when enqueued (not dequeued)

**Key Operations**:
1. Enqueue source at level 0
2. Dequeue node, mark as visited
3. Enqueue all unvisited neighbors at level+1
4. Repeat until queue empty

### `src/algorithms/dfs.ts`
**Depth-First Search Traversal**
- Uses LIFO stack (explicit, not recursive)
- Explores as deep as possible before backtracking
- Pushes neighbors in reverse order for natural traversal order

**Key Operations**:
1. Push source onto stack
2. Pop node, mark as visited
3. Push all unvisited neighbors
4. Repeat until stack empty

### `src/algorithms/floydWarshall.ts`
**Floyd-Warshall All-Pairs Shortest Paths**
- Dynamic programming approach
- Computes shortest paths between ALL pairs of nodes
- Uses 2D distance matrix `dist[i][j]`
- Uses 2D next matrix `next[i][j]` for path reconstruction

**Key Operations**:
1. Initialize: `dist[i][i] = 0`, direct edges = weight, others = ∞
2. For each intermediate node k:
   - For each pair (i,j): `dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])`
3. Reconstruct path using `next` matrix

### `src/algorithms/kruskal.ts`
**Kruskal's Minimum Spanning Tree**
- Greedy algorithm: always pick cheapest edge that doesn't form cycle
- Uses Union-Find (Disjoint Set Union) data structure
- Sorts edges by weight ascending
- Adds edge if it connects two different components

**Union-Find Operations**:
- **find(x)**: Get root of x's component (with path compression)
- **union(x,y)**: Merge components (with union by rank)

**Key Operations**:
1. Sort edges by weight
2. Initialize Union-Find with all nodes
3. For each edge: if `union(u,v)` succeeds, add to MST
4. Stop when MST has V-1 edges

### `src/App.tsx`
**Main Application Component** (900+ lines)

**ThreeScene Component**:
- Creates WebGL renderer with antialiasing
- Sets up perspective camera at (0, 8, 12)
- Adds ambient + directional lights
- Creates rotating group for all graph objects
- Renders nodes as spheres with emissive materials
- Renders edges as lines with dynamic opacity
- Creates DOM labels for edge weights
- Projects 3D midpoints to 2D screen coordinates each frame
- Handles raycasting for node hover/click
- Animates node pulse for start/end nodes
- Parallax camera movement based on mouse position

**HUDOverlay Component**:
- Top bar with logo, stats, and hovered node tooltip
- Left sidebar with three panels:
  1. Algorithm selector (collapsible)
  2. Node pickers for origin/destination (collapsible, cyan accent)
  3. Route summary and run button (always visible)
- Bottom right execution log:
  - Status indicator (pulsing cyan = running, solid green = complete)
  - Progress bar with gradient fill
  - Stats grid: Visited nodes, Explored edges, Path edges
  - Last operation message
  - Visited nodes as numbered badges
  - Final path edges with weights

**State Management**:
- Zustand store with graph data, algorithm state, UI state
- `runAlgorithmStepByStep()`: Executes algorithm, plays back steps with delays
- `toggleNodeSelection()`: Handles node selection logic
- `resetSimulation()`: Clears execution state

### `cpp/*.cpp` Files
**C++ reference implementations** — these are **separate standalone programs**, NOT used by the web application:
- Provided for academic reference and comparison
- Use STL containers (vector, queue, stack, priority_queue, unordered_map)
- Print step-by-step execution to console
- Demonstrate same algorithms with different syntax
- Compile with: `g++ -std=c++17 -O2 <file>.cpp -o <output>`
- Run independently from the web app

**Note**: The web application uses only the TypeScript implementations in `src/algorithms/`. The C++ files are optional reference material.

---

## 7. How Each Algorithm Works

### Dijkstra's Algorithm (Shortest Path)

**Problem**: Find shortest path from source to target in weighted graph with non-negative weights.

**Approach**: Greedy algorithm using priority queue.

**Steps**:
1. Initialize all distances to ∞ except source (0)
2. Add source to priority queue
3. While queue not empty:
   - Extract node `u` with minimum distance
   - Mark `u` as visited
   - For each neighbor `v` of `u`:
     - If `dist[u] + weight(u,v) < dist[v]`:
       - Update `dist[v] = dist[u] + weight(u,v)`
       - Set `prev[v] = u`
       - Add `v` to priority queue
4. Reconstruct path by backtracking from target using `prev`

**Why it works**: Greedy choice is safe because we always process nodes in order of their distance from source. Once a node is visited, we've found its shortest path.

**Limitations**: Cannot handle negative edge weights (would need to revisit nodes).

---

### Bellman-Ford Algorithm (Shortest Path with Negative Weights)

**Problem**: Find shortest path, handle negative weights, detect negative cycles.

**Approach**: Dynamic programming with edge relaxation.

**Steps**:
1. Initialize all distances to ∞ except source (0)
2. Repeat V-1 times:
   - For each edge (u,v) with weight w:
     - If `dist[u] + w < dist[v]`:
       - Update `dist[v] = dist[u] + w`
       - Set `prev[v] = u`
3. Check for negative cycles (V-th pass):
   - If any edge can still be relaxed, negative cycle exists
4. Reconstruct path

**Why it works**: After k iterations, we've found shortest paths using at most k edges. Since any simple path has at most V-1 edges, V-1 iterations suffice.

**Advantage over Dijkstra**: Handles negative weights, detects negative cycles.

**Disadvantage**: Slower (O(VE) vs O((V+E) log V)).

---

### BFS (Breadth-First Search)

**Problem**: Explore graph level by level, find shortest path in unweighted graph.

**Approach**: FIFO queue for level-order traversal.

**Steps**:
1. Enqueue source, mark as visited
2. While queue not empty:
   - Dequeue node `u`
   - For each unvisited neighbor `v`:
     - Mark `v` as visited
     - Enqueue `v`

**Why it works**: Queue ensures we visit all nodes at distance k before visiting any node at distance k+1.

**Use cases**: 
- Shortest path in unweighted graphs
- Level-order traversal
- Connected components
- Bipartite graph checking

---

### DFS (Depth-First Search)

**Problem**: Explore graph by going as deep as possible before backtracking.

**Approach**: LIFO stack (or recursion).

**Steps**:
1. Push source onto stack
2. While stack not empty:
   - Pop node `u`
   - If `u` not visited:
     - Mark `u` as visited
     - Push all unvisited neighbors onto stack

**Why it works**: Stack ensures we explore one branch completely before moving to another.

**Use cases**:
- Topological sorting
- Cycle detection
- Strongly connected components
- Maze solving

---

### Floyd-Warshall Algorithm (All-Pairs Shortest Paths)

**Problem**: Find shortest paths between ALL pairs of vertices.

**Approach**: Dynamic programming with intermediate vertices.

**Steps**:
1. Initialize 2D matrix: `dist[i][j]` = edge weight if edge exists, ∞ otherwise, 0 for diagonal
2. For each intermediate vertex k (0 to V-1):
   - For each pair (i,j):
     - `dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])`
3. Reconstruct any path using `next` matrix

**Why it works**: After considering vertices 0..k as intermediates, `dist[i][j]` contains shortest path from i to j using only vertices 0..k.

**Recurrence**: `dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])`

**Use cases**:
- Dense graphs where we need all-pairs distances
- Transitive closure
- Detecting negative cycles (check diagonal)

---

### Kruskal's Algorithm (Minimum Spanning Tree)

**Problem**: Find minimum cost tree connecting all vertices.

**Approach**: Greedy algorithm with Union-Find.

**Steps**:
1. Sort all edges by weight (ascending)
2. Initialize Union-Find with all vertices
3. For each edge (u,v) in sorted order:
   - If `find(u) ≠ find(v)` (different components):
     - Add edge to MST
     - `union(u,v)` (merge components)
4. Stop when MST has V-1 edges

**Why it works**: Greedy choice is safe (cut property): the lightest edge crossing any cut is in some MST.

**Union-Find optimizations**:
- **Path compression**: Make `find()` faster by flattening tree
- **Union by rank**: Keep tree balanced by attaching smaller tree to larger

**Use cases**:
- Network design (minimize cable length)
- Clustering
- Approximation algorithms

---

## 8. Conclusion

**CampusMatrix** successfully demonstrates six fundamental graph algorithms through an interactive 3D visualization. The project combines:

- **Educational Value**: Step-by-step algorithm execution with detailed logs
- **Visual Appeal**: Stunning 3D graphics with smooth animations
- **Code Quality**: Type-safe TypeScript, clean architecture, modern React patterns
- **Performance**: Efficient Three.js rendering, optimized state management
- **Dual Implementation**: TypeScript for web + C++ for academic reference

### Key Achievements
✅ Six fully functional graph algorithms **implemented in TypeScript**  
✅ Real-time 3D visualization with Three.js  
✅ Interactive node selection and algorithm execution  
✅ Detailed execution logs with progress tracking  
✅ Collapsible UI panels with smooth animations  
✅ Edge weight labels projected from 3D to 2D  
✅ C++ reference implementations (separate standalone programs)  
✅ Type-safe codebase with TypeScript  
✅ Modern React architecture with hooks and Zustand  
✅ **100% browser-based execution** — no backend required  

### Future Enhancements
- Add more algorithms (A*, Prim's MST, Tarjan's SCC)
- Custom graph editor (add/remove nodes and edges)
- Algorithm comparison mode (run multiple algorithms side-by-side)
- Export execution as video or GIF
- Mobile-responsive design
- Dark/light theme toggle
- Algorithm speed control (slow motion, fast forward)

---

**Project by**: ADARSH KUMAR - 24BCS10833 , SEC-SAP_802(B)  .
**Course**: Design and Analysis of Algorithms (DAA)  
**Tech Stack**: React, TypeScript, Three.js, Zustand, Tailwind CSS, Vite  
**Repository**: CampusMatrix Graph Algorithm Visualizer  

---

*This report documents the complete architecture, implementation details, and algorithmic foundations of the CampusMatrix project.*
