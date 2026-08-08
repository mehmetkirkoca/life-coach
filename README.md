# Interactive Life Coach & KAMÇI/T-GROW Planner

This project is an interactive and modern web application that enables individuals to analyze their life balance, discover their core values, and build actionable plans to achieve their goals based on the **KAMÇI (Subject, Goal, Reality, Options/Cure, Will/Commitment)** coaching model.

The project features a **Model Context Protocol (MCP)** server and REST synchronization API that communicates directly with AI agents.

---

## 🚀 Features

1. **Wheel of Life Assessment:**
   * Score your current and target levels across 8 core life areas (Health, Career, Family, Finance, etc.).
   * Visual representation of your life balance with a live-updating, interactive Chart.js radar chart.
2. **Core Values Card Sorting Test:**
   * Sort and discover your top 5 core values that guide your decisions.
3. **KAMÇI Model Planner Wizard:**
   * 6-step dynamic wizard implementing T-GROW coaching steps.
   * **Step Navigation:** Freely jump between steps by clicking indicator dots for completed plans or valid steps.
   * **Plan Editing (Edit Mode):** Update existing commitments easily through the wizard.
4. **Personal Dashboard:**
   * Widescreen detail modal showing goals (left column) and actionable cures (right column).
   * Clean, glassmorphic **Custom Delete Confirmation Modal** replacing browser default popups.
5. **Multi-language Support:**
   * Fully localized in Turkish (TR) and English (EN).
6. **Live API Polling:**
   * Frontend stays in sync with the database by checking for updates every 5 seconds.

---

## ⚙️ Environment Configuration (.env)

Application ports are configurable via the `.env` file in the project root:

```env
# Exposed port on your host machine (e.g. http://localhost:3030)
HOST_PORT=3030

# Internal application server port
PORT=3000
```

---

## ⚡ Zero-Config Docker Setup (Quick Start)

To get started instantly without worrying about technical details, file paths, or JSON configuration files, simply run:

```bash
docker compose up -d
```

> 💡 **Automated Setup:** When the container starts up, it serves the web application on the configured host port (`HOST_PORT` in `.env`, e.g., `http://localhost:3030`) and **automatically configures the MCP configuration file** (`~/.gemini/config/mcp_config.json`) on your host machine with the exact absolute project path. No manual configuration required!

### Access the Application:
Open your browser and navigate to:
* **Web App & API:** `http://localhost:<HOST_PORT>` (e.g., `http://localhost:3030`)

> **Note:** The `coaching_state.json` file is mounted to the host to persist your assessment scores and action plans when the container is stopped or rebuilt.

---

## 🤖 Model Context Protocol (MCP) Configuration

To enable AI agents (such as Antigravity or Gemini clients) to read and modify your coaching data, the container configures MCP automatically. If you prefer running the script manually on host, run:

```bash
npm run setup
```

This script detects your environment and updates `~/.gemini/config/mcp_config.json` automatically:

```json
{
  "mcpServers": {
    "interactive-coaching-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/life-coach/mcp_server.js"
      ]
    }
  }
}
```

---

## 💻 Local Developer Setup (Manual)

To run the application locally without Docker:

### 1. Install Dependencies:
```bash
npm install
```

### 2. Run Automatic MCP Setup:
```bash
npm run setup
```

### 3. Start the Servers:
```bash
# Starts REST API & MCP stdio server on the port defined in .env
node mcp_server.js

# Starts Vite frontend dev server
npm run dev
```

### 4. Build & Update UI:
```bash
# Rebuilds the frontend bundle (instantly reflected inside Docker via mounted ./dist)
npm run update
```

---

## 📂 Project Structure

* `.env` / `.env.example` - Environment configuration for ports (`HOST_PORT`, `PORT`)
* `Dockerfile` - Container build steps & entrypoint script setup
* `docker-compose.yml` - Port, persistent volume, and host MCP config mappings
* `entrypoint.sh` - Automatic Docker container startup & host MCP auto-config script
* `mcp_server.js` - HTTP REST API, Static file server, and Stdio MCP server
* `coaching_state.json` - JSON database holding coaching states and plans
* `scripts/install-mcp.js` - Cross-platform automatic MCP path installer
* `src/stores/coaching.ts` - Pinia store with API sync and polling logic
* `src/views/` - Dashboard, Kamchi (Wizard), Values, and Assessment views
