// Ray casting sensor for a car simulation
class Sensor {
    constructor(car, rayCount = 5, rayLength = 100, raySpread = Math.PI/2) {
      this.car = car;
      this.rayCount = rayCount;
      this.rayLength = rayLength;
      this.raySpread = raySpread;
      this.rays = [];
      this.readings = [];
    }
  
    update(roadBorders, traffic) {
      this.#castRays();
      this.readings = [];
      for (let i = 0; i < this.rays.length; i++) {
        this.readings.push(this.#getReading(this.rays[i], roadBorders, traffic));
      }
    }
  
    #castRays() {
      this.rays = [];
      for (let i = 0; i < this.rayCount; i++) {
        const rayAngle = lerp(
          this.raySpread/2,
          -this.raySpread/2,
          this.rayCount === 1 ? 0.5 : i/(this.rayCount-1)
        ) + this.car.angle;
        const start = { x: this.car.x, y: this.car.y };
        const end = {
          x: this.car.x - Math.sin(rayAngle)*this.rayLength,
          y: this.car.y - Math.cos(rayAngle)*this.rayLength
        };
        this.rays.push([start, end]);
      }
    }
  
    #getReading(ray, roadBorders, traffic) {
      let touches = [];
      // borders
      for (let border of roadBorders) {
        const pt = getIntersection(ray[0], ray[1], border[0], border[1]);
        if (pt) touches.push(pt);
      }
      // traffic
      for (let car of traffic) {
        const poly = car.polygon;
        for (let i = 0; i < poly.length; i++) {
          const pt = getIntersection(ray[0], ray[1], poly[i], poly[(i+1)%poly.length]);
          if (pt) touches.push(pt);
        }
      }
      if (touches.length === 0) return null;
      const offsets = touches.map(t => distance(ray[0], t));
      const minOffset = Math.min(...offsets);
      return touches.find(t => distance(ray[0], t) === minOffset);
    }
  
    draw(ctx) {
      for (let i = 0; i < this.rays.length; i++) {
        let end = this.readings[i] || this.rays[i][1];
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'yellow';
        ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    }
  }
  