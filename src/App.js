import React, { Component } from 'react';
import logo from './logo.svg';
import { ExampleView } from './exampleview';

const {Schema, DOMParser} = require("prosemirror-model")
const {EditorView, Decoration, DecorationSet} = require("prosemirror-view")
const {EditorState, TextSelection, Plugin} = require("prosemirror-state")
const {schema} = require("prosemirror-schema-basic")
const {addListNodes} = require("prosemirror-schema-list")
const {exampleSetup} = require("prosemirror-example-setup")


class App extends Component {

  componentDidMount() {

    const nodes = addListNodes(schema.spec.nodes, "paragraph block*", "block");
    const demoSchema = new Schema({
      nodes: nodes.append({
        example: {
          attrs: { value: { default: 'toot toot tooot' }, bagelvalue: { default: 438 } },
          inline: false,
          draggable: true,
          selectable: true,
          atom: false,
          group: 'block',
          toDOM(node) {
            return ['div', { 'data-type': 'example', value: node.attrs.value }, ''];
          },
          parseDOM: [{
            // you could use my-element as a tag, but we want some additional features that come with the node view
            // the custom element would then completely take over the node and only communicate through its attributes
            tag: 'div[data-type=example]',
            getAttrs(dom) {
              return {};
            }
          }]
        }
      }),
      marks: schema.spec.marks
    });

    const node = demoSchema.node.bind(demoSchema);
    const text = demoSchema.text.bind(demoSchema);
    const example = demoSchema.nodes.example;
    const paragraph = demoSchema.nodes.paragraph;
    const heading = demoSchema.nodes.heading;

    let view = new EditorView(document.querySelector("#menu"), {
      state: EditorState.create({
        doc: node('doc', {}, [
          heading.create({}, [text('Test document')]),
          example.create({}, []),
          paragraph.create({}, [text('Some paragraph to drag after')])
        ]),
        plugins: exampleSetup({ schema: demoSchema }),
      }),
      nodeViews: {
        example: (node, nodeView, getPos) => new ExampleView(node, nodeView, getPos)
      }
    });
  }

  render() {
    return ([
      <div key='menu' id="menu"></div>,
      <div key='content' id="content"></div>
    ]);
  }
}

export default App;
