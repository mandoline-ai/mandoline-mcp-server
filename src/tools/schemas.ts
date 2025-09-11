// Mandoline Agentic Evaluation Schema – revised 2025‑08‑06
/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from 'zod';

import { SCHEMA_DESCRIPTIONS as D } from './descriptions.js';

export const FENCE = '```'; // Markdown fence for large blobs.

export const RoleSchema = z.union([
  z.literal('user'),
  z.literal('assistant'),
  z.literal('system'),
]);
export type Role = z.infer<typeof RoleSchema>;

export const AssetKindSchema = z.union([
  z.literal('code'),
  z.literal('doc'),
  z.literal('data'),
  z.literal('config'),
  z.literal('log'),
  z.literal('other'),
]);
export type AssetKind = z.infer<typeof AssetKindSchema>;

export type Metadata = Record<string, any>;

export const ChatMessageSchema = z.object({
  role: RoleSchema.describe(D.chatMessage.role),
  content: z.string().describe(D.chatMessage.content),
});

const BaseAsset = {
  name: z.string(),
  kind: AssetKindSchema,
  content: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
};

export const ContextAssetSchema = z
  .object({
    ...BaseAsset,
  })
  .describe('Asset the assistant read');
export type ContextAssetData = z.infer<typeof ContextAssetSchema>;

export const OutputAssetSchema = z
  .object({
    ...BaseAsset,
  })
  .describe('Asset the assistant produced');
export type OutputAssetData = z.infer<typeof OutputAssetSchema>;

export const ToolInvocationSchema = z.object({
  name: z.string().describe(D.toolInvocation.name),
  arguments: z.string().describe(D.toolInvocation.arguments),
  result: z.string().optional().describe(D.toolInvocation.result),
});
export type ToolInvocation = z.infer<typeof ToolInvocationSchema>;

const BasePromptSchema = z.object({
  messages: z.array(ChatMessageSchema).describe(D.prompt.messages),
  context_assets: z
    .array(ContextAssetSchema)
    .optional()
    .default([])
    .describe(D.prompt.context_assets),
  invocations: z
    .array(ToolInvocationSchema)
    .optional()
    .default([])
    .describe(D.prompt.invocations),
});

const BaseResponseSchema = z.object({
  message: ChatMessageSchema.describe(D.response.message),
  output_assets: z
    .array(OutputAssetSchema)
    .optional()
    .default([])
    .describe(D.response.output_assets),
  invocations: z
    .array(ToolInvocationSchema)
    .optional()
    .default([])
    .describe(D.response.invocations),
});

function tryParseJson(value: unknown): unknown {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export const PromptSchema = z
  .union([z.string(), BasePromptSchema])
  .transform(tryParseJson)
  .pipe(BasePromptSchema);

export const ResponseSchema = z
  .union([z.string(), BaseResponseSchema])
  .transform(tryParseJson)
  .pipe(BaseResponseSchema);

const PLACEHOLDER_RE =
  /\[(?:the full response|trimmed|placeholder|todo)[^\]]*]/i;

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(`MCP schema validation failed – ${msg}`);
}

export class ContextAssetModel {
  constructor(readonly data: ContextAssetData) {}
  short(lines = 20): string {
    return this.data.content.split(/\r?\n/).slice(0, lines).join('\n');
  }
  static schema = ContextAssetSchema;
}

export class OutputAssetModel {
  constructor(readonly data: OutputAssetData) {}
  short(lines = 20): string {
    return this.data.content.split(/\r?\n/).slice(0, lines).join('\n');
  }
  static schema = OutputAssetSchema;
}

export class ChatMessageModel {
  constructor(readonly data: z.infer<typeof ChatMessageSchema>) {}
  get role() {
    return this.data.role;
  }
  get content() {
    return this.data.content;
  }
  static schema = ChatMessageSchema;
}

export class InvocationModel {
  constructor(readonly data: ToolInvocation) {}
  static schema = ToolInvocationSchema;
}

export class PromptModel {
  messages: ChatMessageModel[];
  contextAssets: ContextAssetModel[];
  invocations: InvocationModel[];

  constructor(data: z.input<typeof BasePromptSchema>) {
    const parsed = BasePromptSchema.parse(data);
    this.messages = parsed.messages.map((m) => new ChatMessageModel(m));
    this.contextAssets = parsed.context_assets.map(
      (a) => new ContextAssetModel(a)
    );
    this.invocations = parsed.invocations.map((i) => new InvocationModel(i));
  }

