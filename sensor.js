// sensor.js
import { lerp } from './utils.js';

export default class Sensor {
  constructor(car, rayCount = 5, rayLength = 150, raySpread = Math.PI / 2) {
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

  #getReading(ray, roadBorders, traffic) {
    const touches = [];

    for (const border of roadBorders) {
      const touch = getIntersection(
        ray[0], ray[1],
        border[0], border[1]
      );
      if (touch) touches.push(touch);
    }

    for (const car of traffic) {
      const poly = car.polygon;
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        const touch = getIntersection(ray[0], ray[1], a, b);
        if (touch) touches.push(touch);
      }
    }

    if (touches.length === 0) return null;
    const offsets = touches.map(t => t.offset);
    const minOffset = Math.min(...offsets);
    return touches.find(t => t.offset === minOffset);
  }

  #castRays() {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      const t = this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1);
      const angle = lerp(
        this.raySpread / 2,
        -this.raySpread / 2,
        t
      ) + this.car.angle;

      const start = { x: this.car.x, y: this.car.y };
      const end = {
        x: this.car.x - Math.sin(angle) * this.rayLength,
        y: this.car.y - Math.cos(angle) * this.rayLength
      };
      this.rays.push([start, end]);
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.rayCount; i++) {
      let end = this.rays[i][1];
      if (this.readings[i]) end = this.readings[i];

      // visible ray
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // unseen part
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,0,0.2)";
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(this.rays[i][1].x, this.rays[i][1].y);
      ctx.stroke();
    }
  }
}

/* helper: intersection between segment p1-p2 and p3-p4 */
function getIntersection(p1, p2, p3, p4) {
  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;
  const x4 = p4.x, y4 = p4.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (denom === 0) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1),
      offset: t
    };
  }
  return null;
}
