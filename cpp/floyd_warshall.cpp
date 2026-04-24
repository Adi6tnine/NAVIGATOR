/*
 * Floyd-Warshall All-Pairs Shortest Paths — Campus Navigation
 * Time: O(V³) | Space: O(V²)
 * Compile: g++ -std=c++17 -O2 floyd_warshall.cpp -o floyd_warshall
 */
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <iomanip>
using namespace std;
const double INF = 1e18;
struct Edge { string from, to; double weight; };

int main() {
    cout << "=== Floyd-Warshall All-Pairs Shortest Paths ===\n";
    vector<string> nodes = {"cs","lib","eng","med","dormA","dormB","gym","cafe","admin","park"};
    vector<Edge> edges = {
        {"cs","lib",5.1},{"cs","eng",5.0},{"cs","cafe",3.6},{"cs","park",2.4},
        {"lib","admin",2.4},{"lib","eng",7.2},{"eng","med",7.2},{"med","gym",5.1},
        {"med","dormB",5.9},{"dormA","cafe",4.2},{"dormA","admin",5.9},
        {"dormB","gym",4.0},{"dormB","park",4.4},{"cafe","park",3.3},{"park","gym",5.1}
    };
    int V = nodes.size();
    unordered_map<string,int> idx;
    for (int i=0;i<V;i++) idx[nodes[i]]=i;
    vector<vector<double>> dist(V, vector<double>(V, INF));
    vector<vector<int>> nxt(V, vector<int>(V, -1));
    for (int i=0;i<V;i++){dist[i][i]=0; nxt[i][i]=i;}
    for (auto& e:edges){
        int i=idx[e.from],j=idx[e.to];
        dist[i][j]=e.weight; dist[j][i]=e.weight;
        nxt[i][j]=j; nxt[j][i]=i;
    }
    // Core DP
    for (int k=0;k<V;k++){
        int upd=0;
        for (int i=0;i<V;i++) for (int j=0;j<V;j++)
            if (dist[i][k]+dist[k][j]<dist[i][j]){
                dist[i][j]=dist[i][k]+dist[k][j]; nxt[i][j]=nxt[i][k]; upd++;
            }
        cout << "k=\"" << nodes[k] << "\": " << upd << " improved\n";
    }
    // Print matrix
    cout << "\nDistance Matrix:\n" << setw(8) << " ";
    for (auto& n:nodes) cout << setw(7) << n;
    cout << "\n";
    for (int i=0;i<V;i++){
        cout << setw(8) << nodes[i];
        for (int j=0;j<V;j++)
            cout << setw(7) << fixed << setprecision(1) << (dist[i][j]>=INF?-1:dist[i][j]);
        cout << "\n";
    }
    // Example path
    int si=idx["dormA"],ti=idx["med"];
    cout << "\ndormA->med: ";
    int cur=si; while(cur!=ti){cout<<nodes[cur]<<" -> ";cur=nxt[cur][ti];}
    cout << nodes[ti] << " (cost: " << dist[si][ti] << ")\n";
    return 0;
}
