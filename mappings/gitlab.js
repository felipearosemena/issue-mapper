const BaseMapping = require('@mappings/base')
const { argv } = require('yargs')

class GitlabMapping extends BaseMapping {
  constructor(client) {
    super()
    this.client = client
    this.commentsPromise = new Promise(r => r())
  }

  modifiedOn({ updated_at = '' }) { return updated_at }

  mapComments(noteData) {
    return noteData.map(({ body, author }) => {
      return {
        text: body,
        author: author.name
      }
    })
  }

  getIssueNotes(id, callback = () => {}) {

    const { gitlab_project_id } = argv

    this.client.projects.issues.notes
      .all(gitlab_project_id, id, notes => {
        callback(notes)
      })

  }

  comments({ id }) {

    this.commentsPromise = new Promise((resolve, reject) => {
      this.getIssueNotes(id, noteData =>
        resolve(this.mapComments(noteData))
      )
    })

    return this.commentsPromise

  }

  parseAttUrl(att) {
    const { url, base_url } = this.client.options
    const filepath = /\((.*?)\)/.exec(att)[1]
    return `${ url }/${ base_url }${ filepath }`
  }

  parseAttName(att) {
    return /\[(.*?)\]/.exec(att)[1]
  }

  parseAttachments(string) {
    return string
      .match(/\[(.*?)\]\((.*?)\)/g)
      .map(att => {
        return {
          url: this.parseAttUrl(att),
          name: this.parseAttName(att),
        }
      })
  }

  attachments({ description }) {

    return new Promise(r => {
      this.commentsPromise
        .then(comments => {

          let string = description + ' ' + comments
            .map(c => c.text)
            .join(' ')

          r(this.parseAttachments(string))

        })
    })
  }
}

module.exports = GitlabMapping
