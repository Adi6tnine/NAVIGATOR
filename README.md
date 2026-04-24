# 🎯 CampusMatrix - Algorithmic Routing Simulator

An interactive 3D visualization platform for exploring graph algorithms in real-time. Built with React, Three.js, and TypeScript.

![CampusMatrix](https://img.shields.io/badge/Status-Production%20Ready-success)
![Netlify](https://img.shields.io/badge/Netlify-Ready-00C7B7?logo=netlify)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-0.184-000000?logo=three.js)

## ✨ Features

- 🎨 **Interactive 3D Visualization** - Explore graph algorithms in stunning 3D
- 🌓 **Light/Dark Theme** - Smooth theme transitions with optimized colors
- 🚀 **6 Graph Algorithms** - Dijkstra, Bellman-Ford, BFS, DFS, Floyd-Warshall, Kruskal MST
- 📊 **Real-time Animation** - Step-by-step algorithm execution with visual feedback
- 🎯 **Campus Network** - 10 nodes representing campus locations with weighted edges
- 📱 **Responsive Design** - Works on desktop and tablet devices
- ⚡ **Optimized Performance** - Code splitting, lazy loading, and efficient rendering

## 🎮 Algorithms Included

| Algorithm | Time Complexity | Space Complexity | Use Case |
|-----------|----------------|------------------|----------|
| Dijkstra's | O((V+E)logV) | O(V) | Shortest path (non-negative weights) |
| Bellman-Ford | O(V·E) | O(V) | Shortest path (handles negative weights) |
| BFS | O(V+E) | O(V) | Level-order traversal |
| DFS | O(V+E) | O(V) | Depth-first exploration |
| Floyd-Warshall | O(V³) | O(V²) | All-pairs shortest paths |
| Kruskal MST | O(E log E) | O(V) | Minimum spanning tree |

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd adi-daa

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app in action!

## 📦 Build & Deploy

### Local Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to Netlify

This project is **Netlify-ready** with optimized configuration!

#### Option 1: One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

#### Option 2: Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Netlify](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Netlify auto-detects settings from `netlify.toml`
6. Click "Deploy site"

#### Option 3: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

📖 **Full deployment guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛠️ Tech Stack

- **Frontend Framework:** React 19.2
- **Language:** TypeScript 6.0
- **3D Graphics:** Three.js 0.184
- **Animation:** Framer Motion 12.38
- **State Management:** Zustand 5.0
- **Styling:** Tailwind CSS 4.2
- **Build Tool:** Vite 8.0
- **Icons:** Lucide React

## 📁 Project Structure

```
adi-daa/
├── src/
│   ├── algorithms/          # Algorithm implementations
│   │   ├── dijkstra.ts
│   │   ├── bellmanFord.ts
│   │   ├── bfs.ts
│   │   ├── dfs.ts
│   │   ├── floydWarshall.ts
│   │   ├── kruskal.ts
│   │   └── types.ts
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── netlify.toml             # Netlify configuration
├── vite.config.ts           # Vite configuration
├── DEPLOYMENT.md            # Deployment guide
└── REPORT.md                # Technical documentation

```

## 🎨 Theme System

The app features a complete light/dark theme system:

- **Dark Theme:** Cyberpunk-inspired with cyan accents
- **Light Theme:** Clean and modern with blue accents
- **Smooth Transitions:** 500ms duration for all theme changes
- **Optimized Colors:** Proper contrast ratios in both themes

## 🔧 Configuration Files

- **`netlify.toml`** - Netlify build settings, redirects, headers
- **`vite.config.ts`** - Build optimization, code splitting
- **`.nvmrc`** - Node.js version specification
- **`public/_redirects`** - SPA routing fallback
- **`public/manifest.json`** - PWA configuration

## 📊 Performance Optimizations

- ✅ Code splitting by vendor (React, Three.js, animations)
- ✅ Asset optimization and minification
- ✅ Long-term caching for static assets (1 year)
- ✅ Gzip/Brotli compression
- ✅ CDN distribution via Netlify
- ✅ Console logs removed in production
- ✅ Security headers configured

## 🔐 Security Features

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## 🎯 Usage

1. **Select Algorithm** - Choose from 6 graph algorithms
2. **Pick Nodes** - Select origin and destination (if required)
3. **Run Simulation** - Watch the algorithm execute step-by-step
4. **View Results** - See visited nodes, explored edges, and final path
5. **Toggle Theme** - Switch between light and dark modes

## 📖 Documentation

- **[REPORT.md](./REPORT.md)** - Complete technical documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide and troubleshooting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Three.js for 3D rendering capabilities
- React team for the amazing framework
- Netlify for seamless deployment
- Tailwind CSS for utility-first styling

## 📞 Support

For issues and questions:
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review [REPORT.md](./REPORT.md) for technical details
- Open an issue on GitHub

---

**Built with ❤️ using React, Three.js, and TypeScript**

**Ready for production deployment on Netlify! 🚀**
 
