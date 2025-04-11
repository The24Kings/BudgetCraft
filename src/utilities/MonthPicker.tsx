import React from "react";
import { IonButton } from "@ionic/react";

interface MonthPickerProps {
	month: number;
	year: number;
	setMonth: (month: number) => void;
	setYear: (year: number) => void;
}

const MonthPicker: React.FC<MonthPickerProps> = ({ month, year, setMonth, setYear }) => {
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];

	const handleMonthChange = (m: number, y: number) => {
		setMonth(m);
		setYear(y);
		console.log(`Selected Month: ${months[m]}, Year: ${y}`);
	};

	return (
		<div className="month-picker-wrapper">
			<div className="month-picker">
				{[-2, -1, 0, 1, 2].map((offset) => {
					const offset_month = (month + offset + 12) % 12;
					const offset_year =
						offset < 0 && month + offset < 0
							? year - 1
							: offset > 0 && month + offset > 11
								? year + 1
								: year;

					return (
						<IonButton
							key={offset}
							className={`month-button ${offset === 0 ? "selected" : ""}`}
							fill={offset === 0 ? "solid" : "clear"}
							onClick={() => handleMonthChange(offset_month, offset_year)}
						>
							{months[offset_month]}
							<br />
							{offset_year}
						</IonButton>
					);
				})}
			</div>
		</div>
	);
};

export default MonthPicker;
