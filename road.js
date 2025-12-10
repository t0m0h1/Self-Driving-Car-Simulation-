// A class representing a road with multiple lanes
class Road {
    constructor(x, width, laneCount = 3) {
      this.x = x;
      this.width = width;
      this.laneCount = laneCount;
      this.left = x - width/2;
      this.right = x + width/2;
      this.laneWidth = width / laneCount;
    }
  
    draw(ctx) {
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'white';
      for (let i = 1; i < this.laneCount; i++) {
        const x = this.left + i * this.laneWidth;
        ctx.setLineDash([20, 20]);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(this.left, 0);
      ctx.lineTo(this.left, ctx.canvas.height);
      ctx.moveTo(this.right, 0);
      ctx.lineTo(this.right, ctx.canvas.height);
      ctx.stroke();
    }
  
    getLaneCenter(laneIndex) {
      const lane = Math.min(laneIndex, this.laneCount - 1);
      return this.left + this.laneWidth/2 + lane*this.laneWidth;
    }
  }
  