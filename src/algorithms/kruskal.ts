import type { GraphEdge, AlgorithmStep, AlgorithmResult } from './types';

/**
 * Kruskal's Minimum Spanning Tree Algorithm
 * Time Complexity: O(E log E) for sorting + O(E α(V)) for Union-Find
 * Space Complexity: O(V)
 *
 * Greedy approach: sort edges by weight, add each edge if it doesn't form a cycle.
 * Uses Union-Find (Disjoint Set Union) with path compression and union by rank.
 */

// Union-Find data structure
class UnionFind {
  parent: Record<string, string>;
  rank: Record<string, number>;

  constructor(nodes: string[]) {
    this.parent = {};
    this.rank = {};
    for (const n of nodes) {
      this.parent[n] = n;
      this.rank[n] = 0;
    }
  }

  find(x: string): string {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  union(x: string, y: string): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false; // Same component, would form cycle

    // Union by rank
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    return true;
  }
}

export function kruskal(
  nodeIds: string[],
  edges: GraphEdge[]
): AlgorithmResult {
  const steps: AlgorithmStep[] = [];

  // Step 1: Sort edges by weight (ascending)
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

  steps.push({
    visitedNodes: [],
    activeEdges: [],
    pathEdges: [],
    currentNode: null,
    message: `Sort ${edges.length} edges by weight (ascending)`,
  });

  // Step 2: Initialize Union-Find
  const uf = new UnionFind(nodeIds);
  const mstEdges: string[] = [];
  const mstNodes = new Set<string>();
  let totalWeight = 0;
  let edgesConsidered = 0;

  // Step 3: Greedily add edges
  for (const edge of sortedEdges) {
    edgesConsidered++;
    const canAdd = uf.union(edge.source, edge.target);

    if (canAdd) {
      mstEdges.push(edge.id);
      mstNodes.add(edge.source);
      mstNodes.add(edge.target);
      totalWeight += edge.weight;

      steps.push({
        visitedNodes: Array.from(mstNodes),
        activeEdges: [...mstEdges],
        pathEdges: [],
        currentNode: edge.source,
        message: `✓ Add edge ${edge.source}↔${edge.target} (w=${edge.weight.toFixed(1)}) | MST edges: ${mstEdges.length}/${nodeIds.length - 1}`,
      });
    } else {
      steps.push({
        visitedNodes: Array.from(mstNodes),
        activeEdges: [...mstEdges],
        pathEdges: [],
        currentNode: null,
        message: `✗ Reject ${edge.source}↔${edge.target} (w=${edge.weight.toFixed(1)}) — would form cycle`,
      });
    }

    // MST is complete when we have V-1 edges
    if (mstEdges.length === nodeIds.length - 1) break;
  }

  steps.push({
    visitedNodes: Array.from(mstNodes),
    activeEdges: mstEdges,
    pathEdges: mstEdges,
    currentNode: null,
    message: `✓ MST complete | ${mstEdges.length} edges | Total weight: ${totalWeight.toFixed(1)} | ${edgesConsidered} edges considered`,
  });

  return {
    steps,
    finalPath: Array.from(mstNodes),
    finalPathEdges: mstEdges,
    totalDistance: totalWeight,
  };
}
