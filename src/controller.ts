import type { APIClient } from './api-client.js';

export abstract class BaseController {
  protected apiClient: APIClient;

  constructor(apiClient: APIClient) {
    this.apiClient = apiClient;
  }

  abstract list(params?: any): Promise<{ items: any[]; nextToken?: string }>;
  abstract get(id: string): Promise<any>;

  async create?(data: any): Promise<any>;
  async delete?(id: string): Promise<void>;
}
