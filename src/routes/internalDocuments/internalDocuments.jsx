/**
 * @File InternalDocuments Component
 * @Description This componene allows users to upload, view and manage internal documents.
 */

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./internalDocuments.css";

/**
 * @component InternalDocuments
 * @description Provides functionality to upload, view, and delete internal documents.
 * @returns {JSX.Element} The InternalDocuments component.
 */

const InternalDocuments = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pdfToView, setPdfToView] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // Delete confirmation modal
  const [documentToDelete, setDocumentToDelete] = useState(null); // Store selected document to delete
  const userId = "demouser";

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/documents`, {
        params: { userId },
      });
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", userId);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/documents/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDocuments([...documents, response.data]);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading document:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteConfirmation = (id) => {
    setDocumentToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/documents/${documentToDelete}`);
      setDocuments(documents.filter((doc) => doc._id !== documentToDelete));
      setDeleteModalVisible(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleViewPDF = async (id) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/documents/${id}`);
      setPdfToView(response.data.fileUrl);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching document URL:", error);
    }
  };

  return (
    <div className="internalDocumentsPage">
      <h1 className="header-style">Internal Documents</h1>

      <div
        className="uploadSection"
        onClick={() => document.getElementById("fileInput").click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setSelectedFile(e.dataTransfer.files[0]);
        }}
      >
        <p>Upload your .pdf file here or Drag and Drop</p>
        <input
          type="file"
          id="fileInput"
          accept=".pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        {selectedFile && (
          <p className="fileName">Selected File: {selectedFile.name}</p>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="uploadButton"
      >
        {isUploading ? "Uploading..." : "Upload File"}
      </button>

      <div className="documentsList">
        <h2>Your Documents</h2>
        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          <ul>
            {documents.map((doc) => (
              <li key={doc._id} className="documentItem">
                <span
                  className="documentLink"
                  onClick={() => handleViewPDF(doc._id)}
                >
                  {doc.fileName}
                </span>
                <button
                  onClick={() => handleDeleteConfirmation(doc._id)}
                  className="deleteButton"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {modalVisible && (
        <div className="modal">
          <button className="closeButton" onClick={() => setModalVisible(false)}>
            Close ×
          </button>
          <div className="modalContent">
            <iframe
              src={pdfToView}
              title="PDF Viewer"
              frameBorder="0"
              className="pdfViewer"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalVisible && (
        <div className="modal">
          <div className="modalContent deleteModal">
            <h2>Are you sure?</h2>
            <p>This document will be permanently deleted.</p>
            <div className="modalButtons">
              <button className="confirmDeleteButton" onClick={handleDelete}>
                Yes, Delete
              </button>
              <button className="cancelButton" onClick={() => setDeleteModalVisible(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalDocuments;
