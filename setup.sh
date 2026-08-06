#!/usr/bin/env bash

set -e

echo "🚀 Life Coach & MCP Otomatik Kurulum Başlatılıyor..."

# 1. Proje bağımlılıklarını kur (eğer node_modules yoksa veya eksikse)
if [ ! -d "node_modules" ]; then
    echo "📦 Bağımlılıklar yükleniyor (npm install)..."
    npm install
fi

# 2. MCP Otomatik Konfigürasyonunu Çalıştır
echo "⚙️  MCP Yapılandırması Yapılandırılıyor..."
node scripts/install-mcp.js

# 3. Docker Kullanılabilir Durumdaysa Docker Konteynerini Başlat
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "🐳 Docker konteyneri başlatılıyor (docker compose up -d)..."
    docker compose up -d
    echo "✅ Docker uygulaması http://localhost:3000 adresinde aktif!"
else
    echo "ℹ️  Docker ortamı algılanmadı veya çalışmıyor. Uygulamayı lokal başlatmak için: npm run dev"
fi

echo "✨ Kurulum tamamlandı! Yapay zeka asistanınız MCP araçlarını kullanmaya hazır."
