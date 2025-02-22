function getAIResponse(input) {
    const responses = {
        "hello": "Hi! How can I assist you?",
        "how are you": "I'm just a bot, but I'm doing great!",
        "who are you": "I am NiyamaShakthi AI, your assistant!",
        "bye": "Goodbye! Have a great day!"
    };

    const defaultResponse = "I'm still learning. Can you rephrase?";
    return responses[input.toLowerCase()] || defaultResponse;
}
