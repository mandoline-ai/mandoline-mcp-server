import type { EvaluationCreate, EvaluationUpdate } from 'mandoline';
import { z } from 'zod';

import {
  generateContentHash,
  handleToolError,
  jsonToolResponse,
} from '../helpers.js';
import { logger } from '../logger.js';
import { getMandolineClient } from '../mandoline-client.js';
import { requestContext, server, serverConfig } from '../server.js';
import {
  SCHEMA_DESCRIPTIONS as D,
  EVALUATION_PARAM_DESCRIPTIONS as E,
  METRIC_PARAM_DESCRIPTIONS as M,
  SHARED_PARAM_DESCRIPTIONS as S,
  TOOL_DESCRIPTIONS,
} from './descriptions.js';
import {
  PromptSchema,
  ResponseSchema,
  buildPromptResponsePair,
  type EvaluationPayloadInput,
} from './schemas.js';

const DEFAULT_INCLUDE_CONTENT = false;

function getEnvironmentContext(model_name?: string): Record<string, unknown> {
  const store = requestContext.getStore();
  return {
    client: store?.clientInfo?.name ?? 'unknown',
    client_version: store?.clientInfo?.version ?? 'unknown',
    server: serverConfig?.name ?? 'unknown',
    server_version: serverConfig?.version ?? 'unknown',
    model_name: model_name ?? 'unknown',
  };
}

function getEvaluationPayload(
  prompt: z.input<typeof PromptSchema>,
  response: z.input<typeof ResponseSchema>,
  model_name?: string,
  properties: Record<string, unknown> = {}
) {
  const { prompt: flatPrompt, response: flatResponse } =
    buildPromptResponsePair({ prompt, response } as EvaluationPayloadInput);
  const contentHash = generateContentHash(flatPrompt, flatResponse);

  const mergedProperties = {
    ...getEnvironmentContext(model_name),
    ...properties,
    contentHash,
  };

  return {
    flatPrompt,
    flatResponse,
    mergedProperties,
  };
}

server.registerTool(
  'create_evaluation',
  {
    description: TOOL_DESCRIPTIONS.create_evaluation,
    inputSchema: {
      metric_id: z.string().describe(M.metric_id),
      prompt: PromptSchema.describe(D.prompt.root),
      response: ResponseSchema.describe(D.response.root),
      model_name: z.string().optional().describe(E.model_name),
      properties: z.record(z.unknown()).optional().describe(S.properties),
    },
  },
  async ({ metric_id, prompt, response, model_name, properties = {} }) => {
    try {
      const { flatPrompt, flatResponse, mergedProperties } =
        getEvaluationPayload(prompt, response, model_name, properties);

      const payload = {
        metricId: metric_id,
        prompt: flatPrompt,
        response: flatResponse,
        properties: mergedProperties,
      };

      const mandoline = getMandolineClient();

      const newEval = await mandoline.createEvaluation(
        payload as EvaluationCreate,
        DEFAULT_INCLUDE_CONTENT
      );

      return jsonToolResponse(newEval);
    } catch (error) {
      handleToolError(error);
    }
  }
);

server.registerTool(
  'batch_create_evaluations',
  {
    description: TOOL_DESCRIPTIONS.batch_create_evaluations,
    inputSchema: {
      metric_ids: z.array(z.string()).describe(M.metric_ids),
      prompt: PromptSchema.describe(D.prompt.root),
      response: ResponseSchema.describe(D.response.root),
      model_name: z.string().optional().describe(E.model_name),
      properties: z.record(z.unknown()).optional().describe(S.properties),
    },
  },
  async ({ metric_ids, prompt, response, model_name, properties = {} }) => {
    try {
      if (
        !metric_ids ||
        !Array.isArray(metric_ids) ||
        metric_ids.length === 0
      ) {
        throw new Error('No metric IDs provided for batch evaluation');
      }

      const { flatPrompt, flatResponse, mergedProperties } =
        getEvaluationPayload(prompt, response, model_name, properties);

      const mandoline = getMandolineClient();

      const evaluationCreates = metric_ids.map((metricId) => ({
        metricId,
        prompt: flatPrompt,
        response: flatResponse,
        properties: mergedProperties,
      }));

      const createdEvaluations = await mandoline.batchCreateEvaluations(
        evaluationCreates,
        DEFAULT_INCLUDE_CONTENT
      );

      return jsonToolResponse(createdEvaluations);
    } catch (error) {
      handleToolError(error);
    }
  }
);

server.registerTool(
  'get_evaluation',
  {
    description: TOOL_DESCRIPTIONS.get_evaluation,
    inputSchema: {
      evaluation_id: z.string().describe(E.evaluation_id),
    },
  },
  async ({ evaluation_id }) => {
    try {
      const mandoline = getMandolineClient();
      const evaluation = await mandoline.getEvaluation(evaluation_id);
      return jsonToolResponse(evaluation);
    } catch (error) {
      handleToolError(error);
    }
  }
);

server.registerTool(
  'get_evaluations',
  {
    description: TOOL_DESCRIPTIONS.get_evaluations,
    inputSchema: {
      skip: z.number().optional().describe(S.skip),
      limit: z.number().optional().describe(S.limit),
      metric_id: z.string().optional().describe('Filter to specific metric.'),
      include_content: z.boolean().optional().describe(S.include_content),
    },
  },
  async ({ skip, limit, metric_id, include_content = true }) => {
    try {
      const mandoline = getMandolineClient();
      const evals = await mandoline.getEvaluations({
        skip,
        limit,
        metricId: metric_id,
        includeContent: include_content,
      });
      return jsonToolResponse(evals);
    } catch (error) {
      handleToolError(error);
    }
  }
);

server.registerTool(
  'update_evaluation',
  {
    description: TOOL_DESCRIPTIONS.update_evaluation,
    inputSchema: {
      evaluation_id: z.string().describe(E.evaluation_id),
      properties: z.record(z.unknown()).optional().describe(S.properties),
    },
  },
  async ({ evaluation_id, properties }) => {
    try {
      const mandoline = getMandolineClient();
      const evaluationUpdate: EvaluationUpdate = {};
      if (properties !== undefined) evaluationUpdate.properties = properties;

      const updated = await mandoline.updateEvaluation(
        evaluation_id,
        evaluationUpdate
      );
      return jsonToolResponse(updated);
    } catch (error) {
      handleToolError(error);
    }
  }
);
