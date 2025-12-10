// controls.js
export default class Controls {
    constructor() {
      this.forward = false;
      this.left = false;
      this.right = false;
      this.reverse = false;
  
      this.#addKeyboardListeners();
    }
  
    #addKeyboardListeners() {
      document.onkeydown = (e) => {
        switch (e.key) {
          case "ArrowLeft":
          case "a":
          case "A":
            this.left = true;
            break;
          case "ArrowRight":
          case "d":
          case "D":
            this.right = true;
            break;
          case "ArrowUp":
          case "w":
          case "W":
            this.forward = true;
            break;
          case "ArrowDown":
          case "s":
          case "S":
            this.reverse = true;
            break;
        }
      };
      document.onkeyup = (e) => {
        switch (e.key) {
          case "ArrowLeft":
          case "a":
          case "A":
            this.left = false;
            break;
          case "ArrowRight":
          case "d":
          case "D":
            this.right = false;
            break;
          case "ArrowUp":
          case "w":
          case "W":
            this.forward = false;
            break;
          case "ArrowDown":
          case "s":
          case "S":
            this.reverse = false;
            break;
        }
      };
    }
  }
  