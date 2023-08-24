//openai chatCompletions adapter
//supports gpt-3.5-turbo et al, gpt-4 et al.
//does not support davinci legacy models
const { Configuration, OpenAIApi } = require('openai');
const {renderPromptState} = require("../g")
//expects the openai api key to be set in the environment
//OPENAI_API_KEY=xyz node yourapp.js
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY // Replace with your actual OpenAI API key
});


const submit = async(model, settings, session) => {
    const openai = new OpenAIApi(configuration);
    const response = await openai.createChatCompletion({
        model: session.model,
        temperature: settings.temperature, 
        max_tokens: settings.max_tokens,
        messages: renderPromptState(session)
    
    });

    //you MUST return an object containing "role" and "content" fields
    //if working with a model that is tuned for IF or non-chat completions
    //you can construct the reply object as {content: "the actual reply", role: "assistant"}
    //if using openai chatcompletions, the reply is already in that format, and you can just return it
    return response.data.choices[0].message; //{content: "the actual reply", role: "assistant"}


}

module.exports={submit}
