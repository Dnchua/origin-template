/* eslint-disable @typescript-eslint/no-var-requires */
// const { defineConfig } = require('@vue/cli-service');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const AutoImport = require('unplugin-auto-import/webpack');
const Components = require('unplugin-vue-components/webpack');
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers');
module.exports = {
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    open: true,
    host: '0.0.0.0', // 允许外部ip访问
    port: 8085, // 端口
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@use "@/assets/skin/orange/index.scss" as *;`,
      },
    },
  },
  configureWebpack: config => {
    // remove the existing ForkTsCheckerWebpackPlugin
    // config.plugins = config.plugins.filter(p => !(p instanceof ForkTsCheckerWebpackPlugin));
    config.plugins.push(
      new NodePolyfillPlugin({
        // typescript: {
        //   configFile: path.resolve(__dirname, 'tsconfig.json'),
        // }
      }),
    );
    config.plugins.push(
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        resolvers: [ElementPlusResolver()],
      }),
    );
    config.plugins.push(
      Components({
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        directoryAsNamespace: true,
      }),
    );
  },
};
