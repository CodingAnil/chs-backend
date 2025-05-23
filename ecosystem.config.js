module.exports = {
  apps: [
    {
      name: "websocket-server",
      script: "./server.js", // or your main server file
      instances: 1, // Don't cluster WebSocket servers
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
    },
  ],
};
