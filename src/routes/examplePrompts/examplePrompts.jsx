import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./examplePrompts.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateCompletion } from "../../lib/openai";
import { promptSections } from "../../data/promptsData";

const ExamplePrompts = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [selectedModel, setSelectedModel] = useState("ampgpt");
    const [expandedPromptIndex, setExpandedPromptIndex] = useState(null);
    const ModelName =  selectedModel === "ampgpt" ? "internal" : "external";

    const mutation = useMutation({
        mutationFn: ({ text, assistantResponse }) => {
            const token = localStorage.getItem("token"); // Retrieve token from localStorage

            return fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Include token
                },
                body: JSON.stringify({ text, assistantResponse,ModelName }),
            }).then((res) => res.json());
        },
        onSuccess: (data, variables) => {
            const { model } = variables; // 👈 get the model passed
            if (data.chatId) {
                queryClient.invalidateQueries({ queryKey: ["userChats"] });
                navigate(`/dashboard/chats/${data.chatId}`, { state: { selectedModel: model } });
            }
        },
    });


    /**
     * Handles prompt selection and expands the clicked prompt
     * @param {string} prompt - The selected prompt text
     * @param {number} index - The index of the clicked prompt
     */
    const handlePromptClick = (prompt, index) => {
        // If the clicked prompt is already expanded, collapse it
        if (expandedPromptIndex === index) {
            setExpandedPromptIndex(null);
            setSelectedPrompt(null);
        } else {
            // Otherwise, expand the clicked prompt
            setSelectedPrompt(prompt);
            setExpandedPromptIndex(index);
        }
    };

    /**
     * Handles GPT selection and submits the prompt
     * @param {string} model - "ampgpt" or "general"
     */
    const handleGPTSelect = async (model) => {
        if (!selectedPrompt) return;
      
        navigate(`/dashboard/chats/loading`, { state: { loading: true, selectedModel: model } });
      
        try {
          const assistantResponse = await generateCompletion([{ role: "user", content: selectedPrompt }], model);
          
          mutation.mutate({ text: selectedPrompt, assistantResponse, model }); // 👈 include model here
        } catch (err) {
          console.error("Error generating assistant response:", err);
        }
      
        setExpandedPromptIndex(null);
      };
      

    return (
        <div className="exPrompts">
            <h1 className="header-style">Example Prompts</h1>
            <div className="promptsGrid">
                {promptSections.map((section, sectionIndex) => (
                    <div className="prompt_Tile" key={sectionIndex}>
                        <div className="tileHeader">
                            {/* Render the icon using the className */}
                            <i className={section.icon}></i>
                            <h3>{section.title}</h3>
                        </div>
                        <div className="promptList">
                            {section.prompts.map((prompt, promptIndex) => {
                                const uniqueIndex = `${sectionIndex}-${promptIndex}`;
                                return (
                                    <div
                                        key={promptIndex}
                                        className={`promptItem ${expandedPromptIndex === uniqueIndex ? "expanded" : ""}`}
                                        onClick={(e) => {
                                            // Prevent collapsing if GPT buttons are clicked
                                            if (!e.target.closest(".gptOption")) {
                                                handlePromptClick(prompt, uniqueIndex);
                                            }
                                        }}
                                    >
                                        {prompt}
                                        {expandedPromptIndex === uniqueIndex && (
                                            <div className="gptOptions">
                                                <div
                                                    className="gptOption"
                                                    onClick={() => handleGPTSelect("ampgpt")}
                                                >
                                                    <i className="fa-solid fa-brain modelIcon"></i> Internal AMP GPT
                                                </div>
                                                <div
                                                    className="gptOption"
                                                    onClick={() => handleGPTSelect("general")}
                                                >
                                                    <i className="fa-solid fa-robot modelIcon"></i> External PipGPT
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExamplePrompts;