const {MenuItem} = require("prosemirror-menu")
const math = require('mathjs')

export class ExpressionView {

  constructor(node, view, getPos) {
    this.node = node
    this.view = view
    this.getPos = getPos
    // this.update = this.update.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)

    this.buildDom()
  }

  stopEvent() { return true }

  update() {
    console.log('expression update')
  }

  buildDom() {
    // The editor will use this as the node's DOM representation
    let dom = document.createElement("span")
    this.dom = dom
    dom.style = 'border-color: blue'
    this.node.dom = dom

    if(this.node.attrs.condition === 'open') {
      // Set up the input element
      let input = document.createElement("input")
      this.input = input
      dom.appendChild(input)
      input.type = "text"
      input.value = this.node.attrs.value
      input.placeholder = "Enter expression"
      input.focus()
      input.select()
      input.addEventListener("keydown", this.handleKeyDown)
    } else {
      // Set up the view for the evaluated expression
      let viewer = document.createElement("span")
      dom.appendChild(viewer)

      let evaluated = math.eval(this.node.attrs.value);
      viewer.innerHTML = evaluated
      viewer.style.color = "blue"
  
      dom.addEventListener("click", this.handleClick)
    }
  }

  handleClick(e) {
    e.preventDefault();
    this.view.dispatch(
      this.view.state.tr
        .setNodeMarkup(this.getPos(), null, {
          condition: 'open',
          value: this.node.attrs.value
        })
    )
  }

  handleKeyDown(e) {
    if(e.keyCode === 13) {
      this.view.dispatch(
        this.view.state.tr
          .setNodeMarkup(this.getPos(), null, {
            condition: 'closed',
            value: this.input.value
          })
      )
    }
  }
}

const expressionNodeSpec = {
  attrs: { 
    value: { default: '' },
    condition: { default: 'open' } 
  },
  inline: true,
  group: "inline",
  draggable: true,
  toDOM(node) {
    return ['div', { 'data-type': 'expression', 'value': node.attrs.value }, ''];
  },
  parseDOM: [{
    // you could use my-element as a tag, but we want some additional features that come with the node view
    // the custom element would then completely take over the node and only communicate through its attributes
    tag: 'div[data-type=expression]',
    getAttrs(dom) {
      return {};
    }
  }]
}

function insertExpression(schemaType) {
  return function(state, dispatch) {
    let {$from} = state.selection, index = $from.index()
    if (!$from.parent.canReplaceWith(index, index, schemaType))
      return false
    if (dispatch) {
      let proseNode = schemaType.create({value: ''});
      dispatch(state.tr.replaceSelectionWith(proseNode))
      let input = proseNode.dom.querySelector('input')
      input.focus()
      input.select()
    }
    return true
  }
}

function addExpressionToMenu(menu, schema) {
  const schemaType = schema.nodes.expression;
  // Add a dino-inserting item for each type of dino
  menu.insertMenu.content.push(new MenuItem({
    title: "Insert Expression",
    label: "Expression",
    enable(state) { return insertExpression(schemaType)(state) },
    run: insertExpression(schemaType)
  }))
}

export {expressionNodeSpec};
export {addExpressionToMenu};