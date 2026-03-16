module.exports = {
  apps: [
    {
      name: "EMS-API-SERVER",
      script: "index.js",
      cwd: "./backend", // ✅ Sahi rasta: Pehle backend folder mein jao, fir index.js chalao
      watch: true,
      env: { NODE_ENV: "production", PORT: 5000 }
    },
    {
      name: "EMS-UI-DASHBOARD",
      script: "npm",
      args: "run dev",
      cwd: "./frontend", // ✅ Sahi rasta: Pehle frontend folder mein jao
      watch: false
    },
    {
      name: "EMS-Producer",
      script: "producer.js", 
      cwd: "./backend", // ✅ Sahi rasta
      instances: 1,
      exec_mode: "fork"
    },
    {
      name: "EMS-Worker",
      script: "queueWorker.js",
      cwd: "./backend", // ✅ Sahi rasta
      instances: 1,
      exec_mode: "fork"
    }
  ]
};