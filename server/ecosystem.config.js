module.exports = {
  apps: [
    {
      name: 'server',
      script: './server/server.js',
      env: {
        PORT: process.env.PORT || 3000
      }
    }
  ]
};
