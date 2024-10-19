# Simple Draw

A simple and intuitive drawing environment built with HTML5 Canvas and Vanilla JavaScript. With Simple Draw, users can create complex polygons, straight lines, squares, circles, and free-hand drawings. The tool allows users to change pencil size and color, clear the screen, undo and redo actions, and even save their drawings locally to the browser using local storage.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Saving and Loading](#saving-and-loading)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)

<img src="/assets/Simple-Draw.png" alt="app" />

## Features

- **Drawing Tools**:

  - Free-hand drawing
  - Straight lines
  - Squares and rectangles
  - Circles
  - Polygons

- **Customization Options**:
  - Pencil size control
  - Pencil color control
- **Editing Tools**:

  - Undo and redo functionality
  - Clear canvas

- **Saving and Loading**:

  - Save drawings locally to browser storage
  - Load previously saved drawings

  <img src="/assets/Simple-Draw-drawing.png" alt="drawing" />

## Installation

To use Simple Draw locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/RyanLarge13/Simple-Draw.git
   ```

2. Open the `index.html` file in your browser.

   That's it! No dependencies or build tools are required.

## Usage

Once you've opened the `index.html` file in your browser, you can start drawing immediately. Use the toolbar to switch between different shapes, change the pencil size or color, and manage the canvas.

- **Free Hand**: Click and drag to draw freehand on the canvas.
- **Straight Lines**: Select the line tool and click to start a line, then drag to finish.
- **Shapes**: Choose from squares, rectangles, circles, or polygons. Click and drag to draw.
- **Undo/Redo**: Use the undo and redo buttons to revert or restore recent actions.
- **Clear Canvas**: Click the "Clear" button to wipe the entire canvas clean.

## Saving and Loading

- **Save Drawing**: Click the "Save" button to store your current drawing in the browser's local storage. The paths of all your drawn shapes will be saved.
- **Load Drawing**: Click the "Load" button to restore the last saved drawing from local storage.

Note: Saved drawings are stored in the browser, so they will persist even if you refresh the page, but they will not carry over to other devices or browsers.

## Customization

You can adjust the pencil's size and color using the toolbar:

- **Size**: Choose different brush sizes to suit your drawing needs.
- **Color**: Use the color picker to select any color for your pencil.

## Contributing

If you would like to contribute to Simple Draw, feel free to fork the repository and submit a pull request. Contributions are always welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details. [MIT License](LICENSE)
