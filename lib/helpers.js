const blocks = Object.create(null)

exports.extend = (name, context) => {
  let block = blocks[name]
  if (!block) {
    block = blocks[name] = []
  }

  block.push(context.fn(this))
}

exports.block = (name) => {
  const val = (blocks[name] || []).join('\n')

  // clear the block
  blocks[name] = []
  return val
}

exports.stringify = (obj) => {
  return JSON.stringify(obj)
}

exports.delay = (a, b) => {
  return a % 3 * b
}