import React, { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { IonIcon } from '@ionic/react';
import { pieChart } from 'ionicons/icons';
import Transaction from "./Transactions/Transaction";
import "./IncomePieChart.css";

interface IncomePieChartProps {
	transactions: Transaction[];
}

const IncomePieChart: React.FC<IncomePieChartProps> = ({ transactions }) => {
	const [isCollapsed, setIsCollapsed] = useState(true);

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

	const [selectedSliceIndex, setSelectedSliceIndex] = useState<number | null>(null);

	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
		if (!isCollapsed) {
			// If collapsing, clear selected slice
			setSelectedSliceIndex(null);
		}
	};

	const onPieSliceClick = (_data: any, index: number) => {
		if (selectedSliceIndex === index) {
			setSelectedSliceIndex(null);
		} else {
			setSelectedSliceIndex(index);
		}
	};

	return (
		<div className="pie-chart-container">
			{!isCollapsed && (
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
			)}

			{expenseData.length > 0 ? (
				<>
					{isCollapsed ? (
						<div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
							<div className="horizontal-bar-container" style={{ flexGrow: 1 }}>
								{expenseData.map((entry, index) => (
									<div
										key={`bar-segment-${index}`}
										className="horizontal-bar-segment"
										style={{
											width: `${(entry.value / totalExpenses) * 100}%`,
											backgroundColor: COLORS[index % COLORS.length]
										}}
										title={`${entry.name}: $${entry.value.toFixed(2)}`}
									/>
								))}
							</div>
							<button
								className="icon-button-outside"
								onClick={toggleCollapse}
								title="Show Pie Chart"
								aria-label="Show Pie Chart"
							>
								<IonIcon icon={pieChart} style={{ fontSize: '25px', color: 'black' }} />
							</button>
						</div>
					) : (
						<ResponsiveContainer width="100%" height={250}>
							<PieChart>
						<Pie
							data={expenseData}
							cx="50%"
							cy="50%"
							labelLine={false}
							outerRadius={120}
							fill="#8884d8"
							dataKey="value"
							label={false}
							onClick={onPieSliceClick}
						>
							{expenseData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>
								<Tooltip
									active={selectedSliceIndex !== null}
									payload={selectedSliceIndex !== null ? [expenseData[selectedSliceIndex]] : []}
									formatter={(value) => [`$${(value as number).toFixed(2)}`]}
									contentStyle={{
										padding: "8px",
										background: "#fff",
										border: "1px solid #ccc"
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
					)}
					{!isCollapsed && selectedSliceIndex !== null && (
						<div className="category-legend">
							<div className="category-item">
								<div
									className="category-color"
									style={{ backgroundColor: COLORS[selectedSliceIndex % COLORS.length] }}
								/>
								<span className="category-label">
									{expenseData[selectedSliceIndex].name}: {((expenseData[selectedSliceIndex].value / totalExpenses) * 100).toFixed(0)}%
								</span>
							</div>
						</div>
					)}
					{!isCollapsed && (
						<button className="toggle-button" onClick={toggleCollapse}>
							Collapse Pie Chart
						</button>
					)}
				</>
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
