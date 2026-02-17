# EC2 Setup Walkthrough - Step by Step

Follow these steps to set up your EC2 instance for the gamer dating app.

## Step 1: Connect to Your EC2 Instance

Open your terminal and SSH into your EC2 instance:

```bash
ssh -i /path/to/your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

Replace:
- `/path/to/your-key.pem` with your actual key file path
- `YOUR_EC2_PUBLIC_IP` with your EC2's public IP address

**If using Ubuntu instead of Amazon Linux:**
```bash
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## Step 2: Run the Automated Setup Script (RECOMMENDED)

Once connected to EC2, run these commands:

```bash
# Download the setup script
curl -o ec2-setup.sh https://raw.githubusercontent.com/Financ3/gamer-dating-app/main/ec2-setup.sh

# Make it executable
chmod +x ec2-setup.sh

# Run the setup
bash ec2-setup.sh
```

The script will:
- ✅ Install Node.js 18
- ✅ Install Git
- ✅ Install PM2 (process manager)
- ✅ Install serve (for React frontend)
- ✅ Install Nginx (optional)
- ✅ Clone your repository
- ✅ Create .env file (you'll need to edit it)
- ✅ Install dependencies
- ✅ Build the frontend
- ✅ Start the application

**The script will prompt you for:**
1. Your GitHub repository URL
2. Your .env configuration values
3. Whether to set up Nginx

---

## Step 3: Configure Your .env File

During the setup, you'll be asked to edit the `.env` file. Here's what you need:

```env
# Server Configuration
SERVER_PORT=5050

# Database Configuration
CONNECTION_STRING=postgresql://username:password@your-database-host:5432/database_name
# Example for RDS:
# CONNECTION_STRING=postgresql://admin:yourpassword@your-db.abcdefg.us-east-1.rds.amazonaws.com:5432/gamerdating

# Session Security
SESSION_SECRET=your-very-long-random-secure-string-here-change-this

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=Gamer Dating <noreply@yourdomain.com>

# Client URL (your domain or EC2 public IP)
CLIENT_URL=http://YOUR_EC2_PUBLIC_IP:3000
# Or if you have a domain:
# CLIENT_URL=http://yourdomain.com
```

### Getting Email Credentials:

**For Gmail:**
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App passwords → Generate new app password
4. Use that password (not your regular password)

---

## Step 4: Verify Installation

After the script completes, verify everything is running:

```bash
# Check Node.js version
node --version
# Should show: v18.x.x

# Check PM2 is running
pm2 list
# Should show 2 processes: gamer-dating-backend and gamer-dating-frontend

# Check PM2 logs
pm2 logs --lines 20
```

---

## Step 5: Test Your Application

Open your browser and test:

1. **Frontend**: `http://YOUR_EC2_PUBLIC_IP:3000`
2. **Backend API**: `http://YOUR_EC2_PUBLIC_IP:5050/auth/duplicate?email=test@test.com`

You should see:
- Frontend: The React app login/signup page
- Backend: JSON response `true` or `false`

---

## Step 6: Verify EC2 Security Group

Make sure your EC2 Security Group allows these ports:

| Port | Protocol | Source | Description |
|------|----------|--------|-------------|
| 22 | TCP | Your IP | SSH access |
| 80 | TCP | 0.0.0.0/0 | HTTP (for Nginx) |
| 443 | TCP | 0.0.0.0/0 | HTTPS (for SSL) |
| 3000 | TCP | 0.0.0.0/0 | Frontend (temporary) |
| 5050 | TCP | 0.0.0.0/0 | Backend API (temporary) |

To configure:
1. AWS Console → EC2 → Security Groups
2. Select your instance's security group
3. Edit inbound rules
4. Add missing rules

---

## Alternative: Manual Setup

If you prefer manual setup instead of the script:

### Install Node.js 18

```bash
# For Amazon Linux 2
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# For Ubuntu
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### Install Git

```bash
# Amazon Linux 2
sudo yum install -y git

# Ubuntu
sudo apt-get install -y git
```

### Install PM2

```bash
sudo npm install -g pm2
pm2 --version
```

### Install serve

```bash
sudo npm install -g serve
```

### Install Nginx (Optional)

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

### Clone Repository

```bash
# Create app directory
mkdir -p /home/ec2-user/gamer-dating-app
cd /home/ec2-user/gamer-dating-app

# Clone your repo
git clone https://github.com/Financ3/gamer-dating-app.git .
```

### Create .env File

```bash
cp .env.example .env
nano .env
# Edit with your production values (see Step 3 above)
```

### Install Dependencies

```bash
# Install frontend dependencies
export NODE_OPTIONS=--openssl-legacy-provider
npm install

# Build frontend
npm run build

# Install backend dependencies
cd server
npm install
cd ..
```

### Start with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Copy and run the command it outputs
```

---

## Troubleshooting

### Script download fails
```bash
# Try with wget instead
wget https://raw.githubusercontent.com/Financ3/gamer-dating-app/main/ec2-setup.sh
chmod +x ec2-setup.sh
bash ec2-setup.sh
```

### Permission denied errors
```bash
# Make sure you're using sudo for global installations
sudo npm install -g pm2
sudo npm install -g serve
```

### Can't access application from browser
1. Check EC2 security group (ports 3000 and 5050 open)
2. Check if PM2 is running: `pm2 list`
3. Check PM2 logs: `pm2 logs`
4. Check if ports are listening: `sudo netstat -tlnp | grep -E '3000|5050'`

### Database connection fails
1. Verify CONNECTION_STRING in .env
2. Check database security group allows EC2's IP
3. Test connection: `psql "$CONNECTION_STRING" -c "SELECT 1"`

### Build fails
```bash
# Clear cache and rebuild
npm cache clean --force
rm -rf node_modules
npm install
export NODE_OPTIONS=--openssl-legacy-provider
npm run build
```

---

## Next Steps After Setup

Once your EC2 is set up and the app is running:

1. ✅ Verify app works in browser
2. ✅ Check PM2 processes are running
3. ✅ Test database connection
4. ✅ Test email functionality (password reset)
5. 🚀 Ready for automated deployments!

After this setup, every time you push to `main` branch, GitHub Actions will automatically deploy updates to your EC2 instance!

---

## Need Help?

If you get stuck:
1. Check PM2 logs: `pm2 logs --lines 50`
2. Check system logs: `journalctl -xe`
3. Verify .env file: `cat .env`
4. Check running processes: `pm2 list`
5. Check ports: `sudo netstat -tlnp`

Common issues and solutions are in DEPLOYMENT.md
