// types.ts

// --- COMMON ---
export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  isMarkdown?: boolean;
}

export type KpiStatus = 'Good' | 'Warning' | 'Bad' | 'Neutral';


// --- STRATEGIC COCKPIT ---
export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface ProgressUpdate {
    id: string;
    date: string; // ISO string
    progressPercentage: number;
    comment: string;
    author: string;
}

export interface StrategicInitiative {
    id: string;
    name: string;
    description: string;
    owner: string;
    dueDate: string; // ISO string YYYY-MM-DD
    status: 'Mới tạo' | 'Đang thực hiện' | 'Hoàn thành' | 'Tạm dừng';
    currentProgress: number; // 0-100
    progressHistory: ProgressUpdate[];
    latestStatusComment: string;
}

export interface StrategicNode {
  id: string;
  name: string;
  questionAnswers: QuestionAnswer[];
  initiatives: StrategicInitiative[];
}

export interface SixVariablesNode {
    id: keyof SixVariablesModel;
    name: string;
    questionAnswers: QuestionAnswer[];
    status: KpiStatus;
    aiAssessment: string;
}

export interface StrategicModel {
  [key: string]: StrategicNode;
}

export type SixVariablesModel = {
  [key: string]: SixVariablesNode;
};

export interface ReportItem {
    id: string;
    content: string;
    status?: KpiStatus;
}

export interface StrategyReport {
    executiveSummary: string;
    strategicFocusAreas: { id: string; reason: string }[];
    strategicLevers: { focusAreaId: string; leverDescription: string }[];
    conflictAnalysis: { conflict: string; recommendation: string }[];
}


// --- TASK MATRIX BUILDER ---
export interface MatrixContextInput {
  id: number;
  question: string;
  answer: string;
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

export interface Task {
  id: string;
  rowNumber: number;
  mc1: string;
  mc2: string;
  mc3: string;
  mc4: string;
  name: string;
  isGroupHeader: boolean;
  assignments: Record<string, string>; // { [deptCode]: 'Q' | 'T' | 'K' | 'B' | 'P' }
}

export interface VersionInfo {
    id: string;
    name: string;
    timestamp: number;
}

export interface VersionData {
    tasks: Task[];
    companyAssignments: Record<string, Record<string, string>>;
    departmentalAssignments: Record<string, Record<string, string>>;
    generatedTaskMarkdown: string;
    departments: Department[];
    roles: Role[];
}

export interface AuditFinding extends Task {
    findingType: string;
}


// --- GOAL MANAGER ---
export interface TrackingEntry {
    id: string;
    date: string; // ISO string
    value: number;
    comment: string;
}

export interface KPI {
    kpiId: string;
    kpiCode: string; // Link to PredefinedKPI
    description: string;
    unit: string;
    baseline: number;
    target: number;
    actual: number;
    progress: number; // 0 to 1
    history: TrackingEntry[];
}

export interface Goal {
    goalId: string;
    goalDescription: string;
    employeeId: string;
    employeeName: string;
    departmentCode: string;
    linkedTaskId: string;
    linkedTaskName: string;
    kpis: KPI[];
}

export interface UserTask {
    id: string;
    employeeId: string;
    rowNumber: number;
    mc1: string;
    mc2: string;
    mc3: string;
    mc4: string;
    fullCode: string;
    taskName: string;
    role: string;
}

export interface PredefinedKPI {
    code: string;
    description: string;
    unit: string;
    category: 'Doanh thu' | 'Doanh số' | 'Dòng tiền' | 'Khác';
}


// --- SETTINGS ---
export interface AiSettingsData {
    model: string;
    temperature: number;
    topP: number;
    showPrompt: boolean;
    useGrounding: boolean;
    thinkingBudgetMode: 'flexible' | 'off' | 'custom';
    customThinkingBudget: number;
}
  
export interface ApiKey {
    id: string;
    name: string;
    key: string;
    engine: 'Gemini' | 'Other';
    priority: number;
}
