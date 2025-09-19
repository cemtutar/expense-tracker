# Serverless Expense Tracker


A full-stack app with **React frontend** and **AWS Lambda + DynamoDB backend**.


## Setup
1. Create DynamoDB table `Expenses` (Primary key: `id` string).
2. Deploy Lambda functions (`addExpense.js`, `getExpenses.js`, `deleteExpense.js`) via API Gateway.
3. Update `frontend/.env` with API Gateway base URL.
4. Run frontend:
```bash
cd frontend
npm install
npm start
```
5. Deploy frontend with AWS Amplify/Netlify/Vercel.# expense-tracker
