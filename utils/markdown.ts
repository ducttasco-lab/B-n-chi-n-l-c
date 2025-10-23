// utils/markdown.ts

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
