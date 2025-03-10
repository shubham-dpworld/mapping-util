import React, { useState, useRef } from "react";
import { utils, writeFile } from "xlsx";
import "./FileMapper.css";
import { runMappingPyodide } from "../../utils/runPyodide"; // Import the function

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

  const fileTypes = {
    XML: ["xml"],
    JSON: ["json"],
    EDIFACT: ["edi", "edifact"],
    X12: ["x12", "835"],
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

    try {
      // Read both files as raw text
      const sourceText = await formData.sourceFile.text();
      const targetText = await formData.targetFile.text();

      // Run Pyodide Mapping (Send raw content + format type)
      const data = await runMappingPyodide(
        sourceText,
        formData.sourceType,
        targetText,
        formData.targetType
      );

      console.log(data);
      const ws = utils.json_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Mappings");
      writeFile(wb, "field-mappings.xlsx");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };


  return (
    <div className="form-wrapper">
      <h1 className="title">File Mapping Tool</h1>
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
    </div>
  );
};

export default FileMapper;