import type { GraphEdge, AlgorithmStep, AlgorithmResult } from './types';

/**
 * Depth-First Search (DFS) Traversal
 * Time Complexity: O(V + E)
 * Space Complexity: O(V)
 *
 * Explores as deep as possible along each branch before backtracking.
 * Uses an explicit stack (iterative) to mirror the C++ implementation.
 */
export function dfs(
  nodeIds: string[],
  edges: GraphEdge[],
  source: string
): AlgorithmResult {
  const steps: AlgorithmStep[] = [];

  // Build adjacency list
  const adj: Record<string, { node: string; edgeId: string }[]> = {};
  for (const n of nodeIds) adj[n] = [];
  for (const e of edges) {
    adj[e.source].push({ node: e.target, edgeId: e.id });
    adj[e.target].push({ node: e.source, edgeId: e.id });
  }

  const visited = new Set<string>();
  const stack: string[] = [source];
  const exploredEdges: string[] = [];
  const traversalOrder: string[] = [];

  steps.push({
    visitedNodes: [],
    activeEdges: [],
    pathEdges: [],
    currentNode: source,
    message: `Push source "${source}" onto stack`,
  });

  while (stack.length > 0) {
    const u = stack.pop()!;

    if (visited.has(u)) continue;
    visited.add(u);
    traversalOrder.push(u);

    steps.push({
      visitedNodes: Array.from(visited),
      activeEdges: [...exploredEdges],
      pathEdges: [],
      currentNode: u,
      message: `Pop & visit "${u}" | Stack depth: ${stack.length}`,
    });

    // Push unvisited neighbors (reverse order to visit in natural order)
    const neighbors = adj[u].filter(({ node }) => !visited.has(node));
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const { node: v, edgeId } = neighbors[i];
      if (!visited.has(v)) {
        stack.push(v);
        exploredEdges.push(edgeId);

        steps.push({
          visitedNodes: Array.from(visited),
          activeEdges: [...exploredEdges],
          pathEdges: [],
          currentNode: u,
          message: `Push "${v}" onto stack (via ${u}→${v})`,
        });
      }
    }
  }

  steps.push({
    visitedNodes: Array.from(visited),
    activeEdges: exploredEdges,
    pathEdges: [],
    currentNode: null,
    message: `✓ DFS complete | Traversal: ${traversalOrder.join(' → ')} | ${visited.size}/${nodeIds.length} nodes reached`,
  });

  return {
    steps,
    finalPath: traversalOrder,
    finalPathEdges: exploredEdges,
    totalDistance: 0,
  };
}
