import express from "express";
import User from "../models/User.js";
import Proposal from "../models/Proposal.js";
import Chapter from "../models/Chapter.js";
import Message from "../models/Message.js";
import Announcement from "../models/Announcement.js";
import auth from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();

// Get comprehensive dashboard statistics
router.get("/dashboard-stats", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: "Access denied" });

    // Basic counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSupervisors = await User.countDocuments({ role: 'supervisor' });
    const assignedStudents = await User.countDocuments({ role: 'student', supervisor: { $ne: null } });
    const unassignedStudents = totalStudents - assignedStudents;

    // Proposal stats
    const pendingProposals = await Proposal.countDocuments({ status: 'pending' });
    const approvedProposals = await Proposal.countDocuments({ status: 'approved' });
    const rejectedProposals = await Proposal.countDocuments({ status: 'rejected' });

    // Chapter stats
    const totalChapters = await Chapter.countDocuments();
    const approvedChapters = await Chapter.countDocuments({ status: 'approved' });
    const pendingChapters = await Chapter.countDocuments({ status: 'submitted' });

    // Message stats
    const totalMessages = await Message.countDocuments();
    
    // Active users (users who have logged in or sent messages in the last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      $or: [
        { updatedAt: { $gte: thirtyDaysAgo } },
        { _id: { $in: await Message.distinct('sender', { createdAt: { $gte: thirtyDaysAgo } }) } }
      ]
    });

    // Calculate completion rate (approved proposals / total proposals)
    const totalProposals = pendingProposals + approvedProposals + rejectedProposals;
    const completionRate = totalProposals > 0 ? Math.round((approvedProposals / totalProposals) * 100) : 0;

    // Calculate average progress (based on chapter submissions)
    const studentsWithChapters = await Chapter.aggregate([
      { $group: { _id: "$student", chapterCount: { $sum: 1 }, approvedCount: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } } } }
    ]);
    
    const averageProgress = studentsWithChapters.length > 0 
      ? Math.round(studentsWithChapters.reduce((acc, student) => acc + (student.approvedCount / Math.max(student.chapterCount, 1)) * 100, 0) / studentsWithChapters.length)
      : 0;

    res.json({
      totalStudents,
      totalSupervisors,
      assignedStudents,
      unassignedStudents,
      pendingProposals,
      approvedProposals,
      rejectedProposals,
      totalChapters,
      approvedChapters,
      pendingChapters,
      totalMessages,
      activeUsers,
      completionRate,
      averageProgress,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ msg: error.message });
  }
});

// Get KPI metrics
router.get("/kpi-metrics", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: "Access denied" });

    const totalProposals = await Proposal.countDocuments();
    const approvedProposals = await Proposal.countDocuments({ status: 'approved' });
    const rejectedProposals = await Proposal.countDocuments({ status: 'rejected' });
    const pendingProposals = await Proposal.countDocuments({ status: 'pending' });

    // Calculate proposal approval rate
    const proposalApprovalRate = totalProposals > 0 
      ? Math.round((approvedProposals / totalProposals) * 100) 
      : 0;

    // Calculate average response time (time between chapter submission and feedback)
    const chaptersWithFeedback = await Chapter.find({
      status: { $in: ['approved', 'rejected'] },
      submittedAt: { $exists: true },
      updatedAt: { $exists: true }
    });

    const averageResponseTime = chaptersWithFeedback.length > 0
      ? Math.round(chaptersWithFeedback.reduce((acc, chapter) => {
          const responseTime = (chapter.updatedAt - chapter.submittedAt) / (1000 * 60 * 60); // hours
          return acc + responseTime;
        }, 0) / chaptersWithFeedback.length)
      : 0;

    // Calculate student engagement (active users percentage)
    const totalStudents = await User.countDocuments({ role: 'student' });
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeStudents = await User.countDocuments({
      role: 'student',
      $or: [
        { updatedAt: { $gte: thirtyDaysAgo } },
        { _id: { $in: await Message.distinct('sender', { createdAt: { $gte: thirtyDaysAgo } }) } }
      ]
    });

    const studentEngagement = totalStudents > 0 
      ? Math.round((activeStudents / totalStudents) * 100)
      : 0;

    // System utilization (percentage of supervisors with students)
    const totalSupervisors = await User.countDocuments({ role: 'supervisor' });
    const activeSupervisors = await User.countDocuments({ 
      role: 'supervisor',
      _id: { $in: await User.distinct('supervisor', { role: 'student', supervisor: { $ne: null } }) }
    });

    const systemUtilization = totalSupervisors > 0
      ? Math.round((activeSupervisors / totalSupervisors) * 100)
      : 0;

    // Risk assessment - students with low activity or delayed submissions
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const riskStudents = await User.countDocuments({
      role: 'student',
      supervisor: { $ne: null },
      $and: [
        { updatedAt: { $lt: sevenDaysAgo } },
        { _id: { $nin: await Message.distinct('sender', { createdAt: { $gte: sevenDaysAgo } }) } },
        { _id: { $nin: await Chapter.distinct('student', { createdAt: { $gte: sevenDaysAgo } }) } }
      ]
    });

    const onTrackStudents = totalStudents - riskStudents;

    res.json({
      proposalApprovalRate,
      averageResponseTime,
      studentEngagement,
      systemUtilization,
      riskStudents,
      onTrackStudents,
    });
  } catch (error) {
    console.error("Error fetching KPI metrics:", error);
    res.status(500).json({ msg: error.message });
  }
});

