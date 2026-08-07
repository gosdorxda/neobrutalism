# VPS Deployment Guide

This document explains how to deploy the Neobrutalism project to a self-managed VPS (Virtual Private Server).

> **Note:** The project currently uses JSON files in the `data/` folder for persistence. This guide assumes you will continue using that approach on the VPS.

---

## 1. Server Requirements

- **OS:** Ubuntu 22.04 LTS or 24.04 LTS (recommended)
- **Node.js:** 18.x or newer
- **RAM:** Minimum 1 GB (2 GB recommended for `npm run build`)
- **Storage:** Depends on uploaded photos/media
- **Network:** IPv4 outbound is required for the `gmgn-cli` integration. IPv6-only outbound may cause `401`/`403` errors from GMGN.

---

## 2. Install System Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Verify
node -v
npm -v
pm2 -v
```

---

## 3. Clone & Build

```bash
cd ~
git clone <your-repo-url> neobrutalism
cd neobrutalism

npm install
npm run build
```

---

## 4. Environment Variables

Create `.env.local` in the project root with real production values:

```env
ADMIN_PASSWORD=your-strong-admin-password
GMGN_API_KEY=your-gmgn-production-api-key
CRON_SECRET=your-random-cron-secret
```

### Important notes

- Do **not** commit `.env.local` to Git. It is already ignored via `.gitignore`.
- Do **not** use the public demo key `gmgn_solbscbaseethmonadtron` in production. Get your own key at https://gmgn.ai/ai.
- `CRON_SECRET` is used to authorize cron requests to `/api/admin/update-top-donors`.

---

## 5. Data Persistence

The project stores data in the `data/` directory:

- `data/batches.json`
- `data/settings.json`
- `data/top-donors.json`

Make sure the directory exists and is writable by the user running the Node process:

```bash
mkdir -p data
chmod 755 data
```

If running as a non-root user (recommended), ensure that user owns the `data/` folder:

```bash
sudo chown -R $USER:$USER data
```

---

## 6. Run with PM2

### Quick start

```bash
pm2 start npm --name "neobrutalism" -- start
pm2 save
pm2 startup
```

### Using an ecosystem file (recommended)

Create `ecosystem.config.js` in the project root:

```js
module.exports = {
  apps: [
    {
      name: "neobrutalism",
      script: "npm",
      args: "start",
      cwd: "/home/<your-user>/neobrutalism",
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

Then run:

```bash
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 7. Nginx Reverse Proxy

Create `/etc/nginx/sites-available/neobrutalism`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

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
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/neobrutalism /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 8. SSL with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Follow the prompts. Certbot will automatically configure HTTPS and redirect HTTP to HTTPS.

---

## 9. Cron Jobs

The `vercel.json` cron configuration is **not used on a VPS**. You must set up cron jobs manually.

### Option A: System cron (recommended)

```bash
crontab -e
```

Add this line to refresh top donors every 6 hours:

```cron
0 */6 * * * curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/admin/update-top-donors >> /home/<your-user>/neobrutalism/logs/cron.log 2>&1
```

### Option B: Node scheduler

Alternatively, install `node-cron` and schedule the update inside the app. This is more complex and not covered here.

---

## 10. GMGN CLI Notes

- `gmgn-cli` is installed as a project dependency in `node_modules/`. The update route executes it directly.
- If you get `401`/`403` errors from GMGN on the VPS, check for IPv6 outbound traffic:

  ```bash
  curl -s https://ipv6.icanhazip.com
  ```

  If an IPv6 address is returned, disable IPv6 or force IPv4 for outbound traffic.

---

## 11. Post-Deploy Checklist

1. Open `https://your-domain.com` — the homepage should load.
2. Open `https://your-domain.com/admin` and log in.
3. Go to the **Top Donors** tab and click **Refresh Top Donors**.
4. Verify the response is successful:

   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/admin/update-top-donors
   ```

5. Verify cron logs after the first scheduled run:

   ```bash
   tail -f /home/<your-user>/neobrutalism/logs/cron.log
   ```

---

## 12. Useful Commands

```bash
# Restart the app
pm2 restart neobrutalism

# View logs
pm2 logs neobrutalism

# Reload Nginx
sudo systemctl reload nginx

# Check disk space
df -h

# Check app is listening on port 3000
ss -tlnp | grep 3000
```

---

## 13. Files That May Need Attention on VPS

| File / Directory | Notes |
|---|---|
| `.env.local` | Must be created manually with production secrets. |
| `data/` | Must be writable by the Node process. |
| `logs/` | Optional; used by the PM2 ecosystem example above. |
| `vercel.json` | Safe to keep, but ignored on VPS. |

---

## 14. Troubleshooting

### `Updated 0 top donors` or GMGN errors

- Check `GMGN_API_KEY` is set correctly in `.env.local`.
- Ensure the VPS uses IPv4 outbound for GMGN requests.
- Check PM2 logs for detailed error messages.

### Admin login fails

- Verify `ADMIN_PASSWORD` in `.env.local` matches what you are entering.
- Remember that the password is case-sensitive.

### Uploaded images not showing

- Check the upload destination folder exists and is writable.
- Check Nginx allows serving static files from that folder.

### Next.js build fails due to memory

- Increase swap or use a VPS with more RAM.
- Alternatively, build locally and copy the `.next/` folder to the VPS.
