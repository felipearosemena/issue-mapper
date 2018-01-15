const request = require('request')
const path = require('path')
const os = require('os')
const fs = require('fs')
const BaseMapping = require('@mappings/base')

class Issue {
  constructor(data, mapping = new BaseMapping()) {

    this.modifiedOn = mapping.modifiedOn(data)
    this.title = mapping.title(data)
    this.description = mapping.description(data)

    this.assignLoaded(this.assignPromisables(data, mapping))

  }

  assignPromisables(data, mapping) {

    const self = this

    return [
      mapping.comments(data).then(comments => self.comments = comments),
      mapping.attachments(data).then(attachments => {
        return this.downloadAttachments(attachments)
          .then(dlAttachmentes => {
            self.attachments = dlAttachmentes
          })
      })
    ]

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
