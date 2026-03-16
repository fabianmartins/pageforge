import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: 'local',
  endpoint: 'http://localhost:8000',
  credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
}));

const projects = [
  { id: '1', name: 'Website Redesign', status: 'active', owner: 'Alice', description: 'Redesign the company website' },
  { id: '2', name: 'Mobile App', status: 'planning', owner: 'Bob', description: 'Build a mobile companion app' },
  { id: '3', name: 'API Migration', status: 'completed', owner: 'Charlie', description: 'Migrate REST APIs to GraphQL' },
];

async function seed() {
  for (const project of projects) {
    await client.send(new PutCommand({ TableName: 'Projects', Item: project }));
    console.log(`✓ Seeded: ${project.name}`);
  }
}

seed().catch(console.error);
