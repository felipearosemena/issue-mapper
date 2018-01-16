const request = require('request')
const path = require('path')
const os = require('os')
const fs = require('fs')
const BaseMapping = require('@mappings/base')

const optionDefaults = {
  attachments: true,
  comments: true
}

class Issue {
  constructor(data, mapping = new BaseMapping(), config = {}) {

    this.options = Object.assign({}, optionDefaults, config)
    this.modifiedOn = mapping.modifiedOn(data)
    this.title = mapping.title(data)
    this.description = mapping.description(data)

    this.assignLoaded(this.assignPromisables(data, mapping))

  }

  assignPromisables(data, mapping) {

    const self = this
    const { options } = this
    const promisables = []

    if(options.comments) {

      const commentPromise = mapping
        .comments(data)
        .then(comments => {
          this.comments = comments
        })

      promisables.push(commentPromise)

    }

    if(options.attachments) {

      const attachmentsPromise = mapping
        .attachments(data)
        .then(attachments =>
          this
            .downloadAttachments(attachments)
            .then(dlAttachmentes => {
              this.attachments = dlAttachmentes
            })
        )

      promisables.push(attachmentsPromise)

    }

    return promisables

  }

  downloadAttachments(attachments) {

    return new Promise(resolve => {

      const dlAttachments = attachments.map(attachment => {

        const { url, name } = attachment
        const filePath = path.join(os.tmpdir(), name)

        attachment.filePath = filePath
        attachment.promise = new Promise(r => {
          request({ uri: url })
            .pipe(fs.createWriteStream(filePath))
            .on('close', r)
        })

        return attachment

      })

      Promise
        .all(dlAttachments.map(a => a.promise))
        .then(() => resolve(dlAttachments))
    })

  }

  assignLoaded(mappingPromises) {
    this.loaded = new Promise(resolve => {
      Promise.all(mappingPromises).then(() => resolve())
    })
  }
}

module.exports = Issue
