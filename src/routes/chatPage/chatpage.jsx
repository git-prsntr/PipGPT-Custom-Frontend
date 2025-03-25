import "./chatpage.css";
import NewPrompt from "../../components/newPrompt/newPrompt";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const Chatpage = () => {
  const path = useLocation().pathname;
  const chatId = path.split("/").pop();
  const isLoadingChatId = chatId === "loading";
  const navigate = useNavigate();

  const location = useLocation();
  const { selectedModel } = location.state || { selectedModel: "ampgpt" };
  const modelDisplayName =
    selectedModel === "ampgpt" ? "Internal AMP GPT" : "External PipGPT";

  const { data: userChatsData } = useQuery({
    queryKey: ["userChats"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  const { data: pinnedChatsData } = useQuery({
    queryKey: ["pinnedChats"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/pinnedchats`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  const {
    isLoading,
    error,
    data,
    refetch,
  } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chats/${chatId}`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to fetch chat data");
      return response.json();
    },
    enabled: !isLoadingChatId && !!chatId,
    staleTime: 0,
    cacheTime: 0,
  });

  const chatTitle =
    userChatsData?.find((chat) => chat._id === chatId)?.title ||
    pinnedChatsData?.find((chat) => chat._id === chatId)?.title ||
    "Chat Title";

  useEffect(() => {
    if (!isLoadingChatId) {
      refetch();
    }
  }, [chatId, refetch, isLoadingChatId]);

  return (
    <div className="chatpage">
      <div className="titleSection">
        <h1 className="header-style">{chatTitle}</h1>
        <h3>
          You are using <b>{modelDisplayName}</b>. To use another model, create a new chat.
        </h3>
      </div>

      <NewPrompt
        initialMessages={data?.history || []}
        selectedModel={selectedModel}
        chatId={chatId}
        loading={isLoading || isLoadingChatId}
        error={error}
      />
    </div>
  );
};

export default Chatpage;
