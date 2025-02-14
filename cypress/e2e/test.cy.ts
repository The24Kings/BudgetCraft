/// <reference types="cypress" />

describe("Database connection test", () => {
	it("Test the 'SEND DATA' button", () => {
		cy.visit("/debug");
		cy.get(".database-test").click();
		cy.on("window:alert", (str) => {
			expect(str).to.contain("Document written with ID:");
		});
	});
});

describe("Category data validation", () => {
	const valid = "Other";
	const invalid = "Invalid";

	it("Correct subcategory given", () => {
		cy.visit("/debug");
		cy.get(".category-validation").get("ion-input").type(valid);
		cy.get(".category-validation").get(".validate").click();
		cy.get(".category-validation").get("p").contains(valid);
	});

	it("Invalid subCategory rejected", () => {
		cy.visit("/debug");
		cy.get(".category-validation").get("ion-input").type(invalid);
		cy.get(".category-validation").get(".validate").click();
		cy.on("window:alert", (str) => {
			expect(str).to.contain(`Subcategory "${invalid}" not found.`);
		});
	});
});

describe("Check the categories", () => {
	it("Does 'Income' Exist", () => {
		cy.visit("/debug");
		cy.get(".categories").get("ion-accordion").contains("Income");
	});

	it("Does 'Expenses' exist", () => {
		cy.visit("/debug");
		cy.get(".categories").get("ion-accordion").contains("Expenses");
	});

	it("Test the JSON parsing", () => {
		const type = "Expenses";
		const category = "Transportation";
		const data = "Insurance";

		cy.visit("/debug");
		cy.get(".categories").contains(type).click();
		cy.get(".categories").get(".category").contains(category).click();
		cy.get(".categories")
			.get(".category")
			.get(".subCategory")
			.contains(data)
			.should("be.visible");
	});
});
