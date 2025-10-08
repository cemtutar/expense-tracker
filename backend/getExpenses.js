import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.EXPENSES_TABLE ?? "Expenses";
const client = new DynamoDBClient({});

const mapExpenseItem = (item = {}) => ({
  id: item.id?.S ?? null,
  name: item.name?.S ?? null,
  category: item.category?.S ?? null,
  date: item.date?.S ?? null,
  method: item.method?.S ?? null,
  status: item.status?.S ?? null,
  amount: item.amount?.N ? Number(item.amount.N) : null,
});

export const handler = async () => {
  try {
    const response = await client.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    const items = Array.isArray(response.Items) ? response.Items : [];
    const expenses = items.map(mapExpenseItem);

    return {
      statusCode: 200,
      body: JSON.stringify(expenses),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to load expenses", error: error.message }),
    };
  }
};
