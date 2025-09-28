import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";


const client = new DynamoDBClient();


export const handler = async (event) => {
    const body = JSON.parse(event.body);


    const params = {
        TableName: "Expenses",
        Item: {
            id: { S: uuidv4() },
            amount: { N: body.amount.toString() },
            category: { S: body.category },
            date: { S: body.date },
        },
    };


    await client.send(new PutItemCommand(params));


    return { statusCode: 200, body: JSON.stringify({ message: "Expense added!" }) };
};