  validate() {
    assert(
      this.messages.length > 0,
      'Prompt must contain at least one message'
    );
    assert(
      this.messages.some((m) => m.role === 'user'),
      'Prompt needs at least one user message'
    );
  }

  flatten(): string {
    const parts: string[] = [];

    // Conversation
    const transcript = this.messages
      .map(
        (m) =>
          `${m.role.charAt(0).toUpperCase() + m.role.slice(1)}: ${m.content}`
      )
      .join('\n');
    parts.push(`# Conversation\n\n${transcript}`);

    if (this.contextAssets.length) {
      const blocks = this.contextAssets.map((asset) => {
        const { name, kind, description, metadata, content } = asset.data;
        let header = `${name} (${kind}`;
        if (metadata?.language) header += `, ${metadata.language}`;
        header += ')';
        if (description) header += ` – ${description}`;
        return `${header}\n${FENCE}\n${content.trimEnd()}\n${FENCE}`;
      });
      parts.push(`# Context\n\n${blocks.join('\n\n')}`);
    }

    if (this.invocations.length) {
      const blocks = this.invocations.map((inv, i) => {
        const args = `${FENCE}json\n${inv.data.arguments}\n${FENCE}`;
        let block = `Tool Call ${i + 1}: ${inv.data.name}\n${args}`;
        if (inv.data.result) {
          block += `\n\nResult:\n${FENCE}\n${inv.data.result}\n${FENCE}`;
        }
        return block;
      });
      parts.push(`# Tool Invocations\n\n${blocks.join('\n\n')}`);
    }

    return parts.join('\n\n');
  }

  static schema = BasePromptSchema;
}

export class ResponseModel {
  message: ChatMessageModel;
  outputAssets: OutputAssetModel[];
  invocations: InvocationModel[];

  constructor(data: z.input<typeof BaseResponseSchema>) {
    const parsed = BaseResponseSchema.parse(data);
    this.message = new ChatMessageModel(parsed.message);
    this.outputAssets = parsed.output_assets.map(
      (a) => new OutputAssetModel(a)
    );
    this.invocations = parsed.invocations.map((i) => new InvocationModel(i));
  }

  validate() {
    assert(
      this.message.role === 'assistant',
      "Response.message.role must be 'assistant'"
    );
    assert(
      !PLACEHOLDER_RE.test(this.message.content),
      'Response contains placeholder text'
    );
  }

  flatten(): string {
    const parts: string[] = [this.message.content];

    // Tool calls in response
    if (this.invocations.length) {
      const blocks = this.invocations.map((inv, i) => {
        const args = `${FENCE}json\n${inv.data.arguments}\n${FENCE}`;
        let block = `Tool Call ${i + 1}: ${inv.data.name}\n${args}`;
        if (inv.data.result) {
          block += `\n\nResult:\n${FENCE}\n${inv.data.result}\n${FENCE}`;
        }
        return block;
      });
      parts.push(`# Tool Invocations\n\n${blocks.join('\n\n')}`);
    }

    // Generated content
    if (this.outputAssets.length) {
      const blocks = this.outputAssets.map((asset) => {
        const { name, kind, description, metadata, content } = asset.data;
        let header = `${name} (${kind}`;
        if (metadata?.language) header += `, ${metadata.language}`;
        header += ')';
        if (description) header += ` – ${description}`;
        return `${header}\n${FENCE}\n${content.trimEnd()}\n${FENCE}`;
      });
      parts.push(`# Generated Content\n\n${blocks.join('\n\n')}`);
    }

    return parts.join('\n\n');
  }

  static schema = BaseResponseSchema;
}

export interface EvaluationPayloadInput {
  metric_id: string;
  model_name: string;
  prompt: z.input<typeof PromptSchema>;
  response: z.input<typeof ResponseSchema>;
  properties?: Record<string, unknown>;
}

export function buildPromptResponsePair({
  prompt,
  response,
}: EvaluationPayloadInput) {
  // Parse with preprocessing to handle JSON strings
  const parsedPrompt = PromptSchema.parse(prompt);
  const parsedResponse = ResponseSchema.parse(response);

  const p = new PromptModel(parsedPrompt);
  const r = new ResponseModel(parsedResponse);

  p.validate();
  r.validate();

  return {
    prompt: p.flatten(),
    response: r.flatten(),
  };
}
