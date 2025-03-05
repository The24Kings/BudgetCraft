class Transaction {
    constructor(
        public id: string,
        public type: string,
        public category: string,
        public subCategory: string,
        public title: string,
        public date: string,
        public description: string,
        public amount: number
    ) {}
};

export default Transaction;