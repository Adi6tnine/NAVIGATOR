import type { GraphEdge, AlgorithmStep, AlgorithmResult } from './types';

/**
 * Breadth-First Search (BFS) Traversal
 * Time Complexity: O(V + E)
 * Space Complexity: O(V)
 *
 * Explores the graph level by level using a FIFO queue.
 * Guarantees shortest path in unweighted graphs.
 */
export function bfs(
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
  const queue: { node: string; level: number }[] = [{ node: source, level: 0 }];
  visited.add(source);

  const exploredEdges: string[] = [];
  const traversalOrder: string[] = [];
  let currentLevel = 0;

  steps.push({
    visitedNodes: [source],
    activeEdges: [],
    pathEdges: [],
    currentNode: source,
    message: `Enqueue source "${source}" at level 0`,
  });

  while (queue.length > 0) {
    const { node: u, level } = queue.shift()!;
    traversalOrder.push(u);

    if (level > currentLevel) {
      currentLevel = level;
    }

    steps.push({
      visitedNodes: Array.from(visited),
      activeEdges: [...exploredEdges],
      pathEdges: [],
      currentNode: u,
      message: `Dequeue "${u}" (Level ${level}) | Queue size: ${queue.length}`,
    });

    for (const { node: v, edgeId } of adj[u]) {
      if (!visited.has(v)) {
        visited.add(v);
        queue.push({ node: v, level: level + 1 });
        exploredEdges.push(edgeId);

        steps.push({
          visitedNodes: Array.from(visited),
          activeEdges: [...exploredEdges],
          pathEdges: [],
          currentNode: u,
          message: `Discover "${v}" via edge ${u}→${v} (Level ${level + 1})`,
        });
      }
    }
  }

  steps.push({
    visitedNodes: Array.from(visited),
    activeEdges: exploredEdges,
    pathEdges: [],
    currentNode: null,
    message: `✓ BFS complete | Traversal: ${traversalOrder.join(' → ')} | ${visited.size}/${nodeIds.length} nodes reached`,
  });

  return {
    steps,
    finalPath: traversalOrder,
    finalPathEdges: exploredEdges,
    totalDistance: 0,
  };
}
