/**
 * @Files Slides Generator Component
 * @Description This component allows users to generate and edit presentation slides based on AI-generated content.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PptxGenJS from "pptxgenjs";
import { generateCompletion } from "../../lib/openai";
import "./slidesGenerator.css";

const TEMPLATE_OPTIONS = {
    CUSTOM: "custom",
    FINANCIAL_PLANNER: "financial_planner",
    PRODUCT_PROMOTION: "product_promotion",
};

const SlidesGenerator = () => {
    const navigate = useNavigate();
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATE_OPTIONS.CUSTOM);
    const [instruction, setInstruction] = useState("");
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [loadingText, setLoadingText] = useState("Generating...");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showTemplateSwitchConfirmation, setShowTemplateSwitchConfirmation] = useState(false);
    const [pendingTemplate, setPendingTemplate] = useState(null);

    // Financial Planner specific fields
    const [financialPlannerInputs, setFinancialPlannerInputs] = useState({
        productName: "",
        plannerType: "",
        targetClient: "",
        keyBenefits: ["", "", ""],
    });

    const loadingTexts = [
        "Generating your slides...",
        "Drafting impactful titles...",
        "Curating concise content...",
        "Finalizing presentation structure...",
        "Almost ready...",
    ];

    useEffect(() => {
        if (previewVisible) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [previewVisible]);

    useEffect(() => {
        if (loading) {
            let index = 0;
            const interval = setInterval(() => {
                setLoadingText(loadingTexts[index]);
                index = (index + 1) % loadingTexts.length;
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [loading]);

    const handleTemplateChange = (newTemplate) => {
        if (slides.length > 0 || instruction.trim() !== "" ||
            (selectedTemplate === TEMPLATE_OPTIONS.FINANCIAL_PLANNER &&
                (financialPlannerInputs.productName ||
                    financialPlannerInputs.plannerType ||
                    financialPlannerInputs.targetClient ||
                    financialPlannerInputs.keyBenefits.some(b => b.trim() !== "")))) {
            setPendingTemplate(newTemplate);
            setShowTemplateSwitchConfirmation(true);
        } else {
            setSelectedTemplate(newTemplate);
        }
    };

    const confirmTemplateSwitch = () => {
        setSelectedTemplate(pendingTemplate);
        setSlides([]);
        setInstruction("");
        setFinancialPlannerInputs({
            productName: "",
            plannerType: "",
            targetClient: "",
            keyBenefits: ["", "", ""],
        });
        setShowTemplateSwitchConfirmation(false);
        setPendingTemplate(null);
    };

    const cancelTemplateSwitch = () => {
        setShowTemplateSwitchConfirmation(false);
        setPendingTemplate(null);
    };


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

    const generateFinancialPlannerPrompt = () => {
        return `Create a professional slide-by-slide pitch deck clear headings and presentation-ready copy for AMP Bank's ${financialPlannerInputs.productName} product intended for ${financialPlannerInputs.plannerType}s targeting ${financialPlannerInputs.targetClient} clients.

Key benefits to highlight:
1. ${financialPlannerInputs.keyBenefits[0]}
2. ${financialPlannerInputs.keyBenefits[1]}
3. ${financialPlannerInputs.keyBenefits[2]}

Follow this structure:
1. Title Slide
2. Introduction & Purpose
3. The Market Opportunity
4. Product Overview
5. Competitive Advantage
6. How to Position to Clients
7. Planner Support & Resources
8. Compliance & Risk Considerations
9. Call to Action

Make each slide visually appealing with clear bullet points. Use the following style and tone uidelines:
1. Professional and concise
2. Positive and empowering
3. Outcome-focused and client-centric
4. Aligned with AMP Bank’s brand voice
5. Include suggested client-facing language where helpful
6. The response should be in Australian English.
`;
    };

    const generateSlides = async () => {
        setLoading(true);
        setError(null);
        setLoadingText("Generating..."); // Reset loading text when starting

        try {
            let prompt;

            if (selectedTemplate === TEMPLATE_OPTIONS.FINANCIAL_PLANNER) {
                prompt = generateFinancialPlannerPrompt();
            } else {
                prompt = instruction;
            }

            const messages = [
                {
                    role: "user",
                    content: `Generate presentation slides based on the following instruction:\n"${prompt}".\nRespond in this format:\n\nSlide 1:\nTitle: {title}\nContent: {content}\n\nSlide 2:\nTitle: {title}\nContent: {content}\n...`,
                },
            ];

            const response = await generateCompletion(messages, "general");
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

    const handleFinancialPlannerInputChange = (field, value, index = null) => {
        if (index !== null) {
            const updatedBenefits = [...financialPlannerInputs.keyBenefits];
            updatedBenefits[index] = value;
            setFinancialPlannerInputs({
                ...financialPlannerInputs,
                keyBenefits: updatedBenefits,
            });
        } else {
            setFinancialPlannerInputs({
                ...financialPlannerInputs,
                [field]: value,
            });
        }
    };

    const confirmFinancialPlannerInputs = () => {
        // Validate inputs
        if (!financialPlannerInputs.productName ||
            !financialPlannerInputs.plannerType ||
            !financialPlannerInputs.targetClient ||
            financialPlannerInputs.keyBenefits.some(benefit => !benefit.trim())) {
            alert("Please fill in all fields before proceeding.");
            return;
        }
        setShowConfirmation(true);
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

        // Add a title slide first
        pptx.addSlide().addText("AMP Bank Presentation", {
            x: 1,
            y: 1,
            fontSize: 36,
            bold: true,
            color: "0033A0" // AMP blue
        });

        slides.forEach((slide) => {
            const slideObj = pptx.addSlide();
            slideObj.addText(slide.title, {
                x: 1,
                y: 0.5,
                fontSize: 24,
                bold: true,
                color: "0033A0"
            });
            slideObj.addText(slide.content, {
                x: 1,
                y: 1.5,
                fontSize: 18,
                bullet: true
            });
        });

        pptx.writeFile(`AMP_${financialPlannerInputs.productName || 'Presentation'}.pptx`);
    };

    const renderTemplateOptions = () => (
        <div className="template-options">
            <h2>Select a Template</h2>
            <div className="template-buttons">
                <button
                    className={`template-button ${selectedTemplate === TEMPLATE_OPTIONS.CUSTOM ? 'active' : ''}`}
                    onClick={() => handleTemplateChange(TEMPLATE_OPTIONS.CUSTOM)}
                >
                    Custom Presentation
                </button>
                <button
                    className={`template-button ${selectedTemplate === TEMPLATE_OPTIONS.FINANCIAL_PLANNER ? 'active' : ''}`}
                    onClick={() => handleTemplateChange(TEMPLATE_OPTIONS.FINANCIAL_PLANNER)}
                >
                    Financial Planner Pitch Deck
                </button>
                <button
                    className={`template-button ${selectedTemplate === TEMPLATE_OPTIONS.PRODUCT_PROMOTION ? 'active' : ''}`}
                    onClick={() => handleTemplateChange(TEMPLATE_OPTIONS.PRODUCT_PROMOTION)}
                >
                    Product Promotion
                </button>
            </div>
        </div>
    );

    const renderTemplateSwitchConfirmation = () => (
        <div className="confirmation-modal">
            <div className="modal-content">
                <h2>Confirm Template Switch</h2>
                <div className="confirmation-details">
                    <p>If you switch templates, it will clear all current slides and input fields.</p>
                    <p>Are you sure you want to proceed?</p>
                </div>

                <div className="confirmation-buttons">
                    <button
                        className="edit-button"
                        onClick={cancelTemplateSwitch}
                    >
                        No, Stay
                    </button>
                    <button
                        className="generate-button"
                        onClick={confirmTemplateSwitch}
                    >
                        Yes, Clear and Switch Template
                    </button>
                </div>
            </div>
        </div>
    );

    const renderFinancialPlannerForm = () => (
        <div className="financial-planner-form">
            <div className="form-group">
                <label>AMP Bank Product Name</label>
                <input
                    type="text"
                    placeholder="e.g., AMP Signature Super, AMP Bett3r Account"
                    value={financialPlannerInputs.productName}
                    onChange={(e) => handleFinancialPlannerInputChange('productName', e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="form-group">
                <label>Type of Financial Planner</label>
                <select
                    value={financialPlannerInputs.plannerType}
                    onChange={(e) => handleFinancialPlannerInputChange('plannerType', e.target.value)}
                    disabled={loading}
                >
                    <option value="">Select planner type</option>
                    <option value="Mortgage Broker">Mortgage Broker</option>
                    <option value="Financial Adviser">Financial Adviser</option>
                    <option value="Wealth Manager">Wealth Manager</option>
                    <option value="Insurance Specialist">Insurance Specialist</option>
                </select>
            </div>

            <div className="form-group">
                <label>Target Client Persona</label>
                <select
                    value={financialPlannerInputs.targetClient}
                    onChange={(e) => handleFinancialPlannerInputChange('targetClient', e.target.value)}
                    disabled={loading}
                >
                    <option value="">Select target client</option>
                    <option value="First Home Buyer">First Home Buyer</option>
                    <option value="Investor">Investor</option>
                    <option value="Retiree">Retiree</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Young Professional">Young Professional</option>
                    <option value="Family">Family</option>
                </select>
            </div>

            <div className="form-group">
                <label>Key Benefits (3 required)</label>
                {[0, 1, 2].map((index) => (
                    <input
                        key={index}
                        type="text"
                        placeholder={`Key benefit ${index + 1}`}
                        value={financialPlannerInputs.keyBenefits[index]}
                        onChange={(e) => handleFinancialPlannerInputChange('keyBenefits', e.target.value, index)}
                        disabled={loading}
                    />
                ))}
            </div>

            {loading ? (
                <div className="loading-text financial-planner-loading">
                    {loadingText}
                </div>
            ) : (
                <button
                    className="confirm-button"
                    onClick={confirmFinancialPlannerInputs}
                    disabled={loading}
                >
                    Review & Generate
                </button>
            )}
        </div>
    );

    const renderConfirmationModal = () => (
        <div className="confirmation-modal">
            <div className="modal-content">
                <h2>Confirm Your Pitch Deck Details</h2>
                <div className="confirmation-details">
                    <p><strong>Product:</strong> {financialPlannerInputs.productName}</p>
                    <p><strong>For:</strong> {financialPlannerInputs.plannerType}</p>
                    <p><strong>Target Client:</strong> {financialPlannerInputs.targetClient}</p>
                    <p><strong>Key Benefits:</strong></p>
                    <ul>
                        {financialPlannerInputs.keyBenefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                        ))}
                    </ul>
                </div>

                <div className="confirmation-buttons">
                    <button
                        className="edit-button"
                        onClick={() => setShowConfirmation(false)}
                        disabled={loading}
                    >
                        Edit Details
                    </button>
                    {loading ? (
                        <div className="loading-text">
                            {loadingText}
                        </div>
                    ) : (
                        <button
                            className="generate-button"
                            onClick={() => {
                                setShowConfirmation(false);
                                generateSlides();
                            }}
                        >
                            Generate Pitch Deck
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const renderCustomInput = () => (
        <div className="custom-input">
            <textarea
                placeholder="Explain your presentation in detail. More detail, better the slides."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="instructionInput"
            ></textarea>
            <button
                className="generateButton"
                onClick={generateSlides}
                disabled={loading || !instruction.trim()}
            >
                {loading ? loadingText : "Generate Slides"}
            </button>
        </div>
    );

    const renderPreviewSlide = (slide, index) => {
        return (
            <div key={index} className="previewSlide">
                <div className="preview-slide-content">
                    <h3 className="preview-slide-title">{slide.title}</h3>
                    <div className="preview-slide-body">
                        {slide.content.split('\n').map((paragraph, i) => (
                            paragraph.trim() && (
                                <p key={i} className="preview-slide-paragraph">
                                    {paragraph.trim().startsWith('•') ? paragraph : '• ' + paragraph}
                                </p>
                            )
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const handlePreviewClick = () => {
        setPreviewVisible(true);
        setTimeout(() => {
            const modal = document.querySelector('.previewModal');
            if (modal) {
                modal.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    return (
        <div className="slidesGenerator">
            <h1 className="header-style">Generate Presentation Slides</h1>

            {renderTemplateOptions()}

            {selectedTemplate === TEMPLATE_OPTIONS.FINANCIAL_PLANNER && renderFinancialPlannerForm()}
            {selectedTemplate === TEMPLATE_OPTIONS.CUSTOM && renderCustomInput()}

            {showConfirmation && renderConfirmationModal()}
            {showTemplateSwitchConfirmation && renderTemplateSwitchConfirmation()}
            {error && <p className="error">{error}</p>}
            {selectedTemplate === TEMPLATE_OPTIONS.PRODUCT_PROMOTION && (
            <div className="coming-soon-message">
                <p>This template is coming soon! Please check back later.</p>
            </div>
        )}

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
                    <button
                        className="previewButton"
                        onClick={handlePreviewClick}
                    >
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
                            ×
                        </button>
                        <div className="preview-slides-container">
                            {/* Title Slide */}
                            <div className="previewSlide">
                                <div className="preview-slide-content">
                                    <h1 className="preview-title-slide">
                                        AMP Bank Presentation
                                        {financialPlannerInputs.productName && (
                                            <div className="product-subtitle">
                                                {financialPlannerInputs.productName}
                                            </div>
                                        )}
                                    </h1>
                                </div>
                            </div>

                            {/* Content Slides */}
                            {slides.map((slide, index) => renderPreviewSlide(slide, index))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SlidesGenerator;