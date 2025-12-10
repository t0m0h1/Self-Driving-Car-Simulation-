// script.js (main)
import Road from './road.js';
import Car from './car.js';
import Controls from './controls.js';
import NeuralNetwork from './network.js';
import { lerp } from './utils.js';

const canvas = document.getElementById("simCanvas");
canvas.width = innerWidth;
canvas.height = innerHeight;
const ctx = canvas.getContext("2d");

const road = new Road(canvas.width / 2, canvas.width * 0.9, 3);
const N = 80; // population
let generation = 0;
let bestScore = 0;
let savedBrain = JSON.parse(localStorage.getItem("bestBrain") || "null");

let cars = generateCars(N);
let traffic = createTraffic();

let animationId = null;
let running = false;

const startPauseBtn = document.getElementById("startPauseBtn");
const saveBtn = document.getElementById("saveBtn");
const discardBtn = document.getElementById("discardBtn");
const aiToggle = document.getElementById("aiToggle");
const generationLabel = document.getElementById("generation");
const bestLabel = document.getElementById("bestScore");

startPauseBtn.onclick = () => {
  if (running) {
    stop();
  } else {
    start();
  }
};

saveBtn.onclick = () => {
  const best = getBestCar();
  if (!best) return;
  localStorage.setItem("bestBrain", JSON.stringify(best.brain));
  alert("Best brain saved to localStorage.");
};

discardBtn.onclick = () => {
  localStorage.removeItem("bestBrain");
  savedBrain = null;
  alert("Saved brain removed.");
};

aiToggle.onchange = () => {
  // toggle AI/manual for the first car (player)
  // if unchecked, let first car be manually controlled
  if (!aiToggle.checked) {
    // turn the first car into manual player
    cars[0].useBrain = false;
    cars[0].controls = new Controls();
  } else {
    cars[0].useBrain = true;
    cars[0].controls = null;
  }
};

function start() {
  running = true;
  startPauseBtn.textContent = "Pause";
  animate();
}

function stop() {
  running = false;
  startPauseBtn.textContent = "Start";
  if (animationId) cancelAnimationFrame(animationId);
}

function generateCars(N) {
  const arr = [];
  for (let i = 0; i < N; i++) {
    const car = new Car(road.laneCenter(1), canvas.height - 150, 30, 50, "AI", 3.2);
    if (i === 0 && savedBrain === null) { // first car as manual if no saved brain
      car.useBrain = false;
      car.controls = new Controls();
    }
    // load saved brain if there is one
    if (savedBrain) {
      car.brain = JSON.parse(JSON.stringify(savedBrain));
      // convert to NeuralNetwork object
      car.brain = reviveNetwork(car.brain);
      if (i !== 0) NeuralNetwork.mutate(car.brain, 0.15);
    }
    arr.push(car);
  }
  return arr;
}

function reviveNetwork(obj) {
  // obj has levels as in network.js - rebuild objects
  const net = new NeuralNetwork([1]); // dummy
  net.levels = obj.levels.map(l => {
    const level = {
      inputs: new Array(l.inputs.length),
      outputs: new Array(l.outputs.length),
      biases: l.biases.slice(),
      weights: l.weights.map(w => w.slice())
    };
    return level;
  });
  return net;
}

function createTraffic() {
  // some dummy traffic cars driving downwards
  const t = [];
  const lanes = road.laneCount;
  const laneCenters = [];
  for (let i = 0; i < lanes; i++) laneCenters.push(road.laneCenter(i));
  // place a few at intervals
  for (let i = 0; i < 6; i++) {
    const car = new Car(laneCenters[i % lanes], -i * 250 - 200, 30, 50, "DUMMY", 2);
    car.speed = 2;
    car.angle = 0;
    car.polygon = car.#createPolygon?.() ?? [{
      x: car.x - 15, y: car.y - 25
    }];
    // we need to give polygon correctly; call update once
    car.useBrain = false;
    car.controls = { forward: true };
    // override move to go forward downwards
    car.update = function (roadBorders, traffic) {
      // simple movement: constant forward speed towards +y (downwards)
      this.y += this.speed;
      this.polygon = this.#createPolygon();
    };
    t.push(car);
  }
  return t;
}

function animate(time) {
  // update
  for (const tcar of traffic) {
    tcar.update(road.borders, []); // traffic doesn't collide with each other in our simple world
  }

  for (const car of cars) {
    car.update(road.borders, traffic);
  }

  // compute best by score and not damaged
  const bestCar = getBestCar();
  if (bestCar && bestCar.score > bestScore) bestScore = Math.round(bestCar.score);

  // if all cars are damaged -> next generation
  if (cars.every(c => c.damaged)) {
    nextGeneration();
  }

  // render
  canvas.height = innerHeight; // resets transform
  ctx.save();
  // translate so best car is near bottom center of screen
  const translateX = -bestCar?.x + canvas.width / 2;
  const translateY = -bestCar?.y + canvas.height * 0.7;
  ctx.translate(translateX, translateY);

  road.draw(ctx);

  for (const tcar of traffic) {
    tcar.draw(ctx, "red", false);
  }

  // draw all AI cars with low alpha so we can see best
  ctx.globalAlpha = 0.2;
  for (const car of cars) {
    car.draw(ctx, "blue", false);
  }
  ctx.globalAlpha = 1;

  // draw best car normally and show sensors
  if (bestCar) {
    bestCar.draw(ctx, "blue", true);
  }

  ctx.restore();

  generationLabel.textContent = "Generation: " + generation;
  bestLabel.textContent = "Best score: " + bestScore;

  if (running) animationId = requestAnimationFrame(animate);
}

/* Genetic selection + mutation */
function getBestCar() {
  return cars.filter(c => !c.damaged).sort((a, b) => b.score - a.score)[0] || cars.sort((a, b) => b.score - a.score)[0];
}

function nextGeneration() {
  generation++;
  // pick best overall
  const sorted = cars.slice().sort((a, b) => b.score - a.score);
  const best = sorted[0];

  // save best brain optionally to memory (but not localStorage)
  const bestBrain = best.brain ? JSON.parse(JSON.stringify(best.brain)) : null;

  // create new population: clone best (keep 1) + mutated variants
  cars = [];
  for (let i = 0; i < N; i++) {
    const car = new Car(road.laneCenter(1), canvas.height - 150, 30, 50, "AI", 3.2);
    if (bestBrain) {
      car.brain = reviveNetwork(bestBrain);
      if (i !== 0) NeuralNetwork.mutate(car.brain, 0.2);
    }
    cars.push(car);
  }

  // if there's a brain saved in localStorage, seed first car with it (but keep it unmutated)
  if (savedBrain) {
    cars[0].brain = reviveNetwork(savedBrain);
  }

  // recreate traffic
  traffic = createTraffic();

  // stop running until user presses start again? We'll keep running automatically
  // Reset best score? keep global bestScore
}

/* quick initial render so user sees something non-empty */
(function initial() {
  // If there's a saved brain in storage, load it
  if (savedBrain) {
    // revive for quick usage later
    savedBrain = reviveNetwork(savedBrain);
  }
  // Start paused by default
  animate();
})();
