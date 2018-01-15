require('module-alias/register')

const { argv } = require('yargs')
const Mapper = require('@root/mapper')

const { i, o } = argv

const mapper = new Mapper(i, o);

mapper.run()
