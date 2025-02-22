document.addEventListener("DOMContentLoaded", () => {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const voiceBtn = document.getElementById("voice-btn");
    const clearChatBtn = document.getElementById("clear-chat");
    const toggleSidebarBtn = document.getElementById("toggle-sidebar");
    const sidebar = document.querySelector(".sidebar");

    // OpenAI API configuration
    const OPENAI_API_KEY = "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"; // Replace with your OpenAI API key
    const OPENAI_MODEL = "gpt-3.5-turbo"; // Cost-effective and suitable for legal questions

    // Predefined questions and answers
    const predefinedQuestions = {
        "who are you": "I am a language model developed by Right Solution. You can call me NiyamaShakthi.",
        "what is your name": "My name is NiyamaShakthi, and I am here to assist you with your legal questions.",
        "who developed you": "I was developed by Right Solution to provide legal assistance and answer your queries.",
        "what can you do": "I can help you with legal questions, provide information, and guide you on various topics.",
        "how can you help me": "I can assist you by answering your legal questions and providing relevant information.",
    };

    // Show main content after intro screen (if any)
    setTimeout(() => {
        const introScreen = document.getElementById("intro-screen");
        if (introScreen) {
            introScreen.style.display = "none";
        }
        document.querySelector(".chat-container").style.display = "block";
    }, 7000);

    // Send message event listeners
    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    // Toggle sidebar visibility
    toggleSidebarBtn.addEventListener("click", () => {
        sidebar.classList.toggle("active");
    });

    // Clear chat history
    clearChatBtn.addEventListener("click", () => {
        chatBox.innerHTML = "";
    });

    // Send message function
    async function sendMessage() {
        const message = userInput.value.trim().toLowerCase();
        if (!message) return;

        displayMessage("user", message);

        // Check if the message matches a predefined question
        if (predefinedQuestions[message]) {
            displayMessage("bot", predefinedQuestions[message]);
        } else {
            // If no predefined answer, fetch response from OpenAI
            await fetchOpenAIResponse(message);
        }

        userInput.value = "";
    }

    // Display messages in chat box
    function displayMessage(sender, text) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
        msgDiv.innerText = text;

        if (sender === "bot") {
            const readBtn = document.createElement("button");
            readBtn.innerText = "🔊 Read";
            readBtn.classList.add("read-btn");
            readBtn.onclick = () => readText(text);
            msgDiv.appendChild(document.createElement("br")); // Line break
            msgDiv.appendChild(readBtn);
        }

        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Text-to-Speech for AI responses
    function readText(text) {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        window.speechSynthesis.speak(speech);
    }

    // Fetch response from OpenAI API
    async function fetchOpenAIResponse(prompt) {
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: OPENAI_MODEL,
                    messages: [
                        {
                            role: "system",
                            content: "You are a legal assistant named NiyamaShakthi, developed by Right Solution. Provide concise and accurate answers to legal questions."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: 150, // Limit response length to save tokens
                    temperature: 0.7 // Balance creativity and accuracy
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const fullResponse = data.choices[0].message.content;

            displayWordByWord(fullResponse);
        } catch (error) {
            console.error("Error fetching OpenAI response:", error);
            displayMessage("bot", "Sorry, I encountered an error. Please try again.");
        }
    }

    // Word-by-word typing effect
    function displayWordByWord(text) {
        let index = 0;
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message", "bot-message");
        chatBox.appendChild(msgDiv);

        function typeEffect() {
            if (index < text.length) {
                msgDiv.innerText += text[index];
                index++;
                setTimeout(typeEffect, 50); // Adjust typing speed here
            } else {
                const readBtn = document.createElement("button");
                readBtn.innerText = "🔊 Read";
                readBtn.classList.add("read-btn");
                readBtn.onclick = () => readText(text);
                msgDiv.appendChild(document.createElement("br")); // Line break
                msgDiv.appendChild(readBtn);
            }
        }
        typeEffect();
    }

    // Voice input functionality
    function startVoiceInput() {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Your browser does not support voice input.");
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            sendMessage();
        };

        recognition.onerror = (event) => {
            console.error("Voice recognition error:", event.error);
            alert("Voice recognition failed. Please try again.");
        };
    }

    // Attach voice input functionality to the voice button
    voiceBtn.addEventListener("click", startVoiceInput);
});