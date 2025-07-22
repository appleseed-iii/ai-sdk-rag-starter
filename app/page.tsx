'use client';

import ChatInput from '@/components/ChatInput';
import Message from '@/components/Message';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef } from 'react';

export default function Chat() {
  const inputRef = useRef<HTMLInputElement>(null);

  const { status, sendMessage, messages, regenerate } = useChat({
    // const { messages, input, handleInputChange, handleSubmit } = useChat({
    // chatStore: defaultChatStoreOptions({
    //   api: '/api/chat',
    // }),
    // from: https://github.com/vercel/ai/blob/main/examples/next/app/chat/%5BchatId%5D/chat.tsx
    // id: chatData.id,
    // messages: chatData.messages,
    // resume,
    maxSteps: 3,
    transport: new DefaultChatTransport({
      api: `/api/chat`,
      // fetch: fetchWithErrorHandlers,
      // prepareSendMessagesRequest({ messages, id, body }) {
      //   return {
      //     body: {
      //       id: chatId,
      //       message: messages.at(-1),
      //       selectedChatModel: "chat-model",
      //       selectedLLMSettingsId,
      //       selectedVisibilityType: "public",
      //       userTimezone,
      //       ...body,
      //     },
      //   };
      // },
    }),
  });
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(message => (
        <Message
          key={message.id}
          message={message}
          regenerate={regenerate}
          sendMessage={sendMessage}
          status={status}
        />
      ))}
      <ChatInput
        status={status}
        onSubmit={text => {
          sendMessage({ text, metadata: { createdAt: Date.now() } });

          // if (isNewChat) {
          //   window.history.pushState(null, '', `/chat/${chatData.id}`);
          // }
        }}
        inputRef={inputRef}
      />
    </div>
  );
}