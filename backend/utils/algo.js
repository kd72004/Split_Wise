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

class MaxHeap {
  constructor() { this.data = []; }
  push(item) { this.data.push(item); this.data.sort((a, b) => b[0] - a[0]); }
  pop() { return this.data.shift(); }
  isEmpty() { return this.data.length === 0; }
}


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


async function settleDebts(transactions, groupId) {
  // 1. Calculate net balances
  const net = new Map();
  for (const [user, amt] of transactions) {
    const id = extractId(user);
    net.set(id, (net.get(id) || 0) + amt);
  }

  // 2. Build heaps
  const creditors = new MaxHeap(); // +ve balances
  const debtors = new MaxHeap();   // -ve balances 
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

async function processGroupSettlements(groupId, frontendTransactions = []) {
  return await fetchUnsettledTransactions(groupId, frontendTransactions);
}

module.exports = {
  fetchUnsettledTransactions,
  settleDebts,
  processGroupSettlements
};
