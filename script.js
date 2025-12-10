// main script for self-driving car simulation

const canvas = document.getElementById("myCanvas");
canvas.width = 400;
canvas.height = 600;
const ctx = canvas.getContext("2d");

// Create road
const road = new Road(canvas.width / 2, canvas.height, 3);

// Traffic cars
const traffic = [];
for (let i = 0; i < 5; i++) {
  const lane = getRandomInt(0, road.laneCount - 1);
  const car = new Car(road.getLaneCenter(lane), canvas.height * 0.3 - i * 200, 30, 50, "KEYS");
  car.angle = 0;      // facing up
  car.speed = 2;      // traffic speed
  traffic.push(car);
}

// Single self-driving car, starts near bottom
const selfDrivingCar = new Car(road.getLaneCenter(1), canvas.height * 0.8, 30, 50, "AI");
if (localStorage.getItem("bestBrain")) {
  selfDrivingCar.brain = JSON.parse(localStorage.getItem("bestBrain"));
}

let animationId;
let aiMode = true;

function animate() {
  // Update traffic cars
  for (let car of traffic) {
    car.update(getRoadBorders(), traffic);
  }

  // Update AI car
  selfDrivingCar.update(getRoadBorders(), traffic);

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Save context for camera translation
  ctx.save();

  // Translate canvas so AI car stays ~80% down
  const translateY = -selfDrivingCar.y + canvas.height * 0.8;
  ctx.translate(0, translateY);

  // Draw road
  road.draw(ctx);

  // Draw traffic
  for (let car of traffic) car.draw(ctx, "red");

  // Draw AI car
  selfDrivingCar.draw(ctx, "blue");

  ctx.restore();

  animationId = requestAnimationFrame(animate);
}

animate();

// Utility: get road borders for collision detection
function getRoadBorders() {
  const borders = [];
  for (let i = 0; i <= road.laneCount; i++) {
    const x = road.left + i * road.laneWidth;
    borders.push([{ x, y: -10000 }, { x, y: 10000 }]);
  }
  return borders;
}

// UI buttons
document.getElementById("saveBrainBtn").onclick = () => {
  localStorage.setItem("bestBrain", JSON.stringify(selfDrivingCar.brain));
  alert("Best brain saved!");
};

document.getElementById("discardBrainBtn").onclick = () => {
  localStorage.removeItem("bestBrain");
  alert("Saved brain discarded!");
};

document.getElementById("aiMode").onchange = (e) => {
  aiMode = e.target.checked;
  selfDrivingCar.controls = new Controls(aiMode ? "AI" : "KEYS");
};

document.getElementById("startBtn").onclick = () => {
  if (!animationId) animate();
};

document.getElementById("pauseBtn").onclick = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
};
