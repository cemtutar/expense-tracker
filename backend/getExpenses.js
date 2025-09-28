import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";


const client = new DynamoDBClient();


export const handler = async () => {
    const data = await client.send(new ScanCommand({ TableName: "Expenses" }));

    const items = Array.isArray(data.Items) ? data.Items : [];

    const expenses = items.map((item) => ({
        id: item?.id?.S,
        amount: item?.amount?.N ? Number(item.amount.N) : undefined,
        category: item?.category?.S,
        date: item?.date?.S,
        name: item?.name?.S,
        method: item?.method?.S,
        status: item?.status?.S,
    }));


    return { statusCode: 200, body: JSON.stringify(expenses) };
};

if (typeof API_BASE !== "undefined") {
    console.log("API_BASE:", API_BASE);
    console.log("Full URL:", `${API_BASE}/getExpenses`);
}
