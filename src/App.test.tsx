import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { doc } from "firebase/firestore";
import { vi } from "vitest";
import App from "./App";
import {
	Category,
	EntryCategories,
	exists,
	getInfo,
	parseJSON,
	SubCategory
} from "./utilities/Categories";
import useFirestoreStore from "./utilities/Firebase";
import Transactions from "./utilities/Transactions/Transaction";

const object = {
	Type1: {
		Category1: {
			Subcategory1: true
		},
		Category2: {
			Subcategory1: true
		}
	},
	Type2: {
		Category1: {
			Subcategory1: true
		},
		Category2: {
			Subcategory1: true
		}
	}
};

test("renders without crashing", () => {
	const { baseElement } = render(<App />);
	expect(baseElement).toBeDefined();
});

test("parses JSON data correctly", () => {
	const categories = parseJSON(object);

	// Check if the categories are parsed correctly
	expect(categories[0].getType()).toBe("Type1");
	expect(categories[0].getCategory()).toBe("Category1");
	expect(categories[0].getSubcategories()[0].name).toBe("Subcategory1");
});

test("checks if subcategory exists", () => {
	const categories = parseJSON(object);

	expect(getInfo(categories, "Subcategory1")).toBeDefined();
});

test("checks if subcategory does not exist", () => {
	// Mute the alert (since it is used in getInfo)
	const jsdomAlert = window.alert;
	window.alert = () => {
		/* no-op */
	};

	const categories = parseJSON(object);

	expect(getInfo(categories, "Subcategory3").length).toBe(0);
	window.alert = jsdomAlert; // Restore the alert
});

/*FIXME: Doesn't actually work :/
test("connects to Firebase", async () => {
	let docId: string | undefined;

	const TestComponent: React.FC = () => {
		const { documents, addDocument } = useFirestoreStore();

		// Call the function and handle the promise
		React.useEffect(() => {
			addDocument("testCollection", {
				testField: "Hello Firebase!",
				timestamp: new Date().toISOString()
			}).then(() => {
				console.log("Document successfully added!");
			}).catch((error) => {
				console.error("Error adding document: ", error);
			});

			documents.forEach((doc) => {
				docId = doc.id;
			});

		}, [addDocument]);

		return null;
	};

	const { container } = render(<TestComponent />);
	expect(container).toBeDefined();
});
*/

test("check is 'exists' function works", () => {
	const categories = parseJSON(object);

	expect(exists("Category1", "Subcategory1", categories)).toBe(true);
});

test("check is 'exists' function works with invalid data", () => {
	const categories = parseJSON(object);

	expect(exists("Category1", "Subcategory3", categories)).toBe(false);
});

const mockCategories: Category[] = [
	new Category("Expense", "Food", [new SubCategory("0", "Groceries", "", true)]),
	new Category("Expense", "Custom Category", [new SubCategory("1", "CustomSub", "", false)])
];

test("Does not show delete button for custom subcategories in transaction modal", () => {
	const { queryByTestId } = render(
		<EntryCategories categories={mockCategories} disableHeader={true} />
	);

	// Check that the delete button is hidden
	expect(queryByTestId("delete-custom-subcategory")).not.toBeInTheDocument();
});
