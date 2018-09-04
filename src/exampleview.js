export class ExampleView {
  constructor(node, view, getPos) {
    // The editor will use this as the node's DOM representation
    this.dom = document.createElement("input")
    this.dom.type = "text"
    this.dom.value = "bagelcake"
    this.dom.addEventListener("click", e => {
      console.log("You clicked me!")
      e.preventDefault()
    })
  }

  stopEvent() { return true }
}

