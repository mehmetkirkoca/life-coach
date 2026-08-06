#!/bin/sh
set -e

echo "🚀 Docker Konteyneri Başlatılıyor..."

# Eğer host gemini config dizini mount edilmişse MCP konfigürasyonunu otomatik güncelle
if [ -d "/host_gemini_config" ]; then
    echo "⚙️ Host MCP Konfigürasyonu otomatik yazılıyor..."
    node scripts/install-mcp.js --docker || true
fi

# Ana sunucuyu çalıştır (HTTP REST API + MCP Server)
exec node mcp_server.js
