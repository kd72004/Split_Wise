const ExpenseSheet = require('../model/expenseSheetModel');

/**
 * Fetch unsettled expenses from ExpenseSheet and convert to transactions array
 * @param {string} groupId - The group ID to fetch expenses for
 * @param {Array} frontendTransactions - Array of [userId, amount] from frontend
 * @returns {Array} - Array of [userId, amount] pairs for settlement algorithm
 */
async function fetchUnsettledTransactions(groupId, frontendTransactions = []) {
    try {
        const unsettledExpenses = await ExpenseSheet.find({
            groupId: groupId,
            settled: false
        }).populate('userId', 'name').populate('payerId', 'name');

        const transactions = [];

        for (const expense of unsettledExpenses) {
            // Add payer entry (positive amount - they paid)
            transactions.push([
                expense.payerId.toString(), // payer gets positive amount
                expense.amountToPay
            ]);

            // Add user entry (negative amount - they owe)
            transactions.push([
                expense.userId.toString(), // user owes negative amount
                -expense.amountToPay
            ]);
        }
        transactions.push(...frontendTransactions);

        console.log('Fetched transactions from ExpenseSheet:');
        transactions.forEach(([userId, amount]) => {
            console.log(`User ${userId}: ${amount > 0 ? '+' : ''}${amount}`);
        });

        // Call settleDebts automatically
        const settlements = await settleDebts(transactions, groupId);
        return settlements;

    } catch (error) {
        console.error('Error fetching unsettled transactions:', error);
        throw error;
    }
}

// Helper: extract only the ObjectId string
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

// Simple max heap using array and sort (for small n, this is fine)
class MaxHeap {
    constructor() { this.data = []; }
    push(item) { this.data.push(item); this.data.sort((a, b) => b[0] - a[0]); }
    pop() { return this.data.shift(); }
    isEmpty() { return this.data.length === 0; }
}

async function settleDebts(transactions, groupId) {
    // 1. Calculate net balances
    const net = new Map();
    for (const [user, amt] of transactions) {
        const id = extractId(user);
        net.set(id, (net.get(id) || 0) + amt);
    }

    // 2. Build heaps
    const creditors = new MaxHeap(); // +ve balances
    const debtors = new MaxHeap();   // -ve balances (as positive numbers)
    for (const [user, amt] of net.entries()) {
        if (amt > 0) creditors.push([amt, user]);
        else if (amt < 0) debtors.push([-amt, user]);
    }

    // 3. Clear old unsettled settlements for this group
    await ExpenseSheet.deleteMany({ groupId, settled: false });

    // 4. Settle debts
    const settlements = [];
    while (!creditors.isEmpty() && !debtors.isEmpty()) {
        const [creditAmt, creditUser] = creditors.pop();
        const [debtAmt, debtUser] = debtors.pop();
        const settleAmt = Math.min(creditAmt, debtAmt);

        settlements.push({ from: debtUser, to: creditUser, amount: settleAmt });

        // Save to DB
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

/**
 * Complete settlement process: fetch unsettled expenses and settle debts
 * @param {string} groupId - The group ID to process settlements for
 * @param {Array} frontendTransactions - Array of [userId, amount] from frontend
 * @returns {Array} - Array of settlement transactions
 */
async function processGroupSettlements(groupId, frontendTransactions = []) {
    try {
        // Step 1: Fetch unsettled transactions from ExpenseSheet + frontend transactions
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


