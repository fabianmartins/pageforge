import { BaseController } from 'pageforge';
import type { APIClient } from 'pageforge';

export class ProjectController extends BaseController {
  constructor(apiClient: APIClient) {
    super(apiClient);
  }

  async list() {
    return this.apiClient.call('main', 'projects/list');
  }

  async get(id: string) {
    return this.apiClient.call('main', 'projects/get', { id });
  }

  async create(data: any) {
    return this.apiClient.call('main', 'projects/create', data);
  }

  async update(id: string, data: any) {
    return this.apiClient.call('main', 'projects/update', { id, ...data });
  }

  async delete(id: string) {
    return this.apiClient.call('main', 'projects/delete', { id });
  }
}
