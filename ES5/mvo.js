'use strict';

var gridState = void 0;

var controller = {
  createGridStateArray: function createGridStateArray(rows, columns) {
    var state = [];
    for (var i = 0, len = columns; i < len; i++) {
      state.push([]);
      for (var j = 0, end = rows; j < end; j++) {
        state[i].push(false);
      }
    }
    return state;
  },
  getGridState: function getGridState() {
    return gridState;
  },
  getCellSize: function getCellSize() {
    return this.cellSize;
  },
  getRows: function getRows() {
    return this.rows;
  },
  getColumns: function getColumns() {
    return this.columns;
  },
  init: function init() {
    // set applicatoin state variables
    this.paint = false;
    this.color = 'green';

    // get height and width of the document, using jQuery for cross browser consistency
    this.docHeight = $(document).height();
    this.docWidth = $(document).width();
    // set the number of columns
    this.columns = 100;
    this.rows = calculateGridRows(columns, docWidth, docHeight);
    this.cellSize = docWidth / columns;

    gridState = this.createGridStateArray(rows, columns);
  }
};

var view = {
  init: function init() {
    // grab the canvas element in the DOM
    this.canvas = document.getElementById('canvas');

    var rows = controller.getRows();
    var columns = controller.getColumns();
    var cellSize = controller.getCellSize();

    // set the width and height of the canvas
    canvas.width = columns * cellSize;
    canvas.height = rows * cellSize;

    // get the context and set it's variables
    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#ccc';

    // create grid in the context
    drawGrid(ctx, columns, rows);
  },
  render: function render() {
    var gridState = controller.getGridState();
  }
};