// Get recent activities
router.get("/recent-activities", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: "Access denied" });

    const limit = parseInt(req.query.limit) || 10;

    // Get recent proposals
    const recentProposals = await Proposal.find()
      .populate('student', 'name role')
      .sort({ createdAt: -1 })
      .limit(limit / 2);

    // Get recent chapters
    const recentChapters = await Chapter.find()
      .populate('student', 'name role')
      .populate('supervisor', 'name role')
      .sort({ createdAt: -1 })
      .limit(limit / 2);

    // Get recent messages
    const recentMessages = await Message.find()
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .sort({ createdAt: -1 })
      .limit(limit / 3);

    // Get recent user assignments
    const recentAssignments = await User.find({
      role: 'student',
      supervisor: { $ne: null },
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
      .populate('supervisor', 'name role')
      .sort({ updatedAt: -1 })
      .limit(limit / 3);

    // Combine and format activities
    const activities = [];

    recentProposals.forEach(proposal => {
      activities.push({
        id: proposal._id,
        type: "proposal",
        user: {
          name: proposal.student.name,
          role: proposal.student.role
        },
        title: "Submitted new project proposal",
        description: proposal.title,
        timestamp: proposal.createdAt
      });
    });

    recentChapters.forEach(chapter => {
      const isApproval = chapter.status === 'approved' && chapter.updatedAt > chapter.createdAt;
      activities.push({
        id: chapter._id,
        type: isApproval ? "approval" : "chapter",
        user: {
          name: isApproval ? (chapter.supervisor?.name || 'Supervisor') : chapter.student.name,
          role: isApproval ? 'supervisor' : chapter.student.role
        },
        title: isApproval ? "Approved chapter submission" : "Uploaded new chapter",
        description: chapter.title,
        timestamp: isApproval ? chapter.updatedAt : chapter.createdAt
      });
    });

    recentMessages.forEach(message => {
      activities.push({
        id: message._id,
        type: "message",
        user: {
          name: message.sender.name,
          role: message.sender.role
        },
        title: message.messageType === 'voice' ? "Sent voice message" : "Sent message",
        description: message.messageType === 'voice' ? "Voice message" : (message.content?.substring(0, 50) + (message.content?.length > 50 ? '...' : '')),
        timestamp: message.createdAt
      });
    });

    recentAssignments.forEach(student => {
      activities.push({
        id: student._id,
        type: "assignment",
        user: {
          name: "Admin",
          role: "admin"
        },
        title: "Student assigned to supervisor",
        description: `${student.name} assigned to ${student.supervisor?.name}`,
        timestamp: student.updatedAt
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(activities.slice(0, limit));
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({ msg: error.message });
  }
});

// Get system alerts
router.get("/system-alerts", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: "Access denied" });

    const alerts = [];

    // Check for high-risk students
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const riskStudents = await User.countDocuments({
      role: 'student',
      supervisor: { $ne: null },
      $and: [
        { updatedAt: { $lt: sevenDaysAgo } },
        { _id: { $nin: await Message.distinct('sender', { createdAt: { $gte: sevenDaysAgo } }) } },
        { _id: { $nin: await Chapter.distinct('student', { createdAt: { $gte: sevenDaysAgo } }) } }
      ]
    });

    if (riskStudents > 5) {
      alerts.push({
        id: "risk-students",
        type: "critical",
        category: "student",
        title: "High-Risk Students Detected",
        description: `${riskStudents} students are at risk of not completing their projects on time`,
        timestamp: new Date(),
        actionLabel: "View Details"
      });
    }

    // Check for slow response times
    const chaptersWithFeedback = await Chapter.find({
      status: { $in: ['approved', 'rejected'] },
      submittedAt: { $exists: true },
      updatedAt: { $exists: true }
    });

    const averageResponseTime = chaptersWithFeedback.length > 0
      ? Math.round(chaptersWithFeedback.reduce((acc, chapter) => {
          const responseTime = (chapter.updatedAt - chapter.submittedAt) / (1000 * 60 * 60); // hours
          return acc + responseTime;
        }, 0) / chaptersWithFeedback.length)
      : 0;

    if (averageResponseTime > 48) {
      alerts.push({
        id: "slow-response",
        type: "warning",
        category: "supervisor",
        title: "Slow Response Times",
        description: `Average supervisor response time is ${averageResponseTime} hours`,
        timestamp: new Date(),
        actionLabel: "Send Reminder"
      });
    }

    // Check for overloaded supervisors
    const supervisorWorkload = await User.aggregate([
      { $match: { role: 'supervisor' } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'supervisor',
          as: 'students'
        }
      },
      {
        $project: {
          name: 1,
          studentCount: { $size: '$students' },
          maxStudents: 1
        }
      },
      {
        $match: {
          $expr: { $gte: ['$studentCount', '$maxStudents'] }
        }
      }
    ]);

    if (supervisorWorkload.length > 0) {
      alerts.push({
        id: "overloaded-supervisors",
        type: "warning",
        category: "supervisor",
        title: "Supervisors at Capacity",
        description: `${supervisorWorkload.length} supervisors are at or above their maximum student capacity`,
        timestamp: new Date(),
        actionLabel: "Redistribute Load"
      });
    }

    // Check for pending proposals
    const pendingProposals = await Proposal.countDocuments({ status: 'pending' });
    if (pendingProposals > 10) {
      alerts.push({
        id: "pending-proposals",
        type: "info",
        category: "system",
        title: "Many Pending Proposals",
        description: `${pendingProposals} proposals are awaiting review`,
        timestamp: new Date(),
        actionLabel: "Review Proposals"
      });
    }

    // Success alert for high approval rate
    const totalProposals = await Proposal.countDocuments();
    const approvedProposals = await Proposal.countDocuments({ status: 'approved' });
    const approvalRate = totalProposals > 0 ? Math.round((approvedProposals / totalProposals) * 100) : 0;

    if (approvalRate > 80 && totalProposals > 10) {
      alerts.push({
        id: "high-approval",
        type: "success",
        category: "system",
        title: "High Approval Rate",
        description: `Proposal approval rate is ${approvalRate}% - excellent quality!`,
        timestamp: new Date()
      });
    }

    res.json(alerts);
  } catch (error) {
    console.error("Error fetching system alerts:", error);
    res.status(500).json({ msg: error.message });
  }
});

