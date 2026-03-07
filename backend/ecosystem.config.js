module.exports = {
  apps: [
    {
      name: "EMS-Producer",
      script: "./producer.js",
      instances: "max", // Saare CPU cores use karega
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "EMS-Worker",
      script: "./queueWorker.js",
      instances: 8, // 8 workers ek saath chalenge
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};