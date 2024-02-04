import { waitForInput } from "../main.js";

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function compileProgram(program) {
  
  let compiled = [];
  
  {
    let j = "";
    for (let i = 0; i < program.length; i++) {
      if ("+-<>[].,".includes(program[i])) {
        j += program[i];
      }
    }
    program = j;
  }
  
  for (let i = 0; i < program.length; i++) {
    let inst = program[i];
    if ("[].,".includes(inst)) {
      compiled.push([inst, 1]);
    } else {
      let r = 0;
      let c = inst;
      while (program[i] === c) {
        r += 1;
        i += 1;
      }
      i -= 1;
      switch (c) {
        case "+":
          compiled.push(["+", r]);
          break;
        case "-":
          compiled.push(["+", -r]);
          break;
        case ">":
          compiled.push([">", r]);
          break;
        case "<":
          compiled.push([">", -r]);
          break;
      }
    }
  }
  
  // simplifies operations
  // +++-- becomes +
  for (let i = 0; i < compiled.length - 1; i++) {
    if ((">+".includes(compiled[i][0])) && (compiled[i][0] === compiled[i+1][0])) {
      compiled[i][1] += compiled.splice(i+1, 1)[0][1];
      if (compiled[i][1] === 0) {
        compiled.splice(i, 1);
        i--;
      }
      i--;
    }
  }
  
  // replaces [+] with 0
  for (let i = 0; i < compiled.length - 2; i++) {
    if ((compiled[i][0] === "[") && (compiled[i+1][0] === "+") && (compiled[i+2][0] === "]")) {
      compiled.splice(i, 3, ["s", 0]);
    }
  }
  
  // replaces +[+] with 0
  for (let i = 0; i < compiled.length - 1; i++) {
    if ((compiled[i][0] === "+") && (compiled[i+1][0] === "s")) {
      compiled.splice(i, 2, ["s", 0]);
    }
  }
  
  // replaces [+]+ with 1
  for (let i = 0; i < compiled.length - 1; i++) {
    if ((compiled[i][0] === "s") && (compiled[i+1][0] === "+")) {
      compiled.splice(i, 2, ["s", (256 + compiled[i][1] + compiled[i+1][1]) % 256]);
    }
  }
  
  var result = "import{waitForInput,interact}from'./main.js';function i(x){interact.appendASCII(x);}async function j(){return(await waitForInput()).charCodeAt(0);}async function generatedBrainFuckCode(interact){var m=[0];var p=0;for(let i=0;i<1000;i++){m.push(0)}";
  
  for (let i = 0; i < compiled.length; i++) {
    let inst = compiled[i];
    switch (inst[0]) {
      case "+":
        if (inst[1] > 0) {
          result += "m[p]=(m[p]+" + inst[1] + ")%256;";
        } else {
          result += "m[p]=(m[p]+" + (inst[1] + 256) + ")%256;";
        }
        break;
      case ">":
        if (inst[1] > 0) {
          if (inst[1] === 1) {
            result += "p++;"
          } else {
            result += "p+=" + inst[1] + ";";
          }
        } else {
          if (inst[1] === -1) {
            result += "p--;"
          } else {
            result += "p-=" + (-inst[1]) + ";";
          }
        }
        break;
      case "[":
        result += "while(m[p]!==0){";
        break;
      case "]":
        result += "}";
        break;
      case "s":
        result += "m[p]=" + inst[1] + ";";
        break;
      case ".":
        result += "i(m[p]);"
        break;
      case ",":
        result += "m[p]=await j();"
        break;
    }
  }
  
  result += "}";
  return result;
}