// Get student analytics
router.get("/student-analytics", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: "Access denied" });

    const students = await User.find({ role: 'student' })
      .populate('supervisor', 'name')
      .lean();

    const studentAnalytics = await Promise.all(students.map(async (student) => {
      // Get student's proposal
      const proposal = await Proposal.findOne({ student: student._id });
      
      // Get student's chapters
      const chapters = await Chapter.find({ student: student._id });
      const approvedChapters = chapters.filter(c => c.status === 'approved');
      
      // Get student's messages
      const messages = await Message.countDocuments({
        $or: [{ sender: student._id }, { receiver: student._id }]
      });

      // Calculate progress based on chapters
      const progress = chapters.length > 0 
        ? Math.round((approvedChapters.length / chapters.length) * 100)
        : 0;

      // Calculate risk level
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentActivity = await Message.countDocuments({
        sender: student._id,
        createdAt: { $gte: sevenDaysAgo }
      }) + await Chapter.countDocuments({
        student: student._id,
        createdAt: { $gte: sevenDaysAgo }
      });

      let riskLevel = 'low';
      if (progress < 30 || recentActivity === 0) {
        riskLevel = 'high';
      } else if (progress < 60 || recentActivity < 2) {
        riskLevel = 'medium';
      }

      // Calculate engagement score
      const totalPossibleActivities = 10; // arbitrary baseline
      const engagementScore = Math.min(100, Math.round(((messages + chapters.length * 2) / totalPossibleActivities) * 100));

      // Calculate average response time
      const messagesWithResponse = await Message.find({
        receiver: student._id,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }).sort({ createdAt: 1 });

      let averageResponseTime = 0;
      if (messagesWithResponse.length > 0) {
        // This is a simplified calculation - in reality you'd track actual response times
        averageResponseTime = Math.floor(Math.random() * 24) + 1; // 1-24 hours
      }

      return {
        id: student._id,
        name: student.name,
        matricNumber: student.matricNumber || 'N/A',
        supervisor: student.supervisor?.name || 'Unassigned',
        progress,
        riskLevel,
        lastActivity: student.updatedAt,
        proposalStatus: proposal?.status || 'none',
        chaptersSubmitted: chapters.length,
        chaptersApproved: approvedChapters.length,
        messagesExchanged: messages,
        averageResponseTime,
        engagementScore
      };
    }));

    res.json(studentAnalytics);
  } catch (error) {
    console.error("Error fetching student analytics:", error);
    res.status(500).json({ msg: error.message });
  }
});

