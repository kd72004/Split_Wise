async function findDegreeOfConnection(userId, targetId) {
    const User = require('../model/userModel');
    const visited = new Set();
    let queue = [{ id: userId, count: 0 }]; // Start from 0
  
    // Early exit for same user
    if (userId.toString() === targetId.toString()) {
      return 0;
    }
  
    while (queue.length > 0) {
      const { id: currentUserId, count } = queue.shift();
      
      if (count >= 3) continue; // Changed to >= 3
  
      visited.add(currentUserId.toString());
  
      // Fetch user data inside function
      const user = await User.findById(currentUserId);
      const mutualFriends = user?.mutualFriends || [];
  
      for (let friend of mutualFriends) {
        const friendId = friend.toString();
        
        if (friendId === targetId.toString()) {
          return count + 1;
        }
  
        if (!visited.has(friendId)) {
          queue.push({ id: friend, count: count + 1 });
          visited.add(friendId);
        }
      }
    }
  
    return -1;
  }