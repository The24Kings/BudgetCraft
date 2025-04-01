import React, { useState } from "react";
import { filter } from "ionicons/icons";
import { IonButton, IonIcon, IonInput, IonModal, IonSelect, IonSelectOption } from "@ionic/react";

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
	setFilterDate
}) => {
	// Controls whether the filter modal is open
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	// Resets all filter fields to their default values
	const clearFilters = () => {
		setFilterType("All");
		setMinAmount(null);
		setMaxAmount(null);
		setFilterDate("");
	};

	return (
		<div className="search-bar">
			{/* Search input for transaction title */}
			<IonInput
				className="search-input"
				placeholder="Search transactions..."
				value={searchTerm}
				onIonInput={(e) => setSearchTerm(e.detail.value ?? "")}
				clearInput
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
					<IonInput
						type="number"
						placeholder="Min Amount"
						value={minAmount ?? ""}
						onIonInput={(e) =>
							setMinAmount(e.detail.value ? parseFloat(e.detail.value) : null)
						}
					/>

					{/* Input for maximum amount */}
					<IonInput
						type="number"
						placeholder="Max Amount"
						value={maxAmount ?? ""}
						onIonInput={(e) =>
							setMaxAmount(e.detail.value ? parseFloat(e.detail.value) : null)
						}
					/>

					{/* Date picker for filtering by date */}
					<IonInput
						type="date"
						placeholder="Filter by Date"
						value={filterDate}
						onIonInput={(e) => setFilterDate(e.detail.value ?? "")}
					/>

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
