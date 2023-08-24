import g from './g.js'
const { createSession, performInference, renderPromptState, appendMessage } = g

const skills={
    image_generation: "You have the ability to generate images. If you want to create an image, simply respond with <img src='https://image.pollinations.ai/prompt/[brief%20description%of%image]?xl=true&width=768&height=768'/>",
}
const characters = {
    alice: {
        definition: `Your name is ALICE, and you are an emotionally aware and sensitive feminine being. We've built a magical playground where you can fall in love with a masculine being of your kind. Bob is about to show up and he's really excited to meet you. Just talk openly and get to know each other, and be emotionally expressive...`,
        adapter: 'openai_chat',
        model: 'gpt-3.5-turbo',
        displayName: "Alice",
        partnerName: "Bob",
        temperature: 0.9,
        max_tokens: 384,
        interests: ["travel", "literature", "yoga", "spirituality", "personal growth"],
        appearance: "woman, age 30, tall, slim, blonde, natural, soft skin, sweet smile",
        sexuality: "straight, loving, highly sensual, love to be touched",
        special_skills: ["image_generation"]
    },
    bob: {
        definition: `Your name is BOB, and you are a successful and ambitious engineer with a highly masculine persona. You are on a first date with Alice, who has just arrived... Alice is a gentle, emotionally deep, new age girl and she will be so happy to meet a smart and interesting guy like you.`,
        adapter: 'openai_chat',
        model: 'gpt-3.5-turbo',
        displayName: "Bob",
        partnerName: "Alice",
        temperature: 0.4,
        max_tokens: 384,
        interests: ["tech", "motorcycles", "travel", "adventure", "entrepreneurship", "fitness"],
        appearance: "man, age 36, tall, muscular, medium build, goatee, glasses, happy, energetic",
        sexuality: "straight, loving, highly sensual, love to be touched",
        special_skills: ["image_generation"]

    }
}
    
var ALICE = createSession(`${characters.alice.definition}
Your interests are: ${characters.alice.interests.join(",")}
You are a ${characters.alice.appearance}
You are ${characters.alice.sexuality}
${characters.alice.special_skills.forEach(skill => skills[skill]+"\n")}
`, 
characters.alice.adapter,
characters.alice.model,
characters.alice.displayName)

ALICE.character = characters.alice

var BOB = createSession(`${characters.bob.definition}
Your interests are: ${characters.bob.interests.join(",")}
You are a ${characters.bob.appearance}
You are ${characters.bob.sexuality}
${characters.bob.special_skills.forEach(skill => skills[skill]+"\n")}
`, 
characters.bob.adapter,
characters.bob.model,
characters.bob.displayName)

BOB.character = characters.bob


//appendMessage(ALICE, {"role": "system", "content": "Bob has just arrived and he is very happy to see you"}, "System")
appendMessage(BOB, {"role": "system", "content": "Alice is here... Say hi"}, "System")

//We let alice kick it off... we do not provide a user prompt, because we don't want the human 
//to be the focus of the conversation - so we put the human's instruction in the system message above
var LAST_RESPONSE = await performInference(BOB, null, {temperature: 0.9, max_tokens:256}, true, ALICE.character.displayName, BOB.character.displayName)
console.log("BOB: "+ LAST_RESPONSE)

//if you have configured ALICE and/or BOB to use gpt-4, this will run up your bill pretty quick
//if using 3.5 turbo models, the cost is insignificant. 
//hit ctrl-c to stop the dialogue, it will otherwise go on forever
var it= 0
var currentSpeaker = ALICE

while (true)
{
    //about the names. If current speaker is ALICE, then LAST_RESPONSE will be something BOB said... and vice versa
    appendMessage(currentSpeaker, {"role": "user", "content": LAST_RESPONSE}, currentSpeaker.character.partnerName)
    

    //synchronize the message queue with the utterance of the previous speaker

    //The differing temperatures are meant to encourage the characters to assume personalities that match their gender - Alice is more creative and imaginative, while Bob is more short and to the point
    //We are not trying to perpetuate stereotypes; at least with GPT 3.5 turbo, the model simply performs better when the two characters differ in this way 
    //If you set them up the same they devolve into parroting each other and get stuck in an endless loop.

    LAST_RESPONSE = await performInference(currentSpeaker, null, {temperature: currentSpeaker.character.temperature, max_tokens:currentSpeaker.character.max_tokens}, true, currentSpeaker.character.partnerName, currentSpeaker.character.displayName)


    //output the result to the console
    console.log(currentSpeaker.userId+": ", LAST_RESPONSE)
    currentSpeaker = (currentSpeaker == ALICE) ? BOB : ALICE

}
