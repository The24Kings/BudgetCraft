import React from "react";
import { render } from "@testing-library/react";
import App from "./App";
import {
	Category,
	EntryCategories,
	exists,
	getInfo,
	parseJSON,
	SubCategory
} from "./utilities/Categories";

const object = {
	Type1: {
		Category1: {
			"0": {
                name: "Subcategory1",
                icon: "",
                static: true
            }
		},
		Category2: {
			"0": {
                name: "Subcategory1",
                icon: "",
                static: true
            }
		}
	},
	Type2: {
		Category1: {
			"0": {
                name: "Subcategory1",
                icon: "",
                static: true
            }
		},
		Category2: {
			"0": {
                name: "Subcategory1",
                icon: "",
                static: true
            }
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
