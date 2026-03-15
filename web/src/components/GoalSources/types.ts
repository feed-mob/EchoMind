export interface BaseSource {
  id: string;
  title: string;
  description: string;
}

export interface AISource extends BaseSource {
  type: 'ai';
  aiType: string;
  updatedAt: string;
  icon?: string;
  onView?: () => void;
  onAnalyze?: () => void;
}

export interface PDFSource extends BaseSource {
  type: 'pdf';
  fileType: string;
  uploadedAt: string;
  onOpen?: () => void;
}

export interface ManualSource extends BaseSource {
  type: 'manual';
  entryType: string;
  modifiedAt: string;
  onEdit?: () => void;
}

export type Source = AISource | PDFSource | ManualSource;

// Goal types for sidebar
export interface Goal {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  statusColor: 'emerald' | 'amber' | 'slate' | string;
}
