import {NodeSelection} from 'prosemirror-state'

const {MenuItem} = require("prosemirror-menu")
const math = require('mathjs')

export class ExpressionView {

  constructor(node, view, getPos, registerExpressionView, destroyExpressionView, parseFields) {
    this.node = node
    this.view = view
    this.getPos = getPos
    this.id = registerExpressionView(this)
    this.destroyExpressionView = destroyExpressionView;
    this.parseFields = parseFields;
    this.handleClick = this.handleClick.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)

    // The editor will use this as the node's DOM representation
    let dom = document.createElement("span")
    this.dom = dom
    this.node.dom = dom
    this.buildInnerDom(dom)
  }

  stopEvent() { return true }

  selectNode(arg) {
    if(this.input) {
      this.input.focus()
      this.input.select()
    } else {
      this.dom.className = 'ProseMirror-selectednode';
    }
  }

  buildInnerDom(dom) {
    if(this.node.attrs.condition === 'open') {
      // Set up the input element
      let input = document.createElement("input")
      this.input = input
      dom.appendChild(input)
      input.type = "text"
      input.value = this.node.attrs.value
      input.placeholder = "Enter expression"
      input.addEventListener("keydown", this.handleKeyDown)
    } else {
      // Set up the view for the evaluated expression
      let viewer = document.createElement("span")
      dom.appendChild(viewer)

      const initialVal = this.node.attrs.value
      let parsedVal = this.parseFields(initialVal)
      let evaluated = math.eval(parsedVal);
      viewer.innerHTML = evaluated
      viewer.style.color = "blue"
  
      dom.addEventListener("click", this.handleClick)
    }
  }

  replaceSelf() {
    // first, destroy children of this.dom
    while (this.dom.firstChild) {
      this.dom.removeChild(this.dom.firstChild);
    }
    this.buildInnerDom(this.dom)
  }

  destroy() {
    this.destroyExpressionView(this.id)
  }

  handleClick(e) {
    e.preventDefault();
    let resolvedPos = this.view.state.doc.resolve(this.getPos())
    let nodeSelection = new NodeSelection(resolvedPos)
    this.view.dispatch(
      this.view.state.tr
        .setNodeMarkup(this.getPos(), null, {
          condition: 'open',
          value: this.node.attrs.value
        })
        .setSelection(nodeSelection)
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
    condition: { default: 'open' } ,
    id: { default: '' },
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
      let expressionNode = schemaType.create({value: ''});
      dispatch(state.tr.replaceSelectionWith(expressionNode))
      let input = expressionNode.dom.querySelector('input')
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