const utils = require('@root/utils')
const x = utils.paramError
const { moduleExists } = utils

function loadAdaptor(name) {
  const Adaptor = require(`@adaptors/${name}`)
  return new Adaptor()
}

function adaptorExists(name) {
  return moduleExists(`@adaptors/${name}`)
}

class Mapper {

  constructor(i = x`--i`, o = x`--o`) {

    this.i = i
    this.o = o
    this.createAdaptors()

  }

  createAdaptors() {

    const { i, o, availableAdaptors } = this

    if(!adaptorExists(i)) {
      throw new Error(`Invalid input adaptor: ${i}`)
    }

    if(!adaptorExists(o)) {
      throw new Error(`Invalid output adaptor: ${o}`)
    }

    this.input = loadAdaptor(i)
    this.output = loadAdaptor(o)

  }

  run() {

    this.input
      .getIssues()
      .then(issues => {
        this.output.postIssues(issues)
      })

  }
}

module.exports = Mapper
