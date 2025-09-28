import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-2" });

export const handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event, null, 2));

  const id = event.pathParameters?.id;
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ message: "Missing id parameter" }) };
  }

  const params = {
    TableName: "Expenses",
    Key: { id: { S: id } }, // <-- make sure "id" matches your table's partition key name
  };

  try {
    await client.send(new DeleteItemCommand(params));
    return { statusCode: 200, body: JSON.stringify({ message: `Expense ${id} deleted` }) };
  } catch (err) {
    console.error("DynamoDB delete failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Delete failed", error: err.message }),
    };
  }
};
