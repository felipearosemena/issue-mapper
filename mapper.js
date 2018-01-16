const utils = require('@root/utils')
const x = utils.paramError
const { moduleExists, inArray } = utils

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

  deDupeIssues(inputIssues, outputIssues) {
    const outputTitles = outputIssues.map(i => i.title)

    return inputIssues
      .filter(({ title }) => !inArray(title, outputTitles))
  }

  run() {

    const { input, output } = this

    Promise
      .all([
        input.getIssues(),
        output.getIssues(),
      ])
      .then(([ inputIssues, outputIssues ]) => {
        output.postIssues(
          this.deDupeIssues(inputIssues, outputIssues)
        )
      })

  }
}

module.exports = Mapper
