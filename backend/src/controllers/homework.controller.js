import mongoose from 'mongoose';
import Homework from '../models/homework.model.js';
import AssignmentSubmission from '../models/assignmentSubmission.model.js';
import StudyMaterial from '../models/studyMaterial.model.js';
import { uploadToCloudStorage } from '../utils/cloudStorage.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// In-Memory Dev Fallback Stores (Empty by default for real user data)
let mockHomeworks = [];
let mockSubmissions = [];
let mockStudyMaterials = [];

/**
 * Create Homework Assignment
 */
export const createHomework = async (req, res) => {
  try {
    const {
      schoolId = 'SCHOOL_GREENWOOD_MAIN',
      branchId = 'BRANCH_MAIN_CAMPUS',
      academicYearId = 'ay_2026_27',
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
      return sendError(res, 'Missing required fields: classId, sectionId, subjectId, teacherId, title, instructions, dueDate', 400);
    }

    // Process file attachments through Cloud Storage Architecture
    const processedAttachments = [];
    if (attachmentFiles && Array.isArray(attachmentFiles)) {
      for (const fileObj of attachmentFiles) {
        const cloudResult = await uploadToCloudStorage(fileObj, 'homework_attachments');
        processedAttachments.push(cloudResult);
      }
    }

    let homeworkDoc;
    if (mongoose.connection.readyState === 1) {
      homeworkDoc = await Homework.create({
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
    } else {
      homeworkDoc = {
        _id: `hw_${Date.now()}`,
        schoolId,
        branchId,
        academicYearId,
        classId,
        sectionId,
        subjectId,
        teacherId,
        title,
        instructions,
        dueDate,
        attachments: processedAttachments,
        status: 'ASSIGNED',
        createdAt: new Date().toISOString(),
      };
      mockHomeworks.unshift(homeworkDoc);
    }

    return sendSuccess(res, 'Homework created successfully with relational links & cloud storage attachments', homeworkDoc, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get Homework List with Relational Filtering
 */
export const getHomeworkList = async (req, res) => {
  try {
    const { schoolId, classId, sectionId, subjectId, teacherId, status } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (schoolId) query.schoolId = schoolId;
      if (classId) query.classId = classId;
      if (sectionId) query.sectionId = sectionId;
      if (subjectId) query.subjectId = subjectId;
      if (teacherId) query.teacherId = teacherId;
      if (status) query.status = status;

      const homeworks = await Homework.find(query).sort({ createdAt: -1 });
      return sendSuccess(res, 'Homework list fetched', homeworks);
    } else {
      let filtered = [...mockHomeworks];
      if (schoolId) filtered = filtered.filter((h) => h.schoolId === schoolId);
      if (classId) filtered = filtered.filter((h) => h.classId === classId);
      if (sectionId) filtered = filtered.filter((h) => h.sectionId === sectionId);
      if (subjectId) filtered = filtered.filter((h) => h.subjectId === subjectId);
      if (teacherId) filtered = filtered.filter((h) => h.teacherId === teacherId);
      if (status) filtered = filtered.filter((h) => h.status === status);

      return sendSuccess(res, 'Homework list fetched (Dev Store)', filtered);
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get Homework Details & Student Submissions
 */
export const getHomeworkDetails = async (req, res) => {
  try {
    const { id } = req.params;

    let homework;
    let submissions = [];

    if (mongoose.connection.readyState === 1) {
      homework = await Homework.findById(id);
      if (!homework) return sendError(res, 'Homework not found', 404);
      submissions = await AssignmentSubmission.find({ homeworkId: id });
    } else {
      homework = mockHomeworks.find((h) => h._id === id);
      if (!homework) return sendError(res, 'Homework not found', 404);
      submissions = mockSubmissions.filter((s) => s.homeworkId === id);
    }

    return sendSuccess(res, 'Homework details fetched', { homework, submissions });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Submit Homework Assignment (Student)
 */
export const submitAssignment = async (req, res) => {
  try {
    const { homeworkId, studentId, submissionText, attachmentFiles = [] } = req.body;

    if (!homeworkId || !studentId) {
      return sendError(res, 'homeworkId and studentId are required for submission', 400);
    }

    // Process file attachments through Cloud Storage Utility
    const processedAttachments = [];
    if (attachmentFiles && Array.isArray(attachmentFiles)) {
      for (const fileObj of attachmentFiles) {
        const cloudResult = await uploadToCloudStorage(fileObj, 'student_submissions');
        processedAttachments.push(cloudResult);
      }
    }

    let submissionDoc;
    if (mongoose.connection.readyState === 1) {
      submissionDoc = await AssignmentSubmission.findOneAndUpdate(
        { homeworkId, studentId },
        {
          submissionDate: new Date(),
          submissionText: submissionText || '',
          attachments: processedAttachments,
          status: 'SUBMITTED',
        },
        { upsert: true, new: true }
      );
    } else {
      const existingIdx = mockSubmissions.findIndex((s) => s.homeworkId === homeworkId && s.studentId === studentId);
      if (existingIdx !== -1) {
        mockSubmissions[existingIdx] = {
          ...mockSubmissions[existingIdx],
          submissionDate: new Date().toISOString(),
          submissionText: submissionText || mockSubmissions[existingIdx].submissionText,
          attachments: processedAttachments.length > 0 ? processedAttachments : mockSubmissions[existingIdx].attachments,
          status: 'SUBMITTED',
        };
        submissionDoc = mockSubmissions[existingIdx];
      } else {
        submissionDoc = {
          _id: `subm_${Date.now()}`,
          homeworkId,
          studentId,
          submissionDate: new Date().toISOString(),
          submissionText: submissionText || '',
          attachments: processedAttachments,
          status: 'SUBMITTED',
          grade: null,
          teacherFeedback: '',
          evaluatedBy: null,
        };
        mockSubmissions.push(submissionDoc);
      }
    }

    return sendSuccess(res, 'Assignment submitted successfully with cloud storage file links', submissionDoc);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Grade / Evaluate Assignment Submission (Teacher)
 */
export const evaluateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, teacherFeedback, teacherId } = req.body;

    if (!grade) {
      return sendError(res, 'Grade is required for evaluation', 400);
    }

    let updatedDoc;
    if (mongoose.connection.readyState === 1) {
      updatedDoc = await AssignmentSubmission.findByIdAndUpdate(
        submissionId,
        {
          grade,
          teacherFeedback: teacherFeedback || '',
          evaluatedBy: teacherId || null,
          evaluatedAt: new Date(),
          status: 'EVALUATED',
        },
        { new: true }
      );
      if (!updatedDoc) return sendError(res, 'Submission record not found', 404);
    } else {
      const subIdx = mockSubmissions.findIndex((s) => s._id === submissionId);
      if (subIdx === -1) return sendError(res, 'Submission record not found', 404);
      mockSubmissions[subIdx] = {
        ...mockSubmissions[subIdx],
        grade,
        teacherFeedback: teacherFeedback || '',
        evaluatedBy: teacherId || 'tch_101',
        evaluatedAt: new Date().toISOString(),
        status: 'EVALUATED',
      };
      updatedDoc = mockSubmissions[subIdx];
    }

    return sendSuccess(res, 'Assignment submission evaluated & graded successfully', updatedDoc);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Create Study Material Document
 */
export const createStudyMaterial = async (req, res) => {
  try {
    const {
      schoolId = 'SCHOOL_GREENWOOD_MAIN',
      branchId = 'BRANCH_MAIN_CAMPUS',
      academicYearId = 'ay_2026_27',
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
      return sendError(res, 'Missing required fields: classId, subjectId, uploadedBy, title', 400);
    }

    const processedAttachments = [];
    if (attachmentFiles && Array.isArray(attachmentFiles)) {
      for (const fileObj of attachmentFiles) {
        const cloudResult = await uploadToCloudStorage(fileObj, 'study_materials');
        processedAttachments.push(cloudResult);
      }
    }

    let materialDoc;
    if (mongoose.connection.readyState === 1) {
      materialDoc = await StudyMaterial.create({
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
    } else {
      materialDoc = {
        _id: `sm_${Date.now()}`,
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
        createdAt: new Date().toISOString(),
      };
      mockStudyMaterials.unshift(materialDoc);
    }

    return sendSuccess(res, 'Study material uploaded successfully to cloud repository', materialDoc, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get Study Materials Repository List
 */
export const getStudyMaterials = async (req, res) => {
  try {
    const { schoolId, classId, sectionId, subjectId, category } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (schoolId) query.schoolId = schoolId;
      if (classId) query.classId = classId;
      if (sectionId) query.sectionId = sectionId;
      if (subjectId) query.subjectId = subjectId;
      if (category) query.category = category;

      const materials = await StudyMaterial.find(query).sort({ createdAt: -1 });
      return sendSuccess(res, 'Study materials fetched', materials);
    } else {
      let filtered = [...mockStudyMaterials];
      if (schoolId) filtered = filtered.filter((m) => m.schoolId === schoolId);
      if (classId) filtered = filtered.filter((m) => m.classId === classId);
      if (sectionId && sectionId !== '') filtered = filtered.filter((m) => m.sectionId === sectionId || m.sectionId === '');
      if (subjectId) filtered = filtered.filter((m) => m.subjectId === subjectId);
      if (category) filtered = filtered.filter((m) => m.category === category);

      return sendSuccess(res, 'Study materials fetched (Dev Store)', filtered);
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
