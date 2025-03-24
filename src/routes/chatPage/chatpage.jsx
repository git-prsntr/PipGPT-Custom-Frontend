/**
 * @file Chatpage Component
 * @description This component renders a chat interface where users can interact with an AI model. It fetches chat history, manages loading states, and allows navigation.
 */

import "./chatpage.css";
import NewPrompt from "../../components/newPrompt/newPrompt";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

/**
 * @component Chatpage
 * @description Renders the chat interface and manages chat history fetching.
 * @returns {JSX.Element} The Chatpage component.
 */

const Chatpage = () => {
    const path = useLocation().pathname;
    const chatId = path.split("/").pop();
    const isLoadingChatId = chatId === "loading";

    const token = localStorage.getItem("token"); // Retrieve token from localStorage


    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate("/dashboard"); // Navigate to the dashboard page
    };

    const location = useLocation();
    const { selectedModel } = location.state || { selectedModel: "ampgpt" };

    const modelDisplayName =
        selectedModel === "ampgpt" ? "Internal AMP GPT" : "External PipGPT";

    // Fetch user chats to get the title
    const { data: userChatsData } = useQuery({
        queryKey: ["userChats"],
        queryFn: () => {
            const token = localStorage.getItem("token"); // Retrieve token from localStorage
            return fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${token}`, // Add token in Authorization header
                    "Content-Type": "application/json",
                },
            }).then((res) => {
                if (!res.ok) throw new Error("Failed to fetch user chats");
                return res.json();
            });
        },
    });

    // Fetch pinned chats to get the title
    const { data: pinnedChatsData } = useQuery({
        queryKey: ["pinnedChats"],
        queryFn: () => {
            const token = localStorage.getItem("token");
            return fetch(`${import.meta.env.VITE_API_URL}/api/pinnedchats`, {
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }).then((res) => {
                if (!res.ok) throw new Error("Failed to fetch pinned chats");
                return res.json();
            });
        },
    });

    // Only fetch chat history if chatId is valid (not "loading")
    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ["chat", chatId],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to fetch chat data");
            return response.json();
        },
        enabled: !isLoadingChatId && !!chatId,
        staleTime: 0,
        cacheTime: 0,
    });

    // Extract chat title from both userChats and pinnedChats
    const chatTitle =
        userChatsData?.find((chat) => chat.chatId === chatId)?.title ||
        pinnedChatsData?.find((chat) => chat.chatId === chatId)?.title ||
        "Chat Title";

    // Loading text animation
    const [loadingTextIndex, setLoadingTextIndex] = useState(0);
    const loadingTexts = ["Digging resources...", "Connecting dots...", "Building sentences..."];

    useEffect(() => {
        if (!isLoading && !isLoadingChatId) return;
        const interval = setInterval(() => {
            setLoadingTextIndex((prevIndex) => (prevIndex + 1) % loadingTexts.length);
        }, 1000);
        return () => clearInterval(interval);
    }, [isLoading, isLoadingChatId]);


    // Refetch when chatId changes, if valid
    useEffect(() => {
        if (!isLoadingChatId) {
            refetch();
        }
    }, [chatId, refetch, isLoadingChatId]);


    return (
        <div className="chatpage">
            <div className="titleSection">
                <h2>{chatTitle}</h2>
                <h3>
                    You are using <b>{modelDisplayName}</b>. To use another model, create a new chat.
                </h3>
            </div>
            <div className="wrapper">
                <div className="chat">
                    {(isLoading || isLoadingChatId) ? (
                        <div className="message assistant loading">
                            {loadingTexts[loadingTextIndex]} {/* Display rotating loading texts */}
                        </div>
                    ) : error ? (
                        "Something went wrong!"
                    ) : (
                        data && (
                            <NewPrompt
                                initialMessages={data.history}
                                selectedModel={selectedModel}
                                chatId={chatId} // Pass chatId to NewPrompt
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chatpage;
