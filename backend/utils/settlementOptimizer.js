const Expense = require('../model/expenseModel');
const ExpenseSheet = require('../model/expenseSheetModel');
const GroupMembership = require('../model/groupMembershipModel');

class SettlementOptimizer {
    constructor() {
        this.maxHeap = class MaxHeap {
            constructor() {
                this.heap = [];
            }

            push(amount, userId) {
                this.heap.push({ amount, userId });
                this._bubbleUp();
            }

            pop() {
                if (this.heap.length === 0) return null;
                
                const max = this.heap[0];
                const last = this.heap.pop();
                
                if (this.heap.length > 0) {
                    this.heap[0] = last;
                    this._bubbleDown();
                }
                
                return max;
            }

            peek() {
                return this.heap.length > 0 ? this.heap[0] : null;
            }

            isEmpty() {
                return this.heap.length === 0;
            }

            _bubbleUp() {
                let index = this.heap.length - 1;
                while (index > 0) {
                    const parentIndex = Math.floor((index - 1) / 2);
                    if (this.heap[parentIndex].amount >= this.heap[index].amount) break;
                    
                    [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
                    index = parentIndex;
                }
            }

            _bubbleDown() {
                let index = 0;
                while (true) {
                    let largest = index;
                    const leftChild = 2 * index + 1;
                    const rightChild = 2 * index + 2;

                    if (leftChild < this.heap.length && this.heap[leftChild].amount > this.heap[largest].amount) {
                        largest = leftChild;
                    }

                    if (rightChild < this.heap.length && this.heap[rightChild].amount > this.heap[largest].amount) {
                        largest = rightChild;
                    }

                    if (largest === index) break;

                    [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
                    index = largest;
                }
            }
        };
    }

    async calculateOptimalSettlements(groupId) {
        try {
            // Step 1: Fetch all expenses for the group
            const expenses = await Expense.find({ groupId }).populate('payers.userId', 'name');
            
            // Step 2: Build net balance map
            const netBalance = new Map();
            
            for (const expense of expenses) {
                // Handle payers (people who paid)
                for (const payer of expense.payers) {
                    const userId = payer.userId._id.toString();
                    const currentBalance = netBalance.get(userId) || 0;
                    netBalance.set(userId, currentBalance + payer.amount);
                }
                
                // Handle split members (people who owe)
                const splitAmount = expense.amount / expense.splitMembers.length;
                for (const memberId of expense.splitMembers) {
                    const userId = memberId.toString();
                    const currentBalance = netBalance.get(userId) || 0;
                    netBalance.set(userId, currentBalance - splitAmount);
                }
            }

            // Step 3: Create two heaps - givers 
            const giverHeap = new this.maxHeap();
            const takerHeap = new this.maxHeap();

            for (const [userId, balance] of netBalance.entries()) {
                if (balance > 0) {
                    // This person should receive money
                    takerHeap.push(balance, userId);
                } else if (balance < 0) {
                    
                    giverHeap.push(-balance, userId); // Store positive value for heap
                }
            }

            // Step 4: Process settlements
            const settlements = [];
            
            while (!giverHeap.isEmpty() && !takerHeap.isEmpty()) {
                const giver = giverHeap.pop();
                const taker = takerHeap.pop();
                
                const settledAmount = Math.min(giver.amount, taker.amount);
                
                settlements.push({
                    from: giver.userId,
                    to: taker.userId,
                    amount: settledAmount
                });
                
                // If there's remaining amount, push back to respective heaps
                if (giver.amount > settledAmount) {
                    giverHeap.push(giver.amount - settledAmount, giver.userId);
                }
                
                if (taker.amount > settledAmount) {
                    takerHeap.push(taker.amount - settledAmount, taker.userId);
                }
            }

            return {
                settlements,
                netBalances: Object.fromEntries(netBalance),
                totalTransactions: settlements.length
            };

        } catch (error) {
            console.error('Error calculating optimal settlements:', error);
            throw error;
        }
    }

    // Helper method to get current balances for a group
    async getGroupBalances(groupId) {
        try {
            const expenses = await Expense.find({ groupId }).populate('payers.userId', 'name');
            const netBalance = new Map();
            
            for (const expense of expenses) {
                // Handle payers
                for (const payer of expense.payers) {
                    const userId = payer.userId._id.toString();
                    const currentBalance = netBalance.get(userId) || 0;
                    netBalance.set(userId, currentBalance + payer.amount);
                }
                
                // Handle split members
                const splitAmount = expense.amount / expense.splitMembers.length;
                for (const memberId of expense.splitMembers) {
                    const userId = memberId.toString();
                    const currentBalance = netBalance.get(userId) || 0;
                    netBalance.set(userId, currentBalance - splitAmount);
                }
            }

            return Object.fromEntries(netBalance);
        } catch (error) {
            console.error('Error getting group balances:', error);
            throw error;
        }
    }
}

module.exports = new SettlementOptimizer(); 
