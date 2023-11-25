import util from 'util';
const inspect = (obj) => util.inspect(obj, { depth: null });
import fs from "fs";
const assistantIds = JSON.parse(fs.readFileSync("assistant.json", "utf8"));
console.log(assistantIds);

import OpenAI from "openai";
const openai = new OpenAI();
let id = assistantIds.assistant || process.argv[2];
if (id) {
    console.log("Removing assistant: ", id);
    let result = await openai.beta.assistants.del(id);
    console.log("Assistant removed: ", result);
    assistantIds.assistant = null;
    assistantIds.thread = null;
    fs.writeFileSync("assistant.json", JSON.stringify(assistantIds, null, 4));
}

