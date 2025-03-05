import React, { useRef, useState } from "react";
import { add, closeOutline } from "ionicons/icons";
import {
	IonAccordion,
	IonAccordionGroup,
	IonButton,
	IonIcon,
	IonInput,
	IonItem,
	IonItemDivider,
	IonItemGroup,
	IonLabel
} from "@ionic/react";
import useFirestoreStore from "./Firebase";

class Category {
	constructor(
		public Type: string,
		public Name: string,
		public Subcategories: SubCategory[]
	) {}

	getType() {
		return this.Type;
	}

	getCategory() {
		return this.Name;
	}

	getSubcategories() {
		return this.Subcategories;
	}
}

class SubCategory {
	Name: string;
	isStatic: boolean;

	constructor(Name: string, isStatic: boolean = false) {
		this.Name = Name;
		this.isStatic = isStatic;
	}

	isStaticCategory() {
		return this.isStatic;
	}

	setStaticCategory(isStatic: boolean) {
		this.isStatic = isStatic;
	}
}

/**
 * Check if a category and subcategory already exists
 */
const exists = (category: string, subcategory: string, categories: Category[]): boolean => {
	console.log("Checking if", category, subcategory, "exists...");

	return categories.some(
		(cat) =>
			cat.getCategory() === category &&
			cat.getSubcategories().some((sub) => sub.Name === subcategory)
	);
};

/**
 * Check if a category is static
 */
const isStatic = (category: string, subcategory: string, categories: Category[]): boolean => {
	return (
		categories
			.find((cat) => cat.getCategory().toLowerCase() === category.toLowerCase())
			?.getSubcategories()
			.find((sub) => sub.Name.toLowerCase() === subcategory.toLowerCase())
			?.isStaticCategory() ?? false
	);
};

/**
 * Parse the JSON data into a list of categories with a list of subcategories
 */
function parseJSON(jsonData: any): Category[] {
	const categories: Category[] = [];

	Object.keys(jsonData).forEach((_Type) => {
		Object.keys(jsonData[_Type]).forEach((_Category) => {
			// Create an array to store the subcategories
			const subcategories: SubCategory[] = [];

			// Iterate through the subcategories
			Object.keys(jsonData[_Type][_Category]).forEach((_subCategory) => {
				subcategories.push(
					new SubCategory(_subCategory, jsonData[_Type][_Category][_subCategory])
				);
			});

			categories.push(new Category(_Type, _Category, subcategories));
		});
	});

	return categories;
}

/**
 * Get the information of a given subcategory
 */
function getInfo(categories: Category[], subCategory: string): Category[] {
	const validCategories: Category[] = [];

	categories.forEach((category) => {
		const sub = category
			.getSubcategories()
			.find((sub) => sub.Name.toLowerCase().includes(subCategory.toLowerCase()));

		if (sub) {
			validCategories.push(new Category(category.getType(), category.getCategory(), [sub]));
		}
	});

	if (validCategories.length === 0) {
		alert(`Subcategory "${subCategory}" not found.`);
	}

	return validCategories;
}

// Functional test to check if the JSON data is parsed correctly
interface DataValidationProps {
	categories: Category[];
}

//TODO: This can be changed to use IonSearchbar instead of IonInput
const DataValidation: React.FC<DataValidationProps> = ({ categories }) => {
	const [validCategories, setValidCategories] = useState<Category[]>([]);
	const [input, setInput] = useState<string>("");

	/**
	 * Handle the enter key for search
	 */
	function search(e: any) {
		if (e.key === "Enter") {
			if (input.trim() === "") {
				setValidCategories([]); // Make sure no categories are shown when empty
				return;
			}
			setValidCategories(getInfo(categories, input));
		}
	}

	return (
		<div className="category-validation">
			<IonItem>
				<IonInput
					placeholder="Enter a subcategory"
					value={input}
					onIonInput={(e) => setInput(e.detail.value!)}
					onKeyDown={(e) => {
						search(e);
					}}
				/>
			</IonItem>
			<IonButton
				className="validate ion-padding"
				onClick={() => {
					if (input.trim() === "") {
						setValidCategories([]); // Make sure no categories are shown when empty
						return;
					}
					setValidCategories(getInfo(categories, input));
				}}
			>
				Get Info
			</IonButton>

			{/* Display the Types of categories - as a set so they are unique (no duplicates) */}
			{[...new Set(validCategories.map((category) => category.getType()))].map((type) => (
				<div className="ion-padding" key={type}>
					<h3>{type}</h3>

					{/* Display the categories */}
					{validCategories
						.filter((category) => category.getType() === type)
						.map((category) => (
							<div key={category.getCategory()}>
								<h4>{category.getCategory()}</h4>

								{/* Display the subcategories */}
								{category.getSubcategories().map((subCategory) => (
									<p key={subCategory.Name}>
										{subCategory.Name} -{" "}
										{subCategory.isStaticCategory() ? "Static" : "Dynamic"}
									</p>
								))}
							</div>
						))}
				</div>
			))}
		</div>
	);
};

interface EntryCategoriesProps {
	categories: Category[];
	disableHeader?: boolean;
	onSelect?: (category: string, subcategory: string) => void;
	json?: Object;
}

/**
 * This component displays the categories and subcategories from the JSON file.
 */
