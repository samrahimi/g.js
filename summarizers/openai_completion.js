//summarization models running on the openai legacy completions endpoint
//text-davinci-002 and text-davinci-003 are the only good ones
//summarizers are not stateful and simply prompt the model with what you give it

const { Configuration, OpenAIApi } = require('openai');
//expects the openai api key to be set in the environment
//OPENAI_API_KEY=xyz node yourapp.js
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY // Replace with your actual OpenAI API key
});

const serializeMessages = (messages) => {
    return messages.map(x => `${x.from}: ${x.content}`).join("\n\n")
}

const submit = async(model, settings, summarization_prompt, messages) => {
    const prompt = `${summarization_prompt}
    
    ${serializeMessages(messages)}`

    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
        prompt: prompt,
        model: model,
        temperature: settings.temperature, 
        max_tokens: settings.max_tokens,
    });
    return response.data.choices[0].text
}

module.exports={submit}
