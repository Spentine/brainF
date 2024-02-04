import { interpretProgram } from "./interpreter/interpreter.js";
import { compileProgram } from "./compiler/compiler.js";

console.log("Script Loaded");

document.addEventListener("DOMContentLoaded", main);

class BrainFuckInteract {
  constructor() {
    this.resetValues(false);
  }
  
  resetValues(running) {
    this.output = "";
    this.updateOutput = false;
    this.input = null;
    this.awaitingInput = false;
    this.running = running;
  }
  
  appendOutput(str) {
    this.output += str;
    this.updateOutput = true;
  }
  
  appendASCII(ascii) {
    this.appendOutput(String.fromCharCode(ascii));
    this.updateOutput = true;
  }
}

export var interact = new BrainFuckInteract();

var programInput = document.getElementById("programInput");

export async function waitForInput() {
  interact.input = null;
  interact.awaitingInput = true;
  return new Promise((resolve) => {
    const checkInput = () => {
      if (interact.input !== null) {
        resolve(interact.input);
      } else {
        setTimeout(checkInput);
      }
    };

    checkInput();
  });
}

async function runProgram() {
  const program = document.getElementById("programData").value;
  interact.resetValues(true);
  await interpretProgram(program, interact);
}

function getCompiled() {
  let prgm = compileProgram(document.getElementById("programData").value);
  console.log(prgm);
  interact.resetValues(true);
  const scriptElement = document.createElement('script');
  scriptElement.type = 'module';
  scriptElement.textContent = prgm + "generatedBrainFuckCode(interact);";
  document.head.appendChild(scriptElement);
}

async function main() {
  console.log("DOMContentLoaded");
  
  let startButton = document.getElementById("startButton")
  startButton.addEventListener("click", runProgram);
  
  programInput.addEventListener("input", registeredPress);
  
  let compileButton = document.getElementById("compileButton")
  compileButton.addEventListener("click", getCompiled);
  
}

function registeredPress() {
  if (interact.awaitingInput) {
    interact.input = programInput.value;
  }
  programInput.value = "";
}

function tick(t) {
  if (interact.updateOutput) {
    var outputElement = document.getElementById("programOutput");
    outputElement.innerHTML = interact.output;
    window.scrollTo(0, document.body.scrollHeight);
    interact.updateOutput = false;
  }
  if (interact.awaitingInput) {
    programInput.style.backgroundColor = "#555";
  } else {
    programInput.style.backgroundColor = "#333";
  }
  window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);