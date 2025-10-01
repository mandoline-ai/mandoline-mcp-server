import type { MetricCreate, MetricUpdate } from 'mandoline';
import { z } from 'zod';

import { handleToolError, jsonToolResponse } from '../helpers.js';
import { getMandolineClient } from '../mandoline-client.js';
import { server } from '../server.js';
import {
  METRIC_PARAM_DESCRIPTIONS as M,
  SHARED_PARAM_DESCRIPTIONS as S,
  TOOL_DESCRIPTIONS,
} from './descriptions.js';
import { LooseRecordSchema } from './schemas.js';

server.registerTool(
  'create_metric',
  {
    description: TOOL_DESCRIPTIONS.create_metric,
    inputSchema: {
      name: z.string().describe(M.name),
      description: z.string().describe(M.description),
      tags: z.array(z.string()).optional().describe(M.tags),
    },
  },
  async ({ name, description, tags }) => {
    try {
      const mandoline = getMandolineClient();
      const metricCreate: MetricCreate = {
        name,
        description,
        tags: tags ?? null,
      };
      const newMetric = await mandoline.createMetric(metricCreate);
      return jsonToolResponse(newMetric);
    } catch (error) {
      handleToolError(error);
    }
  }
);

server.registerTool(
  'batch_create_metrics',
  {
    description: TOOL_DESCRIPTIONS.batch_create_metrics,
    inputSchema: {
      metrics: z
        .array(
          z.object({
            name: z.string().describe(M.name),
            description: z.string().describe(M.description),
            tags: z.array(z.string()).optional().describe(M.tags),
          })
        )
        .describe(M.metrics),
    },
  },
  async ({ metrics }) => {
    try {
      if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
        throw new Error('No metrics provided for batch creation');
      }

      const mandoline = getMandolineClient();

      const metricCreates = metrics.map((metricInput) => ({
        name: metricInput.name,
        description: metricInput.description,
        tags: metricInput.tags ?? null,
      }));

      const createdMetrics = await mandoline.batchCreateMetrics(metricCreates);
      return jsonToolResponse(createdMetrics);
    } catch (error) {
      handleToolError(error);
    }
  }
);

server.registerTool(
  'get_metric',
  {
    description: TOOL_DESCRIPTIONS.get_metric,
    inputSchema: {
      metric_id: z.string().describe(M.metric_id),
    },
  },
  async ({ metric_id }) => {
    try {
      const mandoline = getMandolineClient();
      const metric = await mandoline.getMetric(metric_id);
      return jsonToolResponse(metric);
    } catch (error) {
      handleToolError(error);
    }
  }
);

server.registerTool(
  'get_metrics',
  {
    description: TOOL_DESCRIPTIONS.get_metrics,
    inputSchema: {
      skip: z.number().optional().describe(S.skip),
      limit: z.number().optional().describe(S.limit),
      tags: z.array(z.string()).optional().describe(M.tags),
      filters: LooseRecordSchema.optional().describe(
        `${S.filters} Example: {"name": "foo"} to filter by exact name match.`
      ),
    },
  },
  async ({ skip, limit, tags, filters }) => {
    try {
      const mandoline = getMandolineClient();
      const metrics = await mandoline.getMetrics({
        skip,
        limit,
        tags,
        filters,
      });
      return jsonToolResponse(metrics);
    } catch (error) {
      handleToolError(error);
    }
  }
);

server.registerTool(
  'update_metric',
  {
    description: TOOL_DESCRIPTIONS.update_metric,
    inputSchema: {
      metric_id: z.string().describe(M.metric_id),
      name: z.string().optional().describe(M.name),
      description: z.string().optional().describe(M.description),
      tags: z.array(z.string()).optional().describe(M.tags),
    },
  },
  async ({ metric_id, name, description, tags }) => {
    try {
      const metricUpdate: MetricUpdate = {};
      if (name) metricUpdate.name = name;
      if (description) metricUpdate.description = description;
      if (tags !== undefined) metricUpdate.tags = tags;

      const mandoline = getMandolineClient();
      const updated = await mandoline.updateMetric(metric_id, metricUpdate);
      return jsonToolResponse(updated);
    } catch (error) {
      handleToolError(error);
    }
  }
);
