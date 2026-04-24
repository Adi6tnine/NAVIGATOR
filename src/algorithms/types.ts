export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface AlgorithmStep {
  visitedNodes: string[];
  activeEdges: string[];
  pathEdges: string[];
  currentNode: string | null;
  message: string;
}

export interface AlgorithmResult {
  steps: AlgorithmStep[];
  finalPath: string[];
  finalPathEdges: string[];
  totalDistance: number;
}

export function findEdgeId(edges: GraphEdge[], a: string, b: string): string | null {
  const edge = edges.find(
    (e) => (e.source === a && e.target === b) || (e.source === b && e.target === a)
  );
  return edge ? edge.id : null;
}
