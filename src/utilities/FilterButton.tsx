import React, { useEffect, useRef, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { filter } from "ionicons/icons";
import {
	IonButton,
	IonDatetime,
	IonDatetimeButton,
	IonIcon,
	IonModal,
	IonSearchbar,
	IonSelect,
	IonSelectOption
} from "@ionic/react";

// Props to control filter and search state from parent (Container)
interface FilterButtonProps {
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	filterType: string;
	setFilterType: (value: string) => void;
	minAmount: number | null;
	setMinAmount: (value: number | null) => void;
	maxAmount: number | null;
	setMaxAmount: (value: number | null) => void;
	filterDate: string;
	setFilterDate: (value: string) => void;
	startDate: string;
	setStartDate: (value: string) => void;
	endDate: string;
	setEndDate: (value: string) => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({
	searchTerm,
	setSearchTerm,
	filterType,
	setFilterType,
	minAmount,
	setMinAmount,
	maxAmount,
	setMaxAmount,
	filterDate,
	setFilterDate,
	startDate,
	setStartDate,
	endDate,
	setEndDate
}) => {
	const [date, setDate] = useState(Timestamp.now());
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [tempSearch, setTempSearch] = useState(searchTerm);
	const inputRef = useRef<string>(searchTerm);

	// Debounce effect: updates actual searchTerm after user stops typing
	useEffect(() => {
		const delay = setTimeout(() => {
			setSearchTerm(inputRef.current);
		}, 300);

		return () => clearTimeout(delay);
	}, [searchTerm]); // triggers only when external searchTerm changes

	// Resets all filter fields to their default values
	const clearFilters = () => {
		setFilterType("All");
		setMinAmount(null);
		setMaxAmount(null);
		setFilterDate("");
		setDate(Timestamp.now());
		setStartDate(""); // reset start date
		setEndDate(""); // reset end date
	};

	return (
		<div className="search-bar">
			{/* Search input for transaction title - now using IonSearchbar */}
			<IonSearchbar
				className="search-input"
				placeholder="Search transactions..."
				value={inputRef.current}
				onIonInput={(e) => {
					inputRef.current = e.detail.value ?? "";
					setSearchTerm(inputRef.current); // optional, or debounce this instead
				}}
				style={{ color: "#000" }}
			/>

			{/* Filter icon button to open modal */}
			<IonButton fill="clear" onClick={() => setIsFilterOpen(true)}>
				<IonIcon icon={filter} />
			</IonButton>

			{/* Filter modal popup */}
			<IonModal
				isOpen={isFilterOpen}
				onDidDismiss={() => setIsFilterOpen(false)}
				className="filter-modal-custom"
			>
				<div className="filter-modal">
					<h2>Filters</h2>

					{/* Dropdown to filter by transaction type */}
					<IonSelect
						value={filterType}
						placeholder="Type"
						onIonChange={(e) => setFilterType(e.detail.value)}
					>
						<IonSelectOption value="All">All</IonSelectOption>
						<IonSelectOption value="Income">Income</IonSelectOption>
						<IonSelectOption value="Expenses">Expenses</IonSelectOption>
					</IonSelect>

					{/* Input for minimum amount */}
					<input
						type="number"
						placeholder="Min Amount"
						value={minAmount ?? ""}
						onChange={(e) =>
							setMinAmount(e.target.value ? parseFloat(e.target.value) : null)
						}
					/>

					{/* Input for maximum amount */}
					<input
						type="number"
						placeholder="Max Amount"
						value={maxAmount ?? ""}
						onChange={(e) =>
							setMaxAmount(e.target.value ? parseFloat(e.target.value) : null)
						}
					/>

					{/* Date picker for filtering by date - now using IonDatetimeButton */}
					<h4>Date Range</h4>

					<IonDatetimeButton datetime="start-date" />
					<IonModal keepContentsMounted={true}>
						<IonDatetime
							id="start-date"
							presentation="date"
							onIonChange={(e) => {
								const selected = new Date(e.detail.value as string);
								setStartDate(selected.toISOString().split("T")[0]);
							}}
						/>
					</IonModal>

					<IonDatetimeButton datetime="end-date" />
					<IonModal keepContentsMounted={true}>
						<IonDatetime
							id="end-date"
							presentation="date"
							onIonChange={(e) => {
								const selected = new Date(e.detail.value as string);
								setEndDate(selected.toISOString().split("T")[0]);
							}}
						/>
					</IonModal>

					{/* Clears all filters */}
					<IonButton expand="full" onClick={clearFilters}>
						Clear Filters
					</IonButton>

					{/* Closes the modal */}
					<IonButton
						expand="full"
						color="secondary"
						onClick={() => setIsFilterOpen(false)}
					>
						Close
					</IonButton>
				</div>
			</IonModal>
		</div>
	);
};

export default FilterButton;
