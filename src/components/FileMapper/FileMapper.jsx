import React, { useState, useRef } from "react";
import "./FileMapper.css";

const FileMapper = () => {
  const [formData, setFormData] = useState({
    sourceType: "",
    targetType: "",
    sourceFile: null,
    targetFile: null,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const fileRefs = useRef({ source: null, target: null });
  const [result, setResult] = useState(null);

  const fileTypes = {
    XML: ["xml"],
    JSON: ["json"],
    EDIFACT: ["edi", "edifact"],
    X12: ["edi", "x12", "835"], 
  };

  const validateFile = (file, type) => {
    if (!type) return false;
    const extension = file.name.split(".").pop().toLowerCase();
    return fileTypes[type]?.includes(extension);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      [`${name.replace("Type", "File")}`]: null,
    }));
    setErrors((prev) => ({ ...prev, [name]: "", [`${name.replace("Type", "File")}Error`]: "" }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const errorKey = `${field}Error`;
    const type = formData[field.replace("File", "Type")];

    if (!type) {
      setErrors((prev) => ({ ...prev, [errorKey]: "Please select type first" }));
      return;
    }

    if (!validateFile(file, type)) {
      setErrors((prev) => ({ ...prev, [errorKey]: `Invalid file type for ${type}` }));
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: file }));
    setErrors((prev) => ({ ...prev, [errorKey]: "" }));
  };

  const handleRemoveFile = (field) => {
    const type = field.replace("File", "");
    const inputRef = fileRefs.current[type];
    if (inputRef) inputRef.value = "";
    setFormData((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.sourceType) newErrors.sourceType = "Source type required";
    if (!formData.targetType) newErrors.targetType = "Target type required";
    if (!formData.sourceFile) newErrors.sourceFileError = "Source file required";
    if (!formData.targetFile) newErrors.targetFileError = "Target file required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true); // Start loading
    setResult(null);

    try {

      // Create form data for API request
      const apiFormData = new FormData();
      apiFormData.append("source_type", formData.sourceType);
      apiFormData.append("destination_type", formData.targetType);
      apiFormData.append("source", formData.sourceFile);
      apiFormData.append("destination", formData.targetFile);


      const response = await fetch(
        "http://127.0.0.1:8000/api/generate/mapping-excel-with-source-target",
        {
          method: "POST",
          body: apiFormData,
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      if (response.ok) {
        const blob = await response.blob();
        console.log(`blob: ${blob}`);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "AI_Field_Mapping.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        setResult({
          success: true,
          message:  "Your file is dowloaded successfully! Check the download folder",
        });
  
      } else {
        console.error("Failed to download Excel:", response.statusText);
        alert("Mapping failed. Please check the console for details.");
      }
    } catch (error) {
      console.error("Error during mapping:", error);
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      });
      alert("An error occurred. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="form-wrapper">
      <h1 className="title">File Mapping Tool</h1>
      <p className="description">
        Generate Excel Sheet for mappings based on your source and target files.
      </p>
      <form onSubmit={handleSubmit}>
        {['source', 'target'].map((type) => (
          <div key={type} className="form-section">
            <h2>{`${type.charAt(0).toUpperCase() + type.slice(1)} Configuration`}</h2>
            <div className="form-group">
              <label>{`${type.charAt(0).toUpperCase() + type.slice(1)} Type *`}</label>
              <select
                name={`${type}Type`}
                value={formData[`${type}Type`]}
                onChange={handleInputChange}
                className={errors[`${type}Type`] ? "error" : ""}
              >
                <option value="">Select {type} Type</option>
                {Object.keys(fileTypes).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors[`${type}Type`] && <span className="error-message">{errors[`${type}Type`]}</span>}
            </div>
            <div className="form-group">
              <label>{`${type.charAt(0).toUpperCase() + type.slice(1)} File *`}</label>
              <div className="file-upload">
                <input
                  type="file"
                  ref={(el) => (fileRefs.current[type] = el)}
                  onChange={(e) => handleFileChange(e, `${type}File`)}
                  accept={formData[`${type}Type`] ? fileTypes[formData[`${type}Type`]].map(ext => `.${ext}`).join(",") : "*"}
                />
                <span className="file-name">
                  {formData[`${type}File`]?.name || "Choose file"}
                </span>
                {formData[`${type}File`] && (
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => handleRemoveFile(`${type}File`)}
                  >
                    ×
                  </button>
                )}
              </div>
              {errors[`${type}FileError`] && <span className="error-message">{errors[`${type}FileError`]}</span>}
            </div>
          </div>
        ))}
        <button
          type="submit"
          className="submit-btn"
          disabled={!formData.sourceType || !formData.targetType || 
                   !formData.sourceFile || !formData.targetFile || isLoading}
        >
          {isLoading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
              <span>Generating...</span>
            </div>
          ) : (
            "Generate Mapping File"
          )}
        </button>
      </form>
      {result && (
        <div className={`result-message ${result.success ? "success" : "error"}`}>
          <h3>{result.success ? "Success!" : "Error"}</h3>
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
};

export default FileMapper;