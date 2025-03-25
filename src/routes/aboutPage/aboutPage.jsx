import React from "react";
import { useNavigate } from "react-router-dom";
import "./aboutPage.css";

const AboutPage = () => {
    const navigate = useNavigate(); // Initialize the navigate function

    const handleBackClick = () => {
        navigate("/dashboard"); // Navigate to the dashboard
    };

    return (
        <div className="aboutPage">
            <button className="backButton" onClick={handleBackClick}>
                ← Back to Dashboard
            </button>
            <h1>About</h1>
        </div>
    );
};

export default AboutPage;
