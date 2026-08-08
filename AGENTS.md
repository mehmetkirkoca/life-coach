# 🤖 Life Coach — AI Agent & Model Context Protocol (MCP) Guide

Bu dosya (`AGENTS.md`), bu repoda çalışan yapay zeka ajanları (Cursor, Claude, Gemini, Cline, Roo Code, Copilot vb.) için sistem kılavuzu ve araç tanımlarıdır.

---

## 🏗️ 1. Proje Mimarisi

- **Frontend:** Vue 3 (Composition API), Vite, Pinia Store, Chart.js, Glassmorphic UI.
- **Backend / MCP Server:** Node.js (`mcp_server.js` - Port: `3001`).
- **Veritabanı:** MongoDB 7.0 (`mongodb://localhost:27017/life-coach`) + Yerel JSON Fallback (`coaching_state.json`).
- **Web Portu:** `http://localhost:3030` (veya `.env` dosyasındaki `HOST_PORT`).

---

## 🛠️ 2. Kullanılabilir MCP Araçları (Tools)

Yapay zeka asistanı aşağıdaki MCP araçlarını doğrudan JSON-RPC veya stdio üzerinden çağırabilir:

1. **`get_coaching_state`**: Danışanın mevcut Yaşam Denge Çarkı puanlarını (8 alan), 5 temel değerini, aktif KAMÇI/T-GROW planlarını ve DISC kişilik renk testi sonuçlarını döner.
2. **`update_ratings`**: 8 yaşam alanı puanını (1-10) günceller.
3. **`update_values`**: Danışanın 5 temel değerini günceller.
4. **`add_plan`**: Yeni KAMÇI eylem planı ve taahhüdü kaydeder (`area`, `subject`, `goal`, `commitment`, `cure`).
5. **`delete_plan`**: Belirtilen ID'ye sahip KAMÇI eylem planını siler.
6. **`get_session_notes`**: Danışan için koç tarafından tutulmuş seans notlarını getirir.
7. **`add_session_note`**: Danışan için aksiyon maddeleri ve etiketler içeren yeni seans notu ekler.
8. **`get_coach_feedbacks`**: Danışanın koçuna verdiği puanları (⭐) ve kategori değerlendirmelerini listeler.
9. **`add_coach_feedback`**: Koç için puan veya geri bildirim notu kaydeder.
10. **`update_color_answers`**: 16 soruluk DISC kişilik testi yanıtlarını kaydeder.
11. **`get_clients`**: Koça atanmış aktif danışan listesini getirir.

---

## 🚀 3. Hızlı Kurulum & Çalıştırma

### A) Docker ile Tek Adımda Kurulum (Önerilen)
```bash
docker compose up -d
```
Docker ayağa kalktığında MongoDB, REST API ve Web arayüzü (`http://localhost:3030`) otomatik başlar.

### B) MCP Yapılandırmasını Bağlama
```bash
npm run setup
```
Bu komut sistemdeki Claude Desktop ve Gemini MCP yapılandırmasını otomatik günceller.

### C) Frontend (UI) Geliştirme ve Güncelleme Döngüsü
- `src/` klasöründeki Vue bileşenleri veya stil dosyaları güncellendiğinde:
```bash
npm run update   # veya npm run build
```
- `docker-compose.yml` üzerinde `./dist:/app/dist` volume eşlemesi tanımlı olduğundan, `npm run update` çalıştırıldığı anda Docker konteynerini yeniden başlatmaya gerek kalmadan web arayüzü (`http://localhost:3030`) anında güncellenir.
- Canlı Vite geliştirme sunucusu için:
```bash
npm run dev
```

---

## 👥 5. Hızlı Profil Seçimi & Hazır Seed Verileri

Uygulama açılış ekranında (`/login`) MongoDB veya yerel fallback (`seedData.js`) üzerinden aşağıdaki hazır profiller ve ilişkisel veriler otomatik olarak yüklenir:

- 💼 **Ahmet Yılmaz** (`ahmet@lifecoach.com` - Rol: `coach`, `client`):
  - Atanmış Danışanlar: *Mustafa Demir*, *Ayşe Yılmaz*.
  - Seans Notları: Kariyer/SaaS ve DISC analizi notları yüklüdür.
  - Koç Değerlendirmeleri: Mustafa Demir'den 5⭐ puan ve geri bildirim mevcuttur.
- 💼 **Zeynep Kaya** (`zeynep@lifecoach.com` - Rol: `coach`, `client`):
  - Atanmış Danışanlar: *Can Tekin*.
- 👤 **Mustafa Demir** (`mustafa@example.com` - Rol: `client`):
  - Koçu: Ahmet Yılmaz.
- 👤 **Ayşe Yılmaz** (`ayse@example.com` - Rol: `client`):
  - Koçu: Ahmet Yılmaz.
- 👤 **Can Tekin** (`can@example.com` - Rol: `client`):
  - Koçu: Zeynep Kaya.

> 💡 **Hızlı Giriş:** Giriş sayfasında yer alan profil kartlarına tek tıkla tıklayarak koç veya danışan rolüyle doğrudan sisteme giriş yapabilirsiniz. Seed verileri sunucu ilk ayağa kalktığında MongoDB'ye otomatik yazılır.
