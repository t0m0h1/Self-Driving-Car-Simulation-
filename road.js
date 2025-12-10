// road.js
export default class Road {
    constructor(x, width, laneCount = 3) {
      this.x = x;
      this.width = width;
      this.laneCount = laneCount;
  
      this.left = x - width / 2;
      this.right = x + width / 2;
  
      const infinity = 100000;
      this.top = -infinity;
      this.bottom = infinity;
  
      // create borders as two infinite lines (represented with two points each)
      const topLeft = { x: this.left, y: this.top };
      const topRight = { x: this.right, y: this.top };
      const bottomLeft = { x: this.left, y: this.bottom };
      const bottomRight = { x: this.right, y: this.bottom };
      this.borders = [
        [topLeft, bottomLeft],
        [topRight, bottomRight]
      ];
    }
  
    laneCenter(laneIndex) {
      const laneWidth = this.width / this.laneCount;
      const clamped = Math.max(0, Math.min(laneIndex, this.laneCount - 1));
      return this.left + laneWidth / 2 + clamped * laneWidth;
    }
  
    draw(ctx) {
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#bbbbbb";
      // draw road rectangle
      ctx.fillStyle = "#222";
      ctx.fillRect(this.left, this.top, this.width, this.bottom - this.top);
  
      // draw lane lines
      const laneWidth = this.width / this.laneCount;
      ctx.setLineDash([20, 20]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#888";
      for (let i = 1; i < this.laneCount; i++) {
        const x = this.left + i * laneWidth;
        ctx.beginPath();
        ctx.moveTo(x, -100000);
        ctx.lineTo(x, 100000);
        ctx.stroke();
      }
      ctx.setLineDash([]);
  
      // draw borders
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#fff";
      for (const border of this.borders) {
        ctx.beginPath();
        ctx.moveTo(border[0].x, border[0].y);
        ctx.lineTo(border[1].x, border[1].y);
        ctx.stroke();
      }
    }
  }
  