import React from "react";
import { star } from "ionicons/icons";
import {
	IonAccordion,
	IonAccordionGroup,
	IonButton,
	IonIcon,
	IonInput,
	IonItem,
	IonLabel
} from "@ionic/react";

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

const DataValidation: React.FC<DataValidationProps> = ({ categories }) => {
	const [validCategories, setValidCategories] = React.useState<Category[]>([]);
	const [input, setInput] = React.useState<string>("");

	return (
		<div className="category-validation">
			<IonItem>
				<IonInput
					placeholder="Enter a subcategory"
					onIonInput={(e) => setInput(e.detail.value!)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							setValidCategories(getInfo(categories, input));
						}
					}}
				/>
			</IonItem>
			<IonButton
				className="validate ion-padding"
				onClick={() => setValidCategories(getInfo(categories, input))}
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
													<IonItem className="subCategory" key={subCategory.Name}>
														<IonButton
															fill="clear"
															shape="round"
															onClick={() =>
																console.log(
																	category.getType() + ":\n\t",
																	category.getCategory() +
																		":\n\t\t",
																	subCategory.Name
																)
															}
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

export { EntryCategories, DataValidation, parseJSON, getInfo, Category, SubCategory };
