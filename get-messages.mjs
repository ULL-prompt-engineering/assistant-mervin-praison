async function getLastMessageForRun(openai, runId, threadId) {
    let messages = await openai.beta.threads.messages.list(threadId);
    const lastMessageForRun = messages.data
        .filter(
            (message) =>
                message.run_id === runId && message.role === "assistant"
        )
        .pop();
    return lastMessageForRun;
}

async function getAllMessagesForThread(openai, threadId) {
    let messages = await openai.beta.threads.messages.list(threadId);
    let roleAndContent = messages.data.map(msg => {
        const role = msg.role;
        const content = msg.content[0].text.value;
        return `${role.charAt(0).toUpperCase() + role.slice(1)}: ${content}`;
    });
    return roleAndContent;
}

export { getAllMessagesForThread, getLastMessageForRun}