import { sentences } from 'sbd'

export default () => tree => {
  const replace = []

  tree.children
    .filter(p => p.type === 'paragraph')
    .forEach(
    p => {
      const { children } = p
      const split = []
      let sentence = ''
      let from = 0
      const pushToSplit = pushTo(split)

      // explode text children
      for (const _child of children) {
        if (_child.type === 'text') {
          children.splice(children.indexOf(_child), 1, ...explode(_child))
        }
      }

      // split sentences
      for (const child of children) {
        const index = children.indexOf(child)

        if (child.type === 'break') {
          pushToSplit(p, from, index)
          from = index + 1 // skip break
        }

        if (child.type === 'text') {
          sentence += child.value
          const result = sentences(sentence)

          if (result.length > 1) {
            pushToSplit(p, from, index)
            from = index
            sentence = child.value
          }

          if (index === children.length - 1) { // reached last element
            pushToSplit(p, from)
          }
        }
      } // for
      replace.push([p, split])
    }
  ) // forEach

  replace.forEach(([p, split]) => {
    tree.children.splice(tree.children.indexOf(p), 1, ...split)
  })
}

const explode = (textNode) => {
  return sentences(textNode.value, { preserve_whitespace: true })
    .map(v => ({ ...textNode, value: v }))
}

const pushTo = array => (p, from, index) => {
  const { children } = p
  const split = children.slice(from, index)
  if (split.length) {
    array.push({ ...p, children: split })
  }
}