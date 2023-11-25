import util from 'util';
const inspect = (obj) => util.inspect(obj, { depth: null });
import { red, green, blue, purple, rl } from "./utils.mjs";
import OpenAI from "openai";
const openai = new OpenAI();
let result = await openai.beta.assistants.list({
    limit: 5,
    order: "asc", //Sort order by the created_at timestamp
    //after: null, //List all Assistants created after this timestamp
    //before: null //List all Assistants created before this timestamp
}
);
result.data.forEach(assistant => {
    const { id, name, tools, created_at } = assistant;
    console.log(purple(inspect({ id, name,tools,created_at })))
});
process.exit(0);
