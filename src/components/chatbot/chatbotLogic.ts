import axios from "axios";
import { marked } from "marked";

// Vite env variable expected: VITE_OPENAI_API_KEY
const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
const url = "https://api.openai.com/v1/chat/completions";

export interface SimpleMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Get bot response using limited recent history for context.
 */
export async function getBotResponse(
  latestUserInput: string,
  history: SimpleMessage[] = []
): Promise<string> {
  if (!apiKey) {
    return "La clé API OpenAI est manquante (VITE_OPENAI_API_KEY).";
  }

  const trimmed = history.slice(-20); // limit context size

  const messages = [
    {
      role: "system" as const,
      content:
        "Tu es un assistant utile et courtois spécialisé dans les questions médicales générales (sans poser de diagnostic). La plateforme s'appelle FadakCare. Réponds en Markdown clair, avec des listes quand utile et toujours un avertissement de consulter un professionnel pour des décisions médicales.",
    },
    ...trimmed,
    { role: "user" as const, content: latestUserInput },
  ];

  try {
  const response = await axios.post(
      url,
      {
        model: "gpt-4o-mini",
        messages,
        max_tokens: 1000,
        temperature: 0.6,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

  interface Choice { message?: { content?: string } }
  interface ChatCompletion { choices?: Choice[] }
  const data = response.data as ChatCompletion;
  const botMarkdownResponse: string = data.choices?.[0]?.message?.content || "";
    return marked.parse(botMarkdownResponse);
  } catch (error) {
    console.error("Erreur lors de l'appel à OpenAI:", error);
    return "Désolé, une erreur s'est produite.";
  }
}