const EntryCategories: React.FC<EntryCategoriesProps> = ({
	disableHeader = false,
	categories = [],
	json,
	onSelect
}) => {
	const [showCustomEntry, setShowCustomEntry] = useState<boolean>(false);
	const [subcategory, setSubcategory] = useState<string>("");
	const { isLoading, error, addDocument } = useFirestoreStore();

	const input = useRef<HTMLIonInputElement>(null);

	/**
	 * Handle key press events
	 */
	const keyPress = (e: React.KeyboardEvent<HTMLIonInputElement>, _category: string) => {
		if (e.key === "Enter") {
			submitCustom(_category);
		}
	};

	/**
	 * Validate the input field - replaces non alphanumeric characters
	 */
	const validate = (event: Event) => {
		// Get the value from the input
		const value: string = (event.target as HTMLInputElement).value;

		// Removes non alphanumeric characters
		const filteredValue = value.replace(/[^a-zA-Z0-9\s]+/g, "");

		/**
		 * Update both the state and
		 * component to keep them in sync.
		 */
		setSubcategory(filteredValue);

		const inputCmp = input.current;

		if (inputCmp !== null) {
			inputCmp.value = filteredValue;
		}
	};

	/**
	 * Submit the custom category
	 */
	const submitCustom = async (_category: string) => {
		if (exists(_category, subcategory, categories)) {
			alert("Category already exists.");

			return;
		}

		// Get the category type
		const type = categories.find((cat) => cat.getCategory() === _category)?.getType();

		// Add the subcategory to the JSON file
		json[type][_category][subcategory] = false;

		console.log("Added:", _category, subcategory);

		// Clear the input field
		setSubcategory("");
		setShowCustomEntry(false);

		// Update the Firebase database
		await addDocument("user-categories", {
			id: "testUser", //TODO: Change this to the actual user ID using Firebase Auth
			categories: json,
			timestamp: new Date().toISOString()
		});

		console.log("Error:", error);
		console.log("Loading:", isLoading);
	};

	/**
	 * Handle the accordion change event
	 */
	const accordionChange = (e: CustomEvent) => {
		// Check if the accordion value is set
		if (e.detail.value) {
			const triggeredAccordion = e.detail.value as string;
			const categoryExists = categories.some(
				(category) => category.getCategory() === triggeredAccordion
			);

			// Make sure the trigger was caused by a category accordion
			if (categoryExists) {
				setShowCustomEntry(false);

				console.log("Accordion changed to:", triggeredAccordion);
			}
		}
	};

	return (
		<IonAccordionGroup className="categories" onIonChange={accordionChange}>
			<IonItemGroup>
				{/* Display the Types of categories - as a set so they are unique (no duplicates) */}
				{[...new Set(categories.map((category) => category.getType()))].map((type) => (
					<div key={type}>
						{!disableHeader && (
							<IonItemDivider color="light">
								<IonLabel>{type}</IonLabel>
							</IonItemDivider>
						)}

						{/* Display the categories under the corrisponding Type */}
						{categories
							.filter((cat) => cat.getType() === type)
							.map((category) => (
								<IonAccordion
									className="category"
									value={category.getCategory()}
									key={category.getCategory()}
								>
									<IonItem slot="header" color="dark">
										<IonLabel>{category.getCategory()}</IonLabel>
									</IonItem>

									{/* Display the subcategories */}
									{category.getSubcategories().map((subCategory) => (
										<div
											slot="content"
											key={`${category.getType()}-${category.getCategory()}-${subCategory.Name}`}
										>
											<IonItem className="subCategory" key={subCategory.Name}>
												<IonButton
													fill="clear"
													onClick={() => {
														// Call the onClick function if it exists and pass the category and subcategory
														if (onSelect) {
															onSelect(
																category.getCategory(),
																subCategory.Name
															); // Call the onClick function if it exists and pass the category and subcategory
														} else {
															alert(
																`Selected: ${category.getCategory()} - ${subCategory.Name}`
															);
														}
													}}
												>
													{subCategory.Name}
												</IonButton>
											</IonItem>
										</div>
									))}

									{/* Add Custom Sub-Category */}
									<div
										hidden={!json}
										slot="content"
										key={`${category.getType()}-${category.getCategory()}-add`}
									>
										<IonItem
											className="subCategory"
											key={`${category.getCategory()}-add`}
										>
											{!showCustomEntry && (
												<IonButton
													fill="clear"
													onClick={() => setShowCustomEntry(true)}
												>
													<IonIcon slot="start" icon={add} />
													Add Sub-Category
												</IonButton>
											)}
											{showCustomEntry && (
												<IonInput
													ref={input}
													value={subcategory}
													onKeyDown={(e) =>
														keyPress(e, category.getCategory())
													}
													onIonInput={(e) => validate(e)}
													maxlength={25}
												>
													<div slot="end">
														<IonButton
															fill="clear"
															onClick={() => {
																setShowCustomEntry(false);
																setSubcategory("");
															}}
														>
															<IonIcon
																slot="icon-only"
																icon={closeOutline}
															/>
														</IonButton>
														<IonButton
															fill="clear"
															onClick={() =>
																submitCustom(category.getCategory())
															}
															disabled={!subcategory}
														>
															<IonIcon slot="icon-only" icon={add} />
														</IonButton>
													</div>
												</IonInput>
											)}
										</IonItem>
									</div>
									{/* End of Add Custom Sub-Category */}
								</IonAccordion>
							))}
						{/* End of Display the categories */}
					</div>
				))}
				{/* End of Display the Types of categories */}
			</IonItemGroup>
		</IonAccordionGroup>
	);
};

export {
	EntryCategories,
	DataValidation,
	parseJSON,
	getInfo,
	exists,
	isStatic,
	Category,
	SubCategory
};
