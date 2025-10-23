// types.ts

// Shared types
export interface Department {
    code: string;
    name: string;
    priority: number;
}

export interface Role { // Represents a staff member or position
    id: string;
    name: string;
    departmentCode: string;
    title: string;
    email: string;
    phone: string;
}

export interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
    isMarkdown?: boolean;
}

// Strategic Cockpit types
export interface QuestionAnswer {
    question: string;
    answer: string;
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

export interface StrategicNode {
    id: string;
    name: string;
    questionAnswers: QuestionAnswer[];
    initiatives: StrategicInitiative[];
}

export type KpiStatus = 'Good' | 'Warning' | 'Bad' | 'Neutral';

export interface SixVariablesNode {
    id: string;
    name: string;
    questionAnswers: QuestionAnswer[];
    status: KpiStatus;
    aiAssessment: string;
}

export type StrategicModel = Record<string, StrategicNode>;
export type SixVariablesModel = Record<string, SixVariablesNode>;

export interface StrategyReport {
    executiveSummary: string;
    strategicFocusAreas: { id: string; reason: string; }[];
    strategicLevers: { focusAreaId: string; leverDescription: string; }[];
    conflictAnalysis: { conflict: string; recommendation: string; }[];
}

export interface ReportItem {
    id: string; // factorName or variableName
    content: string;
    status?: KpiStatus;
}


// Task Matrix types
export interface Task {
    id: string;
    rowNumber: number;
    mc1: string;
    mc2: string;
    mc3: string;
    mc4: string;
    name: string;
    isGroupHeader: boolean;
    assignments: Record<string, string>; // DeptCode -> RoleSymbol (Q,T,K,B,P)
}

export interface MatrixContextInput {
    id: number;
    question: string;
    answer: string;
}

export interface VersionInfo {
    id: string;
    name: string;
    timestamp: number;
}

export interface VersionData {
    tasks: Task[];
    companyAssignments: Record<string, Record<string, string>>; // taskId -> { deptCode -> role }
    departmentalAssignments: Record<string, Record<string, string>>; // taskId -> { staffId -> role }
    generatedTaskMarkdown: string;
    departments: Department[];
    roles: Role[];
}

export interface AuditFinding extends Task {
    findingType: string;
}

// Goal Manager types

// New Type for the central library of KPIs
export interface PredefinedKPI {
  code: string; // e.g., 'DT-01'
  description: string; // e.g., 'Doanh thu bán hàng'
  unit: string; // e.g., 'VNĐ'
  category: 'Doanh thu' | 'Doanh số' | 'Dòng tiền' | 'Khác';
}

export interface KPI {
    kpiId: string;
    kpiCode: string; // Link to the PredefinedKPI
    // Description and Unit will be derived from the predefined KPI
    description: string;
    unit: string;
    baseline: number;
    target: number;
    actual: number;
    progress: number; // 0 to 1
    history: TrackingEntry[];
}

export interface TrackingEntry {
    id: string;
    date: string; // ISO string
    value: number;
    comment: string;
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