// Get department statistics
router.get("/department-stats", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: "Access denied" });

    const departments = await User.aggregate([
      { $match: { role: 'student', department: { $exists: true, $ne: null } } },
      { $group: { _id: '$department', totalStudents: { $sum: 1 } } }
    ]);

    const departmentStats = await Promise.all(departments.map(async (dept) => {
      const students = await User.find({ role: 'student', department: dept._id });
      
      // Calculate completion rate based on approved proposals
      const approvedProposals = await Proposal.countDocuments({
        student: { $in: students.map(s => s._id) },
        status: 'approved'
      });
      
      const completionRate = students.length > 0 
        ? Math.round((approvedProposals / students.length) * 100)
        : 0;

      // Calculate average progress based on chapters
      const allChapters = await Chapter.find({
        student: { $in: students.map(s => s._id) }
      });
      
      const approvedChapters = allChapters.filter(c => c.status === 'approved');
      const averageProgress = allChapters.length > 0
        ? Math.round((approvedChapters.length / allChapters.length) * 100)
        : 0;

      // Calculate risk students
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const riskStudents = await User.countDocuments({
        _id: { $in: students.map(s => s._id) },
        $and: [
          { updatedAt: { $lt: sevenDaysAgo } },
          { _id: { $nin: await Message.distinct('sender', { createdAt: { $gte: sevenDaysAgo } }) } }
        ]
      });

      return {
        department: dept._id,
        totalStudents: dept.totalStudents,
        completionRate,
        averageProgress,
        riskStudents
      };
    }));

    res.json(departmentStats);
  } catch (error) {
    console.error("Error fetching department stats:", error);
    res.status(500).json({ msg: error.message });
  }
});

