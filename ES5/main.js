'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  // global variables that keeps track of application states
  var paint = void 0,
      color = void 0,
      state = void 0,
      currentDrag = void 0;

  // draw vertical line over the canvas for each column
  var drawVerticalGridLines = function drawVerticalGridLines(ctx, columns) {
    // get canvas width and height
    var cw = ctx.canvas.width;
    var ch = ctx.canvas.height;

    for (var i = 0, len = columns; i < len; i++) {
      // calculate x coordinate of current row
      var x = cw / columns * i;

      // add half a pixel to the y value for real crisp 1px lines
      // source: http://usefulangle.com/post/17/html5-canvas-drawing-1px-crisp-straight-lines
      drawLine(ctx, x, 0, x, ch);
    }
  };

  // draw horizontal line over the canvas for each row
  var drawHorizontalGridLines = function drawHorizontalGridLines(ctx, rows) {
    // get canvas width and height
    var cw = ctx.canvas.width;
    var ch = ctx.canvas.height;

    for (var i = 0, len = rows; i < len; i++) {
      // calculate y coordinate of current row
      var y = ch / rows * i;

      // add half a pixel to the y value for real crisp 1px lines
      // source: http://usefulangle.com/post/17/html5-canvas-drawing-1px-crisp-straight-lines
      drawLine(ctx, 0, y, cw, y);
    }
  };

  // draw a line from (x1, y1) to (x2, y2)
  var drawLine = function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  // calculate the number of rows, so that the width and height of the cells in our grid are equal
  var calculateGridRows = function calculateGridRows(hfit, docWidth, docHeight) {
    // number of blocks we want to fit horizontally
    var numOfHorizonBlocks = hfit;

    // calculate the height of each block
    var blockHeight = docWidth / numOfHorizonBlocks;

    // calculate the amount of rows fit in the document
    var rows = Math.floor(docHeight / blockHeight);

    // return the amount of rows fit in the whole window
    return rows;
  };

  // create a 2 dimensional array that represents the grid state
  var createGridStateArray = function createGridStateArray(rows, columns) {
    state = [];
    for (var i = 0, len = columns; i < len; i++) {
      state.push([]);
      for (var j = 0, end = rows; j < end; j++) {
        state[i].push('white');
      }
    }
    return state;
  };

  // draw the grid on the canvas context, given the color state of each cell
  var drawGrid = function drawGrid(ctx, columns, rows, cellSize, state) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawVerticalGridLines(ctx, columns);
    drawHorizontalGridLines(ctx, rows);
    //colorSquares(ctx, cellSize, state);
  };

  // color the squares on the canvas according to their state, we're not using this function at the moment
  var colorSquares = function colorSquares(ctx, cellSize, state) {
    for (var col = 0, len = state.length; col < len; col++) {
      for (var row = 0, end = state[col].length; row < end; row++) {
        colorOneSquare(ctx, col, row, state[col][row], cellSize);
      }
    }
  };

  // color one square on the canvas according to its state
  var colorOneSquare = function colorOneSquare(ctx, x, y, color, size) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size + 0.5, y * size + 0.5, size - 1.5, size - 1.5);
  };

  // repaint the whole grid with active cells colored in, we're not using this function at the moment
  var render = function render(ctx, columns, rows, cellSize, state) {
    drawGrid(ctx, columns, rows, cellSize, state);
  };

  var getCurrentCoordinates = function getCurrentCoordinates(mouseEvent) {
    var x = mouseEvent.offsetX;
    var y = mouseEvent.offsetY;
    return [x, y];
  };
  // get the cel in the grid that was clicked
  var getCurrentCel = function getCurrentCel(mouseEvent, cellSize) {
    var _getCurrentCoordinate = getCurrentCoordinates(mouseEvent),
        _getCurrentCoordinate2 = _slicedToArray(_getCurrentCoordinate, 2),
        x = _getCurrentCoordinate2[0],
        y = _getCurrentCoordinate2[1];

    var col = Math.floor(x / cellSize);
    var row = Math.floor(y / cellSize);
    return [col, row];
  };

  // detect if the mouseEvent was a left mouse button
  var detectLeftButton = function detectLeftButton(event) {
    if ('buttons' in event) {
      return event.buttons === 1;
    } else if ('which' in event) {
      return event.which === 1;
    } else {
      return event.button === 1;
    }
  };

  // activate the colorpicker element
  var toggleColorPickerOn = function toggleColorPickerOn(e, $colorpicker) {
    if (!$colorpicker.hasClass("colorpicker--active")) $colorpicker.addClass("colorpicker--active");
    moveDOMElement(e, $colorpicker);
  };

  // deactivate the colorpicker element
  var toggleColorPickerOff = function toggleColorPickerOff($colorpicker) {
    if ($colorpicker.hasClass("colorpicker--active")) $colorpicker.removeClass("colorpicker--active");
  };

  // move DOM element to position of event
  var moveDOMElement = function moveDOMElement(e, $element) {
    var _getCurrentCoordinate3 = getCurrentCoordinates(e),
        _getCurrentCoordinate4 = _slicedToArray(_getCurrentCoordinate3, 2),
        x = _getCurrentCoordinate4[0],
        y = _getCurrentCoordinate4[1];

    $element.offset({ top: y, left: x });
  };

  // convert rgb to hex 
  // source: https://stackoverflow.com/questions/15716702/get-background-color-in-000-format-and-not-rgb
  var hexc = function hexc(colorval) {
    var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    delete parts[0];
    for (var i = 1; i <= 3; ++i) {
      parts[i] = parseInt(parts[i]).toString(16);
      if (parts[i].length == 1) parts[i] = '0' + parts[i];
    }
    color = '#' + parts.join('');

    return color;
  };

  var containsObject = function containsObject(array, obj) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].row === obj.row && array[i].col === obj.col) {
        return true;
      }
    }
    return false;
  };

  // initialize the canvas with proper eventListeners
  var init = function init() {
    paint = false;
    color = 'green';
    currentDrag = [];

    // get height and width of the document, using jQuery for cross browser consistency
    var docHeight = $(document).height();
    var docWidth = $(document).width();
    // set the number of columns
    var columns = 100;
    var rows = calculateGridRows(columns, docWidth, docHeight);
    var cellSize = docWidth / columns;

    // bind DOM elements to variables
    var canvas = document.getElementById('canvas');
    var $colorpicker = $("#colorpicker");

    // set the width and height of the canvas
    canvas.width = docWidth;
    canvas.height = rows * cellSize;

    // get the context and set it's variables
    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#ccc';

    // create 2 dimensional array to keep track of each cell in the grid
    state = createGridStateArray(rows, columns);

    // create grid in the context
    drawGrid(ctx, columns, rows, cellSize, state);

    // prevent the default context menu
    document.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });

    // hide color picker when the mouse leaves the element 
    $colorpicker.on('mouseleave', function () {
      return toggleColorPickerOff($colorpicker);
    });

    // show the color picker when we trigger the context menu on the canvas
    canvas.addEventListener("contextmenu", function (e) {
      toggleColorPickerOn(e, $colorpicker);
    });

    // set global color to the color that was clicked
    $colorpicker.on('click', '.color', function (e) {
      // get the clicked color, and convert to hex
      color = hexc($(this).css('background-color'));
      toggleColorPickerOff($colorpicker);
    });

    // paint on the clicked cell
    canvas.addEventListener('mousedown', function (e) {
      if (!detectLeftButton(e)) {
        return false;
      }
      // start painting
      paint = true;

      // get the clicked cell

      var _getCurrentCel = getCurrentCel(e, cellSize),
          _getCurrentCel2 = _slicedToArray(_getCurrentCel, 2),
          col = _getCurrentCel2[0],
          row = _getCurrentCel2[1];

      // if current cell state is equal to the curren chosen color, deactivate cell


      if (state[col][row] === color) {
        state[col][row] = 'white';
      } else {
        // else set the cell state to the chosen color
        state[col][row] = color;
      }
      currentDrag.push({ col: col, row: row });
      window.requestAnimationFrame(function () {
        colorOneSquare(ctx, col, row, state[col][row], cellSize);
      });
    });

    // paint to canvas if we're the mousebutton is held in
    canvas.addEventListener('mousemove', function (e) {
      if (paint === true) {
        var _getCurrentCel3 = getCurrentCel(e, cellSize),
            _getCurrentCel4 = _slicedToArray(_getCurrentCel3, 2),
            col = _getCurrentCel4[0],
            row = _getCurrentCel4[1];

        if (!containsObject(currentDrag, { col: col, row: row })) {
          state[col][row] = color;
          currentDrag.push({ col: col, row: row });
        }
        window.requestAnimationFrame(function () {
          colorOneSquare(ctx, col, row, state[col][row], cellSize);
        });
      }
    });

    // stop painting
    canvas.addEventListener('mouseup', function () {
      paint = false;
      currentDrag = [];
    });
  };

  init();
})();