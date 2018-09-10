import registerServiceWorker from './registerServiceWorker';
import { ExpressionView, addExpressionToMenu, expressionNodeSpec } from './nodes/expression';
import { RangeView, addRangeToMenu, rangeNodeSpec } from './nodes/range';
import { addDinosToMenu, dinoNodeSpec } from './nodes/dino';
import { selectionSizePlugin } from './plugins/selectionsize';
import { footnoteSpec, FootnoteView, addFootnoteToMenu } from './nodes/footnote';
import applyDevTools from "prosemirror-dev-tools";

const { Schema, DOMParser } = require("prosemirror-model")
const { EditorView } = require("prosemirror-view")
const { EditorState } = require("prosemirror-state")
const { schema } = require("prosemirror-schema-basic")
const { addListNodes } = require("prosemirror-schema-list")
const { exampleSetup, buildMenuItems } = require("prosemirror-example-setup")
const uuid = require('uuid/v1');

const nodes = addListNodes(schema.spec.nodes, "paragraph block*", "block");
const demoSchema = new Schema({
  nodes: nodes.append({
    range: rangeNodeSpec,
    expression: expressionNodeSpec,
    dino: dinoNodeSpec,
    footnote: footnoteSpec
  }),
  marks: schema.spec.marks
});



// use this later
let expressionStore = {};
let fieldStore = {};
let fieldCounter = 0;
function registerExpressionView(expressionView) {
  const id = uuid();
  expressionStore[id] = expressionView
  return id;
}
function destroyExpressionView(id) {
  delete expressionStore[id]
}
function updateExpressions() {
  for (let id in expressionStore) {
    let expressionView = expressionStore[id];
    expressionView.replaceSelf()
  }
}
function registerField(fieldValue) {
  const id = idGen();
  fieldStore[id] = fieldValue;
  fieldCounter++;
  return id;
}
/*
 * Whenever any field is updated
 * update all [relevant] expressions
 */
function updateField(id, value) {
  fieldStore[id] = value;
  updateExpressions();
}
function idGen() {
  return "field" + fieldCounter;
}
function parseFields(stringData) {
  const regex = /#(\S*)/g
  const found = stringData.match(regex) || []
  let result = stringData.substr(0)
  for(let i = 0; i < found.length; i++) {
    const id = found[i].substr(1);
    if(fieldStore.hasOwnProperty(id)) {
      const val = fieldStore[id];
      result = result.replace(found[i], val)
    }
  }
  return result;
}


const nodeViewSetup = {
  range: function (node, nodeView, getPos) {
    return new RangeView(node, nodeView, getPos, registerField, updateField)
  },
  expression: function (node, nodeView, getPos) {
    return new ExpressionView(node, nodeView, getPos, registerExpressionView, destroyExpressionView, parseFields)
  },
  footnote: function (node, view, getPos) { return new FootnoteView(node, view, getPos) }
}


// Ask example-setup to build its basic menu
let menu = buildMenuItems(demoSchema)
addDinosToMenu(menu, demoSchema)
addRangeToMenu(menu, demoSchema, registerField)
addExpressionToMenu(menu, demoSchema)
addFootnoteToMenu(menu, demoSchema)
let content = document.querySelector("#content")
let startDoc = DOMParser.fromSchema(demoSchema).parse(content)

let view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: startDoc,
    // Pass exampleSetup our schema and the menu we created
    plugins: exampleSetup({ schema: demoSchema, menuContent: menu.fullMenu })
      // .concat(selectionSizePlugin)
  }),
  nodeViews: nodeViewSetup
})
applyDevTools(view);

registerServiceWorker();
