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

if (process.env.BACKGROUND_JOBS === "true" || process.env.BACKGROUND_JOBS === "1") {
  module.exports.apps.push({
    name: process.env.APP_NAME ? `${process.env.APP_NAME}_worker` : "next_base_worker",
    script: "jobs/index.js",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
    },
    env_development: {
      NODE_ENV: "development",
    },
  });
}
