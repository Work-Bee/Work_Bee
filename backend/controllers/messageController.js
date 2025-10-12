const Message = require('../models/Message');
const Application = require('../models/Application');
const Job = require('../models/Job');

// Authorization helper: ensure employer or applicant involved in application
async function ensureParticipant(user, applicationId) {
  let app = await Application.findById(applicationId).populate('job').populate('applicant');
  if (!app) return { ok: false, status: 404, message: 'Application not found' };

  const isApplicant = String(app.applicant?._id) === String(user._id);
  // Ensure we have postedBy to verify employer
  let jobPosterId = app.job?.postedBy;
  if (!jobPosterId && app.job?._id) {
    const job = await Job.findById(app.job._id).select('postedBy');
    jobPosterId = job?.postedBy;
  }
  const isEmployer = user.role === 'employer' && jobPosterId && String(jobPosterId) === String(user._id);
  if (!isApplicant && !isEmployer) {
    return { ok: false, status: 403, message: 'Not authorized for this application' };
  }
  return { ok: true, app };
}

exports.getMessages = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const check = await ensureParticipant(req.user, applicationId);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const messages = await Message.find({ application: applicationId })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error('getMessages error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.postMessage = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { body } = req.body;

    if (!body || !body.trim()) return res.status(400).json({ message: 'Message body required' });

    const check = await ensureParticipant(req.user, applicationId);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const msg = await Message.create({
      application: applicationId,
      sender: req.user._id,
      body: body.trim(),
    });
    const populated = await msg.populate('sender', 'name email role');
    res.status(201).json(populated);
  } catch (err) {
    console.error('postMessage error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    // Ensure requester is a participant of the application
    const app = await Application.findById(msg.application).populate('job').populate('applicant');
    if (!app) return res.status(404).json({ message: 'Application not found' });

    let jobPosterId = app.job?.postedBy;
    const isApplicant = String(app.applicant?._id) === String(req.user._id);
    const isEmployer = req.user.role === 'employer' && jobPosterId && String(jobPosterId) === String(req.user._id);
    if (!isApplicant && !isEmployer) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await msg.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error('deleteMessage error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
