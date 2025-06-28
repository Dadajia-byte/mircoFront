const ChainedMap = require('./ChainedMap');
class Output extends ChainedMap {
  constructor(parent) {
    super(parent);
    this.extends([
      'path',
      'filename'
    ])
  }
}

module.exports = Output;