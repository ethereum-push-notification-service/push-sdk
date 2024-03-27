export function extractWebLink(message: string): string | null {
  const webLinkRegex = /(https?:\/\/[^\s]+)/;
  const match = message.match(webLinkRegex);
  return match ? match[0] : null;
}
