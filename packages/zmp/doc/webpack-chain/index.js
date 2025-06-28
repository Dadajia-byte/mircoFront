const ChainedMap = require('./ChainedMap');
const ChainedSet = require('./ChainedSet');
const Output = require('./Output');
class WebpackChain extends ChainedMap {
  constructor() {
    super();
    this.entryPoints = new ChainedMap(this);
    this.output = new Output(); // ouput是一个ChainedMap
  }
  entry(name) { // 添加一个入口
    return this.entryPoints.getOrCompute(
      name,
      () => new ChainedSet(this)
    )
  }
  toConfig() {
    //内部存储结构变成webpack配置文件
    const entryPoints = this.entryPoints.entries();
    return {
      entry: Object.keys(entryPoints).reduce((acc, key) => {
        acc[key] = entryPoints[key].values();
        return acc;
      }, {}),
      output: this.output.entries()
    }
  }
}

module.exports = WebpackChain;
