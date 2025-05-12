export interface FileWithStatus {
    file: File;
    status: "idle" | "processing" | "completed" | "error";
    error?: string;
  }