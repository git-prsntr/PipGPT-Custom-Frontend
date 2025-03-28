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
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);

  // Fetch User Chats
// Fetch User Chats
const { data: userChats, isPending: isUserChatsPending, error } = useQuery({
  queryKey: ["userChats", selectedFilter],  // Refetch when filter changes
  queryFn: () => {
    const token = localStorage.getItem("token"); 
    const modelName = selectedFilter === "all" ? "" : selectedFilter; // Send empty string for "all"

    return fetch(`${import.meta.env.VITE_API_URL}/api/userchats?model=${selectedFilter}`, {
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${token}`,
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

  console.log(sortedUserChats,'sortedUserChats');
  
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

  const renderCategorizedChats = () => {
    // Get all chat IDs that are in folders
    const chatsInFoldersIds = Object.values(chatsInFolders).flat();

    // Filter out chats that are in folders
    const filterChats = (chats) => chats.filter(chat => !chatsInFoldersIds.includes(chat._id));

    return (
      <>
        {categorizedChats.today.length > 0 && (
          <>
            <span className="subHeading">Today</span>
            {filterChats(categorizedChats.today).map((chat) => renderChatItem(chat, false))}
          </>
        )}
        {categorizedChats.yesterday.length > 0 && (
          <>
            <span className="subHeading">Yesterday</span>
            {filterChats(categorizedChats.yesterday).map((chat) => renderChatItem(chat, false))}
          </>
        )}
        {categorizedChats.older.length > 0 && (
          <>
            <span className="subHeading">Older</span>
            {filterChats(categorizedChats.older).map((chat) => renderChatItem(chat, false))}
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

  const handleMoveChatToFolder = (folderName, chatId) => {
    // Add to folder
    setChatsInFolders((prev) => ({
      ...prev,
      [folderName]: [...(prev[folderName] || []), chatId],
    }));

    // Remove from pinned chats if it exists there
    if (pinnedChats?.some(chat => chat._id === chatId)) {
      unpinChatMutation.mutate(chatId);
    }

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


  //Render folder dropdown
  const renderFolderDropdown = () => {
    if (!movingChat || folders.length === 0) return null;

    return (
      <div className="folderDropdownOverlay" onClick={() => setMovingChat(null)}>
        <div className="folderDropdown" onClick={(e) => e.stopPropagation()}>
          <h4>Move to Folder</h4>
          {folders.map((folder) => (
            <div
              key={folder}
              className="folderOption"
              onClick={() => {
                handleMoveChatToFolder(folder, movingChat);
                setMovingChat(null);
              }}
            >
              <i className="fa-solid fa-folder"></i>
              {folder}
            </div>
          ))}
          <button
            className="cancelButton"
            onClick={() => setMovingChat(null)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
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
      {console.log(chat,'<<<<<<<<<<<<<<<<<<<<<<<,,,chat',newTitle)}
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
            : sortedUserChats.length === 0
              ? <p>No chats here. Create new chat.</p>
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
                // Find the chat in either userChats or pinnedChats
                const chat = [...(userChats || []), ...(pinnedChats || [])].find(c => c._id === chatId);
                return chat ? (
                  <div
                    key={chatId}
                    className={`chatItem ${chatIdFromURL === chat._id ? "active" : ""}`}
                  >
                    {renamingChat === chat._id ? (
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={() => {
                          renameMutation.mutate({ chatId: chat._id, newTitle });
                          handleMenuItemClick();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            renameMutation.mutate({ chatId: chat._id, newTitle });
                            handleMenuItemClick();
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <Link to={`/dashboard/chats/${chat._id}`}>{chat.title}</Link>
                    )}

                    <button className="menuButton" onClick={() => handleMenuToggle(`folder-${chat._id}`)}>
                      &#x22EE;
                    </button>
                    <div className={`menu ${activeMenu === `folder-${chat._id}` ? 'show-menu' : ''}`}
                      onMouseLeave={() => setActiveMenu(null)}>
                      <ul>
                        <li onClick={() => { setRenamingChat(chat._id); handleMenuItemClick(); }}>Rename</li>
                        <li onClick={() => { handleDeleteChat(chat._id); handleMenuItemClick(); }}>Delete</li>
                        <li onClick={() => {
                          pinChatMutation.mutate({ chatId: chat._id, title: chat.title });
                          handleMenuItemClick();
                        }}>Pin Chat</li>
                        <li onClick={() => {
                          // Remove from folder
                          setChatsInFolders(prev => ({
                            ...prev,
                            [folder]: prev[folder].filter(id => id !== chat._id)
                          }));
                          handleMenuItemClick();
                        }}>Remove from Folder</li>
                      </ul>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      ))}
      {renderFolderDropdown()}
    </div>
  );
};

export default ChatList;