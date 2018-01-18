const utils = require('@root/utils')
const x = utils.paramError
const { moduleExists, inArray, log } = utils

function loadAdaptor(name, opts = {}) {
  const Adaptor = require(`@adaptors/${name}`)
  return new Adaptor(opts)
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

    this.input = loadAdaptor(i, { type: 'input' })
    this.output = loadAdaptor(o, {
      attachments: false,
      comments: false,
      type: 'output'
    })

  }

  deDupeIssues(inputIssues, outputIssues) {

    log(`Removing duplicates`)

    const outputTitles = outputIssues.map(i => i.title)

    return inputIssues
      .filter(({ title }) => !inArray(title, outputTitles))
  }

  run() {

    const { input, output } = this
    const inputPromise = input.getIssues()
    const outputPromise = inputPromise.then(() => output.getIssues())

    Promise
      .all([
        inputPromise,
        outputPromise,
      ])
      .then(([ inputIssues, outputIssues ]) => {

        const deDuped = this.deDupeIssues(inputIssues, outputIssues)

        output.postIssues(deDuped)
      })

  }
}

module.exports = Mapper
