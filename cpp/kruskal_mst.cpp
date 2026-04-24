/*
 * Kruskal's Minimum Spanning Tree — Campus Navigation
 * Time: O(E log E) | Space: O(V) with Union-Find
 * Compile: g++ -std=c++17 -O2 kruskal_mst.cpp -o kruskal_mst
 */
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
#include <iomanip>
using namespace std;

struct Edge { string from, to; double weight; };

// Union-Find with path compression and union by rank
class UnionFind {
    unordered_map<string, string> parent;
    unordered_map<string, int> rank;
public:
    void makeSet(const string& x) { parent[x] = x; rank[x] = 0; }
    string find(const string& x) {
        if (parent[x] != x) parent[x] = find(parent[x]); // path compression
        return parent[x];
    }
    bool unite(const string& x, const string& y) {
        string rx = find(x), ry = find(y);
        if (rx == ry) return false; // same component — cycle
        if (rank[rx] < rank[ry]) swap(rx, ry); // union by rank
        parent[ry] = rx;
        if (rank[rx] == rank[ry]) rank[rx]++;
        return true;
    }
};

int main() {
    cout << "=== Kruskal's Minimum Spanning Tree ===\n";
    vector<string> nodes = {"cs","lib","eng","med","dormA","dormB","gym","cafe","admin","park"};
    vector<Edge> edges = {
        {"cs","lib",5.1},{"cs","eng",5.0},{"cs","cafe",3.6},{"cs","park",2.4},
        {"lib","admin",2.4},{"lib","eng",7.2},{"eng","med",7.2},{"med","gym",5.1},
        {"med","dormB",5.9},{"dormA","cafe",4.2},{"dormA","admin",5.9},
        {"dormB","gym",4.0},{"dormB","park",4.4},{"cafe","park",3.3},{"park","gym",5.1}
    };

    // Step 1: Sort edges by weight
    sort(edges.begin(), edges.end(), [](const Edge& a, const Edge& b){ return a.weight < b.weight; });
    cout << "Sorted " << edges.size() << " edges by weight.\n\n";

    // Step 2: Initialize Union-Find
    UnionFind uf;
    for (auto& n : nodes) uf.makeSet(n);

    // Step 3: Greedily add edges
    vector<Edge> mst;
    double totalWeight = 0;
    int considered = 0;

    for (auto& e : edges) {
        considered++;
        if (uf.unite(e.from, e.to)) {
            mst.push_back(e);
            totalWeight += e.weight;
            cout << "  + ADD    " << e.from << " <-> " << e.to
                 << " (w=" << fixed << setprecision(1) << e.weight << ")\n";
        } else {
            cout << "  x REJECT " << e.from << " <-> " << e.to
                 << " (w=" << fixed << setprecision(1) << e.weight << ") — cycle\n";
        }
        if ((int)mst.size() == (int)nodes.size() - 1) break;
    }

    cout << "\nMST Complete: " << mst.size() << " edges, total weight: "
         << fixed << setprecision(1) << totalWeight
         << ", " << considered << " edges considered\n";
    return 0;
}
