module.exports = {
    apps : [{
      name: 'API',
      script: 'nodemon',
      args: 'src/index.ts',
      interpreter: 'none',
      watch: true
    }]
  };