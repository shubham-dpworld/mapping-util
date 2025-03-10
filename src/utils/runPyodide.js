let pyodideInstance = null;

export async function initializePyodide() {
  if (!pyodideInstance) {
    // Use dynamic import with explicit URL
    const pyodide = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.mjs');
    pyodideInstance = await pyodide.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.21.3/full/'
    });
    console.log("✅ Pyodide initialized successfully!");
  }
  return pyodideInstance;
}


export async function runMappingPyodide(sourceData, sourceType, targetData, targetType) {
    await initializePyodide();

    // Add these 2 lines to install missing dependencies
    await pyodideInstance.loadPackage("micropip");
    await pyodideInstance.runPythonAsync(`
        import micropip
        await micropip.install("xmltodict")
    `);



    // Rest of your existing code remains unchanged
    const pyScript = `
    import json
    import xmltodict

    def parse_data(data, format):
        if format == "JSON":
            return json.loads(data)
        elif format == "XML":
            return xmltodict.parse(data)
        else:
            return data

    def generate_mappings(source, target):
        mappings = [
            {"Source Field": "Field1", "Target Field": "Mapped1", "Confidence": "95%"},
            {"Source Field": "Field2", "Target Field": "Mapped2", "Confidence": "85%"}
        ]
        return json.dumps(mappings)

    source_data = parse_data(${JSON.stringify(sourceData)}, "${sourceType}")
    target_data = parse_data(${JSON.stringify(targetData)}, "${targetType}")
    result = generate_mappings(source_data, target_data)
    result
    `;

    let result = await pyodideInstance.runPythonAsync(pyScript);
    return JSON.parse(result);
}