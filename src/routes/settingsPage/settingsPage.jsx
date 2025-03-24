/**
 * @File Setting Page Component
 * @Description This is where users will be able to update any setting for the app.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import "./settingsPage.css";

const SettingsPage = () => {
    const navigate = useNavigate(); // Initialize the navigate function

    const handleBackClick = () => {
        navigate("/dashboard"); // Navigate to the dashboard
    };

    return (
        <div className="settingsPage">
            <h1>Settings</h1>
        </div>
    );
};

export default SettingsPage;
