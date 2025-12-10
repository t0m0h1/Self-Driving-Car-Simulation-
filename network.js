// Neural Network implementation with feedforward and mutation capabilities
class NeuralNetwork {
    constructor(neuronCounts) {
      this.levels = [];
      for (let i = 0; i < neuronCounts.length - 1; i++) {
        this.levels.push(new Level(neuronCounts[i], neuronCounts[i+1]));
      }
    }
  
    static feedForward(inputs, network) {
      let outputs = Level.feedForward(inputs, network.levels[0]);
      for (let i = 1; i < network.levels.length; i++) {
        outputs = Level.feedForward(outputs, network.levels[i]);
      }
      return outputs;
    }
  
    static mutate(network, amount = 0.1) {
      network.levels.forEach(level => {
        for (let i = 0; i < level.biases.length; i++) {
          level.biases[i] = mutate(level.biases[i], amount);
        }
        for (let i = 0; i < level.weights.length; i++) {
          for (let j = 0; j < level.weights[i].length; j++) {
            level.weights[i][j] = mutate(level.weights[i][j], amount);
          }
        }
      });
    }
  }
  
  class Level {
    constructor(inputCount, outputCount) {
      this.inputs = new Array(inputCount);
      this.outputs = new Array(outputCount);
      this.biases = new Array(outputCount);
      this.weights = [];
  
      for (let i = 0; i < inputCount; i++) {
        this.weights[i] = new Array(outputCount);
        for (let j = 0; j < outputCount; j++) {
          this.weights[i][j] = Math.random() * 2 - 1;
        }
      }
  
      for (let i = 0; i < outputCount; i++) {
        this.biases[i] = Math.random() * 2 - 1;
      }
    }
  
    static feedForward(givenInputs, level) {
      level.inputs = givenInputs;
      for (let i = 0; i < level.outputs.length; i++) {
        let sum = 0;
        for (let j = 0; j < level.inputs.length; j++) {
          sum += level.inputs[j] * level.weights[j][i];
        }
        level.outputs[i] = sum > level.biases[i] ? 1 : 0;
      }
      return level.outputs;
    }
  }
  