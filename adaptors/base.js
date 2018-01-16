const request = require('request')
const fs = require('fs')
const Issue = require('@root/issue')
const BaseMapping = require('@mappings/base')

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

  getIssues() {}

  postIssues() {}
}

module.exports = BaseAdaptor
