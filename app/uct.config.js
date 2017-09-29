module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : "uct",
      script    : "index.js",
      watch     : true,
      env : {
        NODE_ENV: "production"
      }
    }
  ]
}
