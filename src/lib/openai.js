/**
 * @file AI Completion Generator
 * @description This module generates AI responses using either AMP GPT (Bedrock Agent Runtime) or OpenAI's GPT models.
 */

/**
 * Generates a completion response from either AMP GPT (Bedrock) or OpenAI's GPT-4 Turbo.
 * @async
 * @param {Array} messages - The conversation history including user and assistant messages.
 * @param {string} model - The selected AI model ('ampgpt' for AMP GPT, 'general' for OpenAI's GPT-4 Turbo).
 * @returns {Promise<string>} The generated AI response.
 * @throws {Error} If an invalid model is selected or there is an error in API response.
 */

export const generateCompletion = async (messages, model) => {
  // Map the toggle options to the respective models
  const modelMapping = {
    ampgpt: "internalGPT", // Use Bedrock Agent Runtime for ampgpt
    general: "gpt-4-turbo", // Use OpenAI for general
  };

  const selectedModel = modelMapping[model]; // Get the selected model

  if (!selectedModel) {
    throw new Error("Invalid model selected.");
  }

  const systemMessage = model === "ampgpt"
    ? {
      role: "system",
      content: `
        You are AMPGPT, an AI model trained specifically to answer questions about AMP Bank and its services. 
      `,
    }
    : {
      role: "system",
      content: `
        You are a general External Pip GPT model. Follow these instructions:
        1. Answer questions on any topic to the best of your knowledge.
        2. Provide clear, accurate, and helpful information.
        3. Ensure responses are concise and friendly, suitable for a general audience.
        4. Always give answers in Australian English.
      `,
    };

  const messagesWithSystem = [systemMessage, ...messages.filter((msg) => msg.role !== "system")];

  try {
    if (model === "ampgpt") {
      const token = localStorage.getItem("token"); // Retrieve token
            const user_Id = localStorage.getItem("userId"); // Retrieve token

      // Use Bedrock Agent Runtime for ampgpt
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/retrieve-and-generate`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Include token in request headers

        },
        body: JSON.stringify({
          userId : user_Id,
          query: messagesWithSystem[messagesWithSystem.length - 1].content,
        }),
      });

      const data = await response.json();
      return data.response;
    } else {
      // Use OpenAI for general
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: messagesWithSystem,
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        return data.choices[0].message.content;
      } else {
        throw new Error(data.error.message);
      }
    }
  } catch (error) {
    console.error("Error generating completion:", error);
    throw error;
  }
};