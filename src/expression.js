import {Transform} from 'prosemirror-transform'

const {MenuItem} = require("prosemirror-menu")
const math = require('mathjs')

export class ExpressionView {

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
        input.style.display = "none"
        viewer.style.display = ""
        state.condition = 'closed'

        console.log(view.state)
        debugger;
        view.dispatch(
          view.state.tr
            .delete(2, 4)
            .setMeta("bagelcakeMeta", true))
        // let {myState} = view.state.applyTransaction(tr)
        // view.updateState(myState)
      }
    })

    // Set up the view for the evaluated expression
    let viewer = document.createElement("span")
    dom.appendChild(viewer)
    viewer.style.display = "none"
    viewer.style.color = "blue"

    dom.addEventListener("click", e => {
      e.preventDefault();
      if(state.condition === 'closed') {
        viewer.style.display = "none"
        input.style.display = ""
        input.focus()
        input.select()
        state.condition = 'open'
      }
    })
  }

  stopEvent() { return true }

  update() {
    console.log('expression update')
  }
}

const expressionNodeSpec = {
  attrs: { 
    value: { default: 'toot toot tooot' },
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
      let proseNode = schemaType.create({value: '(6*7*9) ft in inches'});
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