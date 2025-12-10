// Utility functions for various mathematical operations
function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }
  
  function mutate(value, amount = 0.1) {
    if (Math.random() < 0.1) {
      return value + (Math.random() * 2 - 1) * amount;
    }
    return value;
  }
  