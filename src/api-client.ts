export interface APIClient {
  call(api: string, action: string, body?: Record<string, any>): Promise<any>;
}
