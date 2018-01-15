class BaseMapping {
  title({ title = '' }) { return title }
  description({ description = '' }) { return description }
  modifiedOn({ modifiedOn = '' }) { return modifiedOn }
  comments({ comments = [] }) { return new Promise(r => r(comments)) }
  attachments({ attachments = [] }) { return new Promise(r => r(attachments)) }
}

module.exports = BaseMapping
