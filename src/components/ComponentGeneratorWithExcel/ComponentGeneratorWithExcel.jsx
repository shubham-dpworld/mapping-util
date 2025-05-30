import React, { useState, useRef } from "react";
import "./ComponentGeneratorWithExcel.css";

const ComponentGeneratorWithExcel = () => {
  const [formData, setFormData] = useState({
    mappingFile: null
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRefs = useRef({ mapping: null });

  const validateMappingFile = (file) => {
    const extension = file.name.split(".").pop().toLowerCase();
    return ["xlsx", "xls"].includes(extension);
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const errorKey = `${field}Error`;

    if (field === "mappingFile") {
      if (!validateMappingFile(file)) {
        setErrors((prev) => ({
          ...prev,
          [errorKey]: "Invalid file type for mapping. Please upload Excel (.xlsx, .xls) file",
        }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [field]: file }));
    setErrors((prev) => ({ ...prev, [errorKey]: "" }));
  };

  const handleRemoveFile = (field) => {
    if (field === "mappingFile" && fileRefs.current.mapping) {
      fileRefs.current.mapping.value = "";
    }
    setFormData((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.mappingFile) newErrors.mappingFileError = "Mapping file required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const apiFormData = new FormData();
      apiFormData.append("excel", formData.mappingFile);

      const response = await fetch(
        "http://localhost:8000/api/generate/map-xml-from-excel",
        {
          method: "POST",
          body: apiFormData,
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setResult({
        success: true,
        message: "Component generated successfully!",
        data: data,
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
      <h1 className="title">XML Component Generator</h1>
      <p className="description">
        Generate Map XML components based on your mapping Excel file created from the File Mapper tool.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Mapping Configuration</h2>
          <div className="form-group">
            <label>Mapping Excel File *</label>
            <div className="file-upload">
              <input
                type="file"
                ref={(el) => (fileRefs.current.mapping = el)}
                onChange={(e) => handleFileChange(e, "mappingFile")}
                accept=".xlsx,.xls"
              />
              <span className="file-name">
                {formData.mappingFile?.name || "Choose file"}
              </span>
              {formData.mappingFile && (
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={() => handleRemoveFile("mappingFile")}
                >
                  ×
                </button>
              )}
            </div>
            {errors.mappingFileError && (
              <span className="error-message">{errors.mappingFileError}</span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={!formData.mappingFile || isLoading}
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
