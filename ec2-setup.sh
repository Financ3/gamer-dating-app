#!/bin/bash

# EC2 Initial Setup Script for Gamer Dating App
# Run this script on your EC2 instance after first connection
# Usage: bash ec2-setup.sh

set -e  # Exit on error

echo "🚀 Starting EC2 setup for Gamer Dating App..."

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "❌ Cannot detect OS"
    exit 1
fi

echo "📋 Detected OS: $OS"

# Update system
echo "📦 Updating system packages..."
if [ "$OS" = "amzn" ]; then
    sudo yum update -y
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get update
    sudo apt-get upgrade -y
fi

# Install Node.js 18
echo "📦 Installing Node.js 18..."
if [ "$OS" = "amzn" ]; then
    curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
elif [ "$OS" = "ubuntu" ]; then
    curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

node --version
npm --version

# Install Git
echo "📦 Installing Git..."
if [ "$OS" = "amzn" ]; then
    sudo yum install -y git
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get install -y git
fi

git --version

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2
pm2 --version

# Install serve (for serving React build)
echo "📦 Installing serve..."
sudo npm install -g serve

# Install Nginx
echo "📦 Installing Nginx..."
if [ "$OS" = "amzn" ]; then
    sudo amazon-linux-extras install nginx1 -y || sudo yum install nginx -y
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get install -y nginx
fi

sudo systemctl start nginx
sudo systemctl enable nginx

# Create app directory
APP_DIR="$HOME/gamer-dating-app"
echo "📁 Creating app directory at $APP_DIR..."
mkdir -p "$APP_DIR"

# Clone repository
echo "📥 Cloning repository..."
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/gamer-dating-app.git): " REPO_URL

if [ -d "$APP_DIR/.git" ]; then
    echo "Repository already exists, pulling latest changes..."
    cd "$APP_DIR"
    git pull
else
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# Create .env file
echo "⚙️  Creating .env file..."
if [ -f .env ]; then
    echo ".env already exists, skipping..."
else
    cp .env.example .env
    echo "📝 Please edit .env file with your production values:"
    echo "   nano .env"
    echo ""
    read -p "Press Enter to open nano editor for .env configuration..."
    nano .env
fi

# Install dependencies
echo "📦 Installing application dependencies..."
export NODE_OPTIONS=--openssl-legacy-provider
npm install

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Create logs directory
mkdir -p logs

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup
echo "⚙️  Configuring PM2 to start on boot..."
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Configure Nginx (optional)
read -p "Do you want to configure Nginx as reverse proxy? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 Setting up Nginx configuration..."

    # Create nginx config
    sudo cp nginx.conf.example /etc/nginx/sites-available/gamer-dating-app || {
        # If sites-available doesn't exist (Amazon Linux), create conf.d version
        sudo cp nginx.conf.example /etc/nginx/conf.d/gamer-dating-app.conf
    }

    # For systems with sites-enabled
    if [ -d /etc/nginx/sites-enabled ]; then
        sudo ln -sf /etc/nginx/sites-available/gamer-dating-app /etc/nginx/sites-enabled/
        # Remove default if it exists
        sudo rm -f /etc/nginx/sites-enabled/default
    fi

    echo "📝 Please edit the nginx configuration with your domain name:"
    if [ -f /etc/nginx/sites-available/gamer-dating-app ]; then
        sudo nano /etc/nginx/sites-available/gamer-dating-app
    else
        sudo nano /etc/nginx/conf.d/gamer-dating-app.conf
    fi

    # Test nginx config
    sudo nginx -t

    # Restart nginx
    sudo systemctl restart nginx
    echo "✅ Nginx configured and restarted"
fi

# Display status
echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 Application Status:"
pm2 list
echo ""
echo "🌐 Your application should be running at:"
echo "   Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo "   Backend:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5050"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Nginx:    http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
fi
echo ""
echo "📝 Next steps:"
echo "   1. Configure your domain DNS to point to this EC2 IP"
echo "   2. Update CLIENT_URL in .env to your domain"
echo "   3. Set up SSL with Let's Encrypt (recommended)"
echo "   4. Configure GitHub Secrets for automatic deployment"
echo ""
echo "📖 See DEPLOYMENT.md for more details"
