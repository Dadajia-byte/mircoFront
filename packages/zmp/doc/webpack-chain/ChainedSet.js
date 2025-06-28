const Chainable = require('./Chainable');
class ChainSet extends Chainable {
  constructor(parent) {
    super(parent);
    this.store = new Set();
  }
  add(value) {
    this.store.add(value);
    return this;
  }
  values() {
    return [...this.store];
  }
}

module.exports = ChainSet;