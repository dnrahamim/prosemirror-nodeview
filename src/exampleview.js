const {MenuItem} = require("prosemirror-menu")
const math = require('mathjs')

export class ExampleView {

  constructor(node, view, getPos) {
    let state = {
      condition: 'open'
    }
    this.state = state;

    // The editor will use this as the node's DOM representation
    let dom = document.createElement("span")
    dom.style = 'border-color: blue'
    this.dom = dom
    node.dom = dom

    // Set up the input element
    let input = document.createElement("input")
    dom.appendChild(input)
    input.type = "text"
    input.placeholder = "Enter expression"
    input.addEventListener("keydown", e => {
      if(e.keyCode === 13) {
        let evaluated = math.eval(input.value);
        viewer.innerHTML = evaluated
        input.style = "display: none"
        viewer.style = ""
        state.condition = 'closed'
      }
    })

    // Set up the view for the evaluated expression
    let viewer = document.createElement("span")
    dom.appendChild(viewer)
    viewer.style = "display: none"

    dom.addEventListener("click", e => {
      e.preventDefault();
      if(state.condition === 'closed') {
        viewer.style = "display: none"
        input.style = ""
        input.focus()
        input.select()
        state.condition = 'open'
      }
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
      let proseNode = schemaType.create({value: 'here is a data-type baby'});
      dispatch(state.tr.replaceSelectionWith(proseNode))
      let input = proseNode.dom.querySelector('input')
      input.focus()
      input.select()
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