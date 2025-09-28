import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";


const client = new DynamoDBClient();


export const handler = async () => {
    const data = await client.send(new ScanCommand({ TableName: "Expenses" }));


    const expenses = data.Items.map((item) => ({
        id: item.id.S,
        amount: item.amount.N,
        category: item.category.S,
        date: item.date.S,
    }));


    return { statusCode: 200, body: JSON.stringify(expenses) };
};

console.log("API_BASE:", API_BASE);
console.log("Full URL:", `${API_BASE}/getExpenses`);