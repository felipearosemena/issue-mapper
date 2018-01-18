require('dotenv').config()

const Trello = require('node-trello')
const BaseAdaptor = require('@adaptors/base')
const TrelloMapping = require('@mappings/trello')
const { paramError, envError } = require('@root/utils')

const { TRELLO_APP_KEY, TRELLO_USER_TOKEN } = process.env
const { argv } = require('yargs')

class TrelloAdaptor extends BaseAdaptor {
  constructor(config = {}) {
    super(config)

    const { trello_board_id } = argv

    if(!trello_board_id) {
      paramError('--trello_board_id')
    }

    if(!TRELLO_APP_KEY) {
      envError('TRELLO_APP_KEY')
    }

    if(!TRELLO_USER_TOKEN) {
      envError('TRELLO_USER_TOKEN')
    }

    this.client  = new Trello(TRELLO_APP_KEY, TRELLO_USER_TOKEN)
    this.mapping = new TrelloMapping(this.client)

  }

  queryIssues() {

    const { trello_board_id } = argv

    const opts = {
      checklists: 'all',
      attachments: true,
      attachment_fields: 'all'
    }

    return new Promise(resolve => {
      this.client.get(`/1/boards/${ trello_board_id }/cards`, opts, (err, cardData) => {
        if (err) throw err
        resolve(cardData)
      })
    })

  }

}

module.exports = TrelloAdaptor

