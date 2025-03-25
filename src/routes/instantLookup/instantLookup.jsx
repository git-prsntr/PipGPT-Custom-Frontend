import React, { useState } from "react";
import "./instantLookup.css";

const InstantLookup = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [dataSource, setDataSource] = useState("amp-data-pipgpt");
  const [loading, setLoading] = useState(false);

  const dataSources = ["amp-data-pipgpt", "amp-test-data-2"];

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse("");

    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/instant-lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, dataSource }),
      });
      const data = await res.json();
      setResponse(data.response || "No response generated.");
    } catch (error) {
      console.error("Error fetching response:", error);
      setResponse("Error retrieving response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="instantLookup">
      <h1>You are using Internal GPT to retrieve specific information from the data sources.</h1>
      
      {/* Data Source Selection */}
      <select 
        className="dataSourceSelect"
        value={dataSource}
        onChange={(e) => setDataSource(e.target.value)}
      >
        {dataSources.map((source, index) => (
          <option key={index} value={source}>
            {source}
          </option>
        ))}
      </select>

      {/* Query Input */}
      <form onSubmit={handleQuerySubmit} className="queryForm">
        <input
          type="text"
          placeholder="Enter your query here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="queryInput"
        />
        <button type="submit" className="submitButton">
          ➤
        </button>
      </form>

      {/* Response Box */}
      <div className="responseBox">
        {loading ? <p className="loading">Fetching response...</p> : <p>{response}</p>}
      </div>
    </div>
  );
};

export default InstantLookup;
