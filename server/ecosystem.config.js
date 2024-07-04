module.exports = {
  apps: [
    {
      name: 'server',
      script: './server.js',
      env: {
        PORT: process.env.PORT || 3000,
        MONGODB_URI: process.env.MONGODB_URI
      }
    }
  ]
};
