const request = require('request')
const fs = require('fs')
const Issue = require('@root/issue')
const BaseMapping = require('@mappings/base')

class BaseAdaptor {
  constructor() {
    this.mapping = new BaseMapping()
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
    return data.map(issueData => {
      return new Issue(issueData, this.mapping)
    })
  }

  getIssues() {}

  postIssues() {}
}

module.exports = BaseAdaptor
