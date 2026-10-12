import Homework from '../models/homework.model.js';
import AssignmentSubmission from '../models/assignmentSubmission.model.js';
import StudyMaterial from '../models/studyMaterial.model.js';
import { uploadToCloudStorage } from '../utils/cloudStorage.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Create Homework Assignment
 */
export const createHomework = async (req, res, next) => {
  try {
    const {
      schoolId = req.user?.schoolId || 'SCHOOL_MAIN',
      branchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS',
      academicYearId = 'AY_2026_27',
      classId,
      sectionId,
      subjectId,
      teacherId,
      title,
      instructions,
      dueDate,
      attachmentFiles = [],
    } = req.body;

    if (!classId || !sectionId || !subjectId || !teacherId || !title || !instructions || !dueDate) {
      return sendError(res, 'Missing required fields: classId, sectionId, subjectId, teacherId, title, instructions, dueDate', null, 400);
    }

    const processedAttachments = [];
    if (attachmentFiles && Array.isArray(attachmentFiles)) {
      for (const fileObj of attachmentFiles) {
        const cloudResult = await uploadToCloudStorage(fileObj, 'homework_attachments');
        processedAttachments.push(cloudResult);
      }
    }

    const homeworkDoc = await Homework.create({
      schoolId,
      branchId,
      academicYearId,
      classId,
      sectionId,
      subjectId,
      teacherId,
      title,
      instructions,
      dueDate: new Date(dueDate),
      attachments: processedAttachments,
      status: 'ASSIGNED',
    });

    return sendSuccess(res, 'Homework created successfully', homeworkDoc, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Homework List with Relational Filtering
 */
export const getHomeworkList = async (req, res, next) => {
  try {
    const { schoolId, classId, sectionId, subjectId, teacherId, status } = req.query;

    const query = {};
    query.schoolId = schoolId || req.user?.schoolId || 'SCHOOL_MAIN';
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (subjectId) query.subjectId = subjectId;
    if (teacherId) query.teacherId = teacherId;
    if (status) query.status = status;

    const homeworks = await Homework.find(query).sort({ createdAt: -1 });
    return sendSuccess(res, 'Homework list fetched', homeworks);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Homework Details & Student Submissions
 */
export const getHomeworkDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const homework = await Homework.findById(id);
    if (!homework) return sendError(res, 'Homework not found', null, 404);

    const submissions = await AssignmentSubmission.find({ homeworkId: id });
    return sendSuccess(res, 'Homework details fetched', { homework, submissions });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Homework Assignment (Student)
 */
export const submitAssignment = async (req, res, next) => {
  try {
    const { homeworkId, studentId, submissionText, attachmentFiles = [] } = req.body;

    if (!homeworkId || !studentId) {
      return sendError(res, 'homeworkId and studentId are required for submission', null, 400);
    }

    const processedAttachments = [];
    if (attachmentFiles && Array.isArray(attachmentFiles)) {
      for (const fileObj of attachmentFiles) {
        const cloudResult = await uploadToCloudStorage(fileObj, 'student_submissions');
        processedAttachments.push(cloudResult);
      }
    }

    const submissionDoc = await AssignmentSubmission.findOneAndUpdate(
      { homeworkId, studentId },
      {
        submissionDate: new Date(),
        submissionText: submissionText || '',
        attachments: processedAttachments,
        status: 'SUBMITTED',
      },
      { upsert: true, new: true }
    );

    return sendSuccess(res, 'Assignment submitted successfully', submissionDoc);
  } catch (error) {
    next(error);
  }
};

/**
 * Grade / Evaluate Assignment Submission (Teacher)
 */
export const evaluateSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { grade, teacherFeedback, teacherId } = req.body;

    if (!grade) {
      return sendError(res, 'Grade is required for evaluation', null, 400);
    }

    const updatedDoc = await AssignmentSubmission.findByIdAndUpdate(
      submissionId,
      {
        grade,
        teacherFeedback: teacherFeedback || '',
        evaluatedBy: teacherId || req.user?._id,
        evaluatedAt: new Date(),
        status: 'EVALUATED',
      },
      { new: true }
    );
    if (!updatedDoc) return sendError(res, 'Submission record not found', null, 404);

    return sendSuccess(res, 'Assignment submission evaluated & graded successfully', updatedDoc);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Study Material Document
 */
export const createStudyMaterial = async (req, res, next) => {
  try {
    const {
      schoolId = req.user?.schoolId || 'SCHOOL_MAIN',
      branchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS',
      academicYearId = 'AY_2026_27',
      classId,
      sectionId = '',
      subjectId,
      uploadedBy,
      title,
      description = '',
      category = 'NOTES',
      attachmentFiles = [],
    } = req.body;

    if (!classId || !subjectId || !uploadedBy || !title) {
      return sendError(res, 'Missing required fields: classId, subjectId, uploadedBy, title', null, 400);
    }

    const processedAttachments = [];
    if (attachmentFiles && Array.isArray(attachmentFiles)) {
      for (const fileObj of attachmentFiles) {
        const cloudResult = await uploadToCloudStorage(fileObj, 'study_materials');
        processedAttachments.push(cloudResult);
      }
    }

    const materialDoc = await StudyMaterial.create({
      schoolId,
      branchId,
      academicYearId,
      classId,
      sectionId,
      subjectId,
      uploadedBy,
      title,
      description,
      category,
      attachments: processedAttachments,
    });

    return sendSuccess(res, 'Study material uploaded successfully', materialDoc, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Study Materials Repository List
 */
export const getStudyMaterials = async (req, res, next) => {
  try {
    const { schoolId, classId, sectionId, subjectId, category } = req.query;

    const query = {};
    query.schoolId = schoolId || req.user?.schoolId || 'SCHOOL_MAIN';
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (subjectId) query.subjectId = subjectId;
    if (category) query.category = category;

    const materials = await StudyMaterial.find(query).sort({ createdAt: -1 });
    return sendSuccess(res, 'Study materials fetched', materials);
  } catch (error) {
    next(error);
  }
};
