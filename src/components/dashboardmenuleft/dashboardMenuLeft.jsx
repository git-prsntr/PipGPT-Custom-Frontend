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
import './dashboardMenuLeft.css';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * ChatList Component - Displays and manages user chats.
 */

const DashboardMenuLeft = () => {
  const location = useLocation();
  const queryClient = useQueryClient();

  /* State Variables */
  const [activeMenu, setActiveMenu] = useState(null); 


  return (
    <div className="dashboardMenuLeft">
      <div className={`menuItem ${location.pathname === "/dashboard" ? "active" : ""}`}>
        <Link to="/dashboard">
          <i className="fa-solid fa-house"></i>
          <span>Dashboard</span>
        </Link>
      </div>
      <hr />

      <span className="title">Tools</span>
      <div className="tools">
      <div className={`menuItem ${location.pathname === "/exampleprompts" ? "active" : ""}`}>
          <Link to="/exampleprompts">
            <i className="fa-solid fa-comments"></i>
            <span>Example Prompts</span>
          </Link>
        </div>
        <div className={`menuItem ${location.pathname === "/temporarychat" ? "active" : ""}`}>
          <Link to="/temporarychat">
            <i className="fa-solid fa-hourglass-half"></i>
            <span>Temporary Chat</span>
          </Link>
        </div>
        {/*
        <div className={`menuItem ${location.pathname === "/instantlookup" ? "active" : ""}`}>
          <Link to="/instantlookup">
            <i className="fa-solid fa-magnifying-glass"></i>
            <span>Instant Lookup</span>
          </Link>
        </div>
        */}
        <div className={`menuItem ${location.pathname === "/dashboard/tools/slidesgenerator" ? "active" : ""}`}>
          <Link to="/dashboard/tools/slidesgenerator">
            <i className="fa-solid fa-file-powerpoint"></i>
            <span>Slides Generator</span>
          </Link>
        </div>
        <div className={`menuItem ${location.pathname === "/dashboard/tools/datavisualiser" ? "active" : ""}`}>
          <Link to="/dashboard/tools/datavisualiser">
            <i className="fa-solid fa-table"></i>
            <span>Data Visualiser</span>
          </Link>
        </div>
        <div className={`menuItem ${location.pathname === "/dashboard/tools/reportgenerator" ? "active" : ""}`}>
          <Link to="/dashboard/tools/reportgenerator">
            <i className="fa-solid fa-file-invoice"></i>
            <span>Report Generator</span>
          </Link>
        </div>
        <div className={`menuItem ${location.pathname === "/dashboard/tools/contentwriter" ? "active" : ""}`}>
          <Link to="/dashboard/tools/contentwriter">
            <i className="fa-solid fa-pen-nib"></i>
            <span>Content Writer</span>
          </Link>
        </div>
        
      </div>

      <div className="bottom">
        <span className="title">Settings</span>
        <div className={`menuItem ${location.pathname === "/internal-documents" ? "active" : ""}`}>
          <Link to="/internal-documents">
            <i className="fa-solid fa-database"></i>
            <span>Internal Documents</span>
          </Link>
        </div>
        <div className={`menuItem ${location.pathname === "/about" ? "active" : ""}`}>
          <Link to="/about">
            <i className="fa-solid fa-circle-info"></i>
            <span>About</span>
          </Link>
        </div>
        <div className={`menuItem ${location.pathname === "/settings" ? "active" : ""}`}>
          <Link to="/settings">
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};


export default DashboardMenuLeft;