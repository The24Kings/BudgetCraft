import { render } from "@testing-library/react";
import App from "./App";
import { AddCategory, exists, getInfo, isStatic, parseJSON } from "./utilities/Categories";
import { testFirebaseConnection } from "./utilities/Firebase";

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
	expect(categories[0].getSubcategories()[0].Name).toBe("Subcategory1");
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

test("connects to Firebase", async () => {
	// Mute the alert (since it is used in testFirebaseConnection)
	const jsdomAlert = window.alert;
	window.alert = () => {
		/* no-op */
	};

	// Call the function
	const result = await testFirebaseConnection();

	// Assert the result
	expect(result).toBeDefined();
	window.alert = jsdomAlert; // Restore the alert
});

test("Add Category redenders without crashing", () => {
	const { baseElement } = render(<AddCategory categories={[]} json={undefined} />);
	expect(baseElement).toBeDefined();
});

test("check is 'exists' function works", () => {
	const categories = parseJSON(object);

	expect(exists("Category1", "Subcategory1", categories)).toBe(true);
});

test("check is 'exists' function works with invalid data", () => {
	const categories = parseJSON(object);

	expect(exists("Category1", "Subcategory3", categories)).toBe(false);
});

test("check if 'isStatic' function works", () => {
	const categories = parseJSON(object);

	expect(isStatic("Category1", "Subcategory1", categories)).toBe(true);
});

test("check if 'isStatic' function works with invalid data", () => {
	const categories = parseJSON(object);

	expect(isStatic("Category1", "Subcategory3", categories)).toBe(false);
});