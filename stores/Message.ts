import encoder from "@nem035/gpt-3-encoder";
import { Snippet } from "./Snippet";

export const countTokens = (text: string) => encoder.encode(text).length;

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  loading?: boolean;
}

// Helper function to estimate tokens
function estimateTokens(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words * (100 / 75));
}

export function messageContent(message: Message, snippets: Snippet[]) {
  if (message.role === "system") {
    return message.content;
  }
  // Find all snippet entry codes by searching for [[snippetname]] pattern
  // only search for snippets that we know exist in the snippets array
  const snippetNames = snippets.map(snippet => snippet.id);
  const snippetRegex = new RegExp(
    `\\[\\[(${snippetNames.join("|")})\\]\\]`,
    "g"
  );
  const matches = message.content.match(snippetRegex);
  if (matches) {
    // Replace all snippet entry codes with the actual snippet
    let ret = message.content;
    for (const match of matches) {
      const snippetName = match.slice(2, -2);
      const snippet = snippets.find(snippet => snippet.id === snippetName);
      if (snippet) {
        ret = ret.replace(match, snippet.content);
      }
    }
    return ret;
  } else {
    return message.content;
  }
}


// Truncate messages
export function truncateMessages(
  messages: Message[],
  snippets: Snippet[],
  modelMaxTokens: number,
  userMaxTokens: number
): Message[] {
  if (messages.length <= 1) return messages;

  if (!userMaxTokens) {
    // Try to reserve some room for the model output by default
    userMaxTokens = 1024;
  }
  const targetTokens = modelMaxTokens - userMaxTokens;

  // Never remove the system message
  let accumulatedTokens = 0;
  const ret = [];
  let startIdx = 0;

  if (messages[0].role === "system") {
    accumulatedTokens = estimateTokens(messageContent(messages[0], snippets));
    ret.push(messages[0]);
    startIdx = 1;
  }

  // Try to truncate messages as is
  for (let i = messages.length - 1; i >= startIdx; i--) {
    const message = messages[i];
    const tokens = estimateTokens(messageContent(message, snippets));
    if (accumulatedTokens + tokens > targetTokens) {
      break;
    }
    accumulatedTokens += tokens;
    // Insert at position 1
    ret.splice(1, 0, message);
  }
  return ret;
}
