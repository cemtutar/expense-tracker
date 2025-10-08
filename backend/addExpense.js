import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

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
  try {
    const expense = parseExpensePayload(event.body);

    const command = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        id: { S: uuidv4() },
        name: { S: expense.name },
        category: { S: expense.category },
        date: { S: expense.date },
        method: { S: expense.method },
        status: { S: expense.status },
        amount: { N: expense.amount.toString() },
      },
    });

    await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Expense added" }),
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
