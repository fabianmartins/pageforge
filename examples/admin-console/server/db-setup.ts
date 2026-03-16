import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: 'local',
  endpoint: 'http://localhost:8000',
  credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
});

async function setup() {
  try {
    await client.send(new CreateTableCommand({
      TableName: 'Projects',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      BillingMode: 'PAY_PER_REQUEST',
    }));
    console.log('✓ Created Projects table');
  } catch (e: any) {
    if (e.name === 'ResourceInUseException') {
      console.log('⚠ Projects table already exists');
    } else {
      throw e;
    }
  }
}

setup().catch(console.error);
