// Import necessary classes
const canvas = document.getElementById("myCanvas");
canvas.width = 400;
canvas.height = 600;
const ctx = canvas.getContext("2d");

const road = new Road(canvas.width/2, 300, 3);

// Generate traffic cars
const traffic = [];
for (let i = 0; i < 5; i++) {
  const lane = getRandomInt(0, road.laneCount - 1);
  const car = new Car(road.getLaneCenter(lane), -150 - i * 150, 30, 50, "KEYS");
  car.speed = 2; // constant forward speed
  traffic.push(car);
}

// Single self-driving car
const selfDrivingCar = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");
if (localStorage.getItem("bestBrain")) {
  selfDrivingCar.brain = JSON.parse(localStorage.getItem("bestBrain"));
}

let animationId;
let aiMode = true;

function animate() {
  // Move traffic cars
  for (let car of traffic) {
    car.y += car.speed;
    car.updatePolygon();
  }

  // Update self-driving car
  selfDrivingCar.update(getRoadBorders(), traffic);

  // Clear canvas
  canvas.height = canvas.height;

  // Draw road
  road.draw(ctx);

  // Draw traffic
  for (let car of traffic) car.draw(ctx, "red");

  // Draw self-driving car
  selfDrivingCar.draw(ctx, "blue");

  // Center camera on self-driving car
  ctx.save();
  ctx.translate(0, -selfDrivingCar.y + canvas.height * 0.7);
  animationId = requestAnimationFrame(animate);
  ctx.restore();
}

animate();

// Utility to generate road borders for collision detection
function getRoadBorders() {
  const borders = [];
  for (let i = 0; i <= road.laneCount; i++) {
    const x = road.left + i*road.laneWidth;
    borders.push([{x, y: 0}, {x, y: canvas.height*2}]);
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

// Start/Pause buttons
document.getElementById("startBtn").onclick = () => {
  if (!animationId) animate();
};

document.getElementById("pauseBtn").onclick = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
};
