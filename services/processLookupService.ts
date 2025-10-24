// services/processLookupService.ts

export interface StoredFile {
    name: string;
    type: string;
    data: string; // base64 content
}

const FILES_KEY_PREFIX = 'process_lookup_files_';
const SUMMARIES_KEY_PREFIX = 'process_lookup_summary_';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });


export const getTaskFiles = (taskId: string): StoredFile[] => {
    try {
        const data = localStorage.getItem(`${FILES_KEY_PREFIX}${taskId}`);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Failed to load task files:", e);
        return [];
    }
};

export const saveTaskFiles = (taskId: string, files: StoredFile[]) => {
    try {
        localStorage.setItem(`${FILES_KEY_PREFIX}${taskId}`, JSON.stringify(files));
    } catch (e) {
        console.error("Failed to save task files:", e);
    }
};

export const addFileToTask = async (taskId: string, file: File): Promise<StoredFile[]> => {
    const existingFiles = getTaskFiles(taskId);
    // Prevent duplicates
    if (existingFiles.some(f => f.name === file.name)) {
        return existingFiles;
    }
    const base64Data = await fileToBase64(file);
    const newFile: StoredFile = {
        name: file.name,
        type: file.type,
        data: base64Data,
    };
    const updatedFiles = [...existingFiles, newFile];
    saveTaskFiles(taskId, updatedFiles);
    return updatedFiles;
};

export const deleteTaskFile = (taskId: string, fileName: string): StoredFile[] => {
    const existingFiles = getTaskFiles(taskId);
    const updatedFiles = existingFiles.filter(f => f.name !== fileName);
    saveTaskFiles(taskId, updatedFiles);
    return updatedFiles;
};


export const getTaskSummary = (taskId: string): string => {
    return localStorage.getItem(`${SUMMARIES_KEY_PREFIX}${taskId}`) || '';
};

export const saveTaskSummary = (taskId: string, summary: string) => {
    localStorage.setItem(`${SUMMARIES_KEY_PREFIX}${taskId}`, summary);
};

// Function to load all data into state at once
export const loadAllProcessData = (taskIds: string[]): { files: Record<string, StoredFile[]>, summaries: Record<string, string> } => {
    const files: Record<string, StoredFile[]> = {};
    const summaries: Record<string, string> = {};

    taskIds.forEach(id => {
        files[id] = getTaskFiles(id);
        summaries[id] = getTaskSummary(id);
    });

    return { files, summaries };
};
