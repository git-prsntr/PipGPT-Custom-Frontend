/**
 * @File Report Generator Component
 * @description This component allows users to uplaod CSV files and generate professional reports based on the data using AI.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateCompletion } from "../../lib/openai"; 
import "./reportGenerator.css";

/**
 * @component ReportGenerator
 * @description Enables users to upload a CSV file and generate a professional report from the data.
 * @returns {JSX.Element} The ReportGenerator component.
 */

const ReportGenerator = () => {
    const navigate = useNavigate();
    const [fileData, setFileData] = useState(null);
    const [report, setReport] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleBackClick = () => {
        navigate("/dashboard");
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const csv = e.target.result;
                    const rows = csv.split("\n").map((row) => row.split(","));
                    const headers = rows[0];
                    const data = rows.slice(1).map((row) =>
                        headers.reduce((acc, header, index) => {
                            acc[header] = row[index];
                            return acc;
                        }, {})
                    );
                    setFileData(data);
                } catch (err) {
                    console.error("Error parsing file:", err);
                    setError("Failed to parse the file. Please check the format.");
                }
            };
            reader.readAsText(file);
        }
    };

    const chunkArray = (array, chunkSize) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    };

    const generateReport = async () => {
        if (!fileData || fileData.length === 0) {
            alert("No data available for report generation!");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const chunks = chunkArray(fileData, 50); // Process 50 rows at a time
            let completeReport = "";

            for (let i = 0; i < chunks.length; i++) {
                const chunkData = JSON.stringify(chunks[i], null, 2);
                const messages = [
                    {
                        role: "user",
                        content: `Generate a professional report based on the following data chunk:\n${chunkData}`,
                    },
                ];

                const response = await generateCompletion(messages, "general");
                completeReport += `Chunk ${i + 1}:\n${response}\n\n`;
            }

            setReport(completeReport.trim());
        } catch (err) {
            console.error(err);
            setError("Failed to generate report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reportGenerator">
            <h1>Generate Professional Report</h1>

            <div className="fileUploadSection">
                <label htmlFor="fileInput" className="fileUploadLabel">
                    Upload your CSV or Excel file
                </label>
                <input
                    type="file"
                    id="fileInput"
                    accept=".csv"
                    onChange={handleFileUpload}
                />
            </div>

            {fileData && (
                <div className="fileSummary">
                    <p>Uploaded file contains {fileData.length} rows of data.</p>
                </div>
            )}

            <button
                className="generateButton"
                onClick={generateReport}
                disabled={loading || !fileData}
            >
                {loading ? "Generating..." : "Generate Report"}
            </button>

            {error && <p className="error">{error}</p>}

            {report && (
                <div className="reportOutput">
                    <h2>Generated Report</h2>
                    <pre>{report}</pre>
                    <button
                        className="downloadButton"
                        onClick={() => {
                            const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
                            const link = document.createElement("a");
                            link.href = URL.createObjectURL(blob);
                            link.download = "GeneratedReport.txt";
                            link.click();
                        }}
                    >
                        Download Report
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReportGenerator;