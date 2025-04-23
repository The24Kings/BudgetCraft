import React, { useState } from "react";
import { pieChart } from "ionicons/icons";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { IonIcon } from "@ionic/react";
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

	const COLORS = [
		"#B28B84", // Rosy Brown
		"#C5D8D1", // Ash Gray
		"#7D1538", // Claret
		"#D4E09B", // Vanilla
		"#218380", // Teal
		"#DB7C26", // Ochre
		"#77DD77", // Light green
		"#A0EADE", // Tiffany blue
		"#FFD1DC", // Pastel pink
		"#CBAACB", // Light purple
		"#FF6961" // Coral red
	];

	// Map category names to colors to ensure unique colors per category
	const categoryColorMap: { [key: string]: string } = {};
	expenseData.forEach((item, index) => {
		categoryColorMap[item.name] = COLORS[index % COLORS.length];
	});

	const [selectedSliceIndex, setSelectedSliceIndex] = useState<number | null>(null);

	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
		if (!isCollapsed) {
			// If collapse button clicked, clear slice that is shown
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
						<div style={{ display: "flex", alignItems: "center", width: "100%" }}>
							<div className="horizontal-bar-container" style={{ flexGrow: 1 }}>
								{expenseData.map((entry, index) => (
									<div
										key={`bar-segment-${index}`}
										className="horizontal-bar-segment"
										style={{
											width: `${(entry.value / totalExpenses) * 100}%`,
											backgroundColor: categoryColorMap[entry.name]
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
								<IonIcon
									icon={pieChart}
									style={{ fontSize: "25px", color: "#CEF9F2" }}
								/>
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
									activeIndex={-1}
								>
									{expenseData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={categoryColorMap[entry.name]}
											style={{ outline: "none" }}
										/>
									))}
								</Pie>
								<Tooltip
									active={selectedSliceIndex !== null}
									payload={
										selectedSliceIndex !== null
											? [expenseData[selectedSliceIndex]]
											: []
									}
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
									style={{
										backgroundColor:
											categoryColorMap[expenseData[selectedSliceIndex].name]
									}}
								/>
								<span className="category-label">
									{expenseData[selectedSliceIndex].name}:{" "}
									{(
										(expenseData[selectedSliceIndex].value / totalExpenses) *
										100
									).toFixed(0)}
									%
								</span>
							</div>
						</div>
					)}
					{!isCollapsed && (
						<div
							style={{
								display: "flex",
								justifyContent: "flex-end",
								width: "100%",
								marginTop: "10px"
							}}
						>
							<button
								className="icon-button-outside"
								onClick={toggleCollapse}
								title="Collapse Pie Chart"
								aria-label="Collapse Pie Chart"
							>
								<IonIcon
									icon={pieChart}
									style={{ fontSize: "25px", color: "#CEF9F2" }}
								/>
							</button>
						</div>
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
