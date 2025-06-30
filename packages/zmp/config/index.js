const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
/**
 * webpack-chain 使用一个用于创建和修改webpack配置的nodejs库。它提供一种直观的链式API，允许你以可读的方式来构建复杂的webpack配置。
 * 这个库的主要目的是让你可以通过链式API来构建配置，而不是使用一个巨大的配置对象。
 * 以下是webpack-chain的几个特点：
 * 1. 链式API：webpack-chain提供了一种链式API，让你可以以可读的方式来构建复杂的webpack配置。
 * 2. 命名规则和插件：webpack-chain提供了一种命名规则和插件，让你可以以可读的方式来构建复杂的webpack配置。
 */
const webpackChain = require('webpack-chain');

function processDefault(empConfig) {
  const devServer = empConfig.server || {}; // host 8002 remote 8001
  delete empConfig.server;
  // 创建模块联邦选项的对象
  const mfOptions = {
    filename: 'emp.js', // 指定当前容器对外提供模块联邦的服务，生成的remoteEntry文件的名称，这个文件包含模块联邦运行时和引导代码 emp.js
    ...empConfig.empShare
  }
  delete empConfig.empShare;
  // webpack-chain 的配置文件，和webpack的配置文件不是一样的！
  return {
    context: process.cwd(),
    mode: 'development',
    devtool: 'none',
    devServer,
    ...empConfig,
    plugins: {
      html: {
        plugin: HtmlWebpackPlugin,
        args: [
          {
            template: path.join(__dirname, '../template/index.html'),
          }
        ]
      },
      mf: {
        plugin: webpack.container.ModuleFederationPlugin,
        args: [mfOptions]
      }
    },
    module: {
      rules: {
        compile: {
          test: /\.js$/,
          exclude: [/node_modules/],
          use: {
            'babel-loader': {
              loader: require.resolve('babel-loader'),
              options: {
                presets: [
                  require.resolve('@babel/preset-env'),
                  require.resolve('@babel/preset-react'),
                ]
              }
            }
          }
        }
      }
    }
  }
}


exports.getConfig = () => {
  const Config = new webpackChain();
  const empConfigPath = path.resolve(process.cwd(), 'emp-config.js');
  const empConfig = require(empConfigPath);
  const afterConfig = processDefault(empConfig);
  Config.merge(afterConfig);
  // 把Chain对象转成一个webpack配置对象
  console.log(Config.toConfig(), 'Config.toConfig()');
  
  return Config.toConfig();
}

// emp的核心功能就是帮你配置一套webpack配置文件（模块联邦）