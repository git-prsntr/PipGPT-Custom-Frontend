/**
 * ChatList Component
 * 
 * This component displays a list of user chats, pinned chats, and folders to organize chats.
 * Users can rename, delete, pin/unpin, and move chats into folders.
 * It uses React Query for data fetching and state management.
 */

import { useState } from 'react';
import React from "react";
import { Link, useLocation } from 'react-router-dom';
import './chatList.css';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * ChatList Component - Displays and manages user chats.
 */

const ChatList = () => {
  const location = useLocation();
  const queryClient = useQueryClient();

  const [showFilter, setShowFilter] = useState(false);  // State for dropdown visibility
  const [selectedFilter, setSelectedFilter] = useState("all"); // "all", "internal", "external"

  const filterOptions = {
    all: { text: "All Chats", icon: null },
    internal: { text: "Internal Chats", icon: <i className="fa-solid fa-brain filterIcon"></i> },
    external: { text: "External Chats", icon: <i className="fa-solid fa-robot filterIcon"></i> }
  };

  /* State Variables */
  const [activeMenu, setActiveMenu] = useState(null); // Track which menu is active for chats
  const [renamingChat, setRenamingChat] = useState(null); // Track the chat being renamed
  const [newTitle, setNewTitle] = useState(""); // Track the new title for renaming
  const [folderName, setFolderName] = useState(""); // Track new folder name
  const [folders, setFolders] = useState([]); // Store the created folders
  const [addingFolder, setAddingFolder] = useState(false); // Track whether the user is adding a folder
  const [movingChat, setMovingChat] = useState(null); // Track the chat being moved to a folder
  const [chatsInFolders, setChatsInFolders] = useState({}); // Store chats assigned to folders
  const [expandedFolders, setExpandedFolders] = useState({}); // Track which folders are expanded
  const [folderMenu, setFolderMenu] = useState(null); // Track active folder menu
  const [renamingFolder, setRenamingFolder] = useState(null); // Track the folder being renamed
  const [newFolderName, setNewFolderName] = useState(""); // Track new folder name for renaming
  const chatIdFromURL = location.pathname.split("/").pop();

  // Fetch User Chats
// Fetch User Chats
const { data: userChats, isPending: isUserChatsPending, error } = useQuery({
  queryKey: ["userChats"],
  queryFn: () => {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage
    return fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${token}`, // Include token in Authorization header
        "Content-Type": "application/json",
      },
    }).then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch user chats");
      }
      return res.json();
    });
  },
});

// Fetch Pinned Chats
const { data: pinnedChats = [], isPending: isPinnedChatsPending } = useQuery({
  queryKey: ["pinnedChats"],
  queryFn: () => {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage
    return fetch(`${import.meta.env.VITE_API_URL}/api/pinnedchats`, {
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${token}`, // Include token in Authorization header
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch pinned chats");
        }
        return res.json();
      })
      .then((data) =>
        Array.isArray(data)
          ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : []
      );
  },
});


  // Sort user chats (newest first)
  const sortedUserChats = userChats?.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];  


  // Categorize chats into Today, Yesterday, and Older
  const categorizeChats = (chats) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const categorizedChats = {
      today: [],
      yesterday: [],
      older: [],
    };

    chats.forEach((chat) => {
      const chatDate = new Date(chat.createdAt);
      if (chatDate.toDateString() === today.toDateString()) {
        categorizedChats.today.push(chat);
      } else if (chatDate.toDateString() === yesterday.toDateString()) {
        categorizedChats.yesterday.push(chat);
      } else {
        categorizedChats.older.push(chat);
      }
    });

    return categorizedChats;
  };

  const categorizedChats = categorizeChats(sortedUserChats);

  // Render categorized chats with subheadings
  const renderCategorizedChats = () => {
    return (
      <>
        {categorizedChats.today.length > 0 && (
          <>
            <span className="subHeading">Today</span>
            {categorizedChats.today.map((chat) => renderChatItem(chat, false))}
          </>
        )}
        {categorizedChats.yesterday.length > 0 && (
          <>
            <span className="subHeading">Yesterday</span>
            {categorizedChats.yesterday.map((chat) => renderChatItem(chat, false))}
          </>
        )}
        {categorizedChats.older.length > 0 && (
          <>
            <span className="subHeading">Older</span>
            {categorizedChats.older.map((chat) => renderChatItem(chat, false))}
          </>
        )}
      </>
    );
  };


  // Mutation to pin a chat
  const pinChatMutation = useMutation({
      mutationFn: ({ chatId, title }) => {
          const token = localStorage.getItem("token"); // Retrieve token

          return fetch(`${import.meta.env.VITE_API_URL}/api/pinnedchats`, {
              method: "POST",
              credentials: "include",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`, // Include token
              },
              body: JSON.stringify({ chatId, title }),
          });
      },
      onSuccess: () => {
          queryClient.invalidateQueries(["userChats"]);
          queryClient.invalidateQueries(["pinnedChats"]);
      },
  });

  // Mutation to unpin a chat

  const unpinChatMutation = useMutation({
    mutationFn: (chatId) => {
        const token = localStorage.getItem("token");

        return fetch(`${import.meta.env.VITE_API_URL}/api/pinnedchats/${chatId}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
    },
    onSuccess: () => {
        queryClient.invalidateQueries(["userChats"]);
        queryClient.invalidateQueries(["pinnedChats"]);
    },
  });

  // Mutation to delete a chat
  const deleteChatMutation = useMutation({
    mutationFn: (chatId) => {
        const token = localStorage.getItem("token");

        return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        }).then((res) => {
            if (!res.ok) throw new Error("Failed to delete chat");
            return res.json();
        });
    },
    onSuccess: () => {
        queryClient.invalidateQueries(["userChats"]);
        queryClient.invalidateQueries(["pinnedChats"]);
    },
    onError: (error) => {
        console.error("Error deleting chat:", error);
    },
  });

  // Mutation to delete chat from pinned chats section
  const deletePinnedChatMutation = useMutation({
    mutationFn: (chatId) => {
        const token = localStorage.getItem("token");

        return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        }).then((res) => {
            if (!res.ok) throw new Error("Failed to delete pinned chat");
            return res.json();
        });
    },
    onSuccess: () => {
        queryClient.invalidateQueries(["pinnedChats"]);
    },
    onError: (error) => {
        console.error("Error deleting pinned chat:", error);
    },
  });


  // Delete Handlers
  const handleDeleteChat = (chatId) => {
    deleteChatMutation.mutate(chatId);
  };

  const handleDeletePinnedChat = (chatId) => {
    deletePinnedChatMutation.mutate(chatId);
  };

  // Mutation to Rename a chat

  const renameMutation = useMutation({
    mutationFn: ({ chatId, newTitle }) => {
        const token = localStorage.getItem("token");

        return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}/rename`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ newTitle }),
        });
    },
    onSuccess: () => {
        queryClient.invalidateQueries(["userChats"]);
        queryClient.invalidateQueries(["pinnedChats"]);
        setRenamingChat(null);
        setNewTitle("");
    },
  });;


  // Add a New Folder Handler
  const handleAddFolder = () => {
    if (folders.length < 5 && folderName.trim()) {
      setFolders((prevFolders) => [...prevFolders, folderName]);
      setFolderName("");
      setAddingFolder(false);
    }
  };

  // Move chat to the folder Handler
  const handleMoveChatToFolder = (folderName, chatId) => {
    setChatsInFolders((prev) => ({
      ...prev,
      [folderName]: [...(prev[folderName] || []), chatId],
    }));
    setMovingChat(null);
  };

  // Toggle folder expansion
  const toggleFolderExpansion = (folderName) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  // Menu Toggle Handler
  const handleMenuToggle = (chatId) => {
    setActiveMenu((prev) => (prev === chatId ? null : chatId));
  };

  // Menu Item Click Handler
  const handleMenuItemClick = () => {
    setActiveMenu(null);
  };


  // Renaming a Chat Hndlers
  const handleRename = (chatId) => {
    renameMutation.mutate({ chatId, newTitle });
  };

  // Delete Folder Handler
  const handleDeleteFolder = (folderName) => {
    const chatsInFolder = chatsInFolders[folderName] || [];
    chatsInFolder.forEach((chatId) => deleteMutation.mutate(chatId)); // Delete all chats inside folder
    setFolders(folders.filter((folder) => folder !== folderName));
    setFolderMenu(null); // Reset the folder menu
  };

  // Renaming Folder Handler
  const handleRenameFolder = (folderName) => {
    setFolders(
      folders.map((folder) => (folder === renamingFolder ? newFolderName : folder))
    );
    setRenamingFolder(null); // Reset renaming state
    setNewFolderName(""); // Reset input
  };

  //Chat Lists Rendering
  const renderChatItem = (chat, isPinned) => (
    
    <div
      key={chat.chatId}
      className={`chatItem ${chatIdFromURL === chat.chatId ? "active" : ""}`}
    >
      {renamingChat === chat.chatId ? (
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={() => {
            renameMutation.mutate({ chatId: chat.chatId, newTitle });
            handleMenuItemClick(); // Close menu after renaming
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              renameMutation.mutate({ chatId: chat.chatId, newTitle });
              handleMenuItemClick(); // Close menu after pressing Enter
            }
          }}
          autoFocus
        />
      ) : (
        <Link to={`/dashboard/chats/${chat.chatId}`}>{chat.title}</Link>
      )}

      <button className="menuButton" onClick={() => handleMenuToggle(chat.chatId)}>
        &#x22EE; {/* Three-dot menu icon */}
      </button>
      <div className={`menu ${activeMenu === chat.chatId ? 'show-menu' : ''}`} onMouseLeave={() => setActiveMenu(null)}>
        <ul>
          <li onClick={() => { setRenamingChat(chat.chatId); handleMenuItemClick(); }}>Rename</li>
          <li onClick={() => { isPinned ? handleDeletePinnedChat(chat.chatId) : handleDeleteChat(chat.chatId); handleMenuItemClick(); }}>Delete</li>
          {isPinned ? (
            <li onClick={() => { unpinChatMutation.mutate(chat.chatId); handleMenuItemClick(); }}>Unpin Chat</li>
          ) : (
            <li onClick={() => { pinChatMutation.mutate({ chatId: chat.chatId, title: chat.title }); handleMenuItemClick(); }}>Pin Chat</li>
          )}
          {folders.length > 0 ? (
            <li onClick={() => { setMovingChat(chat.chatId); handleMenuItemClick(); }}>Move to Folder</li>
          ) : (
            <li className="disabled">Move to Folder</li>
          )}
        </ul>
      </div>
    </div>
  );


return (
    <div className="chatList">
      <span className="title">Pinned Chats</span>
      <div className="list pinned-list">
        {isPinnedChatsPending
          ? "Loading..."
          : pinnedChats?.length > 0
            ? pinnedChats.map((chat) => renderChatItem(chat, true))
            : <p>No pinned chats</p>}
      </div>

      {/* All Chats Title with Filter Dropdown */}
      <div className="chatListHeader">
        <span className="title">Chats</span>
        <div className="filterDropdown">
          <button className="dropdownButton" onClick={() => setShowFilter(!showFilter)}>
            {filterOptions[selectedFilter].icon}
            {filterOptions[selectedFilter].text}
            <i className={`fa-solid fa-chevron-down ${showFilter ? "rotate" : ""}`}></i>
          </button>
          {showFilter && (
            <ul className={`dropdownMenu ${showFilter ? "show" : ""}`}>
              <li
                className={selectedFilter === "all" ? "active" : ""}
                onClick={() => { setSelectedFilter("all"); setShowFilter(false); }}
              >
                All Chats
              </li>
              <li
                className={selectedFilter === "internal" ? "active" : ""}
                onClick={() => { setSelectedFilter("internal"); setShowFilter(false); }}
              >
                <i className="fa-solid fa-brain filterIcon"></i> Internal Chats
              </li>
              <li
                className={selectedFilter === "external" ? "active" : ""}
                onClick={() => { setSelectedFilter("external"); setShowFilter(false); }}
              >
                <i className="fa-solid fa-robot filterIcon"></i> External Chats
              </li>
            </ul>
          )}
        </div>
      </div>

      <div className="list all-chats-list">
        {isUserChatsPending
          ? "Loading..."
          : error
            ? "Something went wrong!"
            : renderCategorizedChats()}
      </div>

      <hr />
      <div className="folderSection">
        <div className="folderHeader">
          <span className="title">Chat Folders</span>
          {folders.length < 5 && (
            <button className="addFolderButton" onClick={() => setAddingFolder(true)}>+</button>
          )}
        </div>

        {addingFolder && (
          <div className="addFolderContainer">
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Folder Name"
            />
            <button onClick={handleAddFolder} className="addTextButton">Add</button>
          </div>
        )}
      </div>

      {folders.map((folder, index) => (
        <div className="folderitem" key={index}>
          <div className="folderHeaderContainer" onClick={() => toggleFolderExpansion(folder)}>
            <i className="fa-solid fa-folder"></i>
            <span>{renamingFolder === folder ? (
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onBlur={() => handleRenameFolder(folder)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameFolder(folder);
                }}
                autoFocus
              />
            ) : (
              folder
            )}</span>
            <button
              className="menuButton"
              onClick={() => setFolderMenu(folderMenu === folder ? null : folder)}
            >
              &#x22EE;
            </button>
            <div
              className={`menu ${folderMenu === folder ? 'show-menu' : ''}`}
              onMouseLeave={() => setFolderMenu(null)}
            >
              <ul>
                <li onClick={() => setRenamingFolder(folder)}>Rename</li>
                <li onClick={() => handleDeleteFolder(folder)}>Delete</li>
              </ul>
            </div>
          </div>
          {expandedFolders[folder] && (
            <div className="folderChats">
              {chatsInFolders[folder]?.map((chatId) => {
                const chat = data.find((c) => c.chatId === chatId);
                return (
                  <div key={chatId}>
                    <Link to={`/dashboard/chats/${chatId}`}>{chat?.title}</Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatList;