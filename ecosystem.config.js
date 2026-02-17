module.exports = {
  apps: [
    {
      name: 'gamer-dating-app',
      script: './server/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--openssl-legacy-provider'
      }
    }
  ]
};
