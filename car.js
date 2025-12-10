// car.js
import Sensor from './sensor.js';
import NeuralNetwork from './network.js';

export default class Car {
  constructor(x, y, width, height, controlType = "AI", maxSpeed = 3) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = maxSpeed;
    this.friction = 0.06; // drag
    this.angle = 0;
    this.damaged = false;

    this.useBrain = controlType === "AI";
    this.controls = null;

    if (controlType !== "DUMMY") {
      this.sensor = new Sensor(this, 7, 160, Math.PI * 0.9);
      this.brain = new NeuralNetwork([this.sensor.rayCount, 8, 4]);
    }

    this.polygon = [];
    this.bestScore = 0;
    this.score = 0;
  }

  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders, traffic);
    }
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);
      // neural control
      if (this.useBrain) {
        const offsets = this.sensor.readings.map(
          s => s === null ? 0 : 1 - s.offset
        ); // normalized distance 0..1
        const outputs = NeuralNetwork.feedForward(offsets, this.brain);
        // outputs are binary from our Net: use them to control steering & speed
        this.controls = {
          left: outputs[0] === 1,
          right: outputs[1] === 1,
          forward: outputs[2] === 1,
          reverse: outputs[3] === 1
        };
      }
    }
  }

  #assessDamage(roadBorders, traffic) {
    for (const border of roadBorders) {
      if (polyIntersectsLine(this.polygon, border[0], border[1])) {
        return true;
      }
    }
    for (const other of traffic) {
      if (polysIntersect(this.polygon, other.polygon)) {
        return true;
      }
    }
    return false;
  }

  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
    });
    return points;
  }

  #move() {
    const controls = this.controls || {};
    if (controls.forward) this.speed += this.acceleration;
    if (controls.reverse) this.speed -= this.acceleration;

    if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
    if (this.speed < -this.maxSpeed / 2) this.speed = -this.maxSpeed / 2;

    if (this.speed > 0) this.speed -= this.friction;
    if (this.speed < 0) this.speed += this.friction;
    if (Math.abs(this.speed) < this.friction) this.speed = 0;

    if (this.speed !== 0) {
      const flip = this.speed > 0 ? 1 : -1;
      if (controls.left) this.angle += 0.03 * flip;
      if (controls.right) this.angle -= 0.03 * flip;
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;

    // update score by how far along y (smaller y is "forward")
    this.score += Math.abs(this.speed);
    if (this.score > this.bestScore) this.bestScore = this.score;
  }

  draw(ctx, color = "blue", drawSensor = true) {
    if (this.damaged) ctx.fillStyle = "gray";
    else ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    ctx.fill();

    if (this.sensor && drawSensor) {
      this.sensor.draw(ctx);
    }
  }
}

/* util: polygons intersection (basic) */
function polysIntersect(poly1, poly2) {
  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      const a1 = poly1[i];
      const a2 = poly1[(i + 1) % poly1.length];
      const b1 = poly2[j];
      const b2 = poly2[(j + 1) % poly2.length];
      if (lineIntersect(a1, a2, b1, b2)) return true;
    }
  }
  if (pointInPoly(poly1[0], poly2)) return true;
  if (pointInPoly(poly2[0], poly1)) return true;
  return false;
}

function lineIntersect(p1, p2, p3, p4) {
  const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (denom === 0) return false;
  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
  const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function pointInPoly(point, poly) {
  let x = point.x, y = point.y;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function polyIntersectsLine(poly, a, b) {
  for (let i = 0; i < poly.length; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % poly.length];
    if (lineIntersect(p1, p2, a, b)) return true;
  }
  return false;
}
