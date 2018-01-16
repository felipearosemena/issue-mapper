const BaseMapping = require('@mappings/base')
const { argv } = require('yargs')

class GitlabMapping extends BaseMapping {
  constructor(client) {
    super()
    this.client = client
  }

  modifiedOn({ updated_at = '' }) { return updated_at }

  mapNotes(noteData) {
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

    return new Promise((resolve, reject) => {
      this.getIssueNotes(id, noteData =>
        resolve(this.mapNotes(noteData))
      )
    })

  }

  attachments({ attachments = [] }) { return new Promise(r => r(attachments)) }
}

module.exports = GitlabMapping
