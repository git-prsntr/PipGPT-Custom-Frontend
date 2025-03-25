import React, { useState } from "react";
import Papa from "papaparse";
import { Chart, registerables } from "chart.js";
import { Chart as ChartJSComponent } from "react-chartjs-2";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import "./dataVisualiser.css";
import { useNavigate } from "react-router-dom";

// Register all Chart.js components
Chart.register(...registerables);

const DataVisualiser = () => {
    const navigate = useNavigate();
    const [fileData, setFileData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [selectedX, setSelectedX] = useState("");
    const [selectedY, setSelectedY] = useState("");
    const [chartType, setChartType] = useState("bar");
    const [chartData, setChartData] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [fileName, setFileName] = useState(""); // State to store file name

    const handleBackClick = () => {
        navigate("/dashboard");
    };

    const handleFileUpload = (file) => {
        if (!file) return;

        setFileName(file.name); // Set the file name
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: (results) => {
                setFileData(results.data);
                setColumns(Object.keys(results.data[0] || {}));
            },
            error: (err) => {
                console.error("Error parsing CSV file:", err);
            },
        });
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragActive(false);
        const file = event.dataTransfer.files[0];
        handleFileUpload(file);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        handleFileUpload(file);
    };

    const generateChart = () => {
        if (!selectedX || !selectedY) {
            alert("Please select both X and Y axes.");
            return;
        }

        const labels = fileData.map((row) => row[selectedX]);
        const values = fileData.map((row) => row[selectedY]);

        setChartData({
            labels,
            datasets: [
                {
                    label: `${selectedY} vs ${selectedX}`,
                    data: values,
                    backgroundColor: chartType === "pie" ? generateColors(values.length) : "rgba(75, 192, 192, 0.5)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
            ],
        });
    };

    const generateColors = (count) => {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
        }
        return colors;
    };

    const downloadChart = () => {
        const chartCanvas = document.querySelector("canvas"); // Selects the rendered chart canvas
        if (!chartCanvas) {
            alert("No chart available to download.");
            return;
        }

        // Create a new canvas with a white background
        const whiteBackgroundCanvas = document.createElement("canvas");
        const context = whiteBackgroundCanvas.getContext("2d");

        whiteBackgroundCanvas.width = chartCanvas.width;
        whiteBackgroundCanvas.height = chartCanvas.height;

        // Fill the background with white
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, chartCanvas.width, chartCanvas.height);

        // Draw the original chart on top of the white background
        context.drawImage(chartCanvas, 0, 0);

        // Convert to an image blob and trigger download
        whiteBackgroundCanvas.toBlob((blob) => {
            saveAs(blob, "chart.jpg");
        });
    };

    return (
        <div className="dataVisualiser">
            <button className="backButton" onClick={handleBackClick}>
                ← Back to Dashboard
            </button>
            <h1>Data Visualiser</h1>

            <div
                className={`dropZone ${dragActive ? "active" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("fileInput").click()}
            >
                <input
                    id="fileInput"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="fileInput"
                />
                <p>Upload your CSV File or Drag and Drop</p>
            </div>

            {fileName && <div className="fileName">File Loaded: {fileName}</div>} {/* Display the file name */}

            {columns.length > 0 && (
                <div className="chartControls">
                    <label>
                        X-Axis:
                        <select onChange={(e) => setSelectedX(e.target.value)}>
                            <option value="">Select column</option>
                            {columns.map((col) => (
                                <option key={col} value={col}>
                                    {col}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Y-Axis:
                        <select onChange={(e) => setSelectedY(e.target.value)}>
                            <option value="">Select column</option>
                            {columns.map((col) => (
                                <option key={col} value={col}>
                                    {col}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Chart Type:
                        <select onChange={(e) => setChartType(e.target.value)}>
                            <option value="bar">Bar</option>
                            <option value="line">Line</option>
                            <option value="pie">Pie</option>
                        </select>
                    </label>
                </div>
            )}

            <button className="generateButton" onClick={generateChart}>
                Generate
            </button>

            {chartData && (
                <>
                    <div className="chartContainer">
                        <ChartJSComponent key={`${selectedX}-${selectedY}-${chartType}`} type={chartType} data={chartData} />
                    </div>
                    <button className="downloadButton" onClick={downloadChart}>
                        Download Chart
                    </button>
                </>
            )}
        </div>
    );
};

export default DataVisualiser;