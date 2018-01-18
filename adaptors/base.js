const request = require('request')
const fs = require('fs')
const Issue = require('@root/issue')
const BaseMapping = require('@mappings/base')
const { log } = console

const optionDefaults = {
  attachments: true
}

class BaseAdaptor {
  constructor(config = {}) {
    this.mapping = new BaseMapping()
    this.options = Object.assign({}, optionDefaults, config)
  }

  uploadUrl() {
    return ''
  }

  uploadHeaders() {
    return {}
  }

  uploadOptions(filePath = '') {
    return {
      method: 'POST',
      url: this.uploadUrl(),
      headers: this.uploadHeaders(),
      formData: {
        file: fs.createReadStream(filePath)
      }
    }
  }

  uploadFile(filePath = '') {

    const options = this.uploadOptions(filePath)

    return new Promise(resolve => {
      request(options, function (error, response) {
        if(error) { throw new Error(error) }
        resolve(response)
      })
    })

  }

  instantiateIssues(data) {

    const { options } = this

    return data.map(issueData => {
      return new Issue(issueData, this.mapping, {
        attachments: options.attachments
      })
    })

  }

  issuesLoaded(issues, onLoaded = () => {}) {
    Promise
      .all(issues.map(i => i.loaded))
      .then(onLoaded)
  }

  queryIssues() {
    return new Promise(r => r([]))
  }
  getIssues() {

    log(`Getting ${ this.options.type } issues from ${ this.name }`)

    return new Promise(resolve => {
      this
        .queryIssues()
        .then(data => {
          log(`${ data.length } ${ this.name } issues found`)

          if(this.options.type == 'input') {
            log(`Preparing to download attachments & querying additional data`)
          }

          const issues = this.instantiateIssues(data)
          this.issuesLoaded(issues, () => {
            log(`${ issues.length } ${ this.name } issues loaded`)
            resolve(issues)
          })
        })
    })
  }

  loopFinished(i, issues) {
    return !issues.length || (i + 1) > issues.length
  }

  postLoop(i, issues) {

    if(this.loopFinished(i, issues)) {
      return
    }

    const issue = issues[i]
    const uploadPromises = this.uploadFiles(issue)

    Promise
      .all(uploadPromises)
      .then(() => this.postIssue(issue))
      .then(() => {
        log(`Created issue #${i + 1}: ${ issue.title }`)
        this.postLoop(i + 1, issues)
      })
  }

  postIssues(issues) {
    log(`${ issues.length } issues to create`)
    this.postLoop(0, issues)
  }
}

module.exports = BaseAdaptor
