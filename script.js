// Import necessary classes
const canvas = document.getElementById("myCanvas");
canvas.width = 400;
canvas.height = 600;
const ctx = canvas.getContext("2d");

const road = new Road(canvas.width/2, 300, 3);
const traffic = [
  new Car(road.getLaneCenter(1), -100, 30, 50, "KEYS"),
  new Car(road.getLaneCenter(0), -300, 30, 50, "KEYS")
];

const N = 100;
const cars = [];
for (let i = 0; i < N; i++) {
  const car = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");
  if (localStorage.getItem("bestBrain")) {
    car.brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i !== 0) NeuralNetwork.mutate(car.brain, 0.1);
  }
  cars.push(car);
}

let animationId;
let aiMode = true;

function animate() {
  for (let car of traffic) car.update(getRoadBorders(), []);
  for (let car of cars) car.update(getRoadBorders(), traffic);

  canvas.height = canvas.height;

  road.draw(ctx);
  for (let car of traffic) car.draw(ctx, "red");
  
  const bestCar = cars.reduce((a,b) => (a.y < b.y ? a : b));
  ctx.globalAlpha = 0.2;
  for (let car of cars) car.draw(ctx, "blue");
  ctx.globalAlpha = 1;
  bestCar.draw(ctx, "blue");

  animationId = requestAnimationFrame(animate);
}

animate();

function getRoadBorders() {
  const borders = [];
  for (let i = 0; i <= road.laneCount; i++) {
    const x = road.left + i*road.laneWidth;
    borders.push([{x,y:0},{x,y:canvas.height}]);
  }
  return borders;
}

// UI buttons
document.getElementById("saveBrainBtn").onclick = () => {
  const bestCar = cars.reduce((a,b) => (a.y < b.y ? a : b));
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

document.getElementById("discardBrainBtn").onclick = () => {
  localStorage.removeItem("bestBrain");
}

document.getElementById("aiMode").onchange = (e) => {
  aiMode = e.target.checked;
  for (let car of cars) car.controls = new Controls(aiMode ? "AI" : "KEYS");
}
