// A class representing a road with multiple lanes

  class Road {
    constructor(x, width, laneCount = 3) {
      this.x = x;
      this.width = width;
      this.laneCount = laneCount;
  
      this.left = x - width / 2;
      this.right = x + width / 2;
  
      // Extend road infinitely in y-direction
      this.top = -100000;    // large negative value
      this.bottom = 100000;  // large positive value
  
      const infinity = 100000;
      this.borders = [
        [ {x:this.left, y:this.top}, {x:this.left, y:this.bottom} ],
        [ {x:this.right, y:this.top}, {x:this.right, y:this.bottom} ]
      ];
    }
  
    getLaneCenter(laneIndex) {
      const laneWidth = this.width / this.laneCount;
      return this.left + laneWidth / 2 + Math.min(laneIndex, this.laneCount-1) * laneWidth;
    }
  
    draw(ctx) {
      ctx.lineWidth = 5;
      ctx.strokeStyle = "white";
  
      const laneWidth = this.width / this.laneCount;
  
      // Draw lanes
      for (let i = 1; i < this.laneCount; i++) {
        const x = this.left + i * laneWidth;
        ctx.setLineDash([20, 20]);
        ctx.beginPath();
        ctx.moveTo(x, this.top);
        ctx.lineTo(x, this.bottom);
        ctx.stroke();
      }
  
      // Draw road borders
      ctx.setLineDash([]);
      for (let border of this.borders) {
        ctx.beginPath();
        ctx.moveTo(border[0].x, border[0].y);
        ctx.lineTo(border[1].x, border[1].y);
        ctx.stroke();
      }
    }
  }
  