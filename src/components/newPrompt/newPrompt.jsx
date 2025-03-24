/**
 * @file NewPrompt Component
 * @description This component manages a chatbot interface, allowing users to input prompts, receive AI-generated responses, and optionally search the internet for relevant data.
 */

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import "./newPrompt.css";
import axios from "axios";
import { generateCompletion } from "../../lib/openai";

/**
 * @component NewPrompt
 * @param {Object} props - Component props
 * @param {Array} props.initialMessages - Initial chat messages
 * @param {string} props.selectedModel - Selected AI model
 * @param {string} props.chatId - Unique chat identifier
 * @returns {JSX.Element} The chatbot component
 */

const NewPrompt = ({ initialMessages = [], selectedModel, chatId }) => {
    const [messages, setMessages] = useState(initialMessages);
    const [loading, setLoading] = useState(false);
    const [loadingTextIndex, setLoadingTextIndex] = useState(0);
    const [searchInternet, setSearchInternet] = useState(false);
    const loadingTexts = ["Digging resources...", "Connecting dots...", "Building sentences..."];

    const endRef = useRef(null);
    const inputRef = useRef(null);

    // These keys should be in the .env file. Currently here for testing purposes only.
    const GOOGLE_API_KEY = "AIzaSyBwzqCuatStPuWQCvz9cPkgd_iJWBTlpn0";
    const CSE_ID = "f0cacdf5d6360444e";

    // Fix: Update messages when chatId changes
    useEffect(() => {
        setMessages(initialMessages);
    }, [chatId, initialMessages]);


    /**
     * Fetches internet data from Google Custom Search API
     * @async
     * @param {string} query - The user's search query
     * @returns {Promise<Array>} List of search results
     */

    const fetchInternetData = async (query) => {
        try {
            const response = await axios.get("https://www.googleapis.com/customsearch/v1", {
                params: {
                    key: GOOGLE_API_KEY,
                    cx: CSE_ID,
                    q: query,
                    num: 5,
                },
            });
            const results = response.data.items || [];
            return results.map((item) => ({
                title: item.title,
                snippet: item.snippet,
                link: item.link,
            }));
        } catch (error) {
            console.error("Error fetching internet data:", error);
            return [];
        }
    };

    /**
     * Handles adding a new user message and fetching AI response
     * @async
     * @param {string} text - User input text
     */

    const add = async (text) => {
        const updatedMessages = [...messages, { role: "user", content: text }];
        setMessages(updatedMessages);
        setLoading(true);

        try {
            let internetData = "";

            if (searchInternet) {
                const searchResults = await fetchInternetData(text);
                if (searchResults.length > 0) {
                    internetData = searchResults
                        .map((result, index) => `${index + 1}. ${result.title}: ${result.snippet}`)
                        .join("\n");
                } else {
                    internetData = "No relevant internet data found.";
                }
            }

            const prompt = searchInternet
                ? `User Query: ${text}\n\nRelevant Internet Data:\n${internetData}`
                : text;

            const aiResponse = await generateCompletion(
                [...updatedMessages, { role: "user", content: prompt }],
                selectedModel
            );

            const updatedMessagesWithResponse = [
                ...updatedMessages,
                { role: "assistant", content: aiResponse },
            ];
            setMessages(updatedMessagesWithResponse);

            await axios.put(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
                question: text,
                assistantResponse: aiResponse,
            });
        } catch (err) {
            console.error("Error generating AI response or saving data:", err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles form submission
     * @param {Event} e - Form submit event
     */

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = inputRef.current.value;
        if (!text) return;

        add(text);
        inputRef.current.value = "";
    };

    useEffect(() => {
        endRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!loading) return;

        const interval = setInterval(() => {
            setLoadingTextIndex((prevIndex) => (prevIndex + 1) % loadingTexts.length);
        }, 1000);

        return () => clearInterval(interval);
    }, [loading]);

    return (
        <div className="newPrompt">
            <div className="messageContainer">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        {message.role === "assistant" ? (
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                {typeof message.content === "string" ? message.content : ""}
                            </ReactMarkdown>
                        ) : (
                            <span>
                                {typeof message.content === "string" ? message.content : ""}
                            </span>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="message assistant loading">
                        {loadingTexts[loadingTextIndex]}
                    </div>
                )}
                <div className="endChat" ref={endRef}></div>
            </div>
            <form className="formContainerNewPrompt" onSubmit={handleSubmit}>
                {selectedModel === "general" && (
                    <div className="toggleWrapper">
                        <label className="toggleSwitch">
                            <input
                                type="checkbox"
                                checked={searchInternet}
                                onChange={() => setSearchInternet(!searchInternet)}
                            />
                            <span className="slider"></span>
                        </label>
                        <span className="toggleLabel">Search Internet</span>
                    </div>
                )}
                <div className="inputWrapper">
                    <input
                        type="text"
                        name="text"
                        placeholder={`Ask me anything...`}
                        autoComplete="off"
                        className="styledInput"
                        ref={inputRef}
                    />
                    <button type="submit" className="submitButtonNewPrompt">
                        <i className="fa fa-paper-plane"></i>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewPrompt;
