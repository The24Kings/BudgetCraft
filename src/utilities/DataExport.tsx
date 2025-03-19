import { collection, getDocs, getFirestore } from "firebase/firestore";
import { Category } from "../utilities/Categories";

// Function to retrieve the subcategory name instead of ID
const subCategory = (categories: Category[], category: string, id: string) => {
	const subCategoryObj = categories
		.find((cat) => cat.name === category)
		?.Subcategories.find((subCat) => subCat.id === id);

	return subCategoryObj ? subCategoryObj.name : "Uncategorized";
};

const exportUserDataJSON = async (userID: string, categories: Category[]) => {
	try {
		const db = getFirestore();
		const transactionsRef = collection(db, `users/${userID}/transactions`);
		const querySnapshot = await getDocs(transactionsRef);

		const transactions = querySnapshot.docs.map((doc) => {
			const data = doc.data();

			// Convert Firestore timestamp to ISO date format
			const formattedDate =
				data.date && data.date.seconds
					? new Date(data.date.seconds * 1000).toISOString()
					: null;

			// Use the subCategory function to get the actual name
			const subCategoryName = subCategory(categories, data.category, data.subCategoryID);

			// Return transaction object with properly formatted fields
			return {
				id: doc.id,
				title: data.title || "",
				type: data.type || "",
				amount: data.amount || 0,
				date: formattedDate,
				subCategory: subCategoryName,
				category: data.category || "",
				description: data.description || ""
			};
		});

		if (transactions.length === 0) {
			alert("No transactions found for export.");
			return;
		}

		// Wrap transactions inside an object with a "transactions" key
		const exportData = { transactions };

		// Convert to JSON
		const jsonContent = JSON.stringify(exportData, null, 2);
		const blob = new Blob([jsonContent], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");

		link.href = url;
		link.download = `user_transactions_${userID}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		console.log("User data exported successfully as JSON.");
	} catch (error) {
		console.error("Error exporting user data:", error);
		alert("Failed to export user data.");
	}
};

export { exportUserDataJSON };
