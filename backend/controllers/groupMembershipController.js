const GroupMembership = require('../model/groupMembershipModel');
const User = require('../model/userModel');
const Group = require('../model/groupModel');

const addMemberToGroup = async (req, res) => {
  try {
    const { userId, groupId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found with this id' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const existingMembership = await GroupMembership.findOne({ userId, groupId });
    if (existingMembership) {
      return res.status(400).json({ message: 'User is already a member of this group' });
    }

    const membership = await GroupMembership.create({
      userId,
      groupId,
      joinedAt: new Date()
    });

    const populatedMembership = await GroupMembership.findById(membership._id)
      .populate('userId', 'name email')
      .populate('groupId', 'name');

    const groupMembers = await GroupMembership.find({ groupId })
      .populate('userId', '_id name');

    const existingMemberIds = groupMembers.map(member => member.userId._id);
    await User.findByIdAndUpdate(userId, {
      $addToSet: { mutualFriends: { $each: existingMemberIds } }
    });

    for (let member of groupMembers) {
      await User.findByIdAndUpdate(member.userId._id, {
        $addToSet: { mutualFriends: userId }
      });
    }

    res.status(201).json(populatedMembership);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeMemberFromGroup = async (req, res) => {
  try {
    const { userId, groupId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found with this id' });
    }

    const membership = await GroupMembership.findOneAndDelete({ userId, groupId });
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    res.json({ message: 'Member removed from group successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getGroupMembers = async (req, res) => {
  try {
    const memberships = await GroupMembership.find({ groupId: req.params.groupId })
      .populate('userId', 'name email')
      .populate('groupId', 'name')
      .sort({ joinedAt: 1 });

    res.json(memberships);
  } catch (error) {
    console.error('Get group members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserGroups = async (req, res) => {
  try {
    const memberships = await GroupMembership.find({ userId: req.params.userId })
      .populate('groupId');
    // Return only the group objects
    res.json(memberships.map(m => m.groupId));
  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const checkMembership = async (req, res) => {
  try {
    const { userId, groupId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found with this id' });
    }

    const membership = await GroupMembership.findOne({ userId, groupId });

    res.json({
      isMember: !!membership,
      membership: membership ? await membership.populate('userId', 'name email').populate('groupId', 'name') : null
    });
  } catch (error) {
    console.error('Check membership error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addMemberToGroup,
  removeMemberFromGroup,
  getGroupMembers,
  getUserGroups,
  checkMembership
};
