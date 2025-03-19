/// <reference types="cypress" />

describe("Category data validation", () => {
	const validSubcategory = "Sales"; // Subcategory
	const parentCategory = "Business Revenue"; // Make sure to use the correct category that contains "Other"
	const invalidSubcategory = "Invalid";

	it("Correct subcategory given", () => {
		cy.visit("/debug");

		// Expand the correct parent category accordion
		cy.get("ion-accordion")
			.contains(parentCategory)
			.should("exist")
			.scrollIntoView()
			.click({ force: true });

		cy.wait(500); // Allow UI to expand the accordion

		// Click on the correct subcategory inside the expanded category
		cy.get(".subCategory ion-button")
			.contains(validSubcategory)
			.should("exist")
			.scrollIntoView()
			.click({ force: true });

		cy.wait(500); // Allow UI update

		// Verify that the selected subcategory is displayed somewhere
		cy.get("ion-button, ion-label, ion-note, div, span")
			.contains(validSubcategory)
			.should("be.visible");
	});

	it("Invalid subcategory rejected", () => {
		cy.visit("/debug");

		// Type an invalid subcategory
		cy.get("ion-input").first().type(invalidSubcategory);
		cy.get(".validate").click();

		// Expect an alert for an invalid subcategory
		cy.on("window:alert", (str) => {
			expect(str).to.contain(`Subcategory "${invalidSubcategory}" not found.`);
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
		const type = "Income";
		const category = "Business Revenue";
		const data = "Sales";

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

		// Step 1: Open "Business Revenue" Category
		cy.get("ion-accordion")
			.contains("Business Revenue")
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

		cy.wait(2000); // Make sure Firebase updates
		cy.get(".subCategory").contains(testSubcategory).should("exist");

		// Step 4: Check if "Business Revenue" is Still Open Before Searching
		cy.wait(500);
		cy.get("ion-accordion").contains("Business Revenue").should("exist").scrollIntoView();

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

		// Step 4: Select "Business Revenue" inside the transaction modal
		cy.get("ion-modal#custom-category-modal ion-accordion")
			.contains("Business Revenue")
			.should("exist")
			.scrollIntoView()
			.should("be.visible")
			.click({ force: true });

		cy.wait(500);

		// Step 5: Select "Sales" inside the modal
		cy.get("ion-modal#custom-category-modal .subCategory")
			.contains("Sales")
			.scrollIntoView()
			.should("be.visible")
			.click({ force: true });

		cy.wait(1000);

		// Step 6: Enter transaction details
		const testTransaction = {
			title: "Test Transaction",
			amount: 100,
			category: "Business Revenue",
			subCategoryID: "0", // Sales
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
		const userID = "test-user";
		const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/capstone-project-f8dca/databases/(default)/documents/users/${userID}/transactions`;

		cy.request("GET", `${firestoreBaseUrl}`).then((response) => {
			cy.log("Response Body:", response.body);
			console.log("Response Body:", response.body);

			expect(response.status).to.eq(200);

			// Extract all transactions
			const transactions = response.body.documents || [];

			// Log all transactions retrieved for debugging
			cy.log("Retrieved Transactions:", transactions);

			// Find the transaction we just added
			let matchingTransaction = transactions.find((doc) => {
				const data = doc.fields;

				cy.log("Checking transaction:", data.title?.stringValue);
				console.log("Expected:", testTransaction);
				console.log("Received from Firestore:", data);

				// Compare each field individually and log mismatches
				let titleMatch = data.title?.stringValue === testTransaction.title;
				let amountMatch =
					parseFloat(data.amount?.integerValue || data.amount?.doubleValue) ===
					testTransaction.amount;
				let categoryMatch = data.category?.stringValue === testTransaction.category;
				let subCategoryIDMatch =
					data.subCategoryID?.stringValue === testTransaction.subCategoryID;
				let descriptionMatch =
					data.description?.stringValue === testTransaction.description;
				let typeMatch = data.type?.stringValue === testTransaction.type;

				if (!titleMatch)
					cy.log(
						`Mismatch: Title (Expected: ${testTransaction.title}, Got: ${data.title?.stringValue})`
					);
				if (!amountMatch)
					cy.log(
						`Mismatch: Amount (Expected: ${testTransaction.amount}, Got: ${data.amount?.integerValue || data.amount?.doubleValue})`
					);
				if (!categoryMatch)
					cy.log(
						`Mismatch: Category (Expected: ${testTransaction.category}, Got: ${data.category?.stringValue})`
					);
				if (!subCategoryIDMatch)
					cy.log(
						`Mismatch: SubCategory (Expected: ${testTransaction.subCategoryID}, Got: ${data.subCategoryID?.stringValue})`
					);
				if (!descriptionMatch)
					cy.log(
						`Mismatch: Description (Expected: ${testTransaction.description}, Got: ${data.description?.stringValue})`
					);
				if (!typeMatch)
					cy.log(
						`Mismatch: Type (Expected: ${testTransaction.type}, Got: ${data.type?.stringValue})`
					);

				return (
					titleMatch &&
					amountMatch &&
					categoryMatch &&
					subCategoryIDMatch &&
					descriptionMatch &&
					typeMatch
				);
			});

			// Retry if not found initially
			if (!matchingTransaction) {
				cy.wait(2000); // Wait for Firestore to sync
				cy.request("GET", `${firestoreBaseUrl}`).then((retryResponse) => {
					const retryTransactions = retryResponse.body.documents || [];
					matchingTransaction = retryTransactions.find((doc) => {
						const data = doc.fields;
						return (
							data.title?.stringValue === testTransaction.title &&
							parseFloat(data.amount?.integerValue || data.amount?.doubleValue) ===
								testTransaction.amount &&
							data.category?.stringValue === testTransaction.category &&
							data.subCategoryID?.stringValue === testTransaction.subCategoryID &&
							data.description?.stringValue === testTransaction.description &&
							data.type?.stringValue === testTransaction.type
						);
					});

					expect(matchingTransaction, "Transaction not found in Firestore (after retry)")
						.to.exist;

					// If transaction exists, delete it
					if (matchingTransaction) {
						const documentId = matchingTransaction.name.split("/").pop();
						if (documentId) {
							cy.log("Deleting test transaction with ID:", documentId);
							cy.request("DELETE", `${firestoreBaseUrl}/${documentId}`).then(
								(deleteResponse) => {
									expect(deleteResponse.status).to.eq(200);
									cy.log("Test transaction successfully deleted.");
								}
							);
						} else {
							cy.log("Failed to extract document ID, deletion skipped.");
						}
					}
				});
			} else {
				expect(matchingTransaction, "Transaction not found in Firestore").to.exist;
			}
		});
	});

	//TODO: Find out how to find CustomSub ID for creating a custom subcategory
	/*
	it("should mark transactions as 'Uncategorized' when subcategory is deleted", () => {
		cy.visit("/debug");
		cy.wait(1000);

		const testSubcategory = "CustomSub";

		// Compute the subcategory ID using the same hashing function used in the app
		const cyrb53 = (str, seed = 0) => {
			let h1 = 0xdeadbeef ^ seed,
				h2 = 0x41c6ce57 ^ seed;
			for (let i = 0, ch; i < str.length; i++) {
				ch = str.charCodeAt(i);
				h1 = Math.imul(h1 ^ ch, 2654435761);
				h2 = Math.imul(h2 ^ ch, 1597334677);
			}
			h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
			h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
			h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
			h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

			return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
		};

		const testSubcategoryID = cyrb53("Business Revenue" + testSubcategory);

		const testTransaction = {
			title: "Test Transaction",
			amount: 100,
			category: "Business Revenue",
			subCategoryID: testSubcategoryID, // Use hashed ID
			description: "Test description",
			type: "Income"
		};

		let transactionId = null; // Store transaction ID to delete later

		// Step 1: Open "Business Revenue" Category
		cy.get("ion-accordion")
			.contains("Business Revenue")
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

		// Step 6: Select "Business Revenue" Category in the Transaction Modal
		cy.get("ion-modal#custom-category-modal ion-accordion")
			.contains("Business Revenue")
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
		const userID = "test-user";
		const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/capstone-project-f8dca/databases/(default)/documents/users/${userID}/transactions`;

		cy.request("GET", `${firestoreBaseUrl}`).then((response) => {
			cy.log("Response Body:", response.body);
			console.log("Response Body:", response.body);

			expect(response.status).to.eq(200);

			// Extract all transactions
			const transactions = response.body.documents || [];

			// Find the transaction we just added
			let createdTransaction = transactions.find((doc) => {
				const data = doc.fields;

				return (
					data.title?.stringValue === testTransaction.title &&
					parseFloat(data.amount?.integerValue || data.amount?.doubleValue) ===
						testTransaction.amount &&
					data.category?.stringValue === testTransaction.category &&
					data.subCategoryID?.stringValue === testTransaction.subCategoryID &&
					data.description?.stringValue === testTransaction.description &&
					data.type?.stringValue === testTransaction.type
				);
			});

			expect(createdTransaction, "Transaction not found in Firestore").to.exist;

			// Extract transaction ID
			transactionId = createdTransaction.name.split("/").pop();
			cy.log("Transaction ID Found:", transactionId);

			// Step 12: Delete the Subcategory
			cy.wait(2000);
			cy.get("ion-accordion").contains("Business Revenue").should("exist").scrollIntoView();
			cy.wait(500);
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

			// Step 13: Verify Transaction is Updated to "Uncategorized"
			cy.request("GET", `${firestoreBaseUrl}/${transactionId}`).then((updatedResponse) => {
				expect(updatedResponse.status).to.eq(200);
				const updatedTransaction = updatedResponse.body.fields;
				expect(updatedTransaction.subCategoryID.stringValue).to.eq("Uncategorized");
			});

			// Step 14: Delete Test Transaction from Firebase
			cy.request("DELETE", `${firestoreBaseUrl}/${transactionId}`).then((deleteResponse) => {
				expect(deleteResponse.status).to.eq(200);
				cy.log("Test transaction successfully deleted.");
			});
		});
	});
 */

	it("should reset all fields after transaction submission and delete test transaction", () => {
		const testTransaction = {
			title: "Reset Test",
			amount: 50,
			category: "Business Revenue",
			subCategoryID: "0", // Sales
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

		// Step 4: Select "Business Revenue" Category in the Transaction Modal
		cy.get("ion-modal#custom-category-modal ion-accordion")
			.contains("Business Revenue")
			.should("exist")
			.scrollIntoView()
			.should("be.visible")
			.click({ force: true });

		cy.wait(500);

		// Step 5: Select the "Sales" Subcategory
		cy.get("ion-modal#custom-category-modal .subCategory")
			.contains("Sales")
			.scrollIntoView()
			.should("be.visible")
			.click({ force: true });

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
		const userID = "test-user";
		const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/capstone-project-f8dca/databases/(default)/documents/users/${userID}/transactions`;

		cy.request("GET", `${firestoreBaseUrl}`).then((response) => {
			cy.log("Response Body:", response.body);
			console.log("Response Body:", response.body);

			expect(response.status).to.eq(200);

			// Extract all transactions
			const transactions = response.body.documents || [];

			// Log all transactions retrieved for debugging
			cy.log("Retrieved Transactions:", transactions);

			// Find the transaction we just added
			let matchingTransaction = transactions.find((doc) => {
				const data = doc.fields;

				cy.log("Checking transaction:", data.title?.stringValue);
				console.log("Expected:", testTransaction);
				console.log("Received from Firestore:", data);

				// Compare each field individually and log mismatches
				let titleMatch = data.title?.stringValue === testTransaction.title;
				let amountMatch =
					parseFloat(data.amount?.integerValue || data.amount?.doubleValue) ===
					testTransaction.amount;
				let categoryMatch = data.category?.stringValue === testTransaction.category;
				let subCategoryIDMatch =
					data.subCategoryID?.stringValue === testTransaction.subCategoryID;
				let descriptionMatch =
					data.description?.stringValue === testTransaction.description;
				let typeMatch = data.type?.stringValue === testTransaction.type;

				if (!titleMatch)
					cy.log(
						`Mismatch: Title (Expected: ${testTransaction.title}, Got: ${data.title?.stringValue})`
					);
				if (!amountMatch)
					cy.log(
						`Mismatch: Amount (Expected: ${testTransaction.amount}, Got: ${data.amount?.integerValue || data.amount?.doubleValue})`
					);
				if (!categoryMatch)
					cy.log(
						`Mismatch: Category (Expected: ${testTransaction.category}, Got: ${data.category?.stringValue})`
					);
				if (!subCategoryIDMatch)
					cy.log(
						`Mismatch: SubCategory (Expected: ${testTransaction.subCategoryID}, Got: ${data.subCategory?.stringValue})`
					);
				if (!descriptionMatch)
					cy.log(
						`Mismatch: Description (Expected: ${testTransaction.description}, Got: ${data.description?.stringValue})`
					);
				if (!typeMatch)
					cy.log(
						`Mismatch: Type (Expected: ${testTransaction.type}, Got: ${data.type?.stringValue})`
					);

				return (
					titleMatch &&
					amountMatch &&
					categoryMatch &&
					subCategoryIDMatch &&
					descriptionMatch &&
					typeMatch
				);
			});

			// Retry if not found initially
			if (!matchingTransaction) {
				cy.wait(2000); // Wait for Firestore to sync
				cy.request("GET", `${firestoreBaseUrl}`).then((retryResponse) => {
					const retryTransactions = retryResponse.body.documents || [];
					matchingTransaction = retryTransactions.find((doc) => {
						const data = doc.fields;
						return (
							data.title?.stringValue === testTransaction.title &&
							parseFloat(data.amount?.integerValue || data.amount?.doubleValue) ===
								testTransaction.amount &&
							data.category?.stringValue === testTransaction.category &&
							data.subCategoryID?.stringValue === testTransaction.subCategoryID &&
							data.description?.stringValue === testTransaction.description &&
							data.type?.stringValue === testTransaction.type
						);
					});

					expect(matchingTransaction, "Transaction not found in Firestore (after retry)")
						.to.exist;

					// If transaction exists, delete it
					if (matchingTransaction) {
						const documentId = matchingTransaction.name.split("/").pop();
						if (documentId) {
							cy.log("Deleting test transaction with ID:", documentId);
							cy.request("DELETE", `${firestoreBaseUrl}/${documentId}`).then(
								(deleteResponse) => {
									expect(deleteResponse.status).to.eq(200);
									cy.log("Test transaction successfully deleted.");
								}
							);
						} else {
							cy.log("Failed to extract document ID, deletion skipped.");
						}
					}
				});
			} else {
				expect(matchingTransaction, "Transaction not found in Firestore").to.exist;
			}
		});
	});
});
