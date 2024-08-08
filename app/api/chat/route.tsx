// import { NextResponse } from "next/server";
// import OpenAI from "openai";
// import ChatCompletionCreateParams from "openai";
// const systemPrompt: string = "hey";

// export async function POST(req: Request): Promise<NextResponse> {
//   const openai = new OpenAI();
//   const data: ChatCompletionCreateParams.ChatCompletionMessage[] =
//     await req.json();

//   const completion = await openai.chat.completions.create({
//     messages: [{ role: "system", content: systemPrompt }, ...data],
//     model: "gpt-4o",
//     stream: true,
//   });

//   const stream = new ReadableStream({
//     async start(controller) {
//       const encoder = new TextEncoder();
//       try {
//         for await (const chunk of completion) {
//           const content = chunk.choices[0]?.delta?.content;
//           if (content) {
//             const text = encoder.encode(content);
//             controller.enqueue(text);
//           }
//         }
//       } catch (err) {
//         controller.error(err);
//       } finally {
//         controller.close();
//       }
//     },
//   });

//   return new NextResponse(stream);
// }

import { NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { streamText, StreamingTextResponse } from "ai";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";

const systemPrompt: string = "Fuck";

// Create a Bedrock client
const bedrock = createAmazonBedrock({
  region: "us-west-2",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function POST(req: Request): Promise<NextResponse> {
  const data: { role: string; content: string }[] = await req.json();

  const { textStream } = await streamText({
    model: bedrock("meta.llama3-70b-instruct-v1:0"),
    prompt: [...data].map((d) => d.content).join(" "),
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of textStream) {
          const text = encoder.encode(chunk);
          controller.enqueue(text);
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
