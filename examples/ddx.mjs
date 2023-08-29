import g from '../g.js'
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const stdin = readline.createInterface({ input, output });

const patient = await stdin.question("Patient Info: ")
const complaint = await stdin.question("Presenting Complaint: ")
const clinical = await stdin.question("Additional Observations: ")
const labs = await stdin.question("Lab Test Results: ")

const start = Date.now()

const ddx = await g.fromTemplate("ddx", {patient, complaint, clinical, labs})
const end = Date.now()

console.log(`Possibilities: ${ddx}`)
console.log("Inference completed in "+(end - start).toString()+"ms")