# Deployment Checklist ✅

Use this checklist before deploying to ensure everything is configured correctly.

## 🔐 GitHub Secrets (Required)

- [ ] `EC2_HOST` - EC2 public IP or domain
- [ ] `EC2_USER` - SSH username (`ec2-user` or `ubuntu`)
- [ ] `EC2_SSH_KEY` - Private SSH key (entire .pem file)

## ☁️ EC2 Instance Setup

### Required Software
- [ ] Node.js 18.x installed
- [ ] Git installed
- [ ] PM2 installed globally (`npm install -g pm2`)
- [ ] serve installed globally (`npm install -g serve`)

### EC2 Security Group
- [ ] Port 22 (SSH) - Open to your IP
- [ ] Port 80 (HTTP) - Open to 0.0.0.0/0
- [ ] Port 443 (HTTPS) - Open to 0.0.0.0/0 (if using SSL)
- [ ] Port 3000 - Open to 0.0.0.0/0 (frontend, temporary)
- [ ] Port 5050 - Open to 0.0.0.0/0 (backend, temporary)

### Application Setup
- [ ] App directory exists (e.g., `/home/ec2-user/gamer-dating-app`)
- [ ] Repository cloned to EC2
- [ ] `.env` file created with production values
- [ ] Database accessible from EC2

## 📝 Configuration Files

### .env (on EC2)
```env
SERVER_PORT=5050
CONNECTION_STRING=postgresql://user:pass@host:5432/dbname
SESSION_SECRET=your-secure-random-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Your App <noreply@yourapp.com>
CLIENT_URL=http://your-domain.com
```

### Workflow (aws-deploy.yml)
- [ ] `APP_DIR` matches your EC2 path (line 11)
- [ ] `NODE_VERSION` is correct (line 10)

## 🧪 Pre-Deployment Test

### On EC2, verify:
```bash
# Check Node.js
node --version  # Should be v18.x

# Check npm
npm --version

# Check PM2
pm2 --version

# Check serve
serve --version

# Test database connection
psql $CONNECTION_STRING -c "SELECT 1"

# Check git repository
cd ~/gamer-dating-app
git status
```

## 🚀 Deployment Methods

### Method 1: Automatic (Push to main)
```bash
git add .
git commit -m "Deploy updates"
git push origin main
```

### Method 2: Manual Trigger
1. Go to GitHub → Actions
2. Select "Deploy to AWS EC2"
3. Click "Run workflow"
4. Select branch (main)
5. Click "Run workflow"

## ✅ Post-Deployment Verification

### 1. Check GitHub Actions
- [ ] Workflow runs without errors
- [ ] All steps complete successfully

### 2. SSH into EC2 and verify:
```bash
# Check PM2 processes
pm2 list

# Check logs
pm2 logs gamer-dating-backend --lines 20
pm2 logs gamer-dating-frontend --lines 20

# Check if ports are listening
sudo netstat -tlnp | grep -E '3000|5050'

# Test backend
curl http://localhost:5050/auth/duplicate?email=test@test.com

# Test frontend
curl http://localhost:3000
```

### 3. Test from browser
- [ ] Frontend accessible: `http://YOUR_EC2_IP:3000`
- [ ] Backend accessible: `http://YOUR_EC2_IP:5050/auth/duplicate?email=test@test.com`
- [ ] Can register a new user
- [ ] Can login
- [ ] Can view profiles

## 🐛 Troubleshooting

### Build fails in GitHub Actions
```bash
# Check if all dependencies are in package.json
# Check if NODE_OPTIONS is set correctly
# Look for specific error in Actions logs
```

### SSH connection fails
```bash
# Verify EC2_HOST is correct (public IP)
# Verify EC2_USER is correct
# Verify EC2_SSH_KEY is complete (including headers)
# Check EC2 security group allows SSH from GitHub IPs
```

### PM2 won't start
```bash
# Check .env file exists
cd ~/gamer-dating-app
cat .env

# Check for syntax errors
node -c server/index.js

# Check PM2 logs
pm2 logs --lines 50

# Try starting manually
cd ~/gamer-dating-app
node server/index.js
```

### Database connection fails
```bash
# Test connection string
psql "$CONNECTION_STRING" -c "SELECT NOW()"

# Check EC2 security group allows outbound to database
# Check database security group allows inbound from EC2
# Verify CONNECTION_STRING in .env is correct
```

### Application runs but can't access
```bash
# Check security group
# Verify ports 3000 and 5050 are open
# Check if PM2 processes are running: pm2 list
# Check logs: pm2 logs
```

## 🎯 Success Criteria

✅ Deployment completes without errors
✅ Both PM2 processes running (backend + frontend)
✅ Can access frontend via browser
✅ Can access backend API
✅ Can login and use the application
✅ WebSocket/Socket.io chat works
✅ Database queries work
✅ Email sending works (password reset)

## 📊 Monitoring

```bash
# PM2 monitoring
pm2 monit

# View all logs
pm2 logs

# View specific app logs
pm2 logs gamer-dating-backend
pm2 logs gamer-dating-frontend

# Restart if needed
pm2 restart all
pm2 restart gamer-dating-backend
pm2 restart gamer-dating-frontend
```

## 🔄 Regular Maintenance

- [ ] Monitor PM2 logs for errors
- [ ] Check disk space: `df -h`
- [ ] Check memory usage: `free -m`
- [ ] Update dependencies regularly
- [ ] Review security group rules
- [ ] Backup database regularly
- [ ] Keep Node.js updated
- [ ] Keep PM2 updated: `npm update -g pm2`
