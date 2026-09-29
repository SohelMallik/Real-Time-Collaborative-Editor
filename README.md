# 🖊️ CollabCode — Real-Time Collaborative Code Editor

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=flat-square&logo=socket.io&logoColor=white)
![Yjs](https://img.shields.io/badge/Yjs-CRDT-orange?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-ELB%20Deployed-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**A production-ready, real-time collaborative code editor — edit code together, simultaneously, from anywhere.**

[🌐 Live Demo](http://docker-aws-lb-1453782852.eu-north-1.elb.amazonaws.com/) · [🐛 Report Bug](../../issues/new?template=bug_report.md) · [✨ Request Feature](../../issues/new?template=feature_request.md)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Docker (Single Container)](#docker-single-container)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Deployment (AWS)](#-deployment-aws)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 Overview

**CollabCode** is a real-time collaborative code editor that lets multiple users write and edit code together — simultaneously — in the same editor session. Powered by **Yjs CRDTs** (Conflict-free Replicated Data Types) and **Socket.IO**, every keystroke is instantly propagated to all connected peers with zero merge conflicts.

Think of it as Google Docs, but for code — with the full power of **Monaco Editor** (the same editor that powers VS Code).

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔄 **Real-Time Sync** | Changes are synchronized instantly across all connected clients using Yjs CRDTs |
| 👥 **Live User Presence** | See who is currently in the session via the live users sidebar |
| 💻 **Monaco Editor** | Full-featured VS Code–grade editor with syntax highlighting, IntelliSense, and themes |
| 🚀 **Single-Container Deploy** | Frontend is built and served by the same Express backend — no separate servers needed |
| ☁️ **AWS Ready** | Deployed on AWS with an Elastic Load Balancer for scalability |
| 🐳 **Dockerized** | Multi-stage Docker build for a lean, production-ready image |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev/) | 19 | UI framework |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | 0.52 | Code editor component |
| [Yjs](https://yjs.dev/) | 13.6 | CRDT-based real-time data sync |
| [y-monaco](https://github.com/yjs/y-monaco) | 0.1 | Yjs binding for Monaco Editor |
| [y-socket.io](https://github.com/ivan-topp/y-socket.io) | 1.1 | Yjs Socket.IO transport provider |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first styling |
| [Vite](https://vite.dev/) | 7.x | Build tool & dev server |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| [Express](https://expressjs.com/) | 5.x | HTTP server & static file serving |
| [Socket.IO](https://socket.io/) | 4.x | WebSocket-based real-time transport |
| [y-socket.io](https://github.com/ivan-topp/y-socket.io) | 1.1 | Yjs server-side awareness handler |
| [Yjs](https://yjs.dev/) | 13.6 | CRDT document state management |
| [Node.js](https://nodejs.org/) | 20 | Runtime |

### Infrastructure
| Technology | Purpose |
|---|---|
| 🐳 Docker (multi-stage) | Containerization & build pipeline |
| ☁️ AWS Elastic Load Balancer | Traffic distribution & public endpoint |
| 🐧 Node.js Alpine | Minimal production base image |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                  │
│                                                     │
│  ┌─────────────┐        ┌──────────────────────┐   │
│  │  React UI   │        │   Monaco Editor      │   │
│  │  (Sidebar)  │        │   (y-monaco binding) │   │
│  └──────┬──────┘        └──────────┬───────────┘   │
│         │                          │                │
│         └──────── Yjs Doc ─────────┘                │
│                       │                             │
│              y-socket.io Provider                   │
└───────────────────────┼─────────────────────────────┘
                        │ WebSocket (Socket.IO)
┌───────────────────────┼─────────────────────────────┐
│              Express + Socket.IO Server              │
│                       │                             │
│              YSocketIO.initialize()                 │
│         (broadcasts Yjs updates to all peers)       │
│                                                     │
│         Serves built Frontend from /public          │
└─────────────────────────────────────────────────────┘
                        │
              ┌─────────▼──────────┐
              │  AWS Load Balancer  │
              └────────────────────┘
```

**Sync flow:** Each client holds a local Yjs document. On every edit, Yjs computes a compact binary update that is sent via Socket.IO to the server. The server (via `YSocketIO`) forwards that update to all other connected clients, where it is merged locally — guaranteeing eventual consistency without conflicts.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20
- [Docker](https://www.docker.com/) (for containerized run)

---

### Local Development

Run the **Frontend** and **Backend** separately for the best development experience.

#### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

#### 2. Start the Backend

```bash
cd Backend
npm install
npm run dev        # uses nodemon for hot-reload
```

The server will start on **http://localhost:3000**.

#### 3. Start the Frontend

```bash
cd Frontend
npm install
npm run dev        # Vite dev server
```

The frontend will start on **http://localhost:5173** (Vite default).

#### 4. Open the editor

Navigate to `http://localhost:5173` in two browser tabs. Enter different usernames and start editing together in real time.

---

### Docker (Single Container)

The multi-stage [`dockerfile`](dockerfile) builds the React app and copies the compiled `dist/` into the Express backend's `public/` folder, so everything ships as **one container**.

#### Build the image

```bash
docker build -t collabcode .
```

#### Run the container

```bash
docker run -p 3000:3000 collabcode
```

Open **http://localhost:3000** — the frontend and backend are both served from port `3000`.

---

## 📁 Project Structure

```
.
├── Backend/
│   ├── server.js          # Express + Socket.IO + YSocketIO server
│   ├── Public/            # Static files served in production (populated by Docker build)
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── App/
│   │   │   ├── App.jsx    # Main editor component (Yjs + Monaco + Awareness)
│   │   │   └── App.css
│   │   └── main.jsx       # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── dockerfile             # Multi-stage build: builds frontend, then serves via backend
├── .dockerignore
├── .github/
│   └── ISSUE_TEMPLATE/    # Bug report & feature request templates
├── LICENSE                # MIT
└── README.md
```

---

## ⚙️ How It Works

1. **Username & Session Join** — On first load, the user is prompted for a username. It is stored in the URL query string (`?username=alice`) so refreshes persist the session.

2. **Yjs Document** — A shared `Y.Doc` is created in-memory on the client. The `"monaco"` text type within it is bound to the Monaco Editor model using `MonacoBinding` from `y-monaco`.

3. **Socket.IO Provider** — `SocketIOProvider` connects to the backend via WebSocket. It syncs the Yjs document state between all peers and propagates **awareness** (who is online).

4. **Awareness / Presence** — Each client publishes its `username` to `provider.awareness`. All clients listen to `awareness.on("change")` to maintain the live users sidebar.

5. **Server Relay** — The Express server uses `YSocketIO` to relay Yjs binary update messages between clients. It does not store any document state — purely a stateless relay.

6. **Docker Build** — The multi-stage `dockerfile` first compiles the Vite frontend into a static `dist/`, then copies it into the Express backend's `public/` directory. In production, a single `node server.js` serves both the API and the UI.

---

## ☁️ Deployment (AWS)

The application is deployed on **AWS** and publicly accessible via an Elastic Load Balancer:

🌐 **[http://docker-aws-lb-1453782852.eu-north-1.elb.amazonaws.com/](http://docker-aws-lb-1453782852.eu-north-1.elb.amazonaws.com/)**

### Deployment topology

```
Internet
    │
    ▼
AWS Elastic Load Balancer (eu-north-1)
    │
    ▼
EC2 / ECS Container  ─►  Docker Container (port 3000)
                              └── Node.js (Express + Socket.IO)
                                      └── Serves React frontend
```

### Health Check Endpoint

```
GET /health
→ 200 { "message": "ok", "success": true }
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to your branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

Please use the provided [issue templates](.github/ISSUE_TEMPLATE/) for bug reports and feature requests.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.



---

<div align="center">
  <sub>Built with ❤️ using React, Monaco Editor, Yjs, Socket.IO, Docker & AWS</sub>
</div>
