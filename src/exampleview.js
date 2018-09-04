const {MenuItem} = require("prosemirror-menu")

export class ExampleView {
  constructor(node, view, getPos) {
    // The editor will use this as the node's DOM representation
    this.dom = document.createElement("input")
    this.dom.type = "text"
    this.dom.value = "bagelcake"
    this.dom.id = 'bagel'
    this.dom.addEventListener("click", e => {
      console.log("You clicked me!")
      e.preventDefault()
    })
  }

  stopEvent() { return true }
}

const exampleNodeSpec = {
  attrs: { value: { default: 'toot toot tooot' }, bagelvalue: { default: 438 } },
  inline: true,
  group: "inline",
  draggable: true,
  selectable: false,
  atom: false,
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

function insertExample(schemaType) {
  return function(state, dispatch) {
    let {$from} = state.selection, index = $from.index()
    if (!$from.parent.canReplaceWith(index, index, schemaType))
      return false
    if (dispatch) {
      dispatch(state.tr.replaceSelectionWith(schemaType.create({value: 'here is a data-type baby'})))
      let bagel = document.getElementById('bagel');
      bagel.focus();
      bagel.select();
    }
    return true
  }
}

function addExampleToMenu(menu, schema) {
  const schemaType = schema.nodes.example;
  // Add a dino-inserting item for each type of dino
  menu.insertMenu.content.push(new MenuItem({
    title: "Insert Example",
    label: "Example",
    enable(state) { return insertExample(schemaType)(state) },
    run: insertExample(schemaType)
  }))
}

export {exampleNodeSpec};
export {addExampleToMenu};