import React, { useRef, useState } from "react";
import {
	collection,
	doc,
	setDoc,
	Timestamp,
} from "firebase/firestore";
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
import { firestore } from "./FirebaseConfig";

class Category {
	constructor(
		public type: string,
		public name: string,
		public Subcategories: SubCategory[]
	) {}

	getType() {
		return this.type;
	}

	getCategory() {
		return this.name;
	}

	getSubcategories() {
		return this.Subcategories;
	}

	getSubcategoryIndex(subcategory: string) {
		console.log("Searching for subcategory:", subcategory);
		console.log(
			"Found subcategory:",
			this.Subcategories.findIndex((sub) => sub.name === subcategory)
		);
		return this.Subcategories.findIndex((sub) => sub.name === subcategory);
	}
}

class SubCategory {
	id: string;
	name: string;
	icon: string;
	isStatic: boolean;

	constructor(id: string, name: string, icon: string = "", isStatic: boolean = false) {
		this.id = id;
		this.name = name;
		this.icon = icon;
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
			cat.getSubcategories().some((sub) => sub.name === subcategory)
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
			.find((sub) => sub.name.toLowerCase() === subcategory.toLowerCase())
			?.isStaticCategory() ?? false
	);
};

/**
 * Parse the JSON data into a list of categories with a list of subcategories
 */
function parseJSON(jsonData: any): Category[] {
	const categories: Category[] = [];

	Object.keys(jsonData).forEach((_type) => {
		Object.keys(jsonData[_type]).forEach((_Category) => {
			// Create an array to store the subcategories
			const subcategories: SubCategory[] = [];

			// Iterate through the subcategories
			Object.keys(jsonData[_type][_Category]).forEach((_id) => {
				const subcategory = jsonData[_type][_Category][_id];

				subcategories.push(
					new SubCategory(_id, subcategory["name"], "", subcategory["static"])
				);
			});

			categories.push(new Category(_type, _Category, subcategories));
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
			.find((sub) => sub.name.toLowerCase().includes(subCategory.toLowerCase()));

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
									<p key={subCategory.name}>
										{subCategory.name} -{" "}
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

//TODO: In the future this should probably be abstracted out into an object or a function that is called in the component
interface EntryCategoriesProps {
	userID?: string;
	categories: Category[];
	disableHeader?: boolean;
	onSelect?: (category: string, subcategory: string) => void;
	json?: Object;
	hideDelete?: boolean;
}

/**
 * This component displays the categories and subcategories from the JSON file.
 */
const EntryCategories: React.FC<EntryCategoriesProps> = ({
	userID = "",
	disableHeader = false,
	categories = [],
	json,
	onSelect,
	hideDelete = false
}) => {
	const [showCustomEntry, setShowCustomEntry] = useState<boolean>(false);
	const [subcategory, setSubcategory] = useState<string>("");

	const input = useRef<HTMLIonInputElement>(null);

	/**
	 * Handle key press events
	 */
	const keyPress = (e: React.KeyboardEvent<HTMLIonInputElement>, _category: string) => {
		if (e.key === "Enter") {
			submitCustom(categories.find((cat) => cat.getCategory() === _category)!);
		}
	};

	/*
	 * Generate a hash for a string
	 */
	const cyrb53 = (str: string, seed = 0) => {
		let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
		for(let i = 0, ch; i < str.length; i++) {
			ch = str.charCodeAt(i);
			h1 = Math.imul(h1 ^ ch, 2654435761);
			h2 = Math.imul(h2 ^ ch, 1597334677);
		}
		h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
		h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
		h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
		h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	  
		return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
	};

	/**
	 * Validate the input field
	 */
	const validate = (event: Event) => {
		// Get the value from the input
		const value: string = (event.target as HTMLInputElement).value;

		// Scrub the input value and remove the extra spaces
		const filteredValue = value.replace(/[^a-zA-Z0-9\s\-\(\)_\/']+/g, "").replace(/\s+/g, " ");

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
	const submitCustom = async (_category: Category) => {
		if (exists(_category.name, subcategory, categories)) {
			alert("Category already exists.");

			return;
		}

		// Get the category type and increment
		const type = categories.find((cat) => cat.getCategory() === _category.name)?.getType();
		const id = cyrb53(_category.getCategory() + subcategory);

		// Add the subcategory to the JSON file
		json[type][_category.name][id] = {
			name: subcategory,
			icon: "",
			static: false
		};

		// Clear the input field
		setSubcategory("");
		setShowCustomEntry(false);

		// Update the Firebase database
		const settingsRef = collection(firestore, `users/${userID}/settings`);
		const categoryDoc = doc(settingsRef, "categories");

		await setDoc(categoryDoc, {
			categories: json,
			lastUpdated: Timestamp.now()
		});
	};

	/**
	 * Confirm delete custom subcategory
	 */
	const confirmDeleteSubcategory = async (category: Category, subCategoryname: string) => {
		const isConfirmed = window.confirm(
			`Are you sure you want to delete the custom subcategory "${subCategoryname}"?`
		);

		if (!isConfirmed) return;

		try {
			// Update the Firebase database for user categories
			const settingsRef = collection(firestore, `users/${userID}/settings`);
			const categoryDoc = doc(settingsRef, "categories");

			// Remove subcategory from Firestore JSON structure
			const type = category.getType();
			const id = cyrb53(category.getCategory() + subCategoryname);

			delete json[type][category.getCategory()][id];

			// Update the Firebase database
			await setDoc(categoryDoc, {
				categories: json,
				lastUpdated: Timestamp.now()
			});
		} catch (error) {
			console.error("Error deleting subcategory:", error);
		}
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
											key={`${category.getType()}-${category.getCategory()}-${subCategory.name}`}
										>
											<IonItem className="subCategory" key={subCategory.name}>
												<IonButton
													fill="clear"
													onClick={() => {
														// Call the onClick function if it exists and pass the category and subcategory
														if (onSelect) {
															onSelect(
																category.getCategory(),
																subCategory.name
															); //  Call the onClick function if it exists and pass the category and subcategory
														}
													}}
												>
													{subCategory.name}
												</IonButton>

												{/* Only show delete button for non-static (custom) subcategories */}
												{!subCategory.isStatic && !hideDelete && (
													<IonButton
														fill="clear"
														color="danger"
														className="subCat-delete-button"
														onClick={() =>
															confirmDeleteSubcategory(
																category,
																subCategory.name
															)
														}
													>
														<IonIcon icon={closeOutline} />
													</IonButton>
												)}
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
															onClick={() => submitCustom(category)}
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
