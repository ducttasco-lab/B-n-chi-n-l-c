// utils/markdown.ts

import { Task } from '../types.ts';

export const formatMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';

  // Handle inline styles first
  let html = markdown
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  const lines = html.split('\n');
  let inList = false;
  const processedLines: string[] = [];

  lines.forEach(line => {
    const trimmedLine = line.trim();

    // Check for headers
    if (trimmedLine.startsWith('### ')) {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push(`<h4>${trimmedLine.substring(4)}</h4>`);
      return;
    }
    if (trimmedLine.startsWith('## ')) {
       if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push(`<h3>${trimmedLine.substring(3)}</h3>`);
      return;
    }
    if (trimmedLine.startsWith('# ')) {
       if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push(`<h2>${trimmedLine.substring(2)}</h2>`);
      return;
    }

    // Check for list items
    if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      const listItem = `<li>${trimmedLine.substring(2)}</li>`;
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      processedLines.push(listItem);
    } else {
      // If it's not a list item, and we were in a list, close it.
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      // Treat non-empty, non-list lines as paragraphs
      if (trimmedLine.length > 0) {
        processedLines.push(`<p>${line}</p>`);
      }
    }
  });

  // Close any open list at the end
  if (inList) {
    processedLines.push('</ul>');
  }

  return processedLines.join('');
};

const parseMarkdownTable = (markdown: string): { headers: string[], rows: string[][] } => {
    if (!markdown) return { headers: [], rows: [] };
    const lines = markdown.split('\n').map(line => line.trim()).filter(line => line.startsWith('|'));
    if (lines.length < 2) return { headers: [], rows: [] };
    
    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
    const rows = lines.slice(2).map(line => line.split('|').map(cell => cell.trim()).filter((_, i) => i > 0 && i <= headers.length));
    return { headers, rows };
};


export const parseTasksFromMarkdown = (markdown: string): Task[] => {
    const { rows } = parseMarkdownTable(markdown);
    if (rows.length === 0) return [];

    const newTasks: Task[] = rows.map((row, index) => {
        // Handle tables that might have more columns but we only need the first two
        const code = row[0] || '';
        const name = row[1] || '';
        
        const isHeader = !code && name.includes('**');
        const nameCleaned = name.replace(/\*\*/g, '');
        
        let mc1 = '', mc2 = '', mc3 = '', mc4 = '';
        if (code) {
            if (code.length >= 2) mc1 = code.substring(0, 2);
            if (code.length >= 3) mc2 = code.substring(0, 3);
            if (code.length >= 4) mc3 = code.substring(0, 4);
            if (code.length >= 5) mc4 = code.substring(0, 5);
        }

        return {
            id: `task-import-${Date.now()}-${index}`,
            rowNumber: index + 1,
            mc1, mc2, mc3, mc4,
            name: nameCleaned,
            isGroupHeader: isHeader,
            assignments: {}
        };
    });
    return newTasks;
};