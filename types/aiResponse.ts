// runtime-safe decode + type guard for AIResponse

export interface AIResponse {
  files: {
    [filePath: string]: { code: string };
  };
  dependencies: { [pkg: string]: string };
  devDependencies: { [pkg: string]: string };
  projectTitle: string;
  explanation: string;
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function isRecordOfString(val: unknown): val is Record<string, string> {
  if (!isObject(val)) return false;
  return Object.values(val).every(v => typeof v === "string");
}

function isFilesShape(val: unknown): val is AIResponse["files"] {
  if (!isObject(val)) return false;
  return Object.values(val).every(entry =>
    isObject(entry) && typeof (entry as any).code === "string"
  );
}

export function isAIResponse(val: unknown): val is AIResponse {
  if (!isObject(val)) return false;
  return (
    "files" in val &&
    "dependencies" in val &&
    "devDependencies" in val &&
    "projectTitle" in val &&
    "explanation" in val &&
    isFilesShape((val as any).files) &&
    isRecordOfString((val as any).dependencies) &&
    isRecordOfString((val as any).devDependencies) &&
    typeof (val as any).projectTitle === "string" &&
    typeof (val as any).explanation === "string"
  );
}

/*
Usage (safe):

const decoded = decode(response); // returns JsonValue
if (!isAIResponse(decoded)) {
  throw new Error("Decoded value is not a valid AIResponse");
}
const responseJson = decoded; // typed as AIResponse

Quick unsafe cast (not recommended):
const responseJson = decode(response) as unknown as AIResponse;
*/
