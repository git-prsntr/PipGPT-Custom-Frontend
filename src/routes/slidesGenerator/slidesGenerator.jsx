/**
 * @Files Slides Generator Component
 * @Description This component allows users to generate and edit presentation slides based on AI-generated content.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PptxGenJS from "pptxgenjs";
import { generateCompletion } from "../../lib/openai";
import "./slidesGenerator.css";

/**
 * @component SlidesGenerator
 * @description Enables users to generate, edit, and download presentation slides.
 * @returns {JSX.Element} The SlidesGenerator component.
 */

const SlidesGenerator = () => {
    const navigate = useNavigate();
    const [instruction, setInstruction] = useState("");
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false); // State for preview modal visibility
    const [loadingText, setLoadingText] = useState("Generating...");

    // Loading texts array
    const loadingTexts = [
        "Generating your slides...",
        "Drafting impactful titles...",
        "Curating concise content...",
        "Finalizing presentation structure...",
        "Almost ready...",
    ];

    // Rotate loading texts while loading
    useEffect(() => {
        if (loading) {
            let index = 0;
            const interval = setInterval(() => {
                setLoadingText(loadingTexts[index]);
                index = (index + 1) % loadingTexts.length;
            }, 2000); // Change every 2 seconds
            return () => clearInterval(interval);
        }
    }, [loading]);

    const handleBackClick = () => {
        navigate("/dashboard");
    };

    // Parse human-readable response
    const parseHumanReadableResponse = (response) => {
        const slides = [];
        const slideRegex = /Slide \d+:\s*Title:\s*(.+?)\s*Content:\s*(.+?)(?=Slide \d+:|$)/gs;

        let match;
        while ((match = slideRegex.exec(response)) !== null) {
            slides.push({
                title: match[1].trim(),
                content: match[2].trim(),
            });
        }

        return slides;
    };

    const generateSlidesFromInstruction = async () => {
        if (!instruction.trim()) {
            alert("Please enter a valid instruction!");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const messages = [
                {
                    role: "user",
                    content: `Generate presentation slides based on the following instruction:\n"${instruction}".\nRespond in this format:\n\nSlide 1:\nTitle: {title}\nContent: {content}\n\nSlide 2:\nTitle: {title}\nContent: {content}\n...`,
                },
            ];

            const response = await generateCompletion(messages, "general");

            // Parse the human-readable response
            const parsedSlides = parseHumanReadableResponse(response);

            if (parsedSlides.length > 0) {
                setSlides(parsedSlides);
            } else {
                throw new Error("Failed to extract slides from the response.");
            }
        } catch (err) {
            console.error("Error generating slides:", err);
            setError("Failed to generate slides. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const updateSlide = (index, field, value) => {
        const updatedSlides = [...slides];
        updatedSlides[index][field] = value;
        setSlides(updatedSlides);
    };

    const deleteSlide = (index) => {
        const updatedSlides = slides.filter((_, i) => i !== index);
        setSlides(updatedSlides);
    };

    const addSlideBelow = (index) => {
        const newSlide = { title: `New Slide ${slides.length + 1}`, content: "" };
        const updatedSlides = [
            ...slides.slice(0, index + 1),
            newSlide,
            ...slides.slice(index + 1),
        ];
        setSlides(updatedSlides);
    };

    const generatePresentation = () => {
        const pptx = new PptxGenJS();
        slides.forEach((slide) => {
            const slideObj = pptx.addSlide();
            slideObj.addText(slide.title, { x: 1, y: 1, fontSize: 24 });
            slideObj.addText(slide.content, { x: 1, y: 2, fontSize: 18 });
        });
        pptx.writeFile("GeneratedPresentation.pptx");
    };

    return (
        <div className="slidesGenerator">
            <h1 className="header-style">Generate Presentation Slides</h1>

            {/* Instruction Input */}
            <textarea
                placeholder="Explain your presentation in detail. More detail, better the slides."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="instructionInput"
            ></textarea>
            <button className="generateButton" onClick={generateSlidesFromInstruction} disabled={loading}>
                {loading ? loadingText : "Generate Slides"}
            </button>

            {error && <p className="error">{error}</p>}

            {/* Slides Editor */}
            {slides.length > 0 && (
                <div className="slidesEditor">
                    <h2>Edit Slides</h2>
                    {slides.map((slide, index) => (
                        <div key={index} className="slideEditor">
                            <h3>Slide {index + 1}</h3>
                            <div className="editorRow">
                                <input
                                    type="text"
                                    placeholder="Slide Title"
                                    value={slide.title}
                                    onChange={(e) => updateSlide(index, "title", e.target.value)}
                                />
                                <textarea
                                    placeholder="Slide Content"
                                    value={slide.content}
                                    onChange={(e) => updateSlide(index, "content", e.target.value)}
                                />
                                <div className="buttonRow">
                                    <button className="addSlideButton" onClick={() => addSlideBelow(index)}>
                                        + Add Slide Below
                                    </button>
                                    <button className="deleteSlideButton" onClick={() => deleteSlide(index)}>
                                        Delete Slide
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview and Generate Buttons */}
            {slides.length > 0 && (
                <div className="actions">
                    <button className="previewButton" onClick={() => setPreviewVisible(true)}>
                        Preview Presentation
                    </button>
                    <button className="downloadButton" onClick={generatePresentation}>
                        Download Presentation
                    </button>
                </div>
            )}

            {/* Preview Modal */}
            {previewVisible && (
                <div className="previewModal">
                    <div className="modalContent">
                        <button className="closeModal" onClick={() => setPreviewVisible(false)}>
                            × Close
                        </button>
                        <h2>Presentation Preview</h2>
                        {slides.map((slide, index) => (
                            <div key={index} className="previewSlide">
                                <h3>{slide.title}</h3>
                                <p>{slide.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SlidesGenerator;
