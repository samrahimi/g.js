
import g from '../g.js'
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const stdin = readline.createInterface({ input, output });

const description = await stdin.question("Brief Description? ")
const audience = await stdin.question("Intended Audience? ")

const session = g.createSession(`Please create the table of contents for a new book that we are writing, formatted as a single level numbered list. 

For each chapter, please come up with a clear and catchy title followed by a very brief description of the content that will go into the chapter

The chapter title and description should be relevant to the book that the user has requested us to write, and the chapters should create a narrative flow through the book that will make readers want to read it.

For example, if the user asks you for a self-help book about natural treatments for depression, you should respond something like this:

1. Understanding Depression: This chapter will delve into the bio-psychological aspects of depression, its symptoms, and its common misconceptions.
2. The Role of Nutrition in Fighting Depression: The chapter discusses the impact of various foods on mood and mental health and provides dietary tips for managing depression.
...

The details of the book are as follows:`,
"openai_chat", 
"gpt-4", "User", 
` 
Description: ${description}
Intended Audence: ${audience}
`)

const toc = await g.performInference(session, null, {temperature: 0.8, max_tokens: 1024}, true, "User", "Assistant")
console.log("*** Table Of Contents ***")
console.log(toc)

console.log("*** Complete Outline ***")
const complete_outline = await g.performInference(session, "Please elaborate on this outline. For each chapter, describe the key events and the characters involved. It is very important that there be a narrative arc from start to finish", {temperature: 0.8, max_tokens:1536}, true, "User", "Assistant")
console.log(complete_outline)

const characters = await g.performInference(session, "Please briefly describe the main characters in this story", {temperature: 0.8, max_tokens:512}, true, "User", "Assistant")
console.log("*** Characters ***")
console.log(characters)


const synopses = []
var prev = ""

for (var chapter_to_write=1; chapter_to_write<10; chapter_to_write++) {
    console.log("*** Writing Synopsis For Chapter "+chapter_to_write+" ***")
    const synopsis = await g.fromTemplate("synopsis", {description: description, audience: audience, outline: complete_outline, characters: characters, chapter_to_write: chapter_to_write, previous_chapter: prev})
    console.log(synopsis)
    prev = `Previous Chapter:
    ${synopsis}` 
    
}
// const chapters = toc.split("\n").filter(c => c.length > 0 && c[1] == ".") 

// const outline = [] 
// for (var chapter in chapters) {
//     const details = await g.fromTemplate("sublist", {description, audience, chapter})
//     outline.push({chapter: chapter, details: details})
//     console.log(details)
// }

// console.log("Outlining Complete, Press Enter to Write The Book")
// await stdin.question("")

// outline.forEach(async(chapter) => {
//     const content = await g.fromTemplate("writer", {description, audience, chapter})
//     console.log(content)
//     chapter.content = content
// })

// const book = outline.map(c => `${c.chapter}
// ${c.content}
// `).join("\n")

// const fs = require("fs")
// fs.writeFileSync("book.txt", book)

// console.log("Done. Check book.txt")