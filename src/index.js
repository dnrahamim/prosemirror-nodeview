import registerServiceWorker from './registerServiceWorker';
import { ExpressionView, addExpressionToMenu, expressionNodeSpec } from './nodes/expression';
import { RangeView, addRangeToMenu, rangeNodeSpec } from './nodes/range';
import applyDevTools from "prosemirror-dev-tools";
import {fieldManager} from './util/fieldmanager'

const { Schema, DOMParser } = require("prosemirror-model")
const { EditorView } = require("prosemirror-view")
const { EditorState } = require("prosemirror-state")
const { schema } = require("prosemirror-schema-basic")
const { addListNodes } = require("prosemirror-schema-list")
const { exampleSetup, buildMenuItems } = require("prosemirror-example-setup")

const nodes = addListNodes(schema.spec.nodes, "paragraph block*", "block");
const demoSchema = new Schema({
  nodes: nodes.append({
    range: rangeNodeSpec,
    expression: expressionNodeSpec,
  }),
  marks: schema.spec.marks
});

const nodeViewSetup = {
  range: function (node, nodeView, getPos) {
    return new RangeView(node, nodeView, getPos, fieldManager)
  },
  expression: function (node, nodeView, getPos) {
    return new ExpressionView(node, nodeView, getPos, fieldManager)
  },
}

// Ask example-setup to build its basic menu
let menu = buildMenuItems(demoSchema)
addRangeToMenu(menu, demoSchema, fieldManager)
addExpressionToMenu(menu, demoSchema)
let content = document.querySelector("#content")
let startDoc = DOMParser.fromSchema(demoSchema).parse(content)

let view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: startDoc,
    // Pass exampleSetup our schema and the menu we created
    plugins: exampleSetup({ schema: demoSchema, menuContent: menu.fullMenu })
  }),
  nodeViews: nodeViewSetup
})
applyDevTools(view);

registerServiceWorker();
