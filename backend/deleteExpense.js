import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.EXPENSES_TABLE ?? "Expenses";
const client = new DynamoDBClient({});

export const handler = async (event) => {
  const id = event.pathParameters?.id?.trim();

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing id parameter" }),
    };
  }

  try {
    await client.send(
      new DeleteItemCommand({
        TableName: TABLE_NAME,
        Key: { id: { S: id } },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Expense ${id} deleted` }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to delete expense", error: error.message }),
    };
  }
};
