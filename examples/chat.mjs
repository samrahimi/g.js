import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import g from '../g.js'
const { createSession, performInference, renderPromptState, appendMessage } = g

const stdin = readline.createInterface({ input, output });

const username = await stdin.question('Username? ');
const ai_name = await stdin.question('Bot Name? ');
const invocation = await stdin.question('Invocation? ');
const temperature = await stdin.question('Temperature?')
const maxtokens = await stdin.question('Max Tokens?')
const model_id = await stdin.question('Model ID?')
const adapter = await stdin.question("Adapter?") //use openai_chat for models that use chatcompletion, openai for legacy (text-davinci-003 and earlier)

const session = createSession(invocation, adapter, model_id, username)
console.log('\n***Begin Chat Session***\n')
while (true)
{
    console.log("\n\n")
    const query = await stdin.question(username+": ")
    const answer = await performInference(session, query, {temperature: parseFloat(temperature), max_tokens: parseFloat(maxtokens)}, true, username, ai_name)
    console.log(ai_name+": "+ answer)
}
stdin.close();