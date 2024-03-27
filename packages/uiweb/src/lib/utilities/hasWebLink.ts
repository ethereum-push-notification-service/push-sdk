export function hasWebLink(message: string): boolean {
  const webLinkRegex = /(https?:\/\/[^\s]+)/;
  const match = message.match(webLinkRegex);
  return !!match;
}
