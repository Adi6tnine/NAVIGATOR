/*
 * ============================================================
 *  Dijkstra's Shortest Path Algorithm — Campus Navigation
 *  Time Complexity : O((V + E) log V) with priority queue
 *  Space Complexity: O(V + E)
 * ============================================================
 *  Compile: g++ -std=c++17 -O2 dijkstra.cpp -o dijkstra
 *  Run:     ./dijkstra
 * ============================================================
 */

#include <iostream>
#include <vector>
#include <queue>
#include <unordered_map>
#include <string>
#include <climits>
#include <algorithm>
#include <iomanip>

using namespace std;

// ---- Graph representation using adjacency list ----
struct Edge {
    string to;
    double weight;
};

class Graph {
public:
    unordered_map<string, vector<Edge>> adj;
    vector<string> nodes;

    void addNode(const string& id) {
        nodes.push_back(id);
        adj[id] = {};
    }

    void addEdge(const string& u, const string& v, double w) {
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }
};

// ---- Dijkstra's Algorithm ----
struct DijkstraResult {
    unordered_map<string, double> dist;
    unordered_map<string, string> prev;
    vector<string> path;
    double totalCost;
};

DijkstraResult dijkstra(const Graph& graph, const string& source, const string& target) {
    DijkstraResult result;

    // Initialize distances to infinity
    for (const auto& node : graph.nodes) {
        result.dist[node] = 1e18;
        result.prev[node] = "";
    }
    result.dist[source] = 0;

    // Min-priority queue: (distance, node)
    using PII = pair<double, string>;
    priority_queue<PII, vector<PII>, greater<PII>> pq;
    pq.push({0, source});

    unordered_map<string, bool> visited;

    cout << "\n[Dijkstra] Starting from: " << source << " -> " << target << "\n";
    cout << string(50, '-') << "\n";

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (visited[u]) continue;
        visited[u] = true;

        cout << "  Extract-Min: \"" << u << "\" (dist = " << fixed << setprecision(1) << d << ")\n";

        if (u == target) {
            cout << "  >> Target reached!\n";
            break;
        }

        // Relax all neighbors
        for (const auto& edge : graph.adj.at(u)) {
            if (visited[edge.to]) continue;

            double newDist = result.dist[u] + edge.weight;
            if (newDist < result.dist[edge.to]) {
                result.dist[edge.to] = newDist;
                result.prev[edge.to] = u;
                pq.push({newDist, edge.to});
                cout << "    Relax: dist[" << edge.to << "] = " << result.dist[u]
                     << " + " << edge.weight << " = " << newDist << "\n";
            }
        }
    }

    // Reconstruct shortest path
    result.totalCost = result.dist[target];
    string cur = target;
    while (!cur.empty()) {
        result.path.insert(result.path.begin(), cur);
        cur = result.prev[cur];
    }

    return result;
}

// ---- Campus Graph Setup ----
Graph buildCampusGraph() {
    Graph g;
    g.addNode("cs");     g.addNode("lib");    g.addNode("eng");
    g.addNode("med");    g.addNode("dormA");  g.addNode("dormB");
    g.addNode("gym");    g.addNode("cafe");   g.addNode("admin");
    g.addNode("park");

    g.addEdge("cs",    "lib",   5.1);
    g.addEdge("cs",    "eng",   5.0);
    g.addEdge("cs",    "cafe",  3.6);
    g.addEdge("cs",    "park",  2.4);
    g.addEdge("lib",   "admin", 2.4);
    g.addEdge("lib",   "eng",   7.2);
    g.addEdge("eng",   "med",   7.2);
    g.addEdge("med",   "gym",   5.1);
    g.addEdge("med",   "dormB", 5.9);
    g.addEdge("dormA", "cafe",  4.2);
    g.addEdge("dormA", "admin", 5.9);
    g.addEdge("dormB", "gym",   4.0);
    g.addEdge("dormB", "park",  4.4);
    g.addEdge("cafe",  "park",  3.3);
    g.addEdge("park",  "gym",   5.1);

    return g;
}

int main() {
    cout << "=== Campus Navigation: Dijkstra's Algorithm ===" << endl;

    Graph campus = buildCampusGraph();
    auto result = dijkstra(campus, "cs", "gym");

    cout << "\n" << string(50, '=') << "\n";
    cout << "RESULT:\n";
    cout << "  Path: ";
    for (size_t i = 0; i < result.path.size(); i++) {
        cout << result.path[i];
        if (i < result.path.size() - 1) cout << " -> ";
    }
    cout << "\n  Total Cost: " << fixed << setprecision(1) << result.totalCost << "\n";

    return 0;
}
