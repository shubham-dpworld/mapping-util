import React, { useState, useRef } from "react";
import "./ComponentGenerator.css";

const ComponentGenerator = () => {
  const [formData, setFormData] = useState({
    sourceType: "",
    targetType: "",
    sourceFile: null,
    targetFile: null,
    mappingFile: null,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRefs = useRef({ source: null, target: null, mapping: null });

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

  const validateMappingFile = (file) => {
    const extension = file.name.split(".").pop().toLowerCase();
    return ["xlsx", "xls"].includes(extension);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      [`${name.replace("Type", "File")}`]: null,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      [`${name.replace("Type", "File")}Error`]: "",
    }));
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
    } else {
      const type = formData[field.replace("File", "Type")];

      if (!type) {
        setErrors((prev) => ({ ...prev, [errorKey]: "Please select type first" }));
        return;
      }

      if (!validateFile(file, type)) {
        setErrors((prev) => ({
          ...prev,
          [errorKey]: `Invalid file type for ${type}`,
        }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [field]: file }));
    setErrors((prev) => ({ ...prev, [errorKey]: "" }));
  };

  const handleRemoveFile = (field) => {
    let type;
    if (field === "mappingFile") {
      type = "mapping";
    } else {
      type = field.replace("File", "");
    }
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
    if (!formData.mappingFile) newErrors.mappingFileError = "Mapping file required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Create form data for API request
      const apiFormData = new FormData();
      apiFormData.append("sourceType", formData.sourceType);
      apiFormData.append("targetType", formData.targetType);
      apiFormData.append("sourceFile", formData.sourceFile);
      apiFormData.append("targetFile", formData.targetFile);
      apiFormData.append("mappingFile", formData.mappingFile);

      // Make API request
      // const response = await fetch(
      //   "https://mapping-util.onrender.com/requirements/map-xml-component-generator",
      //   {
      //     method: "POST",
      //     body: apiFormData,
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error(`API request failed with status ${response.status}`);
      // }

      // const data = await response.json();

      const data = "test";
      // Handle successful response
      setResult({
        success: true,
        message:  "Component generated successfully!",
        data: data,
      });

      // Handle file download if applicable
      // if (data.zipFileBase64) {
      //   // Convert base64 to blob
      //   const byteCharacters = atob(data.zipFileBase64);
      //   const byteNumbers = new Array(byteCharacters.length);
      //   for (let i = 0; i < byteCharacters.length; i++) {
      //     byteNumbers[i] = byteCharacters.charCodeAt(i);
      //   }
      //   const byteArray = new Uint8Array(byteNumbers);
      //   const blob = new Blob([byteArray], { type: "application/zip" });
        
      //   // Create download link
      //   const url = window.URL.createObjectURL(blob);
      //   const a = document.createElement("a");
      //   a.href = url;
      //   a.download = "integration_components.zip";
      //   a.click();
      // }
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
        Generate Map XML components based on your source and target files along with the mapping file
        created from the File Mapper tool.
      </p>
      
      <form onSubmit={handleSubmit}>
        {["source", "target"].map((type) => (
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
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors[`${type}Type`] && (
                <span className="error-message">{errors[`${type}Type`]}</span>
              )}
            </div>
            <div className="form-group">
              <label>{`${type.charAt(0).toUpperCase() + type.slice(1)} File *`}</label>
              <div className="file-upload">
                <input
                  type="file"
                  ref={(el) => (fileRefs.current[type] = el)}
                  onChange={(e) => handleFileChange(e, `${type}File`)}
                  accept={
                    formData[`${type}Type`]
                      ? fileTypes[formData[`${type}Type`]]
                          .map((ext) => `.${ext}`)
                          .join(",")
                      : "*"
                  }
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
              {errors[`${type}FileError`] && (
                <span className="error-message">
                  {errors[`${type}FileError`]}
                </span>
              )}
            </div>
          </div>
        ))}

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
          disabled={
            !formData.sourceType ||
            !formData.targetType ||
            !formData.sourceFile ||
            !formData.targetFile ||
            !formData.mappingFile ||
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
          {result.success && result.data?.componentDetails && (
            <div className="component-details">
              <h4>Component Details:</h4>
              <pre>{JSON.stringify(result.data.componentDetails, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComponentGenerator;