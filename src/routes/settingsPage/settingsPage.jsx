import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { themes } from "../../data/themeColors";
import "./settingsPage.css";

const SettingsPage = () => {
    const navigate = useNavigate();
    const [selectedTheme, setSelectedTheme] = useState("Blue");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [logoPreview, setLogoPreview] = useState(localStorage.getItem("companyLogo") || null);
    const [companyTitle, setCompanyTitle] = useState(localStorage.getItem("companyTitle") || "PipGPT");
    const dropdownRef = useRef(null);

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            localStorage.setItem("companyLogo", reader.result);
            setLogoPreview(reader.result);
            window.dispatchEvent(new Event("storage"));
        };
        reader.readAsDataURL(file);
    };

    const handleThemeChange = (themeName) => {
        setSelectedTheme(themeName);
        const theme = themes[themeName];
        for (const key in theme) {
            document.documentElement.style.setProperty(key, theme[key]);
        }
        setIsDropdownOpen(false);
    };

    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setIsDropdownOpen(false);
        }
    };

    // ✅ Handle title change and update document title
    const handleTitleChange = (e) => {
        const value = e.target.value.slice(0, 50); // max 50 characters
        setCompanyTitle(value);
        localStorage.setItem("companyTitle", value);
        document.title = value || "PipGPT";
    };

    useEffect(() => {
        document.title = companyTitle || "PipGPT";
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="settingsPage">
            <div className="settingsHeader">
                <h1 className="header-style">Settings</h1>
            </div>

            {/* 🆕 Branding Settings */}
            <div className="brandingSettings">
                <h2 className="brandingTitle">Branding Settings</h2>
                <div className="brandingGrid">
                    {/* Company Title */}
                    <div className="companyTitleInput">
                        <label className="selectorLabel">Company Title (max 50 characters):</label>
                        <input
                            type="text"
                            maxLength={50}
                            value={companyTitle}
                            onChange={handleTitleChange}
                            placeholder="Enter your company title"
                        />
                    </div>

                    {/* Logo Upload */}
                    <div className="logoUploader">
                        <label className="selectorLabel">Upload Company Logo:</label>
                        <div className="logoRow">
                            {logoPreview && (
                                <img src={logoPreview} alt="Company Logo" className="logoPreview" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                            />

                        </div>
                    </div>


                    {/* Theme Selector */}
                    <div className="themeSelector">
                        <label className="selectorLabel">Select Theme:</label>
                        <div className="themeDropdown" ref={dropdownRef}>
                            <div
                                className="dropdownToggle"
                                onClick={() => setIsDropdownOpen((prev) => !prev)}
                                style={{ backgroundColor: themes[selectedTheme]["--primary-color"] }}
                            >
                                <span className="selectedColor" />
                                <span className="arrow">▼</span>
                            </div>
                            {isDropdownOpen && (
                                <div className="dropdownGrid">
                                    {Object.entries(themes).map(([name, themeObj]) => (
                                        <div
                                            key={name}
                                            className="swatch"
                                            style={{ backgroundColor: themeObj["--primary-color"] }}
                                            onClick={() => handleThemeChange(name)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default SettingsPage;
