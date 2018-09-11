const uuid = require('uuid/v1');
require('./string')

class FieldManager {
  constructor() {
    this.expressionStore = {};
    this.fieldStore = {};
    this.fieldCounter = 0;
  }

  registerExpressionView(expressionView) {
    const id = uuid();
    this.expressionStore[id] = expressionView
    return id;
  }
  //TODO: perhaps just loop through all nodeviews and check if expression type?
  destroyExpressionView(id) {
    delete this.expressionStore[id]
  }
  updateExpressions() {
    for (let id in this.expressionStore) {
      let expressionView = this.expressionStore[id];
      expressionView.rerenderSelf()
    }
  }
  registerField(fieldValue) {
    const id = this.generateFieldID();
    this.fieldStore[id] = fieldValue;
    this.fieldCounter++;
    return id;
  }
  /*
   * Whenever any field is updated
   * update all [relevant] expressions
   */
  updateField(id, value) {
    this.fieldStore[id] = value;
    this.updateExpressions();
  }
  generateFieldID() {
    return "field" + this.fieldCounter;
  }
  parseFields(stringData) {
    // make a copy of stringData
    let result = stringData.substr(0)
    //TODO: make field search more performant (very very low priority)
    for(let fieldID in this.fieldStore) {
      const val = this.fieldStore[fieldID];
      result = result.replaceAll('#' + fieldID, val)
    }
    return result;
  }
}

let fieldManager = new FieldManager()

export {fieldManager}

