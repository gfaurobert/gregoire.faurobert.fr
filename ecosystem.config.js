module.exports = {
    apps: [
      {
        name: 'cv-gregor-faurobert-fr',
        script: 'pnpm',
        args: 'start',
        env: {
          PORT: 3004,
          NODE_ENV: 'production',
        },
        instances: 1,
        exec_mode: 'fork',
        watch: false,
        autorestart: true,
        max_memory_restart: '200MB',
      },
    ],
  };
  