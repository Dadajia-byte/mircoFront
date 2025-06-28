const Chainable = require('./Chainable');
class ChainedMap extends Chainable {
  constructor(parent) {
    super(parent);
    this.store = new Map();
  }
  extends(methods) {
    methods.forEach(method => {
      // this.path = (newPath) => this.store.path = newPath
      this[method] = (value) => this.set(method, value);
    })
    return this;
  }
  getOrCompute(key, factory) {
    if (!this.has(key)) {
      // key 是字符串，value 可能是任意的值 Set 字符串
      this.set(key, factory());
    }
    return this.get(key);
  }
  set(key, value) {
    this.store.set(key, value);
    return this;
  }
  has(key) {
    return this.store.has(key);
  }
  get(key) {
    return this.store.get(key);
  }
  entries() {
    return [...this.store].reduce((acc, [key,value])=>{
      acc[key] = value;
      return acc;
    }, {});
  }
}

module.exports = ChainedMap;