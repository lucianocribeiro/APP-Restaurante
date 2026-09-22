module.exports = {
  apps: [
    {
      name: 'menuapp-backend',
      cwd: './MenuApp-Backend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 3000,
      exp_backoff_restart_delay: 200
    },
    {
      name: 'menuapp-frontend',
      cwd: './MenuApp-Frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 3000,
      exp_backoff_restart_delay: 200
    }
  ]
};
