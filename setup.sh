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
    echo "✅ Docker uygulaması http://localhost:${HOST_PORT:-3030} adresinde aktif!"
else
    echo "⚠️  Docker veya Docker Daemon çalışır durumda bulunamadı."
    echo "💡 Projede MongoDB veritabanı ve tüm servislerin sıfır-konfigürasyon ile sorunsuz çalışması için Docker önerilmektedir."
    echo "👉 Lütfen Docker Desktop / Docker Engine'i kurup başlattıktan sonra tekrar çalıştırın:"
    echo "   https://docs.docker.com/get-docker/"
    echo ""
    echo "   Docker hazır olduğunda uygulamayı başlatmak için: docker compose up -d"
fi

echo "✨ Kurulum tamamlandı! Yapay zeka asistanınız MCP araçlarını kullanmaya hazır."
