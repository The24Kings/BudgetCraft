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
		cy.get("ion-input").type(valid);
		cy.get(".validate").click();
		cy.get("p").contains(valid);
	});

	it("Invalid subCategory rejected", () => {
		cy.visit("/debug");
		cy.get("ion-input").type(invalid);
		cy.get(".validate").click();
		cy.on("window:alert", (str) => {
			expect(str).to.contain(`Subcategory "${invalid}" not found.`);
		});
	});
});

describe("Check the categories", () => {
	it("Does 'Income' Exist", () => {
		cy.visit("/debug");
		cy.get("ion-accordion").contains("Income");
	});

	it("Does 'Expenses' exist", () => {
		cy.visit("/debug");
		cy.get("ion-accordion").contains("Expenses");
	});

	it("Test the JSON parsing", () => {
		const type = "Expenses";
		const category = "Transportation";
		const data = "Insurance";

		cy.visit("/debug");
		cy.get(".categories").contains(type).click();
		cy.get(".category").contains(category).click();
		cy.get(".subCategory").contains(data).should("be.visible");
	});
});

describe("Check the 'Add Category' form", () => {
	it("Does 'Add Category' Modal Appear", () => {
		cy.visit("/debug");
		cy.get(".custom-categories").click();
		cy.get("#custom-category-modal").should("be.visible");
	});
	
	it("Does 'Add Category' Modal Disappear", () => {
		cy.visit("/debug");
		cy.get(".custom-categories").click();
		cy.get("#custom-category-modal").should("be.visible");
		cy.get("#cancel-modal").click();
		cy.get("#custom-category-modal").should("not.be.visible");
	});

	it("Does 'Add Category' Modal Submit", () => {
		cy.visit("/debug");
		cy.get(".custom-categories").click();
		cy.get("#custom-category-modal").should("be.visible");
		cy.get("#category-select").click();
		cy.get("button").contains("Gifts").click();
		cy.get("button").contains("OK").click();
		cy.get("#subcategory-input").should('be.visible').type("T");
		cy.get("#submit-modal").click();
		cy.on("window:alert", (str) => {
			expect(str).to.contain("Document written with ID:");
		});
	});
});