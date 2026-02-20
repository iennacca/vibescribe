
export interface AnalysisResult {
  transcript: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  sentiment: string;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  TRANSCRIBING = 'TRANSCRIBING',
  SUMMARIZING = 'SUMMARIZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export interface FileData {
  name: string;
  size: number;
  type: string;
  base64: string;
}
