import registerServiceWorker from './registerServiceWorker';

import logo from './logo.svg';
import { ExpressionView, addExpressionToMenu, expressionNodeSpec } from './expression';
import { addDinosToMenu, dinoNodeSpec } from './dinomodule';
import { selectionSizePlugin } from './plugins/selectionsize';
import './App.css'

const {Schema, DOMParser} = require("prosemirror-model")
const {EditorView, Decoration, DecorationSet} = require("prosemirror-view")
const {EditorState, TextSelection, Plugin} = require("prosemirror-state")
const {schema} = require("prosemirror-schema-basic")
const {addListNodes} = require("prosemirror-schema-list")
const {exampleSetup, buildMenuItems} = require("prosemirror-example-setup")


    const nodes = addListNodes(schema.spec.nodes, "paragraph block*", "block");
    const demoSchema = new Schema({
      nodes: nodes.append({
        expression: expressionNodeSpec,
        dino: dinoNodeSpec
      }),
      marks: schema.spec.marks
    });

    // Ask example-setup to build its basic menu
    let menu = buildMenuItems(demoSchema)
    addDinosToMenu(menu, demoSchema)
    addExpressionToMenu(menu, demoSchema)
    let content = document.querySelector("#content")
    let startDoc = DOMParser.fromSchema(demoSchema).parse(content)

    window.view = new EditorView(document.querySelector("#editor"), {
      state: EditorState.create({
        doc: startDoc,
        // Pass exampleSetup our schema and the menu we created
        plugins: exampleSetup({schema: demoSchema, menuContent: menu.fullMenu})
                  .concat(selectionSizePlugin)
      }),
      nodeViews: {
        expression: (node, nodeView, getPos) => new ExpressionView(node, nodeView, getPos)
      }
    })

registerServiceWorker();
