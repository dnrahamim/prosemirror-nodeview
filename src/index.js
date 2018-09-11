import registerServiceWorker from './registerServiceWorker';
import { ExpressionView, addExpressionToMenu, expressionNodeSpec } from './nodes/expression';
import { RangeView, addRangeToMenu, rangeNodeSpec } from './nodes/range';
import { addDinosToMenu, dinoNodeSpec } from './nodes/dino';
import { selectionSizePlugin } from './plugins/selectionsize';
import { footnoteSpec, FootnoteView, addFootnoteToMenu } from './nodes/footnote';
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
    dino: dinoNodeSpec,
    footnote: footnoteSpec
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
  footnote: function (node, view, getPos) { return new FootnoteView(node, view, getPos) }
}


// Ask example-setup to build its basic menu
let menu = buildMenuItems(demoSchema)
addDinosToMenu(menu, demoSchema)
addRangeToMenu(menu, demoSchema, fieldManager)
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
