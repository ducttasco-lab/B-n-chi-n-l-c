// services/versionManager.ts
import { VersionInfo, VersionData } from '../types.ts';

const METADATA_KEY = 'matrix_versions_metadata';
const DATA_KEY_PREFIX = 'matrix_version_data_';
export const ACTIVATE_MATRIX_KEY = 'active_matrix_data';
const ACTIVE_VERSION_ID_KEY = 'active_version_id';


// --- Active Version ID Management ---

export const getActiveVersionId = (): string | null => {
    return localStorage.getItem(ACTIVE_VERSION_ID_KEY);
};

export const setActiveVersionId = (id: string | null) => {
    if (id) {
        localStorage.setItem(ACTIVE_VERSION_ID_KEY, id);
    } else {
        localStorage.removeItem(ACTIVE_VERSION_ID_KEY);
    }
};


// --- Version Management ---

export const getVersions = (): VersionInfo[] => {
    try {
        const metadataJson = localStorage.getItem(METADATA_KEY);
        if (!metadataJson) return [];
        const versions = JSON.parse(metadataJson) as VersionInfo[];
        return versions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
        console.error("Failed to load versions:", error);
        return [];
    }
};

export const getVersionData = (versionId: string): VersionData | null => {
    try {
        const dataJson = localStorage.getItem(`${DATA_KEY_PREFIX}${versionId}`);
        if (!dataJson) return null;
        return JSON.parse(dataJson) as VersionData;
    } catch (error) {
        console.error(`Failed to load data for version ${versionId}:`, error);
        return null;
    }
};

export const saveVersion = (name: string, data: VersionData): VersionInfo[] => {
    const versions = getVersions();
    const newVersion: VersionInfo = {
        id: `version_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name,
        timestamp: Date.now(),
    };

    try {
        // Save the detailed data
        localStorage.setItem(`${DATA_KEY_PREFIX}${newVersion.id}`, JSON.stringify(data));

        // Save the metadata
        const newVersions = [newVersion, ...versions];
        localStorage.setItem(METADATA_KEY, JSON.stringify(newVersions));
        
        return newVersions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
        console.error("Failed to save version:", error);
        alert("Lỗi khi lưu phiên bản. Có thể do dung lượng lưu trữ trình duyệt đã đầy.");
        throw error;
    }
};

export const renameVersion = (versionId: string, newName: string): VersionInfo[] => {
    const versions = getVersions();
    const updatedVersions = versions.map(v => 
        v.id === versionId ? { ...v, name: newName } : v
    );
    localStorage.setItem(METADATA_KEY, JSON.stringify(updatedVersions));
    return updatedVersions.sort((a, b) => b.timestamp - a.timestamp);
};

export const deleteVersion = (versionId: string): VersionInfo[] => {
    const versions = getVersions();
    const updatedVersions = versions.filter(v => v.id !== versionId);
    
    localStorage.setItem(METADATA_KEY, JSON.stringify(updatedVersions));
    localStorage.removeItem(`${DATA_KEY_PREFIX}${versionId}`);
    
    // If the deleted version was the active one, clear the active ID
    if (getActiveVersionId() === versionId) {
        setActiveVersionId(null);
    }

    return updatedVersions.sort((a, b) => b.timestamp - a.timestamp);
};


// --- Active Matrix Management ---

export const saveActiveMatrix = (data: VersionData) => {
    try {
        const dataJson = JSON.stringify(data);
        localStorage.setItem(ACTIVATE_MATRIX_KEY, dataJson);
    } catch (error) {
        console.error("Failed to save active matrix:", error);
        alert("Lỗi khi lưu ma trận. Có thể dung lượng lưu trữ trình duyệt đã đầy.");
    }
};

export const loadActiveMatrix = (): VersionData | null => {
    try {
        const dataJson = localStorage.getItem(ACTIVATE_MATRIX_KEY);
        if (!dataJson) return null;
        return JSON.parse(dataJson) as VersionData;
    } catch (error) {
        console.error("Failed to load active matrix:", error);
        return null;
    }
};