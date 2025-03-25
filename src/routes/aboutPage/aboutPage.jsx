import React from "react";
import { useNavigate } from "react-router-dom";
import "./aboutPage.css";

const AboutPage = () => {
    const navigate = useNavigate(); // Initialize the navigate function



    return (
        <div className="aboutPage">
            <h1 className="header-style">About</h1>
            <p>PipGPT is your intelligent content assistant—designed to help individuals and businesses unlock the full potential of their ideas, data, and communication.

                Built with advanced AI capabilities, PipGPT is more than just a chatbot. It’s a powerful tool tailored for productivity, innovation, and clarity. Whether you're generating sales pitches, analyzing complex data, drafting reports, creating engaging presentations, or answering domain-specific questions—PipGPT is here to assist.</p>
        </div>
    );
};

export default AboutPage;
