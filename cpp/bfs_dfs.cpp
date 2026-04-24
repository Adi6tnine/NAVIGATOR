/*
 * ============================================================
 *  BFS & DFS Graph Traversal — Campus Navigation
 *  Time Complexity : O(V + E) for both
 *  Space Complexity: O(V)
 * ============================================================
 *  BFS uses a FIFO queue  → explores level by level
 *  DFS uses a LIFO stack  → explores depth-first, then backtracks
 *
 *  Compile: g++ -std=c++17 -O2 bfs_dfs.cpp -o bfs_dfs
 *  Run:     ./bfs_dfs
 * ============================================================
 */

#include <iostream>
#include <vector>
#include <queue>
#include <stack>
#include <unordered_map>
#include <unordered_set>
#include <string>

using namespace std;

class Graph {
public:
    unordered_map<string, vector<string>> adj;
    vector<string> nodes;

    void addNode(const string& id) {
        nodes.push_back(id);
        adj[id] = {};
    }

    void addEdge(const string& u, const string& v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
};

// ---- Breadth-First Search ----
vector<string> bfs(const Graph& graph, const string& source) {
    vector<string> traversalOrder;
    unordered_set<string> visited;
    queue<pair<string, int>> q;  // (node, level)

    visited.insert(source);
    q.push({source, 0});

    cout << "\n[BFS] Starting from: " << source << "\n";
    cout << string(50, '-') << "\n";

    while (!q.empty()) {
        auto [node, level] = q.front();
        q.pop();
        traversalOrder.push_back(node);

        cout << "  Dequeue: \"" << node << "\" (Level " << level
             << ") | Queue size: " << q.size() << "\n";

        for (const auto& neighbor : graph.adj.at(node)) {
            if (visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                q.push({neighbor, level + 1});
                cout << "    Discover: \"" << neighbor << "\" (Level " << (level + 1) << ")\n";
            }
        }
    }

    return traversalOrder;
}

// ---- Depth-First Search (Iterative with explicit stack) ----
vector<string> dfs(const Graph& graph, const string& source) {
    vector<string> traversalOrder;
    unordered_set<string> visited;
    stack<string> stk;

    stk.push(source);

    cout << "\n[DFS] Starting from: " << source << "\n";
    cout << string(50, '-') << "\n";

    while (!stk.empty()) {
        string node = stk.top();
        stk.pop();

        if (visited.find(node) != visited.end()) continue;
        visited.insert(node);
        traversalOrder.push_back(node);

        cout << "  Pop & Visit: \"" << node << "\" | Stack depth: " << stk.size() << "\n";

        // Push neighbors in reverse order to visit in natural order
        const auto& neighbors = graph.adj.at(node);
        for (int i = neighbors.size() - 1; i >= 0; i--) {
            if (visited.find(neighbors[i]) == visited.end()) {
                stk.push(neighbors[i]);
                cout << "    Push: \"" << neighbors[i] << "\"\n";
            }
        }
    }

    return traversalOrder;
}

// ---- Campus Graph ----
Graph buildCampusGraph() {
    Graph g;
    g.addNode("cs");     g.addNode("lib");    g.addNode("eng");
    g.addNode("med");    g.addNode("dormA");  g.addNode("dormB");
    g.addNode("gym");    g.addNode("cafe");   g.addNode("admin");
    g.addNode("park");

    g.addEdge("cs",    "lib");    g.addEdge("cs",    "eng");
    g.addEdge("cs",    "cafe");   g.addEdge("cs",    "park");
    g.addEdge("lib",   "admin");  g.addEdge("lib",   "eng");
    g.addEdge("eng",   "med");    g.addEdge("med",   "gym");
    g.addEdge("med",   "dormB");  g.addEdge("dormA", "cafe");
    g.addEdge("dormA", "admin");  g.addEdge("dormB", "gym");
    g.addEdge("dormB", "park");   g.addEdge("cafe",  "park");
    g.addEdge("park",  "gym");

    return g;
}

int main() {
    cout << "=== Campus Navigation: BFS & DFS Traversal ===" << endl;

    Graph campus = buildCampusGraph();

    // Run BFS
    auto bfsOrder = bfs(campus, "cs");
    cout << "\n  BFS Traversal Order: ";
    for (size_t i = 0; i < bfsOrder.size(); i++) {
        cout << bfsOrder[i];
        if (i < bfsOrder.size() - 1) cout << " -> ";
    }
    cout << "\n  Nodes visited: " << bfsOrder.size() << "/" << campus.nodes.size() << "\n";

    cout << "\n" << string(50, '=') << "\n";

    // Run DFS
    auto dfsOrder = dfs(campus, "cs");
    cout << "\n  DFS Traversal Order: ";
    for (size_t i = 0; i < dfsOrder.size(); i++) {
        cout << dfsOrder[i];
        if (i < dfsOrder.size() - 1) cout << " -> ";
    }
    cout << "\n  Nodes visited: " << dfsOrder.size() << "/" << campus.nodes.size() << "\n";

    return 0;
}
