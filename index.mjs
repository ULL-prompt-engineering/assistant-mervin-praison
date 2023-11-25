import util from 'util';
const inspect = (obj) => util.inspect(obj, { depth: null });
import { red, green, blue, purple, rl } from "./utils.mjs";
import fs from "fs";
const assistantIds = JSON.parse(fs.readFileSync("assistant.json", "utf8"));
console.log(assistantIds);

const userName = assistantIds.userName || "Pedro";
const q = Number(process.argv[2]) || 0;
let question = assistantIds.questions[q] || "I need to solve the equation `3x + 11 = 23`. Can you help me?";

import OpenAI from "openai";
const openai = new OpenAI();

let assistant = null;
if (assistantIds.assistant) {
    try {
        console.log("Retrieving assistant from assistantIds: ", assistantIds.assistant);
        assistant = await openai.beta.assistants.retrieve(assistantIds.assistant);
    } catch (e) {
        console.log(red("Error retrieving assistant: "), red(e));
        assistant = null;
    }
}
if (!assistant) {
    assistant = await openai.beta.assistants.create({
        name: assistantIds.name || "Math Tutor",
        instructions: assistantIds.instructions || "You are a personal math tutor. Write and run code to answer math questions.",
        tools: [] /* assistantIds.tools */,
        model: assistantIds.model,
    });
    assistantIds.assistant = assistant.id;
}

let thread = null;

/* Threads and Messages represent a conversation session between an Assistant and a user. 
There is no limit to the number of Messages you can store in a Thread. 
Once the size of the Messages exceeds the context window of the model, 
the Thread will attempt to include as many messages as possible that fit 
in the context window and drop the oldest messages. 
This truncation strategy may change over time.
*/
if (assistantIds.thread) {
    try {
        console.log("Retrieving thread from assistantIds: ", assistantIds.thread);
        thread = await openai.beta.threads.retrieve(assistantIds.thread);
    } catch (e) {
        console.log(red("Error retrieving thread: "), red(e));
        thread = null;
    }
} 
if (!thread) {
    thread = await openai.beta.threads.create();
    assistantIds.thread = thread.id;
}

let message = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: question,
});

console.log(purple("Message created: "), message.id);
console.log(purple(inspect(message)))

let run = null;

run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
    instructions: `Please address the user as ${userName}.`,
});

console.log(green("Run created: "), run.id);
console.log(green(inspect(run)))

const checkStatusAndPrintMessages = async (threadId, runId) => {
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    console.log(blue("Run status: "))
    console.log(blue(inspect(runStatus)));
    if (runStatus.status === "completed") {
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
        console.log(blue(inspect(runStatus)));
        setTimeout(async () => { await checkStatusAndPrintMessages(thread.id, run.id) }, 
          assistantIds.delay || 9000);
    }
};

await checkStatusAndPrintMessages(thread.id, run.id);
fs.writeFileSync("assistant.json", JSON.stringify(assistantIds, null, 4));

