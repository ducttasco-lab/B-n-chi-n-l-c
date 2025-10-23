// types.ts

export type KpiStatus = 'Good' | 'Warning' | 'Bad' | 'Neutral';

export interface ChatMessage {
  role: 'user' | 'ai' | 'system' | 'error';
  content: string;
  isMarkdown?: boolean;
}

export interface ProgressUpdate {
  id: string;
  date: string;
  progressPercentage: number;
  comment: string;
  author: string;
}

export interface StrategicInitiative {
  id: string;
  name: string;
  description: string;
  owner: string;
  dueDate: string;
  status: 'Mới tạo' | 'Đang thực hiện' | 'Hoàn thành' | 'Tạm dừng';
  currentProgress: number;
  progressHistory: ProgressUpdate[];
  latestStatusComment: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface StrategicNode {
  id: string;
  name: string;
  questionAnswers: QuestionAnswer[];
  initiatives: StrategicInitiative[];
  chatHistory?: string; // HTML content
  aiAnalysis?: string; // Markdown content
}

export interface StrategicModel {
  [key: string]: StrategicNode;
}

export interface SixVariablesNode {
  id: string;
  name: string;
  status: KpiStatus;
  questionAnswers: QuestionAnswer[];
  aiAssessment: string;
  aiFullAnalysis?: string; // Detailed markdown analysis
}

export interface SixVariablesModel {
  [key: string]: SixVariablesNode;
}

export interface KeyResult {
  krId: string;
  description: string;
  baseline: number;
  target: number;
  unit: string;
}

export interface StrategyReport {
    executiveSummary: string;
    strategicFocusAreas: { id: string; reason: string }[];
    strategicLevers: { focusAreaId: string; leverDescription: string }[];
    conflictAnalysis: { conflict: string; recommendation: string }[];
}


// For Task Matrix Builder
export interface Task {
  id: string;
  mc1: string;
  mc2: string;
  mc3: string;
  mc4: string;
  name: string;
  isGroupHeader: boolean;
  assignments: Record<string, string>; // Role ID -> 'Q', 'T', 'K', 'B', 'P'
  rowNumber: number;
}

export interface Department {
  code: string;
  name: string;
  priority: number;
}

export interface Role {
  id: string;
  name: string;
  departmentCode: string;
  title: string;
  email: string;
  phone: string;
}

export interface MatrixContextInput {
    id: number;
    question: string;
    answer: string;
}


// For Goal Manager & Other tools
export interface UserTask {
    rowNumber: number;
    mc1: string;
    mc2: string;
    mc3: string;
    mc4: string;
    fullCode: string;
    taskName: string;
    role: string;
}

export interface Goal {
    goalId: string;
    employeeName: string;
    departmentCode: string;
    linkedTaskId: string;
    goalDescription: string;
    krs: KeyResult[];
    status: 'Đang hoạt động' | 'Hoàn thành' | 'Tạm hoãn' | 'Đã hủy';
}

export interface AuditFinding {
    taskId: string;
    taskName: string;
    mc1: string;
    mc2: string;
    mc3: string;
    mc4: string;
    findingType: string;
}