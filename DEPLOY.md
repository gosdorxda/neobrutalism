# VPS Deployment Guide

Panduan lengkap deploy project ini ke VPS pribadi (Ubuntu).

> **Note:** Project ini menyimpan data di file JSON (`data/`) dan menggunakan **Upstash Redis** untuk caching data realtime.

---

## 1. Server Requirements

- **OS:** Ubuntu 22.04 LTS atau 24.04 LTS (recommended)
- **Node.js:** 20.x LTS atau lebih baru (Next.js 16 + React 19)
- **RAM:** Minimal 1 GB (2 GB recommended untuk `npm run build`)
- **Storage:** Tergantung jumlah foto/media yang di-upload
- **Network:** IPv4 outbound diperlukan untuk API eksternal (CoinGecko, Solana RPC, PumpFun, pumpdev.io, GMGN)
- **Upstash Redis:** Akun gratis di [upstash.com](https://upstash.com) untuk caching data

---

## 2. Install System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essentials
sudo apt install -y curl git nginx

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Verify
node -v    # harus v20.x.x atau lebih baru
npm -v     # harus 10.x.x atau lebih baru
pm2 -v     # harus 5.x.x atau lebih baru
```

---

## 3. Clone & Build

```bash
# Clone project
cd ~
git clone <your-repo-url> neobrutalism
cd neobrutalism

# Install dependencies
npm install

# Build production
npm run build
```

Kalau build gagal karena memory, tambah swap dulu:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Atau build di lokal, lalu copy folder `.next/` ke VPS dan jalankan `npm start` saja.

---

## 4. Environment Variables

Buat file `.env.local` di root project:

```env
# --- WAJIB ---
ADMIN_PASSWORD=your-strong-admin-password-here

# --- SOCIAL MEDIA (opsional, tapi direkomendasikan) ---
# Isi dari admin panel Settings > Social Links

# --- GMGN (untuk fitur Top Donors) ---
# Dapatkan API key dari https://gmgn.ai/ai
GMGN_API_KEY=your-gmgn-api-key

# --- CRON (untuk update top donors otomatis) ---
CRON_SECRET=your-random-cron-secret-string

# --- SOLANA RPC (opsional, untuk wallet balance & stats realtime) ---
# Default: https://api.mainnet-beta.solana.com
# Untuk production, pakai RPC provider seperti Helius, QuickNode, atau Triton
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# --- UPSTASH REDIS (WAJIB untuk caching) ---
# 1. Daftar di https://console.upstash.com/redis
# 2. Buat database Redis baru (region terdekat)
# 3. Copy REST URL dan REST Token
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# --- TOKEN CA (opsional, bisa diisi dari admin panel) ---
# NEXT_PUBLIC_TOKEN_CA=CATFUNDeio111111111111111111111111111111111
```

> **Jangan commit `.env.local` ke Git!** Sudah di-ignore via `.gitignore`.

---

## 5. Upstash Redis Setup (WAJIB)

Project ini menggunakan Redis untuk caching data realtime global. Tanpa Redis, data tetap jalan tapi bisa lambat dan kena rate limit API.

### Cara setup:

1. Daftar di [https://console.upstash.com/redis](https://console.upstash.com/redis)
2. Klik **Create Database**
3. Pilih region terdekat dengan VPS-mu
4. Pilih tipe **Global** atau **Regional**
5. Klik **Create**
6. Setelah jadi, buka tab **REST API**
7. Copy **UPSTASH_REDIS_REST_URL** dan **UPSTASH_REDIS_REST_TOKEN**
8. Paste ke `.env.local`

### Data yang di-cache di Redis:

| Key | Isi | TTL |
|-----|-----|-----|
| `sol:price` | Harga SOL dalam USD | 60 detik |
| `stats:summary` | Statistik kumulatif (total fees, cats, bowls) | 60 detik |
| `token:info` | Data token dari PumpFun | 30 detik |
| `wallets:summary` | Balance Foundation & Creator wallet | 60 detik |

---

## 6. Data Persistence

Project menyimpan data di folder `data/`:

| File | Fungsi |
|------|--------|
| `data/batches.json` | Data batch, receipt, foto |
| `data/settings.json` | Konfigurasi proyek, tema, partner, notification |
| `data/top-donors.json` | Data top donors |
| `data/stats-cache.json` | Cache stats (fallback kalau Redis mati) |

Pastikan folder ada dan writable:

```bash
mkdir -p data
chmod 755 data
sudo chown -R $USER:$USER data
```

### Backup data JSON

```bash
# Backup semua data
cp -r data/ data-backup-$(date +%Y%m%d)/

# Atau pakai cron untuk backup otomatis
# crontab -e
# 0 3 * * * cp -r /home/<user>/neobrutalism/data/ /home/<user>/backups/data-$(date +\%Y\%m\%d)/
```

---

## 7. Run with PM2

### Pakai ecosystem file (recommended)

Buat `ecosystem.config.js` di root project:

```js
module.exports = {
  apps: [
    {
      name: "neobrutalism",
      script: "npm",
      args: "start",
      cwd: "/home/<user>/neobrutalism",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      log_file: "./logs/combined.log",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      time: true,
    },
  ],
};
```

Ganti `<user>` dengan username VPS-mu.

Kemudian:

```bash
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Quick start (tanpa ecosystem file)

```bash
pm2 start npm --name "neobrutalism" -- start
pm2 save
pm2 startup
```

---

## 8. Nginx Reverse Proxy

Buat file `/etc/nginx/sites-available/neobrutalism`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Upload limit untuk foto (maks 10MB)
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/neobrutalism /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 9. SSL with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Ikuti prompt. Certbot akan otomatis konfigurasi HTTPS dan redirect HTTP ke HTTPS.

---

## 10. Cron Jobs

Cron jobs untuk update data otomatis.

### Top Donors (setiap 6 jam)

```bash
crontab -e
```

Tambah baris:

```cron
0 */6 * * * curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/admin/update-top-donors >> /home/<user>/neobrutalism/logs/cron.log 2>&1
```

### Refresh Redis Cache (setiap 2 menit, opsional)

Untuk memastikan data Redis selalu fresh, bisa tambah cron:

```cron
*/2 * * * * curl -fsS https://your-domain.com/api/sol-price > /dev/null 2>&1
*/2 * * * * curl -fsS https://your-domain.com/api/stats > /dev/null 2>&1
*/2 * * * * curl -fsS https://your-domain.com/api/token > /dev/null 2>&1
*/2 * * * * curl -fsS https://your-domain.com/api/wallets > /dev/null 2>&1
```

Ini akan memicu refresh Redis cache setiap 2 menit, jadi data selalu fresh untuk semua user.

---

## 11. Post-Deploy Checklist

1. ✅ Buka `https://your-domain.com` — homepage harus load
2. ✅ Buka `https://your-domain.com/admin` — login dengan password dari `ADMIN_PASSWORD`
3. ✅ Buka tab **Settings** → **Notification Banner** — isi teks, simpan, cek muncul di homepage
4. ✅ Buka tab **Settings** → **Theme** — ganti tema, simpan, refresh homepage
5. ✅ Buka `https://your-domain.com/dashboard` — data wallet dan transaksi harus muncul
6. ✅ Cek SOL price di navbar — harus muncul setelah beberapa detik
7. ✅ Cek Token Info — data harus muncul
8. ✅ Cek Redis: login ke console Upstash, cek ada data di key `sol:price`, `stats:summary`, dll
9. ✅ Test Top Donors:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/admin/update-top-donors
```

10. ✅ Cek log cron setelah scheduled run pertama:

```bash
tail -f /home/<user>/neobrutalism/logs/cron.log
```

---

## 12. Useful Commands

```bash
# Restart app
pm2 restart neobrutalism

# View logs
pm2 logs neobrutalism

# View realtime logs
pm2 logs neobrutalism --lines 100

# Reload Nginx
sudo systemctl reload nginx

# Check disk space
df -h

# Check app is running on port 3000
ss -tlnp | grep 3000

# Check Redis connection (dari VPS)
curl -s https://YOUR_UPSTASH_URL/ping -H "Authorization: Bearer YOUR_UPSTASH_TOKEN"

# Deploy ulang setelah update kode
cd ~/neobrutalism
git pull
npm install
npm run build
pm2 restart neobrutalism
```

---

## 13. Files That Need Attention on VPS

| File / Directory | Notes |
|---|---|
| `.env.local` | Harus dibuat manual dengan production secrets |
| `data/` | Harus writable oleh Node process |
| `logs/` | Optional; dipakai PM2 ecosystem |
| `public/` | Static files (foto, logo, dll) |
| `vercel.json` | Aman di-keep, tapi di-ignore di VPS |

---

## 14. Dependencies Overview

| Package | Fungsi |
|---------|--------|
| `next` | Framework (v16.3) |
| `react` / `react-dom` | UI library (v19) |
| `framer-motion` | Animasi (flywheel, notif banner) |
| `@upstash/redis` | Caching Redis |
| `react-loading-skeleton` | Loading skeleton |
| `@web3icons/react` | Icon crypto (Solana, Phantom) |
| `lucide-react` | Icon UI |
| `@radix-ui/*` | Aksesibel UI primitives |
| `sharp` | Image optimization |
| `gmgn-cli` | GMGN top donors |
| `tw-animate-css` | Tailwind CSS animations |

---

## 15. Troubleshooting

### Halaman lambat / data nggak muncul

- Cek Redis: `curl -s https://YOUR_UPSTASH_URL/get/sol:price -H "Authorization: Bearer YOUR_UPSTASH_TOKEN"`
- Cek env vars: `cat .env.local` (pastikan UPSTASH_REDIS_* sudah benar)
- Cek PM2 logs: `pm2 logs neobrutalism`

### SOL Price di navbar tidak muncul

- Pastikan VPS bisa akses `api.coingecko.com` dan `api.binance.com`
- Cek: `curl -s https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`

### Token Info kosong / error

- Pastikan Token CA di admin panel Settings benar
- Cek: `curl -s https://advanced-api-v2.pump.fun/coins/metadata/TOKEN_CA`

### GMGN errors / 401 Unauthorized

- Check `GMGN_API_KEY` di `.env.local`
- Pastikan VPS pakai IPv4 outbound: `curl -s https://ipv4.icanhazip.com`
- Jika IPv6 muncul, force IPv4: `sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1`

### Build gagal karena memory

```bash
# Tambah swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Atau build di lokal, copy .next/ ke VPS
```

### Upload foto gagal

- Check folder uploads writable
- Check Nginx `client_max_body_size` (minimum 10M)
- Check disk space: `df -h`

### Admin login gagal

- Cek `ADMIN_PASSWORD` di `.env.local`
- Password case-sensitive
- Restart app setelah ubah `.env.local`: `pm2 restart neobrutalism`