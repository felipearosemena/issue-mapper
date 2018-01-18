require('dotenv').config()

const gitlab = require('gitlab')
const BaseAdaptor = require('@adaptors/base')
const GitlabMapping = require('@mappings/gitlab')
const { paramError, envError } = require('@root/utils')

const { GITLAB_TOKEN } = process.env
const { argv } = require('yargs')

class GitlabAdaptor extends BaseAdaptor {
  constructor(config = {}) {
    super(config)

    const { gitlab_project_id } = argv

    if(!gitlab_project_id) {
      paramError('--gitlab_project_id')
    }

    if(!GITLAB_TOKEN) {
      envError('GITLAB_TOKEN')
    }

    this.client = gitlab({
      url: 'https://gitlab.com',
      token: GITLAB_TOKEN
    })

    this.mapping = new GitlabMapping(this.client)
    this.name = 'Gitlab'

  }

  uploadUrl() {
    const { url, base_url } = this.client.options
    const { gitlab_project_id } = argv
    return `${ url }/${ base_url }/projects/${ encodeURIComponent(gitlab_project_id) }/uploads`
  }

  uploadHeaders() {
    return {
      'Private-Token': GITLAB_TOKEN
    }
  }

  queryIssues() {

    const { gitlab_project_id } = argv

    return new Promise(resolve => {

      this.client.projects.issues
        .list(gitlab_project_id, issuesData => {
          resolve(issuesData)
        })

    })

  }

  uploadFiles(issue) {
    return issue.attachments.map(attachment => {
      return this.uploadFile(attachment.filePath)
        .then(response => this.appendFileMarkdown(issue, response))
    })
  }

  appendFileMarkdown(issue, { body }) {
    const { markdown } = JSON.parse(body)
    issue.description += `\n${ markdown }`
  }

  postIssue(issue) {

    return new Promise(resolve => {
      this.client.issues
        .create(argv.gitlab_project_id, issue, issueData => {

          if(!issueData.id) {
            throw new Error(`Failed to create issue "${ issue.title }"`)
          }

          if(issue.comments.length) {
            this
              .postNotes(issueData.id, issue.comments)
              .then(resolve)
          } else {
            resolve()
          }
        })
    })

  }

  postNotes(id, comments) {

    return Promise
      .all(comments.map(({ text }) =>
        new Promise(resolve => {
          this.client.notes
            .create(argv.gitlab_project_id, id, { body: text }, resolve)
        })
      ))

  }

}

module.exports = GitlabAdaptor
