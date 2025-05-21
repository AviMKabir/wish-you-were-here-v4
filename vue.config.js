const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/wish-you-were-here-v4/' // Replace 'your-repo-name' with the actual name of your GitHub repository
    : '/'
})