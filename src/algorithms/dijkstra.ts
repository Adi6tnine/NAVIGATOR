import type { GraphEdge, AlgorithmStep, AlgorithmResult } from './types';

/**
 * Dijkstra's Shortest Path Algorithm
 * Time Complexity: O((V + E) log V) with a priority queue
 * Space Complexity: O(V)
 * 
 * Uses a min-priority queue to greedily select the nearest unvisited node,
 * then relaxes all outgoing edges. Guarantees shortest path for non-negative weights.
 */
export function dijkstra(
  nodeIds: string[],
  edges: GraphEdge[],
  source: string,
  target: string
): AlgorithmResult {
  const steps: AlgorithmStep[] = [];

  // Build adjacency list
  const adj: Record<string, { node: string; weight: number; edgeId: string }[]> = {};
  for (const n of nodeIds) adj[n] = [];
  for (const e of edges) {
    adj[e.source].push({ node: e.target, weight: e.weight, edgeId: e.id });
    adj[e.target].push({ node: e.source, weight: e.weight, edgeId: e.id });
  }

  // Initialize distance and predecessor arrays
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const prevEdge: Record<string, string | null> = {};
  const visited = new Set<string>();

  for (const n of nodeIds) {
    dist[n] = Infinity;
    prev[n] = null;
    prevEdge[n] = null;
  }
  dist[source] = 0;

  // Priority queue (min-heap simulation)
  const pq: { node: string; dist: number }[] = [{ node: source, dist: 0 }];

  steps.push({
    visitedNodes: [],
    activeEdges: [],
    pathEdges: [],
    currentNode: source,
    message: `Initialize: dist[${source}] = 0, all others = ∞`,
  });

  while (pq.length > 0) {
    // Extract minimum distance node
    pq.sort((a, b) => a.dist - b.dist);
    const { node: u, dist: d } = pq.shift()!;

    if (visited.has(u)) continue;
    visited.add(u);

    const exploredEdges = nodeIds.filter((n) => prevEdge[n] !== null).map((n) => prevEdge[n]!);

    steps.push({
      visitedNodes: Array.from(visited),
      activeEdges: exploredEdges,
      pathEdges: [],
      currentNode: u,
      message: `Extract-Min: u = "${u}", dist = ${d === Infinity ? '∞' : d.toFixed(1)}`,
    });

    if (u === target) break;

    // Relax all neighbors of u
    for (const { node: v, weight: w, edgeId } of adj[u]) {
      if (visited.has(v)) continue;

      const newDist = dist[u] + w;
      if (newDist < dist[v]) {
        dist[v] = newDist;
        prev[v] = u;
        prevEdge[v] = edgeId;
        pq.push({ node: v, dist: newDist });

        const currentExplored = nodeIds.filter((n) => prevEdge[n] !== null).map((n) => prevEdge[n]!);
        steps.push({
          visitedNodes: Array.from(visited),
          activeEdges: [...currentExplored, edgeId],
          pathEdges: [],
          currentNode: u,
          message: `Relax: dist[${v}] = dist[${u}] + w(${u},${v}) = ${dist[u].toFixed(1)} + ${w.toFixed(1)} = ${newDist.toFixed(1)}`,
        });
      }
    }
  }

  // Reconstruct shortest path
  const path: string[] = [];
  const pathEdges: string[] = [];
  let cur: string | null = target;
  while (cur !== null) {
    path.unshift(cur);
    if (prevEdge[cur]) pathEdges.unshift(prevEdge[cur]!);
    cur = prev[cur];
  }

  const allExplored = nodeIds.filter((n) => prevEdge[n] !== null).map((n) => prevEdge[n]!);
  steps.push({
    visitedNodes: Array.from(visited),
    activeEdges: allExplored,
    pathEdges,
    currentNode: null,
    message:
      dist[target] < Infinity
        ? `✓ Shortest path: ${path.join(' → ')} | Total cost: ${dist[target].toFixed(1)}`
        : `✗ No path exists from ${source} to ${target}`,
  });

  return {
    steps,
    finalPath: path,
    finalPathEdges: pathEdges,
    totalDistance: dist[target],
  };
}
