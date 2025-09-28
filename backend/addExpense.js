import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";


const client = new DynamoDBClient();


export const handler = async (event) => {
    const body = JSON.parse(event.body ?? "{}");

    const nameValue = typeof body.name === "string" ? body.name.trim() : "";
    const categoryValue = typeof body.category === "string" ? body.category.trim() : "";
    const dateValue = typeof body.date === "string" ? body.date.trim() : "";
    const methodValue = typeof body.method === "string" ? body.method.trim() : "";
    const statusValue = typeof body.status === "string" ? body.status.trim() : "";
    const amountValue = Number(body.amount);

    if (
        nameValue === "" ||
        categoryValue === "" ||
        dateValue === "" ||
        methodValue === "" ||
        statusValue === "" ||
        !Number.isFinite(amountValue)
    ) {
        return { statusCode: 400, body: JSON.stringify({ message: "Invalid expense payload" }) };
    }

    const item = {
        id: { S: uuidv4() },
        name: { S: nameValue },
        category: { S: categoryValue },
        date: { S: dateValue },
        method: { S: methodValue },
        status: { S: statusValue },
        amount: { N: amountValue.toString() },
    };

    const params = {
        TableName: "Expenses",
        Item: item,
    };

    await client.send(new PutItemCommand(params));

    return { statusCode: 200, body: JSON.stringify({ message: "Expense added!" }) };
};
