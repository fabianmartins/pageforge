import express from 'express';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'node:crypto';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: 'local',
  endpoint: 'http://localhost:8000',
  credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
}));

const app = express();
app.use(express.json());

// List projects
app.post('/projects/list', async (_req, res) => {
  const { Items = [] } = await ddb.send(new ScanCommand({ TableName: 'Projects' }));
  res.json({ items: Items });
});

// Get project
app.post('/projects/get', async (req, res) => {
  const { Item } = await ddb.send(new GetCommand({ TableName: 'Projects', Key: { id: req.body.id } }));
  if (!Item) return res.status(404).json({ error: 'Not found' });
  res.json(Item);
});

// Create project
app.post('/projects/create', async (req, res) => {
  const item = { id: crypto.randomUUID(), ...req.body };
  await ddb.send(new PutCommand({ TableName: 'Projects', Item: item }));
  res.json(item);
});

// Delete project
app.post('/projects/delete', async (req, res) => {
  await ddb.send(new DeleteCommand({ TableName: 'Projects', Key: { id: req.body.id } }));
  res.json({ success: true });
});

app.listen(3001, () => console.log('API server running on http://localhost:3001'));
