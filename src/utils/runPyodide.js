let pyodideInstance = null;

async function loadPromptTemplate() {
    const response = await fetch('/mainPromt.txt'); // No absolute path needed
    return await response.text();
}

async function loadbackTicks() {
    const response = await fetch('/backTick.txt'); // No absolute path needed
    return await response.text();
}
// async function loadediPrompt() {
//     const response = await fetch('/ediPrompt.txt'); // No absolute path needed
//     return await response.text();
// }



export async function initializePyodide() {
  if (!pyodideInstance) {
    // Use dynamic import with explicit URL
    const pyodide = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.mjs');
    pyodideInstance = await pyodide.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.21.3/full/'
    });
    
    await pyodideInstance.loadPackage("micropip");
    await pyodideInstance.runPythonAsync(`
      import micropip
      await micropip.install(["openpyxl", "xmltodict"])
    `);
    
    console.log("✅ Pyodide initialized successfully!");
  }
  return pyodideInstance;
}

export async function runMappingPyodide(sourceData, sourceType, targetData, targetType) {
  try {
    await initializePyodide();

    const promptTemplate = await loadPromptTemplate(); // Load the prompt dynamically
    const backTick = await loadbackTicks();
    // const ediPrompt = await loadediPrompt();
    pyodideInstance.globals.set("PROMPT_TEMPLATE", promptTemplate);
    pyodideInstance.globals.set("backTickText", backTick);
    // pyodideInstance.globals.set("EDI_PROMPT_TEMPLATE", ediPrompt);
    console.log(sourceData);
    console.log(targetData);


    const pyScript = `
import json
import xml.etree.ElementTree as ET
import os
import difflib
from openpyxl import Workbook
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.styles import PatternFill, Font
import re
from collections import Counter
import posixpath
import pyodide.http

os.path = posixpath

API_KEY = "AIzaSyCOKPBzAeqOocXuiiH44NGBIGLX-IrnlrY"
CONFIDENCE_COLORS = {
    "high": "92D050",
    "medium": "FFFF00",
    "low": "FF5050"
}

def extract_json_paths(data, parent_key="", seen_paths=None):
    if seen_paths is None:
        seen_paths = set()
    paths = []
    
    if isinstance(data, dict):
        for key, value in data.items():
            new_key = f"{parent_key}.{key}" if parent_key else key
            if isinstance(value, (dict, list)):
                paths.extend(extract_json_paths(value, new_key, seen_paths))
            else:
                if new_key not in seen_paths:
                    seen_paths.add(new_key)
                    paths.append(new_key)
    elif isinstance(data, list):
        new_key = f"{parent_key}[*]" if parent_key else "[*]"
        if new_key not in seen_paths:
            seen_paths.add(new_key)
            if data:
                paths.extend(extract_json_paths(data[0], new_key, seen_paths))
    
    return paths

def extract_xml_paths(element, parent_path="", seen_paths=None):
    if seen_paths is None:
        seen_paths = set()
    paths = []
    
    current_path = f"{parent_path}/{element.tag}" if parent_path else element.tag
    if list(element):
        for child in element:
            paths.extend(extract_xml_paths(child, current_path, seen_paths))
    else:
        if current_path not in seen_paths:
            seen_paths.add(current_path)
            paths.append(current_path)
    
    return paths

def extract_edifact_fields(content, seg_sep="'", elem_sep="+", sub_elem_sep=":"):
    fields = []
    segment_counts = Counter()
    seen_paths = set()
    
    segments = content.strip().split(seg_sep)
    
    for segment in segments:
        parts = segment.strip().split(elem_sep)  
        segment_type = parts[0].strip()
        segment_counts[segment_type] += 1  

    for segment in segments:
        segment = segment.strip()
        if not segment:
            continue
        
        parts = segment.strip().split(elem_sep)
        segment_type = parts[0].strip()
        qualifier = parts[1] if len(parts) > 1 else ""
       
        for i, element in enumerate(parts[1:], start=1):
            sub_elements = element.split(sub_elem_sep)
            
            field_index = str(i)
            if i < 10:
                field_index = "0" + str(i)

            if len(sub_elements) > 1:
                for j, sub_element in enumerate(sub_elements, start=1):
                    field_path = f"{segment_type}{field_index}.{j}_{qualifier}" if segment_counts[segment_type] > 1 else f"{segment_type}{field_index}.{j}"
                    if field_path not in seen_paths and sub_element.strip():
                        seen_paths.add(field_path)
                        fields.append(field_path)
            else:
                field_path = f"{segment_type}{field_index}_{qualifier}" if segment_counts[segment_type] > 1 else f"{segment_type}{field_index}"
                if field_path not in seen_paths:
                    seen_paths.add(field_path)
                    fields.append(field_path)
    
    return fields

def extract_x12_fields(content, seg_sep="~", elem_sep="*", sub_elem_sep=":"):
    fields = []
    seen_paths = set()
    segment_counts = Counter()

    segments = content.strip().split(seg_sep)
    
    for segment in segments:
        parts = segment.strip().split(elem_sep)
        segment_type = parts[0].strip()
        segment_counts[segment_type] += 1

    for segment in segments:
        segment = segment.strip()
        if not segment:
            continue

        parts = segment.split(elem_sep)  
        segment_type = parts[0].strip() 
        qualifier = parts[1].strip() if len(parts) > 1 else ""

        for i, element in enumerate(parts[1:], start=1):
            sub_elements = element.split(sub_elem_sep) 
            field_index = str(i)
            if i < 10:
                field_index = "0" + str(i)
                
            if len(sub_elements) > 1:
                for j, sub_element in enumerate(sub_elements, start=1):
                    field_path = f"{segment_type}{field_index}.{j}_{qualifier}" if segment_counts[segment_type] > 1 else f"{segment_type}{field_index}.{j}"
                    if field_path not in seen_paths and sub_element.strip():
                        seen_paths.add(field_path)
                        fields.append(field_path)
            else:
                field_path = f"{segment_type}{field_index}_{qualifier}" if segment_counts[segment_type] > 1 else f"{segment_type}{field_index}"
                if field_path not in seen_paths:
                    seen_paths.add(field_path)
                    fields.append(field_path)
    return fields

def read_content(content, file_type, seg_sep="~", elem_sep="*", sub_elem_sep=":"):
    if file_type == "JSON":
        try:
            json_content = json.loads(content);
            return extract_json_paths(json_content)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {e}")
    elif file_type == "XML":
        try:
            return extract_xml_paths(ET.fromstring(content))
        except ET.ParseError as e:
            raise ValueError(f"Invalid XML: {e}")
    elif file_type == "EDIFACT":
        return extract_edifact_fields(content, seg_sep, elem_sep, sub_elem_sep)
    elif file_type == "X12":
        return extract_x12_fields(content, seg_sep, elem_sep, sub_elem_sep)
    else:
        raise ValueError("Unsupported file type")

async def call_gemini_api(prompt):
    try:
        response = await pyodide.http.pyfetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY,
            method="POST",
            headers={"Content-Type": "application/json"},
            body=json.dumps({
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.3, "maxOutputTokens": 65536}
            })
        )
        response_json = await response.json()
        print(f"json: {response_json}")
        ai_response = response_json["candidates"][0]["content"]["parts"][0]["text"]
        cleaned_json = re.sub(fr"{backTickText}json\s*|\s*{backTickText}", "", ai_response).strip()
        return json.loads(cleaned_json)
    except Exception as e:
        print(f"API Error: {str(e)}")
        return {}

def generate_mapping_prompt(source_fields, target_fields):
    prompt_template = PROMPT_TEMPLATE
    # Convert source and target fields to formatted JSON strings
    sourceNames = json.dumps(source_fields, indent=2)
    targetNames = json.dumps(target_fields, indent=2)
    # Replace placeholders with actual values
    prompt = prompt_template.format(sourceNames=sourceNames, targetNames=targetNames)
    return prompt

def get_mapping_from_ai(source_fields, target_fields):
    try:
        prompt = generate_mapping_prompt(source_fields, target_fields);
        print(f"prompt: {prompt}")
        return call_gemini_api(prompt)
    except Exception as e:
        print(f"Mapping Error: {str(e)}")
        return {}

async def main(source_type, source_data, target_type, target_data):
    try:
        source_fields = read_content(source_data, source_type)
        target_fields = read_content(target_data, target_type)
        mappings = await get_mapping_from_ai(source_fields, target_fields)
        print(f"Mapping: {mappings}")
        return json.dumps({
            "status": "success",
            "data": {
                "source_fields": source_fields,
                "target_fields": target_fields,
                "mappings": mappings,
                "source_format": source_type,
                "target_format": target_type
            }
        }, default=str)
    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": str(e)
        })

# Execute with properly escaped inputs
result = main(
    '''${sourceType}''',
    r'''${sourceData}''',
    '''${targetType}''',
    r'''${targetData}'''
)
result
`;

    const result = await pyodideInstance.runPythonAsync(pyScript);
    return JSON.parse(result);
  } catch (error) {
    console.error("Execution Error:", error);
    return {
      status: "error",
      message: "Mapping failed: " + error.message
    };
  }
}