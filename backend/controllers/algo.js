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

async function settleDebts(transactions, groupId) {
    const net = new Map();
    for (const [user, amt] of transactions) net.set(user, (net.get(user) || 0) + amt);

    const taker = new MaxPriorityQueue({ compare: (a, b) => b[0] - a[0] });
    const giver = new MaxPriorityQueue({ compare: (a, b) => b[0] - a[0] });

    for (const [user, amt] of net.entries()) {
        if (amt > 0) taker.enqueue([amt, user]);
        else if (amt < 0) giver.enqueue([-amt, user]);
    }

    const settlements = [];

    while (!taker.isEmpty() && !giver.isEmpty()) {
        const [ta, tu] = taker.dequeue();
        const [ga, gu] = giver.dequeue();
        const minAmt = Math.min(ta, ga);
        
        settlements.push({ from: gu, to: tu, amount: minAmt });
        console.log(`${gu} pays ${minAmt} to ${tu}`);
        
        if (ta > minAmt) taker.enqueue([ta - minAmt, tu]);
        if (ga > minAmt) giver.enqueue([ga - minAmt, gu]);
    }

    // After settlement processing, clean up and add new records
    try {
        // Step 1: Remove all unsettled expenses for this group
        await ExpenseSheet.deleteMany({
            groupId: groupId,
            settled: false
        });
        console.log(`Removed all unsettled expenses for group ${groupId}`);

        // Step 2: Add new settlement records
        for (const settlement of settlements) {
            await ExpenseSheet.create({
                expenseId: null, // This is a settlement, not an expense
                userId: settlement.from, // The person who is paying
                groupId: groupId,
                amountToPay: settlement.amount,
                payerId: settlement.from, // The person who is paying
                settled: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        console.log(`Added ${settlements.length} new settlement records`);

    } catch (error) {
        console.error('Error updating ExpenseSheet after settlement:', error);
        throw error;
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


