import React, { useState, useRef } from "react";
import "./ComponentGeneratorWithExcel.css";

// Helper: Validates file extension
const isValidExcelFile = (file) => {
  const extension = file.name.split(".").pop().toLowerCase();
  return ["xlsx", "xls"].includes(extension);
};

// Helper: Builds form data for API
const buildFormData = ({ mappingFile, sourceProfileName, destinationProfileName, mapName }) => {
  const formData = new FormData();
  formData.append("excel", mappingFile);
  formData.append("sourceProfileName", sourceProfileName);
  formData.append("destinationProfileName", destinationProfileName);
  formData.append("mapName", mapName);
  return formData;
};

// API call
const submitToAPI = async (formData) => {
  const response = await fetch(
    "http://localhost:8000/api/generate/map-xml-from-excel",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return await response.json();
};

// UI Helper: Render file input
const FileInput = ({
  label,
  file,
  fileRef,
  onChange,
  onRemove,
  errorMessage,
  accept,
}) => (
  <div className="form-group">
    <label>{label} *</label>
    <div className="file-upload">
      <input
        type="file"
        ref={fileRef}
        onChange={onChange}
        accept={accept}
      />
      <span className="file-name">{file?.name || "Choose file"}</span>
      {file && (
        <button type="button" className="remove-file-btn" onClick={onRemove}>
          ×
        </button>
      )}
    </div>
    {errorMessage && <span className="error-message">{errorMessage}</span>}
  </div>
);

// UI Helper: Text Input
const TextInput = ({ label, value, onChange, errorMessage, field }) => (
  <div className="form-group">
    <label>{label} *</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className={errorMessage ? "error" : ""}
    />
    {errorMessage && <span className="error-message">{errorMessage}</span>}
  </div>
);

const ComponentGeneratorWithExcel = () => {
  const [formData, setFormData] = useState({
    mappingFile: null,
    sourceProfileName: "",
    destinationProfileName: "",
    mapName: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRefs = useRef({ mapping: null });

  const updateFormData = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const updateError = (field, message) =>
    setErrors((prev) => ({ ...prev, [`${field}Error`]: message }));

  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [`${field}Error`]: "" }));

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (field === "mappingFile" && !isValidExcelFile(file)) {
      updateError(field, "Invalid file type. Please upload .xlsx or .xls file.");
      return;
    }

    updateFormData(field, file);
    clearError(field);
  };

  const handleRemoveFile = (field) => {
    if (fileRefs.current.mapping) fileRefs.current.mapping.value = "";
    updateFormData(field, null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.mappingFile) {
      newErrors.mappingFileError = "Mapping file required";
    }
    if (!formData.sourceProfileName.trim()) {
      newErrors.sourceProfileNameError = "Source Profile Name is required";
    }
    if (!formData.destinationProfileName.trim()) {
      newErrors.destinationProfileNameError = "Destination Profile Name is required";
    }
    if (!formData.mapName.trim()) {
      newErrors.mapNameError = "Map Name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const data = await submitToAPI(buildFormData(formData));
      setResult({
        success: true,
        message: "Component generated successfully!",
        data,
      });
    } catch (error) {
      console.error("Error generating component:", error);
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-wrapper">
      <h1 className="title">XML Component Generator (using Excel only)</h1>
      <p className="description">
        Generate Map XML components based on your mapping Excel file created from the File Mapper tool.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Mapping Configuration</h2>

          <TextInput
            label="Source Profile Name"
            value={formData.sourceProfileName}
            onChange={updateFormData}
            field="sourceProfileName"
            errorMessage={errors.sourceProfileNameError}
          />
          <TextInput
            label="Destination Profile Name"
            value={formData.destinationProfileName}
            onChange={updateFormData}
            field="destinationProfileName"
            errorMessage={errors.destinationProfileNameError}
          />
          <TextInput
            label="Map Name"
            value={formData.mapName}
            onChange={updateFormData}
            field="mapName"
            errorMessage={errors.mapNameError}
          />

          <FileInput
            label="Mapping Excel File"
            file={formData.mappingFile}
            fileRef={(el) => (fileRefs.current.mapping = el)}
            onChange={(e) => handleFileChange(e, "mappingFile")}
            onRemove={() => handleRemoveFile("mappingFile")}
            errorMessage={errors.mappingFileError}
            accept=".xlsx,.xls"
          />
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={
            !formData.mappingFile ||
            !formData.sourceProfileName ||
            !formData.destinationProfileName ||
            !formData.mapName ||
            isLoading
          }
        >
          {isLoading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
              <span>Generating...</span>
            </div>
          ) : (
            "Generate XML Component"
          )}
        </button>
      </form>

      {result && (
        <div className={`result-message ${result.success ? "success" : "error"}`}>
          <h3>{result.success ? "Success!" : "Error"}</h3>
          <p>{result.message}</p>
          {result.success && result.data?.redirectUrl && (
            <div className="component-details">
              <h4>BOOMI Map Component XML Url:</h4>
              <a href={result.data.redirectUrl} target="_blank" rel="noopener noreferrer">
                {result.data.redirectUrl}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComponentGeneratorWithExcel;
