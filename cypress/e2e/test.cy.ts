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
		cy.get("ion-input").first().type(valid);
		cy.get(".validate").click();
		cy.get("p").contains(valid).should("be.visible");
	});

	it("Invalid subCategory rejected", () => {
		cy.visit("/debug");
		cy.get("ion-input").first().type(invalid);
		cy.get(".validate").click();
		cy.on("window:alert", (str) => {
			expect(str).to.contain(`Subcategory "${invalid}" not found.`);
		});
	});
});

describe("Check the categories", () => {
	it("Does 'Income' Exist", () => {
		cy.visit("/debug");
		cy.get("ion-item-divider").contains("Income").should("exist");
	});

	it("Does 'Expenses' Exist", () => {
		cy.visit("/debug");
		cy.get("ion-item-divider").contains("Expenses").should("exist");
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

describe("Transaction and Subcategory Tests", () => {
	beforeEach(() => {
		cy.visit("/debug");
		cy.wait(1000); // Make sure UI loads
	});

	it("should allow adding and deleting a custom subcategory", () => {
		const testSubcategory = "NewCustomSub";

		// Step 1: Open "Salary & Wages" Category
		cy.get("ion-accordion")
			.contains("Salary & Wages")
			.should("exist")
			.scrollIntoView()
			.then(($accordion) => {
				if (!$accordion.attr("expanded")) {
					cy.wrap($accordion).click({ force: true });
				}
			});

		cy.wait(500);

		// Step 2: Click "Add Sub-Category" Button
		cy.get("ion-button")
			.contains("Add Sub-Category")
			.should("exist")
			.scrollIntoView()
			.should("be.visible")
			.click({ force: true });

		// Step 3: Type the subcategory name and press Enter to add it
		cy.get("ion-item.subCategory")
			.find("ion-input")
			.first()
			.should("exist")
			.should("be.visible")
			.click()
			.type(`${testSubcategory}{enter}`);

		cy.wait(2000); // Ensure Firebase updates
		cy.get(".subCategory").contains(testSubcategory).should("exist");

		// Step 4: Ensure "Salaries & Wages" is Still Open Before Searching
		cy.wait(500);
		cy.get("ion-accordion").contains("Salary & Wages").should("exist").scrollIntoView();

		cy.wait(500);

		// Step 5: Find "NewCustomSub" and Its Delete Button
		cy.get(".subCategory")
			.contains(testSubcategory)
			.should("exist")
			.scrollIntoView()
			.should("be.visible")
			.closest("ion-item") // Get the parent row
			.find(".subCat-delete-button")
			.should("exist")
			.scrollIntoView()
			.should("be.visible")
			.click();

		cy.on("window:confirm", () => true);
		cy.wait(2000);

		// Step 6: Verify the Subcategory Is Deleted
		cy.get(".subCategory").contains(testSubcategory).should("not.exist");
	});

	it("should not show delete button for custom subcategories when adding a transaction", () => {
		cy.get("#add-transaction").click({ force: true });
		cy.wait(500);
		cy.get("ion-modal").should("have.class", "show-modal");
		cy.get(".subCategory").each(($el) => {
			cy.wrap($el).within(() => {
				cy.get(".subCat-delete-button").should("not.exist"); // Make sure delete button is hidden
			});
		});
	});

	it("should store new transaction data in the database and delete it afterward", () => {
		cy.visit("/debug");
		cy.get("#add-transaction").click({ force: true }); // Open transaction modal
		cy.wait(500);

		// Step 2: Select "Type" (Income)
		cy.get("ion-select").first().click(); // Open the select dropdown
		cy.wait(1000);

		cy.get("ion-alert").should("exist").find("button").contains("Income").click();

		// Step 3: Click "OK" to confirm selection
		cy.get("ion-alert").find("button").contains("OK").click();
		cy.wait(1000); // Make sure categories appear in the modal

		// Make sure the backdrop disappears before interacting further
		cy.get("ion-backdrop").should("not.exist");
		cy.wait(500);

		// Step 4: Select "Salary & Wages" inside the transaction modal
		cy.get("ion-modal#custom-category-modal ion-accordion")
			.contains("Salary & Wages")
			.should("exist")
			.scrollIntoView()
			.should("be.visible")
			.click({ force: true });

		cy.wait(500);

		// Step 5: **Select "Paycheck" inside the modal**
		cy.get("ion-modal#custom-category-modal .subCategory")
			.contains("Paycheck")
			.should("exist")
			.scrollIntoView()
			.should("be.visible")
			.click();

		cy.wait(1000);

		// Step 6: Enter transaction details
		const testTransaction = {
			title: "Test Transaction",
			amount: 100,
			category: "Salary & Wages",
			subCategory: "Paycheck",
			description: "Test description",
			type: "Income"
		};

		cy.get("ion-modal#custom-category-modal ion-input").first().type(testTransaction.title); // Title
		cy.get("ion-modal#custom-category-modal ion-input[type='number']").type(
			testTransaction.amount.toString()
		); // Amount
		cy.get("ion-modal#custom-category-modal ion-textarea").type(testTransaction.description); // Description

		// Step 7: Click the "Confirm" button at the top right inside the modal
		cy.get("ion-modal#custom-category-modal ion-button").contains("Confirm").click();
		cy.wait(1000);

		// Step 8: Verify transaction is stored in the database
		const userID = "test-user"; // Ensure you're using the test user
		const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/capstone-project-f8dca/databases/(default)/documents/users/${userID}/transactions`;

		cy.request("GET", `${firestoreBaseUrl}`).then((response) => {
			cy.log("Response Body:", response.body);
			console.log("Response Body:", response.body);

			expect(response.status).to.eq(200);

			// Extract all transactions
			const transactions = response.body.documents || [];

			// Find the transaction we just added
			const matchingTransaction = transactions.find((doc) => {
				const data = doc.fields;

				return (
					data.title?.stringValue === testTransaction.title &&
					data.amount?.integerValue == testTransaction.amount &&
					data.category?.stringValue === testTransaction.category &&
					data.subCategory?.stringValue === testTransaction.subCategory &&
					data.description?.stringValue === testTransaction.description &&
					data.type?.stringValue === testTransaction.type
				);
			});

			expect(matchingTransaction).to.exist; // Make sure it exists in the DB

			if (matchingTransaction) {
				const documentId = matchingTransaction.name.split("/").pop(); // Extract document ID
				cy.log("Deleting test transaction with ID:", documentId);

				// Delete the transaction from Firestore
				cy.request("DELETE", `${firestoreBaseUrl}/${documentId}`).then((deleteResponse) => {
					expect(deleteResponse.status).to.eq(200);
					cy.log("Test transaction successfully deleted.");
				});
			}
		});
	});

	it("should mark transactions as 'Uncategorized' when subcategory is deleted", () => {
		cy.visit("/debug");
		cy.wait(1000);

		const testSubcategory = "CustomSub";
		const testTransaction = {
			title: "Test Transaction",
			amount: 100,
			category: "Salary & Wages",
			subCategory: testSubcategory,
			description: "Test description",
			type: "Income"
		};

		let transactionId = null; // Store transaction ID to delete later

		// Step 1: Open "Salary & Wages" Category
		cy.get("ion-accordion")
			.contains("Salary & Wages")
			.should("exist")
			.scrollIntoView()
			.then(($accordion) => {
				if (!$accordion.attr("expanded")) {
					cy.wrap($accordion).click({ force: true });
				}
			});

		cy.wait(500);

		// Step 2: Click "Add Sub-Category" Button
		cy.get("ion-button")
			.contains("Add Sub-Category")
			.should("exist")
			.scrollIntoView()
			.should("be.visible")
			.click({ force: true });

		// Step 3: Type the subcategory name and press Enter to add it
		cy.get("ion-item.subCategory")
			.find("ion-input")
			.first()
			.should("exist")
			.should("be.visible")
			.click()
			.type(`${testSubcategory}{enter}`);

		cy.wait(2000); // Let Firebase update
		cy.get(".subCategory").contains(testSubcategory).should("exist");

		// Step 4: Open New Transaction Modal
		cy.get("#add-transaction").click({ force: true });
		cy.wait(500);

		// Step 5: Select "Income" as Type
		cy.get("ion-select").first().click();
		cy.wait(1000);
		cy.get("ion-alert").should("exist").find("button").contains("Income").click();
		cy.get("ion-alert").find("button").contains("OK").click();
		cy.wait(1000);
		cy.get("ion-backdrop").should("not.exist");
		cy.wait(500);

		// Step 6: Select "Salary & Wages" Category in the Transaction Modal
		cy.get("ion-modal#custom-category-modal ion-accordion")
			.contains("Salary & Wages")
			.should("exist")
			.scrollIntoView()
			.should("be.visible")
			.click({ force: true });

		cy.wait(500);

		// Step 7: Scroll Down Inside the Modal to Find the Custom Subcategory
		cy.get("ion-modal#custom-category-modal ion-content")
			.should("exist")
			.then(($content) => {
				const content = $content[0]; // Get the native DOM element
				content.scrollTop = content.scrollHeight; // Scroll to bottom
			});

		cy.wait(500);

		// Step 8: Check the subcategory is visible before selecting it
		cy.get("ion-modal#custom-category-modal .subCategory")
			.contains(testSubcategory)
			.should("exist")
			.click();

		cy.wait(1000);

		// Step 9: Enter Transaction Details
		cy.get("ion-modal#custom-category-modal ion-input").first().type(testTransaction.title); // Title
		cy.get("ion-modal#custom-category-modal ion-input[type='number']").type(
			testTransaction.amount.toString()
		); // Amount
		cy.get("ion-modal#custom-category-modal ion-textarea").type(testTransaction.description); // Description

		// Step 10: Click Confirm to Save the Transaction
		cy.get("ion-modal#custom-category-modal ion-button").contains("Confirm").click();
		cy.wait(1000);

		// Step 11: Retrieve Transaction ID from Firebase
		const userID = "test-user"; // Ensure you're using the test user
		const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/capstone-project-f8dca/databases/(default)/documents/users/${userID}/transactions`;

		cy.request("GET", `${firestoreBaseUrl}`).then((response) => {
			cy.log("Response Body:", response.body);
			console.log("Response Body:", response.body);

			expect(response.status).to.eq(200);

			// Extract all transactions
			const transactions = response.body.documents || [];

			// Find the transaction we just added
			const createdTransaction = transactions.find((doc) => {
				const data = doc.fields;

				return (
					data.title?.stringValue === testTransaction.title &&
					data.amount?.integerValue == testTransaction.amount &&
					data.category?.stringValue === testTransaction.category &&
					data.subCategory?.stringValue === testTransaction.subCategory &&
					data.description?.stringValue === testTransaction.description &&
					data.type?.stringValue === testTransaction.type
				);
			});

			expect(createdTransaction).to.exist;
			transactionId = createdTransaction.name.split("/").pop();

			cy.log("Transaction ID Found:", transactionId);

			// Step 12: Check if "Salaries & Wages" is Still Open Before Searching
			cy.wait(2000);

			cy.get("ion-accordion").contains("Salary & Wages").should("exist").scrollIntoView();

			cy.wait(500);

			// Step 13: Find "CustomSub" and Its Delete Button
			cy.get(".subCategory")
				.contains(testSubcategory)
				.should("exist")
				.scrollIntoView()
				.should("be.visible")
				.closest("ion-item") // Get the parent row
				.find(".subCat-delete-button")
				.should("exist")
				.scrollIntoView()
				.should("be.visible")
				.click();

			cy.on("window:confirm", () => true);
			cy.wait(2000);

			// Step 14: Verify Transaction is Updated to "Uncategorized"
			cy.request("GET", `${firestoreBaseUrl}/${transactionId}`).then((updatedResponse) => {
				expect(updatedResponse.status).to.eq(200);

				const updatedTransaction = updatedResponse.body.fields;
				expect(updatedTransaction.subCategory.stringValue).to.eq("Uncategorized");
			});

			// Step 15: Delete Test Transaction from Firebase
			cy.request("DELETE", `${firestoreBaseUrl}/${transactionId}`).then((deleteResponse) => {
				expect(deleteResponse.status).to.eq(200);
				cy.log("Test transaction successfully deleted.");
			});
		});
	});

	it("should reset all fields after transaction submission and delete test transaction", () => {
		const testTransaction = {
			title: "Reset Test",
			amount: 50,
			category: "Salary & Wages",
			subCategory: "Paycheck",
			description: "Test description",
			type: "Income"
		};

		let transactionId = null; // Store transaction ID to delete later

		// Step 1: Open the Add Transaction Modal
		cy.get("#add-transaction").click({ force: true });
		cy.wait(500);

		// Step 2: Select "Type" (Income)
		cy.get("ion-select").first().click();
		cy.wait(1000);
		cy.get("ion-alert").should("exist").find("button").contains("Income").click();
		cy.get("ion-alert").find("button").contains("OK").click();
		cy.wait(1000);

		// Step 3: Make sure backdrop disappears before continueing
		cy.get("ion-backdrop").should("not.exist");
		cy.wait(500);

		// Step 4: Select "Salary & Wages" Category in the Transaction Modal
		cy.get("ion-modal#custom-category-modal ion-accordion")
			.contains("Salary & Wages")
			.should("exist")
			.scrollIntoView()
			.should("be.visible")
			.click({ force: true });

		cy.wait(500);

		// Step 5: Select the "Paycheck" Subcategory
		cy.get("ion-modal#custom-category-modal .subCategory")
			.contains("Paycheck")
			.should("exist")
			.scrollIntoView()
			.should("be.visible")
			.click();

		cy.wait(1000);

		// Step 6: Enter Transaction Details
		cy.get("ion-modal#custom-category-modal ion-input").first().type(testTransaction.title); // Title
		cy.get("ion-modal#custom-category-modal ion-input[type='number']").type(
			testTransaction.amount.toString()
		); // Amount
		cy.get("ion-modal#custom-category-modal ion-textarea").type(testTransaction.description); // Description

		// Step 7: Click Confirm to Save the Transaction
		cy.get("ion-modal#custom-category-modal ion-button").contains("Confirm").click();
		cy.wait(1000);

		// Step 8: Reopen Modal and Check if Fields are Reset
		cy.get("#add-transaction").click({ force: true });
		cy.wait(500);

		cy.get("ion-modal").should("have.class", "show-modal");

		// Step 9: Verify That the Select Type is Reset
		cy.get("ion-select")
			.first()
			.invoke("attr", "aria-label")
			.then((value) => {
				expect(value).to.be.undefined; // Test passes if it's unselected
			});

		// Step 10: Retrieve Transaction ID from Firebase and Delete It
		const userID = "test-user"; // Ensure you're using the test user
		const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/capstone-project-f8dca/databases/(default)/documents/users/${userID}/transactions`;

		cy.request("GET", `${firestoreBaseUrl}`).then((response) => {
			cy.log("Response Body:", response.body);
			console.log("Response Body:", response.body);

			expect(response.status).to.eq(200);

			// Extract all transactions
			const transactions = response.body.documents || [];

			// Find the transaction we just added
			const createdTransaction = transactions.find((doc) => {
				const data = doc.fields;

				return (
					data.title?.stringValue === testTransaction.title &&
					data.amount?.integerValue == testTransaction.amount &&
					data.category?.stringValue === testTransaction.category &&
					data.subCategory?.stringValue === testTransaction.subCategory &&
					data.description?.stringValue === testTransaction.description &&
					data.type?.stringValue === testTransaction.type
				);
			});

			expect(createdTransaction).to.exist;
			transactionId = createdTransaction.name.split("/").pop();

			cy.log("Transaction ID Found:", transactionId);

			// Step 11: Delete Test Transaction from Firebase
			cy.request("DELETE", `${firestoreBaseUrl}/${transactionId}`).then((deleteResponse) => {
				expect(deleteResponse.status).to.eq(200);
				cy.log("Test transaction successfully deleted.");
			});
		});
	});
});
