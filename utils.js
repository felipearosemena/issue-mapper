
module.exports.paramError = p => { throw new Error(`Missing parameter: ${p}`) }
module.exports.envError = p => { throw new Error(`Missing .env variable: ${p}`) }

module.exports.moduleExists = name => {
  try { return require.resolve( name ) }
  catch( e ) { return false }
}
