const BaseMapping = require('@mappings/base')

class TrelloMapping extends BaseMapping {
  constructor(client) {
    super()
    this.client = client
  }

  modifiedOn({ dateLastActivity }) {
    return dateLastActivity
  }

  title({ name }) {
    return name
  }

  checklistMarkdown({ name, checkItems }) {

    const title = `## ${ name }\n`
    const items = checkItems.map(({ state, name }) =>
      `* [${ state == 'incomplete' ? ' ' : 'x' }] ${ name }\n`
    ).join('\n')

    return title + items
  }

  description({ desc, checklists }) {

    const checklistsMdown =  checklists
      .map(c => this.checklistMarkdown(c))
      .join('\n')

    return `${desc}\n${checklistsMdown}`
  }

  mapComments(commentData) {
    return commentData.map(({ data, memberCreator }) => {
      return {
        text: data.text,
        author: memberCreator.fullName
      }
    })
  }

  getCardComments(id, callback = () => {}) {

    const opts = { filter: 'commentCard' }

    this.client.get(`/1/cards/${ id }/actions`, opts, (err, commentData) => {

      if(err) {
        return reject(err)
      }

      callback(commentData)

    })
  }

  comments({ id }) {

    return new Promise((resolve, reject) => {
      this.getCardComments(id, commentData =>
        resolve(this.mapComments(commentData))
      )
    })

  }
  //Here get the isUpload parameter of each attachment
  attachments({ attachments }) {
    return new Promise(resolve => resolve(
      attachments.map(({ url, name, isUpload }) => {
        return { url: url, name: name, isUpload: isUpload }
      })
    ))
  }

}

module.exports = TrelloMapping
