# AWS EC2 Deployment Guide

This guide will help you deploy the Gamer Dating App to AWS EC2 using GitHub Actions.

## 📋 Prerequisites

- AWS EC2 instance running (Amazon Linux 2 or Ubuntu recommended)
- SSH access to the EC2 instance
- Domain name pointed to your EC2 instance (optional but recommended)
- GitHub repository with the code

## 🔧 EC2 Setup

### 1. Connect to Your EC2 Instance

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### 2. Install Node.js

```bash
# For Amazon Linux 2
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# For Ubuntu
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install Git

```bash
# Amazon Linux 2
sudo yum install -y git

# Ubuntu
sudo apt-get install -y git
```

### 4. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 5. Install Nginx (Optional but Recommended)

```bash
# Amazon Linux 2
sudo amazon-linux-extras install nginx1 -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Ubuntu
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Install PostgreSQL Client (if needed)

```bash
# Amazon Linux 2
sudo amazon-linux-extras install postgresql13 -y

# Ubuntu
sudo apt-get install -y postgresql-client
```

### 7. Clone the Repository

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/gamer-dating-app.git
cd gamer-dating-app
```

### 8. Create .env File

```bash
cp .env.example .env
nano .env
```

Update the `.env` file with your production values:

```env
SERVER_PORT=5050
CONNECTION_STRING=postgresql://username:password@your-rds-endpoint:5432/database_name
SESSION_SECRET=your-very-secure-secret-here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=Gamer Dating <noreply@gamerdating.com>

# Client URL (your domain or EC2 public IP)
CLIENT_URL=http://your-domain.com
```

### 9. Initial Build and Start

```bash
# Install dependencies
npm install

# Build frontend
export NODE_OPTIONS=--openssl-legacy-provider
npm run build

# Install backend dependencies
cd server
npm install
cd ..

# Start with PM2
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Follow the command it outputs
```

### 10. Configure Nginx (Optional)

```bash
# Copy the nginx config
sudo cp nginx.conf.example /etc/nginx/sites-available/gamer-dating-app

# Edit it with your domain
sudo nano /etc/nginx/sites-available/gamer-dating-app

# Enable the site
sudo ln -s /etc/nginx/sites-available/gamer-dating-app /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## 🔐 GitHub Secrets Setup

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions → New repository secret):

1. **EC2_HOST**: Your EC2 public IP or domain
   - Example: `54.123.45.67` or `ec2-54-123-45-67.compute-1.amazonaws.com`

2. **EC2_USER**: SSH username
   - Amazon Linux 2: `ec2-user`
   - Ubuntu: `ubuntu`

3. **EC2_SSH_KEY**: Your private SSH key
   - Copy the entire contents of your `.pem` file
   - Include `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`

## 🚀 Deploy via GitHub Actions

### Option 1: Automatic Deployment

Every push to the `main` branch will automatically trigger deployment.

### Option 2: Manual Deployment

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Select "Deploy to AWS EC2"
4. Click "Run workflow"
5. Select branch and click "Run workflow"

## 🔒 Security Checklist

- [ ] EC2 Security Group allows:
  - Port 22 (SSH) from your IP only
  - Port 80 (HTTP) from anywhere
  - Port 443 (HTTPS) from anywhere (if using SSL)
  - Port 5432 (PostgreSQL) from EC2 only (if using RDS)
- [ ] Strong .env secrets (especially SESSION_SECRET)
- [ ] Database credentials are secure
- [ ] SSL certificate installed (use Let's Encrypt - certbot)
- [ ] Firewall (ufw/iptables) configured
- [ ] Regular security updates enabled

## 📊 Monitoring

### Check Application Status

```bash
pm2 list
pm2 logs
pm2 monit
```

### Check Nginx Status

```bash
sudo systemctl status nginx
sudo nginx -t
```

### View Logs

```bash
# PM2 logs
pm2 logs gamer-dating-backend
pm2 logs gamer-dating-frontend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🐛 Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs

# Check if .env file exists
cat .env

# Check if database is accessible
psql $CONNECTION_STRING
```

### Build fails

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Try building manually
export NODE_OPTIONS=--openssl-legacy-provider
npm run build
```

### Can't connect to application

```bash
# Check if processes are running
pm2 list

# Check ports
sudo netstat -tlnp | grep -E '3000|5050'

# Check nginx
sudo systemctl status nginx
```

## 🔄 Manual Deployment Steps

If you need to deploy manually without GitHub Actions:

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Navigate to app directory
cd ~/gamer-dating-app

# Pull latest changes
git pull origin main

# Install dependencies
npm install
cd server && npm install && cd ..

# Build frontend
export NODE_OPTIONS=--openssl-legacy-provider
npm run build

# Restart with PM2
pm2 restart ecosystem.config.js
```

## 📝 Notes

- The app uses PM2 to manage processes
- Frontend runs on port 3000 (served by `serve`)
- Backend runs on port 5050
- Nginx proxies both services (if configured)
- Socket.io is used for real-time chat functionality
- Database runs on external PostgreSQL (RDS recommended)

## 🆘 Getting Help

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify .env configuration
4. Check EC2 security group settings
5. Ensure database is accessible
