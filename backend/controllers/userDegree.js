async function findDegreeOfConnection(userId, targetId) {
  const User = require('../model/userModel');
  const visited = new Set();
  let queue = [{ id: userId, count: 0 }];

  if (userId.toString() === targetId.toString()) {
    return 1;
  }

  while (queue.length > 0) {
    const { id: currentUserId, count } = queue.shift();
    visited.add(currentUserId.toString());

    let user;
    try {
      user = await User.findById(currentUserId);
    } catch (err) {
      console.error('Error fetching user:', err);
      return -1;
    }

    if (!user) continue;

    if (count >= 3) return 3;

    const mutualFriends = user.mutualFriends || [];

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

  return -1; // No path found within 3 degrees
}

module.exports = findDegreeOfConnection;