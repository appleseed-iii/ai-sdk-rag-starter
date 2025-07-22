import { createResource, removeResource } from '@/lib/actions/resources';
import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, tool, UIMessage } from 'ai';
import { z } from 'zod';
import { findRelevantContent } from '@/lib/ai/embedding';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    messages: convertToModelMessages(messages),
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        inputSchema: z.object({
          content: z
            .string()
            .describe('the content or resource to add to the knowledge base'),
        }),
        execute: async ({ content }) => createResource({ content }),
      }),
      removeResource: tool({
        description: `remove a resource to your knowledge base.
          If the user indicates that you should forget some content or otherwise remove something from memory, use this tool.`,
        inputSchema: z.object({
          content: z
            .string()
            .describe('the content or resource to remove to the knowledge base'),
        }),
        execute: async ({ content }) => removeResource({ content }),
      }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        inputSchema: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),

    },
  });

  return result.toUIMessageStreamResponse();
}