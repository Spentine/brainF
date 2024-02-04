import { waitForInput } from "../main.js";

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function interpretProgram(program, interact) {
  console.log("Running program");
  
  const concernTime = 100;
  let lastTime = Date.now();
  let timeCheck = 0;
  
  const memory = [0];
  var memptr = 0;
  
  let index = 0;
  
  while (index < program.length) {
    switch (program[index]) {
      case "+":
        memory[memptr] = (memory[memptr] + 1) % 256;
        break;
      case "-":
        memory[memptr] = (memory[memptr] + 255) % 256;
        break;
      case "<":
        if (memptr === 0) {break}
        memptr -= 1;
        break;
      case ">":
        memptr += 1;
        if (memptr === memory.length) {
          memory.push(0);
        }
        break;
      case "[":
        if (memory[memptr] === 0) {
          let height = 1;
          while (height !== 0) {
            index += 1;
            switch (program[index]) {
              case "[":
                height += 1;
                break;
              case "]":
                height -= 1;
                break;
            }
          }
        }
        break;
      case "]":
        if (memory[memptr] !== 0) {
          let height = 1;
          while (height !== 0) {
            index -= 1;
            switch (program[index]) {
              case "[":
                height -= 1;
                break;
              case "]":
                height += 1;
                break;
            }
          }
        }
        break;
      case ".":
        interact.appendASCII(memory[memptr]);
        break;
      case ",":
        memory[memptr] = (await waitForInput()).charCodeAt(0);
        timeCheck = 0;
    }
    index += 1;
    timeCheck += 1;
    if (timeCheck > 10000) {
      timeCheck = 0;
      if (Date.now() > lastTime + concernTime) {
        await sleep(50);
      }
    }
  }
  interact.running = false;
}