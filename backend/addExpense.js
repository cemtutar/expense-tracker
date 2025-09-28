import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";


const client = new DynamoDBClient();


export const handler = async (event) => {
    const body = JSON.parse(event.body ?? "{}");

    const amountValue = Number(body.amount);
    const categoryValue = typeof body.category === "string" ? body.category.trim() : "";
    const dateValue = typeof body.date === "string" ? body.date.trim() : "";

    if (!Number.isFinite(amountValue) || categoryValue === "" || dateValue === "") {
        return { statusCode: 400, body: JSON.stringify({ message: "Invalid expense payload" }) };
    }

    const item = {
        id: { S: uuidv4() },
        amount: { N: amountValue.toString() },
        category: { S: categoryValue },
        date: { S: dateValue },
    };

    if (typeof body.name === "string" && body.name.trim() !== "") {
        item.name = { S: body.name.trim() };
    }

    if (typeof body.method === "string" && body.method.trim() !== "") {
        item.method = { S: body.method.trim() };
    }

    if (typeof body.status === "string" && body.status.trim() !== "") {
        item.status = { S: body.status.trim() };
    }

    const params = {
        TableName: "Expenses",
        Item: item,
    };

    await client.send(new PutItemCommand(params));

    return { statusCode: 200, body: JSON.stringify({ message: "Expense added!" }) };
};
