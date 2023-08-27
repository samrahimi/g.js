# g.js
Pure JS framework for interacting with LLMs in a model-agnostic way and creating multimodal pipelines.

//Create a chatbot using one of the newer openai models that use the chatCompletion endpoint, any of the 3.5 turbo or gpt-4 models
const adapter="openai_chat", model_id="gpt-3.5-turbo_16k", username="User", ai_name="AI"

//Or if you want to use a legacy openai model, set adapter = "openai" and model_id = "text-davinci-003", no other code changes needed!

const session = createSession("You are a helpful assistant", adapter, model_id, username)
while (true)
{
    console.log("\n\n")
    const query = await stdin.question(username+": ")

    //Each query and the AI's reply, is by default appended to the messages[] collection that gets sent to the model
    //TODO: manage the context length using various strategies (naive FIFO, summarization, retriever, ...)
    const answer = await performInference(session, query, {temperature: parseFloat(temperature), max_tokens: parseFloat(maxtokens)})
    console.log(ai_name+": "+ answer)
}


//Summarize text using the prompt structure and settings in templates/summarize.json
const summary = await g.fromTemplate("summarize", {text: content_to_summarize})

//Transform the raw output from a computer vision model into a coherent description of the scene
const description = await g.fromTemplate("image_comprehension", {concepts: [{name: "aerial", value: 0.992}, {name:"city", value: 0.98}, ...]})


# What is the point of this?
Develop user-facing web and mobile apps powered by AI using your favorite web development tech stack, without the use of python. Python is an excellent language for all sorts of machine learning tasks, but it is not the first choice for building modern consumer apps (if you doubt me, check out any HuggingFace space... there is amazing work being done there, but gradio and streamlit are not designed for general purpose apps - for that you use things like React, Next.js, Express)


# Extending g.js
g.js uses a plugin architecture that creates an abstract interface for querying large language models (or any model that expects text as an input and that outputs text). To add support for a new family of models, create an adapter in /adapters that takes care of submitting a prompt and parsing the response. 

All adaptors must export a submit function in the form async(model, settings, session) which returns a string. If your adapter is talking to a model or API that uses unstructured text as the input and the output, start by copying openai_completion.js and change it to connect with your model.

Templates are similar to langchain templates, but with a JS template literal syntax... templates are useful for structuring traditional instruction-following or question-answering prompts, and for applying the necessary transformations to the input data, before sending it to the model. To use a template:

await g.fromTemplate("template_name", {key1: value1, key2: value2, ...}) 

Here is an example of a simple template for summarization:

{               
                "instruction": "Your job is to summarize documents. When the user gives you a document to summarize, please respond with a detailed summary, including the key points that are important, and discarding things that are unimportant. Please write like a highly skilled human author and not like an AI... and please try to capture the emotional essence of the original material in your summary. Do not chat with the user, respond only with the summary of whatever the user has submitted to you.", 
                "context":"${data.text}", 
                "adapter":"openai_chat",   
                "model":"gpt-3.5-turbo", 
                "temperature": 0.8,        
                "max_tokens": 500
}

Any JS expression that works in a template literal can be used in your template definitions, as long as strings are properly escaped:


{               
                "instruction": "Please describe the image or scene in a coherent and detailed way, based on raw data containing features detected by an image recognition model. See context for details", 
                "context":"${data.concepts.map(x => `${x.name} (P = ${x.value})`).join('\\n')}", 
                "adapter":"openai_chat",   
                "model":"gpt-4", 
                "temperature": 0.9,        
                "max_tokens": 512
}

g.fromTemplate generates the prompt from your data and queries the model in one step... As long as your template follows the structure of the examples, it can typically be used with any adapter and model. 

# Work In Progress

- publish as npm package
- save / load sessions from database
- work with few shot training examples in a structured way
- context length optimization tools (FIFO, lossy neural compression, etc)
- create sessions by forking / branching an existing session with variety of context sharing strategies