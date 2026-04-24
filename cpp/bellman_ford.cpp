/*
 * ============================================================
 *  Bellman-Ford Shortest Path Algorithm — Campus Navigation
 *  Time Complexity : O(V * E)
 *  Space Complexity: O(V)
 * ============================================================
 *  Can handle negative edge weights and detect negative cycles.
 *  Relaxes ALL edges V-1 times to guarantee shortest paths.
 *
 *  Compile: g++ -std=c++17 -O2 bellman_ford.cpp -o bellman_ford
 *  Run:     ./bellman_ford
 * ============================================================
 */

#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <iomanip>
#include <algorithm>

using namespace std;

struct Edge {
    string from, to;
    double weight;
};

struct BFResult {
    unordered_map<string, double> dist;
    unordered_map<string, string> prev;
    vector<string> path;
    double totalCost;
    bool hasNegativeCycle;
};

BFResult bellmanFord(const vector<string>& nodes, const vector<Edge>& edges,
                     const string& source, const string& target) {
    BFResult result;
    result.hasNegativeCycle = false;
    int V = nodes.size();

    // Step 1: Initialize distances
    for (const auto& n : nodes) {
        result.dist[n] = 1e18;
        result.prev[n] = "";
    }
    result.dist[source] = 0;

    cout << "\n[Bellman-Ford] Source: " << source << " -> Target: " << target << "\n";
    cout << string(50, '-') << "\n";

    // Create bidirectional edge list
    vector<Edge> allEdges;
    for (const auto& e : edges) {
        allEdges.push_back(e);
        allEdges.push_back({e.to, e.from, e.weight});
    }

    // Step 2: Relax all edges V-1 times
    for (int i = 0; i < V - 1; i++) {
        bool updated = false;
        cout << "  Pass " << (i + 1) << ":\n";

        for (const auto& e : allEdges) {
            if (result.dist[e.from] >= 1e17) continue;

            double newDist = result.dist[e.from] + e.weight;
            if (newDist < result.dist[e.to]) {
                result.dist[e.to] = newDist;
                result.prev[e.to] = e.from;
                updated = true;
                cout << "    Relax " << e.from << " -> " << e.to
                     << ": dist[" << e.to << "] = " << fixed << setprecision(1) << newDist << "\n";
            }
        }

        if (!updated) {
            cout << "    No updates — converged early at pass " << (i + 1) << "\n";
            break;
        }
    }

    // Step 3: Check for negative-weight cycles (V-th pass)
    for (const auto& e : allEdges) {
        if (result.dist[e.from] < 1e17 &&
            result.dist[e.from] + e.weight < result.dist[e.to]) {
            result.hasNegativeCycle = true;
            cout << "\n  WARNING: Negative-weight cycle detected!\n";
            break;
        }
    }

    // Reconstruct path
    result.totalCost = result.dist[target];
    string cur = target;
    while (!cur.empty()) {
        result.path.insert(result.path.begin(), cur);
        cur = result.prev[cur];
    }

    return result;
}

int main() {
    cout << "=== Campus Navigation: Bellman-Ford Algorithm ===" << endl;

    vector<string> nodes = {"cs","lib","eng","med","dormA","dormB","gym","cafe","admin","park"};
    vector<Edge> edges = {
        {"cs","lib",5.1}, {"cs","eng",5.0}, {"cs","cafe",3.6}, {"cs","park",2.4},
        {"lib","admin",2.4}, {"lib","eng",7.2}, {"eng","med",7.2}, {"med","gym",5.1},
        {"med","dormB",5.9}, {"dormA","cafe",4.2}, {"dormA","admin",5.9},
        {"dormB","gym",4.0}, {"dormB","park",4.4}, {"cafe","park",3.3}, {"park","gym",5.1}
    };

    auto result = bellmanFord(nodes, edges, "dormA", "med");

    cout << "\n" << string(50, '=') << "\n";
    cout << "RESULT:\n";
    cout << "  Negative cycle: " << (result.hasNegativeCycle ? "YES" : "NO") << "\n";
    cout << "  Path: ";
    for (size_t i = 0; i < result.path.size(); i++) {
        cout << result.path[i];
        if (i < result.path.size() - 1) cout << " -> ";
    }
    cout << "\n  Total Cost: " << fixed << setprecision(1) << result.totalCost << "\n";

    return 0;
}
