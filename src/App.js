import React, { Component } from 'react';
import logo from './logo.svg';

const {Schema, DOMParser} = require("prosemirror-model")
const {EditorView, Decoration, DecorationSet} = require("prosemirror-view")
const {EditorState, TextSelection, Plugin} = require("prosemirror-state")
const {schema} = require("prosemirror-schema-basic")
const {addListNodes} = require("prosemirror-schema-list")
const {exampleSetup} = require("prosemirror-example-setup")

/*
EditorView = window.EditorView
state = window.state
new EditorView(document.querySelector(".full"), {state})
*/

class App extends Component {

  componentDidMount() {
    const demoSchema = new Schema({
      nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
      marks: schema.spec.marks
    })
    
    let state = EditorState.create({doc: DOMParser.fromSchema(demoSchema).parse(document.querySelector("#content")),
          plugins: exampleSetup({schema: demoSchema})})
    
    window.view = new EditorView(document.querySelector("#menu"), {state})
  }

  render() {
    return ([
      <div key='menu' id="menu"></div>,
      <div key='content' id="content"></div>
    ]);
  }
}

export default App;
