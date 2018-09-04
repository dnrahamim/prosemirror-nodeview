export class ExampleView {
  constructor(node, view, getPos) {
    // The editor will use this as the node's DOM representation
    this.dom = document.createElement("input")
    this.dom.type = "text"
    this.dom.value = "bagelcake"
    this.dom.addEventListener("click", e => {
      console.log("You clicked me!")
      e.preventDefault()
    })
  }

  stopEvent() { return true }
}

const exampleNodeSpec = {
  attrs: { value: { default: 'toot toot tooot' }, bagelvalue: { default: 438 } },
  inline: false,
  draggable: true,
  selectable: true,
  atom: false,
  group: 'block',
  toDOM(node) {
    return ['div', { 'data-type': 'example', value: node.attrs.value }, ''];
  },
  parseDOM: [{
    // you could use my-element as a tag, but we want some additional features that come with the node view
    // the custom element would then completely take over the node and only communicate through its attributes
    tag: 'div[data-type=example]',
    getAttrs(dom) {
      return {};
    }
  }]
}
export {exampleNodeSpec};