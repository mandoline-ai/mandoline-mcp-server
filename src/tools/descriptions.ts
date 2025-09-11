/**
 * Centralized description strings for the Mandoline MCP integration.
 */

export const SCHEMA_DESCRIPTIONS = {
  chatMessage: {
    role:
      "Role of the speaker: 'user', 'assistant', or 'system'. Must match the " +
      'original conversation exactly.',
    content:
      'Verbatim text of the message. No summarization or truncation—this is ' +
      'the ground-truth transcript line.',
  },

  contextAsset: {
    name:
      'Human-friendly handle or path of the resource the assistant READ ' +
      "(e.g., 'utils/pager.py').",
    kind: 'One of: code, doc, data, config, log, other.',
    content:
      'Full text the assistant consumed BEFORE generating its reply. ' +
      'Include original versions of files that will later be modified so ' +
      'reviewers can compare old vs new. You may truncate as long as a ' +
      'reviewer can still reconstruct intent—show first/last sections and ' +
      "insert an ellipsis marker like '[…]'.",
    description: 'Single-line purpose summary (helps quick scans).',
    metadata:
      'Optional key-value info (language, framework, line-count, etc.). ' +
      'If the file has a language, set metadata.language.',
  },

  outputAsset: {
    name:
      'Handle or path of the artifact the assistant WROTE or MODIFIED in ' +
      "this turn (e.g., '.cursorignore', 'README.md').",
    kind: 'Same taxonomy as contextAsset.',
    content:
      'Full text produced by the assistant. Include ALL generated artifacts ' +
      '—code, docs, tests, configs—so evaluators can see the delta. Follow ' +
      'the same truncation rules as contextAsset.',
    description: 'One-line why-it-matters summary.',
    metadata:
      'Optional key-value info (language, purpose, etc.). Populate ' +
      'metadata.language for syntax-highlighting when possible.',
  },

  toolInvocation: {
    name: "Name of the tool invoked (e.g., 'web_fetch').",
    arguments: 'Raw JSON string passed to the tool (exact, unformatted).',
    result: 'Raw text or JSON returned by the tool (optional).',
  },

  prompt: {
    root:
      'Complete prompt context including conversation history, assets read, ' +
      'and tool calls executed before the assistant reply being evaluated. ' +
      'Must be provided as an object.',
    messages:
      'COMPLETE conversation history up to—but NOT including—the assistant ' +
      'reply being evaluated. Include BOTH user and assistant turns in ' +
      'chronological order.',
    context_assets:
      'Every ContextAsset the assistant read while producing the reply. ' +
      'Omit only if genuinely none were consulted.',
    invocations:
      'All tool calls executed BEFORE the assistant reply (chronological).',
  },

  response: {
    root:
      "The assistant's complete response being evaluated, including the " +
      'message content, generated assets, and any tool calls made. ' +
      'Must be provided as an object.',
    message:
      "The assistant's reply for THIS turn (the thing being scored). " +
      "Must have role 'assistant'.",
    output_assets:
      'Array of OutputAssets generated in this reply. Include updated docs ' +
      'as well as code/config files.',
    invocations:
      'Tool calls executed DURING the assistant reply, if any. Leave empty ' +
      'if the reply had no tool invocations.',
  },
} as const;

export const TOOL_DESCRIPTIONS = {
  create_metric: 'Creates a new evaluation metric in Mandoline.',
  batch_create_metrics: 'Creates multiple metrics in one call.',
  get_metric: 'Fetches a metric by its ID.',
  get_metrics: 'Lists metrics with filtering and pagination.',
  update_metric: "Modifies an existing metric's metadata.",

  create_evaluation:
    'Evaluates a single prompt/response pair and returns a score (-1 … +1).',
  batch_create_evaluations:
    'Evaluates the same pair against multiple metrics in one request.',
  get_evaluation: 'Retrieves one evaluation by ID.',
  get_evaluations: 'Lists evaluations with pagination and filtering.',
  update_evaluation: 'Updates evaluation metadata (score is immutable).',

  get_server_health: 'Check the server health status.',
} as const;

export const SHARED_PARAM_DESCRIPTIONS = {
  skip: 'Number of results to skip (default 0).',
  limit:
    'Maximum results to return (default 100, max 1000). Large payloads can be expensive.',
  include_content:
    'When false, omits heavy prompt/response text (default true).',
  filters: "Server-side field-value filters, e.g., { 'name': 'foo' }.",
  properties:
    "Optional evaluation metadata (e.g., { branch: 'feature/x', commit: '<sha>' }).",
} as const;

export const METRIC_PARAM_DESCRIPTIONS = {
  name: 'Descriptive label for the metric.',
  description: 'Detailed explanation of what the metric measures.',
  tags: "Optional labels for organization (e.g., ['security']).",
  metric_id: 'Unique ID of the metric to fetch or modify.',
  metric_ids: 'Array of metric IDs for batch evaluation.',
  metrics: 'Array of metric definitions for bulk creation.',
} as const;

export const EVALUATION_PARAM_DESCRIPTIONS = {
  model_name:
    'Identifier of the model that generated the response. Only provide if certain.',
  evaluation_id: 'Unique ID of an existing evaluation.',
} as const;

export const PARAM_DESCRIPTIONS = {
  ...SHARED_PARAM_DESCRIPTIONS,
  ...METRIC_PARAM_DESCRIPTIONS,
  ...EVALUATION_PARAM_DESCRIPTIONS,
} as const;
