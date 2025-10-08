import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.EXPENSES_TABLE ?? "Expenses";
const client = new DynamoDBClient({});

const parseExpensePayload = (rawBody) => {
  let payload = {};
  try {
    payload = JSON.parse(rawBody ?? "{}");
  } catch (error) {
    throw new Error("Invalid JSON payload");
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const category = typeof payload.category === "string" ? payload.category.trim() : "";
  const date = typeof payload.date === "string" ? payload.date.trim() : "";
  const method = typeof payload.method === "string" ? payload.method.trim() : "";
  const status = typeof payload.status === "string" ? payload.status.trim() : "";

  const amountText = String(payload.amount ?? "").trim();
  const amount = Number(amountText);

  if (!name || !category || !date || !method || !status || amountText === "" || !Number.isFinite(amount)) {
    throw new Error("Invalid expense payload");
  }

  return { name, category, date, method, status, amount };
};

export const handler = async (event) => {
  const id = event.pathParameters?.id?.trim();

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing id parameter" }),
    };
  }

  try {
    const expense = parseExpensePayload(event.body);

    await client.send(
      new UpdateItemCommand({
        TableName: TABLE_NAME,
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
          ":name": { S: expense.name },
          ":category": { S: expense.category },
          ":date": { S: expense.date },
          ":method": { S: expense.method },
          ":status": { S: expense.status },
          ":amount": { N: expense.amount.toString() },
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Expense ${id} updated` }),
    };
  } catch (error) {
    const statusCode =
      error.message === "Invalid expense payload" || error.message === "Invalid JSON payload"
        ? 400
        : 500;
    return {
      statusCode,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