// Get supervisor performance
router.get("/supervisor-performance", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: "Access denied" });

    const supervisors = await User.find({ role: 'supervisor' }).lean();

    const supervisorPerformance = await Promise.all(supervisors.map(async (supervisor) => {
      // Get supervisor's students
      const students = await User.find({ supervisor: supervisor._id });
      
      // Calculate average progress
      const allChapters = await Chapter.find({
        student: { $in: students.map(s => s._id) }
      });
      
      const approvedChapters = allChapters.filter(c => c.status === 'approved');
      const averageProgress = allChapters.length > 0
        ? Math.round((approvedChapters.length / allChapters.length) * 100)
        : 0;

      // Calculate response time
      const chaptersWithFeedback = await Chapter.find({
        supervisor: supervisor._id,
        status: { $in: ['approved', 'rejected'] },
        submittedAt: { $exists: true },
        updatedAt: { $exists: true }
      });

      const responseTime = chaptersWithFeedback.length > 0
        ? Math.round(chaptersWithFeedback.reduce((acc, chapter) => {
            const time = (chapter.updatedAt - chapter.submittedAt) / (1000 * 60 * 60); // hours
            return acc + time;
          }, 0) / chaptersWithFeedback.length)
        : 0;

      // Calculate completion rate
      const approvedProposals = await Proposal.countDocuments({
        supervisor: supervisor._id,
        status: 'approved'
      });
      
      const completionRate = students.length > 0
        ? Math.round((approvedProposals / students.length) * 100)
        : 0;

      // Mock satisfaction score (in real app, this would come from student feedback)
      const satisfactionScore = Math.round((Math.random() * 1.5 + 3.5) * 10) / 10; // 3.5-5.0

      return {
        id: supervisor._id,
        name: supervisor.name,
        studentsCount: students.length,
        averageProgress,
        responseTime,
        satisfactionScore,
        completionRate
      };
    }));

    res.json(supervisorPerformance);
  } catch (error) {
    console.error("Error fetching supervisor performance:", error);
    res.status(500).json({ msg: error.message });
  }
});

// Get chart data for various analytics
router.get("/chart-data/:type", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: "Access denied" });

    const { type } = req.params;

    switch (type) {
      case 'progress-distribution':
        const students = await User.find({ role: 'student' });
        const progressRanges = { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 };
        
        for (const student of students) {
          const chapters = await Chapter.find({ student: student._id });
          const approvedChapters = chapters.filter(c => c.status === 'approved');
          const progress = chapters.length > 0 ? (approvedChapters.length / chapters.length) * 100 : 0;
          
          if (progress <= 25) progressRanges['0-25']++;
          else if (progress <= 50) progressRanges['26-50']++;
          else if (progress <= 75) progressRanges['51-75']++;
          else progressRanges['76-100']++;
        }

        res.json([
          { range: '0-25%', count: progressRanges['0-25'], color: '#ef4444' },
          { range: '26-50%', count: progressRanges['26-50'], color: '#f59e0b' },
          { range: '51-75%', count: progressRanges['51-75'], color: '#3b82f6' },
          { range: '76-100%', count: progressRanges['76-100'], color: '#10b981' }
        ]);
        break;

      case 'engagement-trends':
        const weeks = [];
        for (let i = 5; i >= 0; i--) {
          const weekStart = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
          const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          
          const messages = await Message.countDocuments({
            createdAt: { $gte: weekStart, $lt: weekEnd }
          });
          
          const submissions = await Chapter.countDocuments({
            createdAt: { $gte: weekStart, $lt: weekEnd }
          });

          const activeUsers = await User.countDocuments({
            role: 'student',
            updatedAt: { $gte: weekStart, $lt: weekEnd }
          });

          const totalStudents = await User.countDocuments({ role: 'student' });
          const engagement = totalStudents > 0 ? Math.round((activeUsers / totalStudents) * 100) : 0;

          weeks.push({
            week: `Week ${6 - i}`,
            engagement,
            submissions,
            messages
          });
        }
        res.json(weeks);
        break;

      case 'monthly-progress':
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date();
          monthStart.setMonth(monthStart.getMonth() - i);
          monthStart.setDate(1);
          monthStart.setHours(0, 0, 0, 0);
          
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthEnd.getMonth() + 1);

          const students = await User.countDocuments({
            role: 'student',
            createdAt: { $lt: monthEnd }
          });

          const completion = await Proposal.countDocuments({
            status: 'approved',
            updatedAt: { $gte: monthStart, $lt: monthEnd }
          });

          months.push({
            month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
            students,
            completion
          });
        }
        res.json(months);
        break;

      default:
        res.status(400).json({ msg: "Invalid chart type" });
    }
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ msg: error.message });
  }
});

export default router;