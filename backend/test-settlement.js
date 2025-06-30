const SettlementOptimizer = require('./utils/settlementOptimizer');

// Test the settlement algorithm with sample data
function testSettlement() {
    console.log('Testing Settlement Algorithm...\n');

    // Sample data similar to your C++ example
    const sampleExpenses = [
        {
            groupId: 'group1',
            description: 'Dinner',
            amount: 100,
            payers: [{ userId: 'user1', amount: 100 }],
            splitMembers: ['user1', 'user2']
        },
        {
            groupId: 'group1',
            description: 'Movie',
            amount: 60,
            payers: [{ userId: 'user1', amount: 60 }],
            splitMembers: ['user1', 'user3']
        },
        {
            groupId: 'group1',
            description: 'Shopping',
            amount: 120,
            payers: [{ userId: 'user3', amount: 120 }],
            splitMembers: ['user2', 'user3']
        },
        {
            groupId: 'group1',
            description: 'Transport',
            amount: 40,
            payers: [{ userId: 'user4', amount: 40 }],
            splitMembers: ['user3', 'user4']
        }
    ];

    // Calculate net balances
    const netBalance = new Map();

    for (const expense of sampleExpenses) {
        // Handle payers
        for (const payer of expense.payers) {
            const userId = payer.userId;
            const currentBalance = netBalance.get(userId) || 0;
            netBalance.set(userId, currentBalance + payer.amount);
        }
        
        // Handle split members
        const splitAmount = expense.amount / expense.splitMembers.length;
        for (const memberId of expense.splitMembers) {
            const userId = memberId;
            const currentBalance = netBalance.get(userId) || 0;
            netBalance.set(userId, currentBalance - splitAmount);
        }
    }

    console.log('Net Balances:');
    for (const [userId, balance] of netBalance.entries()) {
        console.log(`User ${userId}: ${balance > 0 ? '+' : ''}${balance.toFixed(2)}`);
    }

    // Create heaps
    const giverHeap = [];
    const takerHeap = [];

    for (const [userId, balance] of netBalance.entries()) {
        if (balance > 0) {
            takerHeap.push({ amount: balance, userId });
        } else if (balance < 0) {
            giverHeap.push({ amount: -balance, userId });
        }
    }

    giverHeap.sort((a, b) => b.amount - a.amount);
    takerHeap.sort((a, b) => b.amount - a.amount);

    console.log('\nProcessing Settlements:');
    const settlements = [];
    
    while (giverHeap.length > 0 && takerHeap.length > 0) {
        const giver = giverHeap.shift();
        const taker = takerHeap.shift();
        
        const settledAmount = Math.min(giver.amount, taker.amount);
        
        settlements.push({
            from: giver.userId,
            to: taker.userId,
            amount: settledAmount
        });
        
        console.log(`User ${giver.userId} gives ${settledAmount.toFixed(2)} to User ${taker.userId}`);
        
        if (giver.amount > settledAmount) {
            giverHeap.push({ amount: giver.amount - settledAmount, userId: giver.userId });
            giverHeap.sort((a, b) => b.amount - a.amount);
        }
        
        if (taker.amount > settledAmount) {
            takerHeap.push({ amount: taker.amount - settledAmount, userId: taker.userId });
            takerHeap.sort((a, b) => b.amount - a.amount);
        }
    }

    console.log(`\nTotal transactions needed: ${settlements.length}`);
}

testSettlement(); 