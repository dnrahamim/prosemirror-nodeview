const {MenuItem} = require("prosemirror-menu")

export class RangeView {

  constructor(node, view, getPos, fieldManager) {
    this.node = node
    this.view = view
    this.getPos = getPos
    this.fieldManager = fieldManager;
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)

    this.buildDom()
  }

  stopEvent() { return true }

  buildDom() {
    // The editor will use this as the node's DOM representation
    let dom = document.createElement("span")
    this.dom = dom
    this.node.dom = dom

    // Set up the range element
    let range = document.createElement("input")
    this.range = range
    range.type="range"
    range.min="1"
    range.max="100"
    range.value = this.node.attrs.value || '50'
    this.fieldManager.updateField(this.node.attrs.id, range.value)
    range.oninput = this.handleInputChange;
    dom.appendChild(range)
    range.addEventListener("mouseup", this.handleMouseUp)
  }

  handleInputChange(e) {
    this.fieldManager.updateField(this.node.attrs.id, this.range.value)
  }

  handleMouseUp(e) {
    e.preventDefault();
    this.view.dispatch(
      this.view.state.tr
        .setNodeMarkup(this.getPos(), null, {
          value: this.range.value,
          id: this.node.attrs.id
        })
    )
  }


}

const rangeNodeSpec = {
  attrs: { 
    value: { default: '' },
    id: { default: '' }
  },
  inline: true,
  group: "inline",
  draggable: false,
  toDOM(node) {
    return ['div', { 'data-type': 'range', 'value': node.attrs.value }, ''];
  },
  parseDOM: [{
    // you could use my-element as a tag, but we want some additional features that come with the node view
    // the custom element would then completely take over the node and only communicate through its attributes
    tag: 'div[data-type=range]',
    getAttrs(dom) {
      return {};
    }
  }]
}

function insertRange(schemaType, fieldManager) {
  return function(state, dispatch) {
    let {$from} = state.selection, index = $from.index()
    if (!$from.parent.canReplaceWith(index, index, schemaType))
      return false
    if (dispatch) {
      let value = ''
      let rangeNode = schemaType.create({
        value: value,
        id: fieldManager.registerField(value)
      });
      dispatch(state.tr.replaceSelectionWith(rangeNode))
    }
    return true
  }
}

function addRangeToMenu(menu, schema, fieldManager) {
  const schemaType = schema.nodes.range;
  // Add a dino-inserting item for each type of dino
  menu.insertMenu.content.push(new MenuItem({
    title: "Insert Range",
    label: "Range",
    enable(state) { return insertRange(schemaType, fieldManager)(state) },
    run: insertRange(schemaType, fieldManager)
  }))
}

export {rangeNodeSpec};
export {addRangeToMenu};