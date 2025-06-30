const ExpenseSheet = require('../model/expenseSheetModel');

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

    const settlements = await settleDebts(transactions, groupId);
    return settlements;
  } catch (error) {
    console.error('Error in fetchUnsettledTransactions:', error);
    throw error;
  }
}

/**
 * Settle debts between users based on transactions
 * @param {Array} transactions - [userId, amount]
 * @param {string} groupId
 * @returns {Array} settlements
 */
async function settleDebts(transactions, groupId) {
  const net = new Map();
  for (const [user, amt] of transactions) {
    net.set(user, (net.get(user) || 0) + amt);
  }

  const taker = [];
  const giver = [];

  for (const [user, amt] of net.entries()) {
    if (amt > 0) taker.push([amt, user]);
    else if (amt < 0) giver.push([-amt, user]);
  }

  taker.sort((a, b) => b[0] - a[0]);
  giver.sort((a, b) => b[0] - a[0]);

  const settlements = [];

  while (taker.length && giver.length) {
    const [ta, tu] = taker.shift();
    const [ga, gu] = giver.shift();

    const minAmt = Math.min(ta, ga);
    settlements.push({ from: gu, to: tu, amount: minAmt });

    if (ta > minAmt) taker.unshift([ta - minAmt, tu]);
    if (ga > minAmt) giver.unshift([ga - minAmt, gu]);
  }

  // Store new settlements as records
  for (const settlement of settlements) {
    await ExpenseSheet.create({
      userId: settlement.from,
      payerId: settlement.to,
      groupId,
      amountToPay: settlement.amount,
      settled: false
    });
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
