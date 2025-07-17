const ExpenseSheet = require('../model/expenseSheetModel');

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
//extractId(val) extracts and returns a MongoDB ObjectId string from an object, string, or any input, if possible.

class MaxHeap {
  constructor() { this.data = []; }
  push(item) { this.data.push(item); this.data.sort((a, b) => b[0] - a[0]); }
  pop() { return this.data.shift(); }
  isEmpty() { return this.data.length === 0; }
}


/**
 * Fetch unsettled transactions and combine with frontend transactions
 * @param {string} groupId
 * @param {Array} frontendTransactions - [userId, amount]
 * @returns {Array} settlements
 */
async function fetchUnsettledTransactions(groupId, frontendTransactions = []) {
  try {
    const unsettledExpenses = await ExpenseSheet.find({
      groupId,
      settled: false
    });

    const transactions = [];
    for (const expense of unsettledExpenses) {
      transactions.push([
        extractId(expense.payerId),
        expense.amountToPay
      ]);
      transactions.push([
        extractId(expense.userId),
        -expense.amountToPay
      ]);
    }
    transactions.push(...frontendTransactions);
    const settlements = await settleDebts(transactions, groupId);
    return settlements;
  } catch (error) {
    console.error('Error in fetchUnsettledTransactions:', error);
    throw error;
  }
}

/**
 * Settle debts between users based on transactions (minimize number of transactions)
 * @param {Array} transactions - [userId, amount]
 * @param {string} groupId
 * @returns {Array} settlements
 */
async function settleDebts(transactions, groupId) {
  console.log("settleDebts called", transactions, groupId);
  // 1. Calculate net balances (use string keys!)
  const net = new Map();
  for (const [user, amt] of transactions) {
    const id = extractId(user).toString(); // Use string key!
    net.set(id, (net.get(id) || 0) + amt);
  }

  // Debug: print net balances
  console.log("Net balances:", net);

  // 2. Remove users with zero balance
  for (const [user, amt] of Array.from(net.entries())) {
    if (Math.abs(amt) < 1e-6) net.delete(user);
  }

  // 3. Prepare MaxHeaps for creditors and debtors
  const creditors = new MaxHeap(); // [amount, userId]
  const debtors = new MaxHeap();   // [amount, userId] (amount is positive, represents debt)
  for (const [user, amt] of net.entries()) {
    if (amt > 0) creditors.push([amt, user]);
    else if (amt < 0) debtors.push([ -amt, user ]); // store as positive for max heap
  }

  // 4. Clear old unsettled settlements for this group
  await ExpenseSheet.deleteMany({ groupId, settled: false });

  // 5. Settle debts (netting between pairs, no self-owes)
  const settlements = [];
  while (!creditors.isEmpty() && !debtors.isEmpty()) {
    const [creditAmt, creditUser] = creditors.pop();
    const [debtAmt, debtUser] = debtors.pop();
    const settleAmt = Math.min(creditAmt, debtAmt);

    if (creditUser !== debtUser && settleAmt > 0) {
      settlements.push({ from: debtUser, to: creditUser, amount: settleAmt });

      // Save to DB (convert string back to ObjectId)
      await ExpenseSheet.create({
        userId: extractId(debtUser),
        payerId: extractId(creditUser),
        groupId,
        amountToPay: settleAmt,
        settled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (creditAmt > settleAmt) creditors.push([creditAmt - settleAmt, creditUser]);
    if (debtAmt > settleAmt) debtors.push([debtAmt - settleAmt, debtUser]);
  }

  return settlements;
}

async function processGroupSettlements(groupId, frontendTransactions = []) {
  console.log("settleGroup called", groupId, frontendTransactions);
  return await fetchUnsettledTransactions(groupId, frontendTransactions);
}

module.exports = {
  fetchUnsettledTransactions,
  settleDebts,
  processGroupSettlements
};
