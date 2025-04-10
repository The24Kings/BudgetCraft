import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Transaction from "./Transactions/Transaction";
import "./IncomePieChart.css";

interface IncomePieChartProps {
	transactions: Transaction[];
}

const IncomePieChart: React.FC<IncomePieChartProps> = ({ transactions }) => {
	// Calculate totals
	const totalIncome = transactions
		.filter((tx) => tx.type === "Income")
		.reduce((sum, tx) => sum + tx.amount, 0);

	const totalExpenses = transactions
		.filter((tx) => tx.type === "Expenses")
		.reduce((sum, tx) => sum + tx.amount, 0);

	const remaining = totalIncome - totalExpenses;

	// Prepare expense data for pie chart
	const expenseData = transactions
		.filter((tx) => tx.type === "Expenses")
		.reduce(
			(acc, tx) => {
				const existing = acc.find((item) => item.name === tx.category);
				if (existing) {
					existing.value += tx.amount;
				} else {
					acc.push({ name: tx.category, value: tx.amount });
				}
				return acc;
			},
			[] as { name: string; value: number }[]
		);

	const COLORS = ["#FF8042", "#FFBB28", "#00C49F", "#0088FE", "#8884D8"];

	return (
		<div className="pie-chart-container">
			<div className="totals-display">
				<div className="total-income">
					<h3>Total Income</h3>
					<p>${totalIncome.toFixed(2)}</p>
				</div>
				<div className="remaining-balance">
					<h3>Remaining</h3>
					<p>${remaining.toFixed(2)}</p>
				</div>
			</div>

			{expenseData.length > 0 ? (
				<ResponsiveContainer width="100%" height={500}>
					<PieChart>
						<Pie
							data={expenseData}
							cx="50%"
							cy="50%"
							labelLine={false}
							outerRadius={180}
							fill="#8884d8"
							dataKey="value"
							label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
						>
							{expenseData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<Tooltip
							formatter={(value) => [`$${(value as number).toFixed(2)}`]}
							contentStyle={{
								padding: "8px",
								background: "#fff",
								border: "1px solid #ccc"
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
			) : (
				<div className="no-expenses-message">
					<p>
						No expenses to display (found{" "}
						{transactions.filter((tx) => tx.type === "Expenses").length} expense
						transactions)
					</p>
				</div>
			)}
		</div>
	);
};

export default IncomePieChart;
