import { useNavigate } from "react-router-dom";
import "./dashboardpage.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { generateCompletion } from "../../lib/openai";
import { useState, useRef, useEffect } from "react";
import { promptSections } from "../../data/promptsData"; 

const Dashboardpage = () => {
    const [messages, setMessages] = useState([]);
    const [selectedModel, setSelectedModel] = useState("ampgpt");
    const [showOptions, setShowOptions] = useState(true);
    const [randomPrompts, setRandomPrompts] = useState([]); 

    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { user } = useUser();

    const [text, setText] = useState("");
    const textareaRef = useRef(null);
    const formContainerRef = useRef(null);
    const buttonContainerRef = useRef(null);

   //Handle enter to submit 

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(text);
            e.target.value = ''; 
            setText(''); 
        }
    };

    // Get current hour and determine greetings.
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 12) {
            return "Good Morning";
        } else if (hour >= 12 && hour < 18) {
            return "Good Afternoon";
        } else {
            return "Good Night";
        }
    };

    // For the dynamic container heights
    useEffect(() => {
        if (textareaRef.current && formContainerRef.current && buttonContainerRef.current) {
            const textarea = textareaRef.current;
            const formContainer = formContainerRef.current;
            const buttonContainer = buttonContainerRef.current;

            // Reset the height first
            textarea.style.height = "auto";

            // Set new height based on content
            const newTextAreaHeight = Math.min(textarea.scrollHeight, 250); // Limit textarea height
            textarea.style.height = `${newTextAreaHeight}px`;

            // Calculate total height of form container
            const buttonHeight = buttonContainer.offsetHeight + 20; // Including padding
            const totalHeight = newTextAreaHeight + buttonHeight + 20; // Consistent spacing
            formContainer.style.height = `${Math.min(totalHeight, 400)}px`; // Limit max height
        }
    }, [text]);

    const ModelName =  selectedModel === "ampgpt" ? "internal" : "external";
    // Mutation to create a new chat session and navigate to the chat page
    const mutation = useMutation({
        mutationFn: ({ text, assistantResponse }) => {
            const token = localStorage.getItem("token"); // Get token from localStorage

            return fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Include token in Authorization header
                },
                body: JSON.stringify({ text, assistantResponse,ModelName }),
            }).then((res) => {
                if (!res.ok) throw new Error("Failed to send chat message");
                return res.json();
            });
        },
        onSuccess: (data) => {
            if (data.chatId) {
                queryClient.invalidateQueries({ queryKey: ["userChats"] });
                navigate(`/dashboard/chats/${data.chatId}`, { state: { selectedModel } });
            }
        },
        onError: (error) => {
            console.error("Mutation error:", error);
        },
    });


    /**
     * Handles user input submission to generate AI responses.
     * @async
     * @param {string} text - User input text.
     */
    const handleSubmit = async (text) => {
        if (!text) return;

        const updatedMessages = [...messages, { role: "user", content: text }];
        setMessages(updatedMessages);

        // Navigate immediately to the chat page with a loading state
        navigate(`/dashboard/chats/loading`, { state: { loading: true, selectedModel } });

        try {
            const assistantResponse = await generateCompletion(updatedMessages, selectedModel);
            const updatedMessagesWithResponse = [
                ...updatedMessages,
                { role: "assistant", content: assistantResponse },
            ];
            setMessages(updatedMessagesWithResponse);

            // Save the chat
            mutation.mutate({ text, assistantResponse });
        } catch (err) {
            console.error("Error generating assistant response:", err);
        }
    };

    /**
     * Handles form submission event.
     * @param {Event} e - Form submission event.
     */
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const text = e.target.text.value;
        handleSubmit(text);
        e.target.reset();
    };

    const toggleModel = () => {
        setSelectedModel((prevModel) => (prevModel === "ampgpt" ? "general" : "ampgpt"));
    };

    const toggleOptions = () => {
        setShowOptions(!showOptions);
    };

    const handleToolClick = (tool) => {
        if (tool === "slidesGenerator") {
            navigate("/dashboard/tools/slidesgenerator");
        } else if (tool === "reportGenerator") {
            navigate("/dashboard/tools/reportgenerator");
        } else if (tool === "contentWriter") {
            navigate("/dashboard/tools/contentwriter");
        } else if (tool === "dataVisualiser") {
            navigate("/dashboard/tools/dataVisualiser");
        } else if (tool === "chat") {
            navigate(`/dashboard/chats`, { state: { selectedModel } });
        }
    };

    /**
     * Fetches 4 random prompts from the promptSections data.
     */
    const refreshPrompts = () => {
        // Flatten all prompts into a single array
        const allPrompts = promptSections.flatMap((section) =>
            section.prompts.map((prompt) => ({
                category: section.title,
                icon: section.icon,
                prompt,
            }))
        );

        // Shuffle the prompts and pick 4 random ones
        const shuffledPrompts = allPrompts.sort(() => 0.5 - Math.random());
        const selectedPrompts = shuffledPrompts.slice(0, 4);
        setRandomPrompts(selectedPrompts);
    };

    // Fetch initial random prompts on component mount
    useEffect(() => {
        refreshPrompts();
    }, []);

    return (
        <div className="dashboardpage">
            <div className="welcomeText">
                <h1>{getGreeting()}, {user?.firstName || "there"}.</h1>
                <h3>What would you like me to do today?</h3>
            </div>

            <div className="formcontainer" ref={formContainerRef}>
                <form onSubmit={handleFormSubmit}>
                    <textarea
                        ref={textareaRef}
                        name="text"
                        placeholder={`Ask me anything... (Press Enter to send, Shift+Enter for new line)`}
                        autoComplete="off"
                        rows="2"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                    ></textarea>
                    <div className="button-container" ref={buttonContainerRef}>
                        <div className="choosemodel">
                            <div className="modelToggleSwitch" onClick={toggleModel}>
                                <div className={`modelToggleOption ${selectedModel === "ampgpt" ? "active" : ""}`}>
                                    <i className={`fa-solid fa-brain modelIcon ${selectedModel === "ampgpt" ? "activeIcon" : ""}`}></i>
                                    Internal AMP GPT
                                </div>
                                <div className={`modelToggleOption ${selectedModel === "general" ? "active" : ""}`}>
                                    <i className={`fa-solid fa-robot modelIcon ${selectedModel === "general" ? "activeIcon" : ""}`}></i>
                                    External PipGPT
                                </div>
                            </div>
                        </div>

                        <button type="submit">
                            <i className="fa fa-paper-plane"></i>
                        </button>
                    </div>
                </form>
            </div>

            <div className="examplePromptssection">
                <div className="promptsHeader">
                    <h3>Example Prompts</h3>
                    <button className="refreshPromptsButton" onClick={refreshPrompts}>
                        <i className="fas fa-sync-alt"></i> Refresh Prompts
                    </button>
                </div>
                <div className="promptsContainer">
                    {randomPrompts.map((item, index) => (
                        <div key={index} className="promptTile" onClick={() => handleSubmit(item.prompt)}>
                            <i className={`${item.icon} promptIcon`}></i>
                            <div className="promptText">
                                <h4>{item.category}</h4>
                                <p>{item.prompt}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboardpage;