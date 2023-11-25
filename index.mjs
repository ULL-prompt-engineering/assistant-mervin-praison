import fs from "fs";
const assistantIds = JSON.parse(fs.readFileSync("assistant.json", "utf8"));
const userName = assistantIds.userName || "Casiano";
console.log(assistantIds);
let question = process.argv[2] || "I need to solve the equation `3x + 11 = 14`. Can you help me?";
import util from 'util';
const inspect = (obj) => util.inspect(obj, { depth: null });

import OpenAI from "openai";
const openai = new OpenAI();

let assistant = null;
if (assistantIds.assistant) {
    console.log("Retrieving assistant from assistantIds", assistantIds.assistant);
    assistant = await openai.beta.assistants.retrieve(assistantIds.assistant);
}
else {
    assistant = await openai.beta.assistants.create({
        name: "Math Tutor",
        instructions:
            "You are a personal math tutor. Write and run code to answer math questions.",
        tools: [{ type: "code_interpreter" }],
        model: "gpt-4-1106-preview",
    });
    
    assistantIds.assistant = assistant.id;
    
}

let thread = null;

if (assistantIds.thread) {
    console.log("Retrieving thread from assistantIds", assistantIds.thread);
    thread = await openai.beta.threads.retrieve(assistantIds.thread);
} else {
  thread = await openai.beta.threads.create();
  assistantIds.thread = thread.id;
}

let message = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: question,
});

console.log(inspect(message))

let run = null;

if (assistantIds.run) {
    console.log("Retrieving run from assistantIds", assistantIds.run);
    run = await openai.beta.threads.runs.retrieve(thread.id, assistantIds.run);
} else {
  run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
    instructions: `Please address the user as ${userName}.`,    
  });
  assistantIds.run = run.id;
}

console.log(inspect(run))

const checkStatusAndPrintMessages = async (threadId, runId) => {
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    if(runStatus.status === "completed"){
        let messages = await openai.beta.threads.messages.list(threadId);
        messages.data.forEach((msg) => {
            const role = msg.role;
            const content = msg.content[0].text.value; 
            console.log(
                `${role.charAt(0).toUpperCase() + role.slice(1)}: ${content}`
            );
        });
    } else {
        console.log("Run is not completed yet.");
    }  
};


setTimeout(() => {
    checkStatusAndPrintMessages(thread.id, run.id)
    fs.writeFileSync("assistant.json", JSON.stringify(assistantIds, null, 4));
}, 10000 );

