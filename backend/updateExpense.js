import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient();

export const handler = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ message: "Missing id parameter" }) };
  }

  let body = {};
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ message: "Invalid JSON payload" }) };
  }

  const nameValue = typeof body.name === "string" ? body.name.trim() : "";
  const categoryValue = typeof body.category === "string" ? body.category.trim() : "";
  const dateValue = typeof body.date === "string" ? body.date.trim() : "";
  const methodValue = typeof body.method === "string" ? body.method.trim() : "";
  const statusValue = typeof body.status === "string" ? body.status.trim() : "";
  const amountNumber = Number(body.amount);

  if (
    nameValue === "" ||
    categoryValue === "" ||
    dateValue === "" ||
    methodValue === "" ||
    statusValue === "" ||
    !Number.isFinite(amountNumber)
  ) {
    return { statusCode: 400, body: JSON.stringify({ message: "Invalid expense payload" }) };
  }

  const params = {
    TableName: "Expenses",
    Key: { id: { S: id } },
    UpdateExpression:
      "SET #name = :name, #category = :category, #date = :date, #method = :method, #status = :status, #amount = :amount",
    ExpressionAttributeNames: {
      "#name": "name",
      "#category": "category",
      "#date": "date",
      "#method": "method",
      "#status": "status",
      "#amount": "amount",
    },
    ExpressionAttributeValues: {
      ":name": { S: nameValue },
      ":category": { S: categoryValue },
      ":date": { S: dateValue },
      ":method": { S: methodValue },
      ":status": { S: statusValue },
      ":amount": { N: amountNumber.toString() },
    },
  };

  try {
    await client.send(new UpdateItemCommand(params));
    return { statusCode: 200, body: JSON.stringify({ message: `Expense ${id} updated` }) };
  } catch (err) {
    console.error("DynamoDB update failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Update failed", error: err.message }),
    };
  }
};
