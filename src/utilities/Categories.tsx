import React, { useRef, useState } from "react";
import { duplicate, star } from "ionicons/icons";
import {
	IonAccordion,
	IonAccordionGroup,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonIcon,
	IonInput,
	IonItem,
	IonLabel,
	IonModal,
	IonSelect,
	IonSelectOption,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import { pushCategoriesToFirebase } from "./Firebase";

class Category {
	Type: string;
	Name: string;
	Subcategories: SubCategory[];

	constructor(Type: string, Name: string, Subcategories: SubCategory[]) {
		this.Type = Type;
		this.Name = Name;
		this.Subcategories = Subcategories;
	}

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

	return (
		<div className="category-validation">
			<IonItem>
				<IonInput
					placeholder="Enter a subcategory"
					value={input}
					onIonInput={(e) => setInput(e.detail.value!)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							if (input.trim() === "") {
								setValidCategories([]); // Make sure no categories are shown when empty
								return;
							}
							setValidCategories(getInfo(categories, input));
						}
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
}

/**
 * This component displays the categories and subcategories from the JSON file.
 */
const EntryCategories: React.FC<EntryCategoriesProps> = ({ categories }) => {
	return (
		<div className="categories">
			<IonAccordionGroup>
				{/* Create a Set with the Types to remove mulitples and display */}
				{[...new Set(categories.map((category) => category.getType()))].map((type) => (
					<IonAccordion className="type" value={type} key={type}>
						<IonItem slot="header" color="primary">
							<IonLabel>{type}</IonLabel>
						</IonItem>
						<div slot="content" key={type}>
							<IonAccordionGroup>
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
													<IonItem
														className="subCategory"
														key={subCategory.Name}
													>
														<IonButton
															fill="clear"
															shape="round"
															onClick={() => alert(subCategory.Name)}
														>
															<IonIcon slot="start" icon={star} />
															{subCategory.Name}
														</IonButton>
													</IonItem>
												</div>
											))}
										</IonAccordion>
									))}
							</IonAccordionGroup>
						</div>
					</IonAccordion>
				))}
			</IonAccordionGroup>
		</div>
	);
};

interface AddCategoryProps {
	categories: Category[];
	json: Object;
}

/**
 * A custom component to add custom categories to the list
 */
const AddCategory: React.FC<AddCategoryProps> = ({ categories, json }) => {
	const [category, setCategory] = useState<string>("");
	const [subcategory, setSubcategory] = useState<string>("");

	const modal = useRef<HTMLIonModalElement>(null);
	const input = useRef<HTMLIonInputElement>(null);

	/*
	 * Validate the input field - replaces non alphanumeric characters
	 */
	const validate = (event: Event) => {
		// Get the value from the input
		const value: string = (event.target as HTMLInputElement).value;

		// Removes non alphanumeric characters
		const filteredValue = value.replace(/[^a-zA-Z0-9]+/g, "");

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
	 * Dismiss the modal
	 */
	const dismiss = () => {
		// Reset the input values
		setCategory("");
		setSubcategory("");

		// Close
		modal.current?.dismiss();
	};

	/**
	 * Submit the custom category
	 */
	const submitCustom = () => {
		if (exists(category, subcategory, categories)) {
			alert("Category already exists.");

			dismiss(); // Close the modal
			return;
		}

		// Get the category type
		const type = categories.find((cat) => cat.getCategory() === category)?.getType();

		// Add the subcategory to the JSON file
		json[type][category][subcategory] = false;

		console.log("Added:", category, subcategory);

		// Update the Firebase database
		pushCategoriesToFirebase(json);

		dismiss(); // Close the modal
	};

	return (
		<div className="custom-categories">
			<IonButton id="create-category" shape="round">
				<IonIcon slot="icon-only" icon={duplicate} />
			</IonButton>

			<IonModal id="custom-category-modal" ref={modal} trigger="create-category">
				<IonHeader>
					<IonToolbar>
						<IonButtons slot="start">
							<IonButton id="cancel-modal" onClick={() => dismiss()}>Cancel</IonButton>
						</IonButtons>
						<IonTitle className="ion-text-center">Create</IonTitle>
						<IonButtons slot="end">
							<IonButton
								id="submit-modal"
								onClick={() => submitCustom()}
								disabled={!category || !subcategory}
							>
								Add
							</IonButton>
						</IonButtons>
					</IonToolbar>
				</IonHeader>

				<IonContent className="ion-padding">
					<IonItem>
						<IonSelect
							id="category-select"
							value={category}
							placeholder="Category"
							onIonChange={(e) => setCategory(e.detail.value)}
						>
							{categories.map((category) => (
								<IonSelectOption
									key={category.getCategory()}
									value={category.getCategory()}
								>
									{category.getCategory()}
								</IonSelectOption>
							))}
						</IonSelect>
					</IonItem>

					<div style={{ padding: "10px 0" }}></div>

					<IonInput
						id="subcategory-input"
						ref={input}
						value={subcategory}
						fill="outline"
						placeholder="Enter a subcategory"
						onIonInput={(e) => validate(e)}
						maxlength={25}
						counter={true}
					/>
				</IonContent>
			</IonModal>
		</div>
	);
};

export { EntryCategories, DataValidation, AddCategory, parseJSON, getInfo, exists, isStatic, Category, SubCategory };
