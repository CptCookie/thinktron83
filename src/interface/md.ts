/**
 * shorthand function to render simple markdown strings
 * @param content
 * @returns rendered HTML tree
 */
export const renderMarkdown = (content: string): HTMLElement[] => {
  let header = document.createElement("h1");
  header.textContent = "text";
  return [header];
};
