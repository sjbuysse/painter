(function(){
  // global variables that keeps track of application states
  let paint, color, state, currentDrag;

  // draw vertical line over the canvas for each column
  const drawVerticalGridLines = (ctx, columns) => {
    // get canvas width and height
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    for(let i = 0, len = columns; i<len; i++) {
      // calculate x coordinate of current row
      const x = (cw/columns)*i;

      // add half a pixel to the y value for real crisp 1px lines
      // source: http://usefulangle.com/post/17/html5-canvas-drawing-1px-crisp-straight-lines
      drawLine(ctx, x, 0, x, ch);
    }
  }

  // draw horizontal line over the canvas for each row
  const drawHorizontalGridLines = (ctx, rows) => {
    // get canvas width and height
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    for(let i = 0, len = rows; i<len; i++) {
      // calculate y coordinate of current row
      const y = (ch/rows)*i;

      // add half a pixel to the y value for real crisp 1px lines
      // source: http://usefulangle.com/post/17/html5-canvas-drawing-1px-crisp-straight-lines
      drawLine(ctx, 0, y, cw, y);
    }
  }

  // draw a line from (x1, y1) to (x2, y2)
  const drawLine = (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
  }

  // calculate the number of rows, so that the width and height of the cells in our grid are equal
  const calculateGridRows = (hfit, docWidth, docHeight) => {
    // number of blocks we want to fit horizontally
    const numOfHorizonBlocks = hfit;

    // calculate the height of each block
    const blockHeight = docWidth/numOfHorizonBlocks;

    // calculate the amount of rows fit in the document
    const rows = Math.floor(docHeight/blockHeight);

    // return the amount of rows fit in the whole window
    return rows;
  }

  // create a 2 dimensional array that represents the grid state
  const createGridStateArray = (rows, columns) => {
    state = [];
    for(let i = 0, len = columns; i<len; i++) {
      state.push([]);
      for(let j = 0, end = rows; j<end; j++) {
        state[i].push('white');
      }
    }
    return state;
  }

  // draw the grid on the canvas context, given the color state of each cell
  const drawGrid = (ctx, columns, rows, cellSize, state) => {
    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
    drawVerticalGridLines(ctx, columns);
    drawHorizontalGridLines(ctx, rows);
    //colorSquares(ctx, cellSize, state);
  }

  // color the squares on the canvas according to their state, we're not using this function at the moment
  const colorSquares = (ctx, cellSize, state) => {
    for(let col = 0, len = state.length; col<len; col++){
      for(let row = 0, end = state[col].length; row<end; row++){
        colorOneSquare(ctx, col, row, state[col][row], cellSize);
      }
    }
  }
  
  // color one square on the canvas according to its state
  const colorOneSquare = (ctx, x, y, color, size) => {
    ctx.fillStyle = color;
    ctx.fillRect(x*size+0.5,y*size+0.5,size-1.5,size-1.5);
  }

  // repaint the whole grid with active cells colored in, we're not using this function at the moment
  const render = (ctx, columns, rows, cellSize, state) => {
    drawGrid(ctx, columns, rows, cellSize, state);
  }

  const getCurrentCoordinates = (mouseEvent) => {
    const x = mouseEvent.offsetX;
    const y = mouseEvent.offsetY;
    return [x,y];
  }
  // get the cel in the grid that was clicked
  const getCurrentCel = (mouseEvent, cellSize) => {
    const [x,y] = getCurrentCoordinates(mouseEvent);
    const col = Math.floor(x/cellSize);
    const row = Math.floor(y/cellSize);
    return [col, row];
  };
  
  // detect if the mouseEvent was a left mouse button
  const detectLeftButton = (event) => {
      if ('buttons' in event) {
          return event.buttons === 1;
      } else if ('which' in event) {
          return event.which === 1;
      } else {
          return event.button === 1;
      }
  };

  // activate the colorpicker element
  const toggleColorPickerOn = (e, $colorpicker) => {
    if(!$colorpicker.hasClass("colorpicker--active"))
      $colorpicker.addClass("colorpicker--active");
    moveDOMElement(e, $colorpicker);
  }

  // deactivate the colorpicker element
  const toggleColorPickerOff = ($colorpicker) => {
    if($colorpicker.hasClass("colorpicker--active"))
      $colorpicker.removeClass("colorpicker--active");
  }

  // move DOM element to position of event
  const moveDOMElement = (e, $element) => {
    const [x,y] = getCurrentCoordinates(e);
    $element.offset({top: y, left: x});
  }

  // convert rgb to hex 
  // source: https://stackoverflow.com/questions/15716702/get-background-color-in-000-format-and-not-rgb
  const hexc = (colorval) => {
      var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      delete(parts[0]);
      for (var i = 1; i <= 3; ++i) {
          parts[i] = parseInt(parts[i]).toString(16);
          if (parts[i].length == 1) parts[i] = '0' + parts[i];
      }
      color = '#' + parts.join('');

      return color;
  }

  const containsObject = (array, obj) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i].row === obj.row && array[i].col === obj.col) {
            return true;
        }
    }
    return false;
  }

  // initialize the canvas with proper eventListeners
  const init = () => {
    paint = false;
    color = 'green';
    currentDrag = [];

    // get height and width of the document, using jQuery for cross browser consistency
    const docHeight = $(document).height();
    const docWidth = $(document).width();
    // set the number of columns
    const columns = 100;
    const rows = calculateGridRows(columns, docWidth, docHeight);
    const cellSize = docWidth/columns;

    // bind DOM elements to variables
    const canvas =  document.getElementById('canvas');
    const $colorpicker = $("#colorpicker");

    // set the width and height of the canvas
    canvas.width = docWidth;
    canvas.height = rows * cellSize;

    // get the context and set it's variables
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#ccc';

    // create 2 dimensional array to keep track of each cell in the grid
    state = createGridStateArray(rows, columns);

    // create grid in the context
    drawGrid(ctx, columns, rows, cellSize, state);

    // prevent the default context menu
    document.addEventListener( "contextmenu", function(e) {
      e.preventDefault();
    });

    // hide color picker when the mouse leaves the element 
    $colorpicker.on('mouseleave', () => toggleColorPickerOff($colorpicker))

    // show the color picker when we trigger the context menu on the canvas
    canvas.addEventListener( "contextmenu", function(e) {
      toggleColorPickerOn(e, $colorpicker);
    });

    // set global color to the color that was clicked
    $colorpicker.on('click', '.color', function(e){
      // get the clicked color, and convert to hex
      color = hexc($(this).css('background-color'));
      toggleColorPickerOff($colorpicker);
    })

    // paint on the clicked cell
    canvas.addEventListener('mousedown', (e) => {
      if(!detectLeftButton(e)){
        return false;
      }
      // start painting
      paint = true;

      // get the clicked cell
      const [col, row] = getCurrentCel(e, cellSize);

      // if current cell state is equal to the curren chosen color, deactivate cell
      if(state[col][row] === color) { 
        state[col][row] = 'white';
      } else {
        // else set the cell state to the chosen color
        state[col][row] = color;
      } 
      currentDrag.push({col: col, row: row});
      window.requestAnimationFrame(function() {colorOneSquare(ctx, col, row, state[col][row], cellSize);})
    });

    // paint to canvas if we're the mousebutton is held in
    canvas.addEventListener('mousemove', (e) => {
      if(paint === true) {
        const [col, row] = getCurrentCel(e, cellSize);
        if(!containsObject(currentDrag, {col: col, row: row})){
          state[col][row] = color;
          currentDrag.push({col: col, row: row});
        }
      window.requestAnimationFrame(function() {colorOneSquare(ctx, col, row, state[col][row], cellSize);})
      }
    });

    // stop painting
    canvas.addEventListener('mouseup', () => {
      paint = false;
      currentDrag = [];
    })
  }

  init();
})();

