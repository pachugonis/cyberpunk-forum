# Cyberpunk Forum - VPS Deployment Guide

Complete manual for deploying the Cyberpunk Forum application to a VPS server with the domain **vorthex.net**.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Domain Configuration](#domain-configuration)
4. [Install Dependencies](#install-dependencies)
5. [Database Setup](#database-setup)
6. [Application Deployment](#application-deployment)
7. [SSL Configuration](#ssl-configuration)
8. [Process Manager Setup](#process-manager-setup)
9. [Nginx Configuration](#nginx-configuration)
10. [Security Hardening](#security-hardening)
11. [Monitoring & Maintenance](#monitoring--maintenance)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- VPS server with Ubuntu 22.04 LTS or higher (recommended: 2GB RAM, 2 CPU cores)
- Root or sudo access to the server
- Domain name **vorthex.net** pointing to your VPS IP address
- SSH client (PuTTY, Terminal, etc.)

---

## Server Setup

### 1. Connect to Your VPS

```bash
ssh root@your_vps_ip
```

### 2. Update System Packages

```bash
apt update && apt upgrade -y
```

### 3. Create a Non-Root User (Recommended)

```bash
adduser cyberforum
usermod -aG sudo cyberforum
```

Switch to the new user:

```bash
su - cyberforum
```

### 4. Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Check firewall status:

```bash
sudo ufw status
```

---

## Domain Configuration

### Configure DNS Records

In your domain registrar's control panel (where you registered vorthex.net), add the following DNS records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | your_vps_ip | 3600 |
| A | www | your_vps_ip | 3600 |

**Note:** DNS propagation can take 24-48 hours. Verify with:

```bash
ping vorthex.net
```

---

## Install Dependencies

### 1. Install Node.js 20.x (LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:

```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 2. Install Git

```bash
sudo apt install -y git
```

### 3. Install Build Essentials

```bash
sudo apt install -y build-essential
```

---

## Database Setup

The application uses **SQLite** as the database, which is file-based and doesn't require a separate database server.

### 1. Install SQLite3

```bash
sudo apt install -y sqlite3
```

Verify installation:

```bash
sqlite3 --version
```

---

## Application Deployment

### 1. Clone the Repository

Create application directory:

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
```

Clone your repository (replace with your actual repository URL):

```bash
git clone https://github.com/yourusername/cyberpunk-forum.git
cd cyberpunk-forum
```

**Or** upload files via SFTP:

```bash
# On your local machine
scp -r c:\Users\Игорь\Documents\qoder\new\cyberpunk-forum cyberforum@your_vps_ip:/var/www/
```

### 2. Install Node.js Dependencies

```bash
cd /var/www/cyberpunk-forum
npm install
```

### 3. Configure Environment Variables

Create production environment file:

```bash
nano .env
```

Add the following configuration:

```env
# Database
DATABASE_URL="file:./prisma/production.db"

# NextAuth
AUTH_SECRET="zlF3C5HctiXFJiL0jFmKvGhxbxQr1gjNj9ySpTE1jdc="
NEXTAUTH_URL="https://vorthex.net"

# Node Environment
NODE_ENV="production"

# Optional: File Upload Settings
MAX_FILE_SIZE=5242880
UPLOAD_DIR="/var/www/cyberpunk-forum/public/uploads"
```

**Important:** 
- Change `AUTH_SECRET` to a new random value. Generate one with:
  ```bash
  openssl rand -base64 32
  ```

Save and exit (Ctrl+X, then Y, then Enter).

### 4. Set Up Database

Create uploads directory:

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

Generate Prisma client and push database schema:

```bash
npx prisma generate
npx prisma db push
```

Seed the database with initial data:

```bash
npm run db:seed
```

### 5. Build the Application

```bash
npm run build
```

This will create an optimized production build in the `.next` directory.

### 6. Test the Application

Start the application temporarily:

```bash
npm start
```

The application should now be running on port 3000. Test it:

```bash
curl http://localhost:3000
```

Press `Ctrl+C` to stop the test server.

---

## SSL Configuration

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

**Note:** Make sure your domain is already pointing to your VPS IP before running this command.

```bash
sudo certbot certonly --standalone -d vorthex.net -d www.vorthex.net
```

Follow the prompts:
- Enter your email address
- Agree to terms of service
- Choose whether to share email with EFF

Certificates will be saved in `/etc/letsencrypt/live/vorthex.net/`

### 3. Set Up Auto-Renewal

Certbot automatically installs a renewal timer. Verify it:

```bash
sudo systemctl status certbot.timer
```

Test renewal:

```bash
sudo certbot renew --dry-run
```

---

## Process Manager Setup

Use **PM2** to keep the application running and restart it automatically.

### 1. Install PM2 Globally

```bash
sudo npm install -g pm2
```

### 2. Create PM2 Ecosystem File

```bash
cd /var/www/cyberpunk-forum
nano ecosystem.config.js
```

Add the following configuration:

```javascript
module.exports = {
  apps: [{
    name: 'cyberpunk-forum',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/cyberpunk-forum',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/cyberpunk-forum/logs/error.log',
    out_file: '/var/www/cyberpunk-forum/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

Save and exit.

### 3. Create Logs Directory

```bash
mkdir -p logs
```

### 4. Start Application with PM2

```bash
pm2 start ecosystem.config.js
```

### 5. Configure PM2 Startup

```bash
pm2 startup systemd
```

Copy and run the command that PM2 outputs (it will look like this):

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u cyberforum --hp /home/cyberforum
```

Save the PM2 process list:

```bash
pm2 save
```

### 6. Useful PM2 Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs cyberpunk-forum

# Restart application
pm2 restart cyberpunk-forum

# Stop application
pm2 stop cyberpunk-forum

# Monitor application
pm2 monit
```

---

## Nginx Configuration

Use Nginx as a reverse proxy to forward requests to the Next.js application.

### 1. Install Nginx

```bash
sudo apt install -y nginx
```

### 2. Create Nginx Configuration File

```bash
sudo nano /etc/nginx/sites-available/vorthex.net
```

Add the following configuration:

```nginx
# Rate limiting zone
limit_req_zone $binary_remote_addr zone=app_limit:10m rate=10r/s;

# Upstream Node.js application
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name vorthex.net www.vorthex.net;
    
    # Certbot challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name vorthex.net www.vorthex.net;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/vorthex.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vorthex.net/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # HSTS (optional but recommended)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Max upload size (for file uploads)
    client_max_body_size 10M;

    # Logging
    access_log /var/log/nginx/vorthex.net.access.log;
    error_log /var/log/nginx/vorthex.net.error.log;

    # Static files (Next.js public directory)
    location /_next/static {
        proxy_cache_valid 200 60m;
        proxy_pass http://nextjs_backend;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Static uploads
    location /uploads {
        alias /var/www/cyberpunk-forum/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js API routes
    location /api {
        limit_req zone=app_limit burst=20 nodelay;
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # All other routes (Next.js pages)
    location / {
        proxy_pass http://nextjs_backend;
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

Save and exit.

### 3. Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/vorthex.net /etc/nginx/sites-enabled/
```

### 4. Remove Default Site (Optional)

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 5. Test Nginx Configuration

```bash
sudo nginx -t
```

You should see:

```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 6. Restart Nginx

```bash
sudo systemctl restart nginx
```

### 7. Enable Nginx to Start on Boot

```bash
sudo systemctl enable nginx
```

---

## Security Hardening

### 1. Set Proper File Permissions

```bash
cd /var/www/cyberpunk-forum

# Set directory permissions
find . -type d -exec chmod 755 {} \;

# Set file permissions
find . -type f -exec chmod 644 {} \;

# Make uploads directory writable
chmod 755 public/uploads

# Protect sensitive files
chmod 600 .env
chmod 600 prisma/*.db
```

### 2. Configure Fail2Ban (Optional but Recommended)

Install Fail2Ban to protect against brute-force attacks:

```bash
sudo apt install -y fail2ban
```

Create Nginx jail configuration:

```bash
sudo nano /etc/fail2ban/jail.local
```

Add:

```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/*error.log

[nginx-botsearch]
enabled = true
port = http,https
logpath = /var/log/nginx/*access.log
maxretry = 2

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/*error.log
```

Restart Fail2Ban:

```bash
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```

### 3. Set Up Automatic Security Updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Monitoring & Maintenance

### 1. Monitor Application Logs

```bash
# PM2 logs
pm2 logs cyberpunk-forum

# Nginx access logs
sudo tail -f /var/log/nginx/vorthex.net.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/vorthex.net.error.log
```

### 2. Database Backup Script

Create a backup script:

```bash
nano ~/backup-database.sh
```

Add:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/home/cyberforum/backups"
DB_FILE="/var/www/cyberpunk-forum/prisma/production.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/cyberforum_backup_$DATE.db"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp $DB_FILE $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "cyberforum_backup_*.db.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

Make it executable:

```bash
chmod +x ~/backup-database.sh
```

### 3. Schedule Daily Backups with Cron

```bash
crontab -e
```

Add this line (runs daily at 2 AM):

```cron
0 2 * * * /home/cyberforum/backup-database.sh >> /home/cyberforum/backup.log 2>&1
```

### 4. Application Update Script

Create an update script:

```bash
nano ~/update-app.sh
```

Add:

```bash
#!/bin/bash

cd /var/www/cyberpunk-forum

echo "Pulling latest changes..."
git pull

echo "Installing dependencies..."
npm install

echo "Running database migrations..."
npx prisma generate
npx prisma db push

echo "Building application..."
npm run build

echo "Restarting application..."
pm2 restart cyberpunk-forum

echo "Update completed!"
```

Make it executable:

```bash
chmod +x ~/update-app.sh
```

To update the application:

```bash
~/update-app.sh
```

---

## Troubleshooting

### Application Won't Start

1. Check PM2 logs:
   ```bash
   pm2 logs cyberpunk-forum --lines 50
   ```

2. Check Node.js version:
   ```bash
   node --version  # Should be v20.x.x
   ```

3. Verify environment variables:
   ```bash
   cat /var/www/cyberpunk-forum/.env
   ```

4. Check database file exists:
   ```bash
   ls -la /var/www/cyberpunk-forum/prisma/production.db
   ```

### 502 Bad Gateway Error

1. Check if application is running:
   ```bash
   pm2 status
   ```

2. Check if port 3000 is listening:
   ```bash
   sudo netstat -tlnp | grep 3000
   ```

3. Restart the application:
   ```bash
   pm2 restart cyberpunk-forum
   ```

4. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/vorthex.net.error.log
   ```

### SSL Certificate Issues

1. Verify certificate files exist:
   ```bash
   sudo ls -la /etc/letsencrypt/live/vorthex.net/
   ```

2. Test SSL configuration:
   ```bash
   sudo nginx -t
   ```

3. Renew certificate manually:
   ```bash
   sudo certbot renew --force-renewal
   ```

### Database Errors

1. Check database file permissions:
   ```bash
   ls -la /var/www/cyberpunk-forum/prisma/
   ```

2. Verify database integrity:
   ```bash
   sqlite3 /var/www/cyberpunk-forum/prisma/production.db "PRAGMA integrity_check;"
   ```

3. Re-run migrations:
   ```bash
   cd /var/www/cyberpunk-forum
   npx prisma db push --force-reset
   npm run db:seed
   ```

### File Upload Issues

1. Check uploads directory permissions:
   ```bash
   ls -la /var/www/cyberpunk-forum/public/uploads/
   ```

2. Ensure directory is writable:
   ```bash
   sudo chown -R cyberforum:cyberforum /var/www/cyberpunk-forum/public/uploads
   chmod 755 /var/www/cyberpunk-forum/public/uploads
   ```

3. Check Nginx max upload size:
   ```bash
   sudo grep client_max_body_size /etc/nginx/sites-available/vorthex.net
   ```

### High Memory Usage

1. Monitor application:
   ```bash
   pm2 monit
   ```

2. Restart application:
   ```bash
   pm2 restart cyberpunk-forum
   ```

3. Check for memory leaks in logs:
   ```bash
   pm2 logs cyberpunk-forum --lines 100
   ```

---

## Post-Deployment Checklist

- [ ] Application accessible at https://vorthex.net
- [ ] SSL certificate valid and auto-renewal configured
- [ ] All pages load correctly
- [ ] User registration works
- [ ] Login/logout functionality works
- [ ] File uploads work
- [ ] Database backups scheduled
- [ ] PM2 process running and auto-starts on reboot
- [ ] Nginx configured and running
- [ ] Firewall rules configured
- [ ] Security headers in place
- [ ] Monitoring logs accessible

---

## Useful Commands Reference

### Application Management
```bash
pm2 start ecosystem.config.js      # Start application
pm2 stop cyberpunk-forum           # Stop application
pm2 restart cyberpunk-forum        # Restart application
pm2 logs cyberpunk-forum           # View logs
pm2 monit                          # Monitor resources
pm2 status                         # Check status
```

### Nginx Management
```bash
sudo systemctl start nginx         # Start Nginx
sudo systemctl stop nginx          # Stop Nginx
sudo systemctl restart nginx       # Restart Nginx
sudo systemctl reload nginx        # Reload config
sudo nginx -t                      # Test configuration
```

### Database Management
```bash
npx prisma studio                  # Open database GUI
npx prisma db push                 # Apply schema changes
sqlite3 prisma/production.db       # Open database CLI
```

### SSL Certificate Management
```bash
sudo certbot renew                 # Renew certificates
sudo certbot certificates          # List certificates
```

---

## Support & Resources

- **Next.js Documentation:** https://nextjs.org/docs
- **Prisma Documentation:** https://www.prisma.io/docs
- **PM2 Documentation:** https://pm2.keymetrics.io/docs
- **Nginx Documentation:** https://nginx.org/en/docs/

---

## Changelog

- **2026-02-04:** Initial deployment guide created

---

**Congratulations!** Your Cyberpunk Forum is now deployed and running on **vorthex.net**. 🚀
