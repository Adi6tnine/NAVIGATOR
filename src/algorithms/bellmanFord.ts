import type { GraphEdge, AlgorithmStep, AlgorithmResult } from './types';

/**
 * Bellman-Ford Shortest Path Algorithm
 * Time Complexity: O(V * E)
 * Space Complexity: O(V)
 * 
 * Relaxes ALL edges V-1 times. Can handle negative edge weights
 * and detect negative-weight cycles (unlike Dijkstra).
 */
export function bellmanFord(
  nodeIds: string[],
  edges: GraphEdge[],
  source: string,
  target: string
): AlgorithmResult {
  const steps: AlgorithmStep[] = [];
  const V = nodeIds.length;

  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const prevEdge: Record<string, string | null> = {};

  for (const n of nodeIds) {
    dist[n] = Infinity;
    prev[n] = null;
    prevEdge[n] = null;
  }
  dist[source] = 0;

  steps.push({
    visitedNodes: [source],
    activeEdges: [],
    pathEdges: [],
    currentNode: source,
    message: `Initialize: dist[${source}] = 0, all others = ∞`,
  });

  // Create undirected edge list (both directions)
  const allEdges: { source: string; target: string; weight: number; id: string }[] = [];
  for (const e of edges) {
    allEdges.push({ source: e.source, target: e.target, weight: e.weight, id: e.id });
    allEdges.push({ source: e.target, target: e.source, weight: e.weight, id: e.id });
  }

  // V-1 relaxation passes
  for (let i = 0; i < V - 1; i++) {
    let updated = false;

    for (const { source: u, target: v, weight: w, id: edgeId } of allEdges) {
      if (dist[u] === Infinity) continue;

      const newDist = dist[u] + w;
      if (newDist < dist[v]) {
        dist[v] = newDist;
        prev[v] = u;
        prevEdge[v] = edgeId;
        updated = true;

        const relaxedNodes = nodeIds.filter((n) => dist[n] < Infinity);
        const relaxedEdges = nodeIds.filter((n) => prevEdge[n] !== null).map((n) => prevEdge[n]!);

        steps.push({
          visitedNodes: relaxedNodes,
          activeEdges: [...relaxedEdges, edgeId],
          pathEdges: [],
          currentNode: v,
          message: `Pass ${i + 1}: Relax ${u} → ${v}, dist[${v}] = ${newDist.toFixed(1)}`,
        });
      }
    }

    if (!updated) {
      steps.push({
        visitedNodes: nodeIds.filter((n) => dist[n] < Infinity),
        activeEdges: nodeIds.filter((n) => prevEdge[n] !== null).map((n) => prevEdge[n]!),
        pathEdges: [],
        currentNode: null,
        message: `Pass ${i + 1}: No updates — algorithm converged early`,
      });
      break;
    }
  }

  // Negative cycle detection (V-th pass)
  let hasNegCycle = false;
  for (const { source: u, target: v, weight: w } of allEdges) {
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
      hasNegCycle = true;
      break;
    }
  }

  // Reconstruct path
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
    visitedNodes: nodeIds.filter((n) => dist[n] < Infinity),
    activeEdges: allExplored,
    pathEdges,
    currentNode: null,
    message: hasNegCycle
      ? `⚠ Negative-weight cycle detected!`
      : dist[target] < Infinity
        ? `✓ Shortest path: ${path.join(' → ')} | Cost: ${dist[target].toFixed(1)}`
        : `✗ No path from ${source} to ${target}`,
  });

  return {
    steps,
    finalPath: path,
    finalPathEdges: pathEdges,
    totalDistance: dist[target],
  };
}
