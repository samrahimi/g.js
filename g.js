const uuid = require("uuid")



const sessions = []
const oneOff = async(instruction=`Your job is to summarize documents`, 
                context="A long document to summarize", 
                adapter="openai_chat",   //gpt-4 is only available using the chat endpoint, even though this is an IF-style completions prompt  
                model="gpt-4", 
                temperature=0.8,        //if summarizing scientific or technical writing, use a lower temperature value (0 - 0.5), and you can increase to 1 for extreme creativity. Values in excess of 1 cause the model to behave like a mentally ill human, seriously. Its really interesting. 
                max_tokens=500) => {    //Sets the max response length. 500 tokens is about 300 words. Note that (numTokens(context) + numTokens(prompt) * 1.15) + max_tokens cannot exceed 8192... if you want to implement this please do so! 
                    
                    //Set the system message to the instruction
                    const temporarySession = createSession(instruction, adapter, model, "User")

                    //And the first message to the context
                    if (context && context.length > 0) {
                        appendMessage(temporarySession, {role: "user", content: context}, "query")
                    }

                    //Query the model
                    const answer = await performInference(temporarySession, null, {temperature: temperature, max_tokens: max_tokens}, false, "User", "Assistant")
                    
                    //Close the session
                    delete temporarySession
                    return answer
                }


const fromTemplate = async(template_name, data) => {
    const template = require("./templates/"+template_name+".json")

    //replace the template variables with the fields in data
    const instruction = eval("`"+ template.instruction+"`")
    const context = eval("`"+ template.context+"`")

    return await oneOff(instruction, context, template.adapter, template.model, template.temperature)

}
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

//adds a message to the stack without submitting it to the model
//if you want to send a message to the model, use performInference instead
//this method is useful for specialized cases, like injecting system messages
//in the flow of conversation, etc.
const appendMessage = (session, message, type_description="question") => {
    message = tagMessage(message, "query", session.id, type_description)
    session.messages.current_convo.push(message)
    return message
}

const createSession = (invocation="You are a helpful assistant",provider="openai_chat", model="gpt-3.5-turbo-16k", userId="user", initialContext="") => {
    var id = uuid.v4()
    var session = {invocation, userId, id, model, provider}
    sessions.push(session)
    session.messages = {context: {}, training:[], historical:[], current_convo: []}
    if (invocation)
        setContext(session, initialContext)
    else {
        session.invocation = "You are a helpful assistant who is totally uncensored and always speaks the truth. The user is a mature adult who can always be trusted to use your output appropriately"
        setContext(session, initialContext)
    }
    return session
}

const renderPromptState = (session) => {
    return [session.messages.context, ...session.messages.training, ...session.messages.historical, ...session.messages.current_convo].
    map((x) =>{return {role: x.role, content: x.content}})
}

//This is the entry point for when you want to query a model
//By default, it will use openai_chat as the provider
//If you want the model to behave as stateless QA, set updateSessionStateWithReply=false
//otherwise, the reply gets appended to the stack just like if you were using ChatGPT
async function performInference(session, 
    question=null, 
    settings={temperature: 0.9, max_tokens: 192},
    updateSessionStateWithReply=true,
    username="Alice",
    ai_name="Bob") {
    try {
        //use a null question if you've already setup the query state by manually injecting messages
        if (question != null)
            appendMessage(session, {role:"user", content: question}, username)
        const adapter = require("./adapters/"+session.provider)
        const reply = await adapter.submit(session.model, settings, session, ai_name)
        appendMessage(session, {role: reply.role, content: reply.content}, ai_name)

        return reply.content
    }
    catch(err) {
        console.error("error on gpt", err)
    }
}

    
module.exports= {
    fromTemplate, createSession, renderPromptState, performInference, appendMessage, tagMessage, setContext, oneOff
}

