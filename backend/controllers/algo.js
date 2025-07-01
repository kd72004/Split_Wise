const ExpenseSheet = require('../model/expenseSheetModel');
async function fetchUnsettledTransactions(groupId, frontendTransactions = []) {
    try {
        const unsettledExpenses = await ExpenseSheet.find({
            groupId: groupId,
            settled: false
        }).populate('userId', 'name').populate('payerId', 'name');

        const transactions = [];

        for (const expense of unsettledExpenses) {
            transactions.push([
                expense.payerId.toString(), 
                expense.amountToPay
            ]);

            
            transactions.push([
                expense.userId.toString(), 
                -expense.amountToPay
            ]);
        }
        transactions.push(...frontendTransactions);

        console.log('Fetched transactions from ExpenseSheet:');
        transactions.forEach(([userId, amount]) => {
            console.log(`User ${userId}: ${amount > 0 ? '+' : ''}${amount}`);
        });

        const settlements = await settleDebts(transactions, groupId);
        return settlements;

    } catch (error) {
        console.error('Error fetching unsettled transactions:', error);
        throw error;
    }
}


function extractId(val) {
    if (!val) return val;
    if (typeof val === 'object' && val._id) return val._id;
    if (typeof val === 'string') {
        const match = val.match(/[a-fA-F0-9]{24}/);
        if (match) return match[0];
        return val;
    }
    return val;
}

class MaxHeap {
    constructor() { this.data = []; }
    push(item) { this.data.push(item); this.data.sort((a, b) => b[0] - a[0]); }
    pop() { return this.data.shift(); }
    isEmpty() { return this.data.length === 0; }
}

async function settleDebts(transactions, groupId) {
   
    const net = new Map();
    for (const [user, amt] of transactions) {
        const id = extractId(user);
        net.set(id, (net.get(id) || 0) + amt);
    }

    
    const creditors = new MaxHeap(); // +ve balances
    const debtors = new MaxHeap();   // -ve balances 
    for (const [user, amt] of net.entries()) {
        if (amt > 0) creditors.push([amt, user]);
        else if (amt < 0) debtors.push([-amt, user]);
    }

    await ExpenseSheet.deleteMany({ groupId, settled: false });

    const settlements = [];
    while (!creditors.isEmpty() && !debtors.isEmpty()) {
        const [creditAmt, creditUser] = creditors.pop();
        const [debtAmt, debtUser] = debtors.pop();
        const settleAmt = Math.min(creditAmt, debtAmt);

        settlements.push({ from: debtUser, to: creditUser, amount: settleAmt });

        await ExpenseSheet.create({
            userId: extractId(debtUser),
            payerId: extractId(creditUser),
            groupId,
            amountToPay: settleAmt,
            settled: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        if (creditAmt > settleAmt) creditors.push([creditAmt - settleAmt, creditUser]);
        if (debtAmt > settleAmt) debtors.push([debtAmt - settleAmt, debtUser]);
    }

    return settlements;
}

async function processGroupSettlements(groupId, frontendTransactions = []) {
    try {
        const settlements = await fetchUnsettledTransactions(groupId, frontendTransactions);
        
        return settlements;
        
    } catch (error) {
        console.error('Error processing group settlements:', error);
        throw error;
    }
}

module.exports = {
    fetchUnsettledTransactions,
    settleDebts,
    processGroupSettlements
};


