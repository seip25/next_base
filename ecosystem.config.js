module.exports = {
  apps: [
    {
      name: process.env.APP_NAME || "next_base",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
      },
      env_development: {
        NODE_ENV: "development",
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};
