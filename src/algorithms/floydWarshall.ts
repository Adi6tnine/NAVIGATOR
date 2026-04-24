import type { GraphEdge, AlgorithmStep, AlgorithmResult } from './types';
import { findEdgeId } from './types';

/**
 * Floyd-Warshall All-Pairs Shortest Paths
 * Time Complexity: O(V³)
 * Space Complexity: O(V²)
 *
 * Dynamic programming approach: for each intermediate vertex k,
 * check if path i→k→j is shorter than current i→j.
 * dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
 */
export function floydWarshall(
  nodeIds: string[],
  edges: GraphEdge[],
  source: string | null,
  target: string | null
): AlgorithmResult {
  const steps: AlgorithmStep[] = [];
  const V = nodeIds.length;
  const idx: Record<string, number> = {};
  nodeIds.forEach((n, i) => (idx[n] = i));

  // Initialize distance matrix
  const dist: number[][] = Array.from({ length: V }, () => Array(V).fill(Infinity));
  const next: (number | null)[][] = Array.from({ length: V }, () => Array(V).fill(null));

  for (let i = 0; i < V; i++) {
    dist[i][i] = 0;
    next[i][i] = i;
  }

  for (const e of edges) {
    const i = idx[e.source];
    const j = idx[e.target];
    dist[i][j] = e.weight;
    dist[j][i] = e.weight;
    next[i][j] = j;
    next[j][i] = i;
  }

  steps.push({
    visitedNodes: [],
    activeEdges: [],
    pathEdges: [],
    currentNode: null,
    message: `Initialize ${V}×${V} distance matrix with direct edge weights`,
  });

  // Floyd-Warshall main loop
  for (let k = 0; k < V; k++) {
    const kNode = nodeIds[k];
    let updatesInThisPass = 0;

    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          next[i][j] = next[i][k];
          updatesInThisPass++;
        }
      }
    }

    // Show which nodes have been used as intermediaries
    const intermediaries = nodeIds.slice(0, k + 1);
    const affectedEdges: string[] = [];
    for (const e of edges) {
      const i = idx[e.source];
      const j = idx[e.target];
      if (dist[i][j] <= e.weight) affectedEdges.push(e.id);
    }

    steps.push({
      visitedNodes: intermediaries,
      activeEdges: affectedEdges,
      pathEdges: [],
      currentNode: kNode,
      message: `k = "${kNode}": Consider paths through "${kNode}" | ${updatesInThisPass} distances improved`,
    });
  }

  // Reconstruct specific path if source and target given
  const pathNodes: string[] = [];
  const pathEdges: string[] = [];
  let totalDist = Infinity;

  if (source && target) {
    const si = idx[source];
    const ti = idx[target];
    totalDist = dist[si][ti];

    if (totalDist < Infinity) {
      let cur = si;
      pathNodes.push(nodeIds[cur]);
      while (cur !== ti) {
        const nxt = next[cur][ti];
        if (nxt === null) break;
        const eid = findEdgeId(edges, nodeIds[cur], nodeIds[nxt]);
        if (eid) pathEdges.push(eid);
        cur = nxt;
        pathNodes.push(nodeIds[cur]);
      }
    }

    steps.push({
      visitedNodes: nodeIds,
      activeEdges: edges.map((e) => e.id),
      pathEdges,
      currentNode: null,
      message:
        totalDist < Infinity
          ? `✓ All-pairs complete | ${source}→${target}: ${pathNodes.join(' → ')} (cost: ${totalDist.toFixed(1)})`
          : `✓ All-pairs complete | No path from ${source} to ${target}`,
    });
  } else {
    steps.push({
      visitedNodes: nodeIds,
      activeEdges: edges.map((e) => e.id),
      pathEdges: [],
      currentNode: null,
      message: `✓ All-pairs shortest paths computed for all ${V} vertices`,
    });
  }

  return {
    steps,
    finalPath: pathNodes,
    finalPathEdges: pathEdges,
    totalDistance: totalDist,
  };
}
