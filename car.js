// Car class representing a vehicle in the simulation
class Car {
    constructor(x, y, width = 30, height = 50, controlType = "AI") {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.angle = 0;
      this.speed = 0;
      this.acceleration = 0.2;
      this.friction = 0.05;
      this.maxSpeed = 3;
      this.controls = new Controls(controlType);
      this.sensor = controlType === "AI" ? new Sensor(this) : null;
      this.brain = controlType === "AI" ? new NeuralNetwork([this.sensor.rayCount, 6, 4]) : null;
      this.polygon = [];
      this.updatePolygon();
      this.damaged = false;
    }
  
    update(roadBorders, traffic) {
      if (!this.damaged) {
        this.#move();
        this.updatePolygon();
        this.damaged = this.#assessDamage(roadBorders, traffic);
      }
      if (this.sensor) {
        this.sensor.update(roadBorders, traffic);
        const offsets = this.sensor.readings.map(s => s === null ? 0 : 1 - distance({x:this.x,y:this.y}, s)/this.sensor.rayLength);
        const output = NeuralNetwork.feedForward(offsets, this.brain);
        this.controls.forward = output[0];
        this.controls.left = output[1];
        this.controls.right = output[2];
        this.controls.reverse = output[3];
      }
    }
  
    #assessDamage(roadBorders, traffic) {
      for (let border of roadBorders) {
        if (polysIntersect(this.polygon, border)) return true;
      }
      for (let car of traffic) {
        if (polysIntersect(this.polygon, car.polygon)) return true;
      }
      return false;
    }
  
    #move() {
      if (this.controls.forward) this.speed += this.acceleration;
      if (this.controls.reverse) this.speed -= this.acceleration;
      if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
      if (this.speed < -this.maxSpeed/2) this.speed = -this.maxSpeed/2;
  
      if (this.speed > 0) this.speed -= this.friction;
      if (this.speed < 0) this.speed += this.friction;
      if (Math.abs(this.speed) < this.friction) this.speed = 0;
  
      if (this.speed !== 0) {
        const flip = this.speed > 0 ? 1 : -1;
        if (this.controls.left) this.angle += 0.03 * flip;
        if (this.controls.right) this.angle -= 0.03 * flip;
      }
  
      this.x -= Math.sin(this.angle) * this.speed;
      this.y -= Math.cos(this.angle) * this.speed;
    }
  
    updatePolygon() {
      const w = this.width;
      const h = this.height;
      const rad = Math.hypot(w, h)/2;
      const beta = Math.atan2(w,h);
      this.polygon = [
        {x: this.x - Math.sin(this.angle - beta)*rad, y: this.y - Math.cos(this.angle - beta)*rad},
        {x: this.x - Math.sin(this.angle + beta)*rad, y: this.y - Math.cos(this.angle + beta)*rad},
        {x: this.x - Math.sin(Math.PI + this.angle - beta)*rad, y: this.y - Math.cos(Math.PI + this.angle - beta)*rad},
        {x: this.x - Math.sin(Math.PI + this.angle + beta)*rad, y: this.y - Math.cos(Math.PI + this.angle + beta)*rad}
      ];
    }
  
    draw(ctx, color="blue") {
      ctx.fillStyle = this.damaged ? "gray" : color;
      ctx.beginPath();
      ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
      for (let point of this.polygon) ctx.lineTo(point.x, point.y);
      ctx.fill();
      if (this.sensor) this.sensor.draw(ctx);
    }
  }