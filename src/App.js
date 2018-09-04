import React, { Component } from 'react';
import logo from './logo.svg';
import { ExampleView, addExampleToMenu, exampleNodeSpec } from './exampleview';
import { addDinosToMenu, dinoNodeSpec } from './dinomodule';

const {Schema, DOMParser} = require("prosemirror-model")
const {EditorView, Decoration, DecorationSet} = require("prosemirror-view")
const {EditorState, TextSelection, Plugin} = require("prosemirror-state")
const {schema} = require("prosemirror-schema-basic")
const {addListNodes} = require("prosemirror-schema-list")
const {exampleSetup, buildMenuItems} = require("prosemirror-example-setup")

class App extends Component {

  componentDidMount() {

    const nodes = addListNodes(schema.spec.nodes, "paragraph block*", "block");
    const demoSchema = new Schema({
      nodes: nodes.append({
        example: exampleNodeSpec,
        dino: dinoNodeSpec
      }),
      marks: schema.spec.marks
    });

    // Ask example-setup to build its basic menu
    let menu = buildMenuItems(demoSchema)
    addDinosToMenu(menu, demoSchema)
    addExampleToMenu(menu, demoSchema)
    let content = document.querySelector("#content")
    let startDoc = DOMParser.fromSchema(demoSchema).parse(content)

    window.view = new EditorView(document.querySelector("#menu"), {
      state: EditorState.create({
        doc: startDoc,
        // Pass exampleSetup our schema and the menu we created
        plugins: exampleSetup({schema: demoSchema, menuContent: menu.fullMenu})
      }),
      nodeViews: {
        example: (node, nodeView, getPos) => new ExampleView(node, nodeView, getPos)
      }
    })
  }

  render() {
    return ([
      <div key='menu' id="menu"></div>,
      <div key='content' id="content" style={{"display": "none"}}>
        <h1>howdy all</h1>
        doop doop doop<br/>
        here is some text<br/>
        enjoy the text please!
      </div>
    ]);
  }
}

export default App;
