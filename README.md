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

## 🛠️ Docker Setup (Quick Start)

You can run the frontend and backend of the application together in a single container on port `3000`.

### 1. Start the Container:
Run the following command in the project root:
```bash
docker compose up -d
```

### 2. Access the Application:
Open your browser and navigate to:
* **Web App & API:** `http://localhost:3000`

> **Note:** The `coaching_state.json` file is mounted to the host to persist your assessment scores and action plans when the container is stopped or rebuilt.

---

## 🤖 Model Context Protocol (MCP) Configuration

To enable AI agents (such as Antigravity or Gemini clients) to read and modify your coaching data, configure the MCP server in your local client.

### Configuration via Docker:
Add the following server configuration to your `~/.gemini/config/mcp_config.json` file:
```json
{
  "mcpServers": {
    "interactive-coaching-mcp": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-p",
        "3000:3000",
        "-v",
        "/absolute/path/to/interactive-coaching-app/coaching_state.json:/app/coaching_state.json",
        "interactive-coaching-app-coaching-app"
      ],
      "env": {}
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

### 2. Start the Servers:
```bash
# Starts REST API & MCP stdio server on port 3000
node mcp_server.js

# Starts Vite frontend dev server on port 5173/5174
npm run dev
```

### 3. Production Build:
```bash
npm run build
```

---

## 📂 Project Structure

* `Dockerfile` - Container build steps
* `docker-compose.yml` - Port and volume mapping configurations
* `mcp_server.js` - HTTP REST API, Static file server, and Stdio MCP server
* `coaching_state.json` - JSON database holding coaching states and plans
* `src/stores/coaching.ts` - Pinia store with API sync and polling logic
* `src/views/` - Dashboard, Kamchi (Wizard), Values, and Assessment views
