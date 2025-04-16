import { Timestamp } from "firebase/firestore";
import Transaction from "../Transactions/Transaction";

class Goal {
	constructor(
		public id: string = "",
		public type: string = "",
		public category: string = "",
		public subCategoryID: string = "",
		public goal: number = 0,
        public budgetItem: boolean = true,
		public recurring: boolean = false,
		public reminder: boolean = false,
		public createdAt: Timestamp = Timestamp.now(),
		public targetDate: Timestamp = Timestamp.now(),
		public reminderDate: Timestamp = Timestamp.now(),
		public description: string = "",
		public transactionIDs: String[] = [],
        public withdrawalIDs: String[] = [], // IDs of transactions that are withdrawals
		public transactions: Transaction[] = [], // Transactions related to this goal
        public withdrawals: Transaction[] = [] // Transactions related to this goal that are withdrawals
	) {}
}

export default Goal;
