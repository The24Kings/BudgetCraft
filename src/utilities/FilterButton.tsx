import React, { useEffect, useRef, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { filter } from "ionicons/icons";
import {
	IonButton,
	IonButtons,
	IonDatetime,
	IonDatetimeButton,
	IonIcon,
	IonModal,
	IonSearchbar,
	IonSelect,
	IonSelectOption,
	IonTitle,
	IonToolbar
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
	startDate: string;
	setStartDate: (value: string) => void;
	endDate: string;
	setEndDate: (value: string) => void;
	clearFilters: () => void;
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
	startDate,
	setStartDate,
	endDate,
	setEndDate,
	clearFilters
}) => {
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const inputRef = useRef<string>(searchTerm);

	// Debounce effect: updates actual searchTerm after user stops typing
	useEffect(() => {
		const delay = setTimeout(() => {
			setSearchTerm(inputRef.current);
		}, 300);

		return () => clearTimeout(delay);
	}, [searchTerm]); // triggers only when external searchTerm changes

	return (
		<div className="search-bar-wrapper">
			{/* Search input for transaction title */}
			<div className="search-bar-container">
				<IonSearchbar
					className="search-input"
					placeholder="Search"
					showClearButton="never"
					debounce={200}
					onIonInput={(e) => {
						inputRef.current = e.detail.value ?? "";
						setSearchTerm(inputRef.current);
					}}
				>
					<IonButton
						className="filter-icon-button"
						fill="clear"
						onClick={() => setIsFilterOpen(true)}
					>
						<IonIcon icon={filter} />
					</IonButton>
				</IonSearchbar>
			</div>
			{/* Filter modal popup */}
			<IonModal
				isOpen={isFilterOpen}
				onDidDismiss={() => setIsFilterOpen(false)}
				className="filter-modal-custom"
			>
				<IonToolbar>
					<IonButtons slot="start">
						<IonButton
							className="filter-cancel-button"
							onClick={() => setIsFilterOpen(false)}
						>
							Cancel
						</IonButton>
					</IonButtons>

					<IonTitle className="filter-title">Filters</IonTitle>

					<IonButtons slot="end">
						<IonButton className="filter-clear-button" onClick={clearFilters}>
							Clear Filters
						</IonButton>
					</IonButtons>
				</IonToolbar>

				<div className="filter-modal">
					<IonSelect
						className="filter-type-select"
						value={filterType}
						placeholder="Type"
						onIonChange={(e) => setFilterType(e.detail.value)}
					>
						<IonSelectOption value="All">All</IonSelectOption>
						<IonSelectOption value="Income">Income</IonSelectOption>
						<IonSelectOption value="Expenses">Expenses</IonSelectOption>
					</IonSelect>

					<input
						type="number"
						placeholder="Min Amount"
						value={minAmount ?? ""}
						onChange={(e) =>
							setMinAmount(e.target.value ? parseFloat(e.target.value) : null)
						}
					/>

					<input
						type="number"
						placeholder="Max Amount"
						value={maxAmount ?? ""}
						onChange={(e) =>
							setMaxAmount(e.target.value ? parseFloat(e.target.value) : null)
						}
					/>

					<h4 className="filter-date-title">Date Range</h4>
					<div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
						<IonDatetimeButton datetime="start-date" />
						<IonDatetimeButton datetime="end-date" />
					</div>

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
				</div>
			</IonModal>
		</div>
	);
};

export default FilterButton;
