// const Chain = require('webpack-chain');
const WebpackChain = require('./webpack-chain/index');
const path = require('path');
// const config = new Chain();
const config = new WebpackChain();

config
.entry('index') // 添加一个入口，名称是index
.add('./src/index.js') // 添加一个入口文件
.end() // 结束入口的添加
.output // 添加输出配置
.path(path.resolve(__dirname, 'dist')) // 设置输出路径
.filename('[name].js') // 设置输出文件名
.end() // 结束输出的添加

const options = config.toConfig();
console.log(options);
/**
 * {
  output: {
    path: '/Users/anshuchen/fontend/微前端/mircoFront/packages/zmp/doc/dist',
    filename: '[name].js'
  },
  entry: { index: [ './src/index.js' ] }
}
 */