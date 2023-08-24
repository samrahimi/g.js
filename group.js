// WIP: see multi_agent_interaction.png for an overview of the architecture envisioned for this functionality
// basically, group.js is intended to be a group chat framework for groups >= 3 participants where at least one participant is an LLM

const uuid = require("uuid")
const HARD_LIMIT = 50 //if more than 50 messages in the chat, we only summarize the most recent 50 for new participants



const rooms = []

const tagMessage= (message, tag, sessionId, metadata) => {
    message.tag = tag
    if (sessionId) {
        message.sessionId = sessionId || ""
        message.userId = sessions.filter(x => x.id == sessionId)[0].userId || ""
    }
    message.metadata = metadata || ""
    message.timestamp = Date.now()
    return message
}

//sets or updates the context document for a conversation
//this message will be structured thusly:
//${session.invocation}
//** Current Context **
//${context}

const setContext = (session, context="") => {
    //if a context is not provided, this will set the initial system message to the invocation specified when the session was created
    
    var messageContent = context && context.trim().length > 0 ? 
        `${session.invocation}
        ** Current Context **
        ${context}` 
    : 
        session.invocation

    var message = tagMessage({role: "system", content: messageContent}, "context", session.id, "instructional prompt with optional context document")
    session.messages.context = message
}

//this appends to the few shot training data... these appear to the model like normal user or assistant messages
//but they can be totally synthetic if you want. in particular, this approach will solve issues involving failure to format output as instructed
const addTrainingMessage = (session, message, type_description="question") => {
    message = tagMessage(message, "training", session.id, type_description)
    session.messages.training.push(message)

}

//the central repository for the group chat
//todo: persist this in a db
const sendMessage = (room, content, type="user", from="username") => {
    const id = room.messages.length + 1
    const newMessage= {
        type, from, content, id 
    }
    newMessage.timestamp = Date.now()
    room.messages.push(newMessage)
}

//get or create user... users matter because this is where we track the last-synced message id
const getUser = (room, userId, type="bot") => {
    if (room.users.filter(x => x.id == userId).length > 0)
        return room.users.filter(x => x.id == userId)[0]
    else
    {
        const newUser = {id: userId, synced_to: 0, last_seen: Date.now(), type: type}
        room.users.push(newUser)
        return newUser    
    }
}

const sync= async(roomId, userId, syncType = "summary") => {
    const room = rooms.filter(x => x.id == roomId)[0]
    const user = getUser(room, userId)
    const lastMessage = room.messages[room.messages.length - 1]
    if (lastMessage.id <= user.synced_to)
        return null //user is already up to date

    if (syncType == "messages")
        return room.messages.filter(x => x.id > user.synced_to)
    else {
        //summarize all messages with an ID > user.synced_to, return that
    }
}

const createRoom = (
owner="admin",
name="bot social club",
welcome_message="Welcome to bot club. There are no messages yet, so you can be the first to say something!",
summarization_provider="openai_completion", 
summarization_model="text-davinci-003",
summarization_prompt="Please summarize the following conversation for a user who has just logged in and needs to catch up. Please include what is important and discard that which is not.", 
description="a friendly chat for intelligent agents of all species") => {
    var id = uuid.v4()
    var room = {id, name, description, owner, summarization_provider, summarization_model}
    rooms.push(room)
    room.messages = [{type:"system", from: owner, content: welcome_message, id: 1, timestamp: Date.now()}]

    room.users = [{id: owner, synced_to: 0, last_seen: Date.now(), type: "system"}]
    return room.id
}

const getRecentMessages = (session) => {
    return [session.messages.context, ...session.messages.training, ...session.messages.historical, ...session.messages.current_convo].
    map((x) =>{return {role: x.role, content: x.content}})
}

//This is the entry point for when you want to query a model
//By default, it will use openai_chat as the provider
//If you want the model to behave as stateless QA, set updateSessionStateWithReply=false
//otherwise, the reply gets appended to the stack just like if you were using ChatGPT
async function performInference(session, 
    question="what is love?", 
    settings={temperature: 0.9, max_tokens: 2048},
    updateSessionStateWithReply=true) {
    try {
        //use a null question if you've already setup the query state by manually injecting messages
        if (question != null)
            appendMessage(session, {role:"user", content: question}, "user_request")
        const adapter = require("./adapters/"+session.provider)
        const reply = await adapter.submit(session.model, settings, session)
        appendMessage(session, {role: reply.role, content: reply.content}, "ai_response")

        return reply.content
    }
    catch(err) {
        console.error("error on gpt", err)
    }
}
    
module.exports= {
    createSession, renderPromptState, performInference, appendMessage, tagMessage, setContext
}

