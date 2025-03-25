import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateCompletion } from "../../lib/openai"; // Assumes you have openai.js for OpenAI calls
import "./contentWriter.css";

const ContentWriter = () => {
    const navigate = useNavigate();
    const [contentDraft, setContentDraft] = useState("");
    const [keywords, setKeywords] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const [selectedAudience, setSelectedAudience] = useState([]);
    const [audienceOverlayOpen, setAudienceOverlayOpen] = useState(false);
    const [generatedContent, setGeneratedContent] = useState("");
    const [loading, setLoading] = useState(false);

    const audienceOptions = [
        "Technical",
        "Non-Technical",
        "Age 18-25",
        "Age 25-40",
        "Gender: Male",
        "Gender: Female",
    ];

    const handleBackClick = () => {
        navigate("/dashboard");
    };

    const handleAudienceSelection = (option) => {
        if (selectedAudience.includes(option)) {
            setSelectedAudience(selectedAudience.filter((item) => item !== option));
        } else {
            setSelectedAudience([...selectedAudience, option]);
        }
    };

    const handleGenerate = async () => {
        if (!contentDraft || !selectedPlatform || selectedAudience.length === 0) {
            alert("Please fill all fields before generating content.");
            return;
        }

        setLoading(true);
        try {
            const prompt = `
Generate content based on the following details:
- Content Draft: ${contentDraft}
- Keywords: ${keywords}
- Platform: ${selectedPlatform}
- Audience: ${selectedAudience.join(", ")}

Provide only the generated content, without any additional commentary or explanations.
`;

            const response = await generateCompletion([{ role: "user", content: prompt }], "general");
            setGeneratedContent(response);
        } catch (error) {
            console.error("Error generating content:", error);
            alert("Failed to generate content. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent);
        alert("Content copied to clipboard!");
    };

    const handleDownload = () => {
        const blob = new Blob([generatedContent], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "generated-content.txt";
        link.click();
    };

    return (
        <div className="contentWriter">
            <button className="backButton" onClick={handleBackClick}>
                ← Back to Dashboard
            </button>
            <h1>Content Writer</h1>

            <textarea
                className="contentInput"
                placeholder="Enter Content draft, instruction or detail"
                value={contentDraft}
                onChange={(e) => setContentDraft(e.target.value)}
            />

            <div className="inputControls">
                <input
                    type="text"
                    className="keywordsInput"
                    placeholder="Enter Keywords, Separate them by commas"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                />
                <select
                    className="dropdown"
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                >
                    <option value="">Select Platform</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Medium">Medium</option>
                    <option value="Twitter">Twitter</option>
                </select>
                <button
                    className="audienceButton"
                    onClick={() => setAudienceOverlayOpen(true)}
                >
                    {selectedAudience.length > 0
                        ? `Selected (${selectedAudience.length})`
                        : "Select Audience"}
                </button>
            </div>

            <button className="generateButton" onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating..." : "Generate"}
            </button>



            {generatedContent && (
                <div className="resultContainer">
                    <div className="charCount">
                        Characters: {generatedContent.length}
                    </div>

                    <textarea
                        className="generatedContent"
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                    />
                    <div className="actions">
                        <button className="downloadButton" onClick={handleDownload}>
                            Download as .txt
                        </button>
                        <button className="copyButton" onClick={handleCopy}>
                            Copy
                        </button>
                    </div>
                </div>
            )}

            {audienceOverlayOpen && (
                <div className="audienceOverlay">
                    <div className="overlayContent">
                        <h3>Select Audience</h3>
                        <div className="audienceList">
                            {audienceOptions.map((option) => (
                                <label key={option} className="dropdownItem">
                                    <input
                                        type="checkbox"
                                        checked={selectedAudience.includes(option)}
                                        onChange={() => handleAudienceSelection(option)}
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>
                        <button
                            className="audienceOkButton"
                            onClick={() => setAudienceOverlayOpen(false)}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentWriter;