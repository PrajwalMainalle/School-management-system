import mongoose from 'mongoose';
import GradingScale from '../models/gradingScale.model.js';
import Exam from '../models/exam.model.js';
import ExamMark from '../models/examMark.model.js';
import ReportCard from '../models/reportCard.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// In-Memory Dev Fallback Stores (Empty by default for real user data)
let mockGradingScales = [];
let mockExams = [];
let mockExamMarks = [];
let mockReportCards = [];

/**
 * Helper to resolve Grade & GPA from configurable Grading Scale boundaries
 */
const resolveGradeFromScale = (percentage, gradingScale) => {
  const boundaries = gradingScale?.boundaries || mockGradingScales[0].boundaries;
  const sorted = [...boundaries].sort((a, b) => b.minPercentage - a.minPercentage);

  for (const boundary of sorted) {
    if (percentage >= boundary.minPercentage) {
      return {
        grade: boundary.grade,
        gradePoint: boundary.gradePoint,
        remarks: boundary.remarks,
      };
    }
  }

  return { grade: 'F', gradePoint: 0, remarks: 'Needs Improvement / Fail' };
};

/**
 * Create or Update Configurable Grading Scale
 */
export const createGradingScale = async (req, res) => {
  try {
    const { schoolId = 'SCHOOL_GREENWOOD_MAIN', name, passingPercentage = 35, boundaries = [] } = req.body;

    if (!name || !boundaries.length) {
      return sendError(res, 'Grading scale name and boundaries are required', 400);
    }

    let scaleDoc;
    if (mongoose.connection.readyState === 1) {
      scaleDoc = await GradingScale.create({
        schoolId,
        name,
        passingPercentage,
        boundaries,
      });
    } else {
      scaleDoc = {
        _id: `gs_${Date.now()}`,
        schoolId,
        name,
        passingPercentage,
        boundaries,
        createdAt: new Date().toISOString(),
      };
      mockGradingScales.push(scaleDoc);
    }

    return sendSuccess(res, 'Configurable grading scale created successfully', scaleDoc, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get All Configurable Grading Scales
 */
export const getGradingScales = async (req, res) => {
  try {
    const { schoolId = 'SCHOOL_GREENWOOD_MAIN' } = req.query;

    if (mongoose.connection.readyState === 1) {
      const scales = await GradingScale.find({ schoolId });
      return sendSuccess(res, 'Grading scales fetched', scales);
    } else {
      const scales = mockGradingScales.filter((gs) => gs.schoolId === schoolId);
      return sendSuccess(res, 'Grading scales fetched (Dev Store)', scales);
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Create Exam Configuration
 */
export const createExam = async (req, res) => {
  try {
    const {
      schoolId = 'SCHOOL_GREENWOOD_MAIN',
      branchId = 'BRANCH_MAIN_CAMPUS',
      academicYearId = 'ay_2026_27',
      name,
      examType = 'MID_TERM',
      classId,
      sectionId,
      gradingScaleId,
      subjects = [],
    } = req.body;

    if (!name || !classId || !sectionId || !subjects.length) {
      return sendError(res, 'Exam name, classId, sectionId, and subjects are required', 400);
    }

    let examDoc;
    if (mongoose.connection.readyState === 1) {
      examDoc = await Exam.create({
        schoolId,
        branchId,
        academicYearId,
        name,
        examType,
        classId,
        sectionId,
        gradingScaleId,
        subjects,
        status: 'SCHEDULED',
      });
    } else {
      examDoc = {
        _id: `ex_${Date.now()}`,
        schoolId,
        branchId,
        academicYearId,
        name,
        examType,
        classId,
        sectionId,
        gradingScaleId: gradingScaleId || mockGradingScales[0]._id,
        subjects,
        status: 'SCHEDULED',
        createdAt: new Date().toISOString(),
      };
      mockExams.push(examDoc);
    }

    return sendSuccess(res, 'Exam created successfully', examDoc, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get Exams List
 */
export const getExams = async (req, res) => {
  try {
    const { schoolId = 'SCHOOL_GREENWOOD_MAIN', classId, sectionId } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { schoolId };
      if (classId) query.classId = classId;
      if (sectionId) query.sectionId = sectionId;

      const exams = await Exam.find(query).sort({ createdAt: -1 });
      return sendSuccess(res, 'Exams list fetched', exams);
    } else {
      let filtered = mockExams.filter((e) => e.schoolId === schoolId);
      if (classId) filtered = filtered.filter((e) => e.classId === classId);
      if (sectionId) filtered = filtered.filter((e) => e.sectionId === sectionId);

      return sendSuccess(res, 'Exams list fetched (Dev Store)', filtered);
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Batch Save Marks Entry (Teacher Input)
 */
export const saveMarksBatch = async (req, res) => {
  try {
    const { examId, subjectId, marksList = [], teacherId } = req.body;

    if (!examId || !subjectId || !marksList.length) {
      return sendError(res, 'examId, subjectId, and marksList array are required', 400);
    }

    const savedRecords = [];

    if (mongoose.connection.readyState === 1) {
      for (const item of marksList) {
        const markDoc = await ExamMark.findOneAndUpdate(
          { examId, studentId: item.studentId, subjectId },
          {
            marksObtained: item.marksObtained || 0,
            maxMarks: item.maxMarks || 100,
            isAbsent: item.isAbsent || false,
            teacherComments: item.teacherComments || '',
            enteredBy: teacherId,
          },
          { upsert: true, new: true }
        );
        savedRecords.push(markDoc);
      }
      await Exam.findByIdAndUpdate(examId, { status: 'MARKS_ENTRY' });
    } else {
      for (const item of marksList) {
        const existingIdx = mockExamMarks.findIndex(
          (m) => m.examId === examId && m.studentId === item.studentId && m.subjectId === subjectId
        );
        if (existingIdx !== -1) {
          mockExamMarks[existingIdx] = {
            ...mockExamMarks[existingIdx],
            marksObtained: item.marksObtained || 0,
            maxMarks: item.maxMarks || 100,
            isAbsent: item.isAbsent || false,
            teacherComments: item.teacherComments || '',
          };
          savedRecords.push(mockExamMarks[existingIdx]);
        } else {
          const newMark = {
            _id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            examId,
            studentId: item.studentId,
            subjectId,
            marksObtained: item.marksObtained || 0,
            maxMarks: item.maxMarks || 100,
            isAbsent: item.isAbsent || false,
            teacherComments: item.teacherComments || '',
          };
          mockExamMarks.push(newMark);
          savedRecords.push(newMark);
        }
      }
      const ex = mockExams.find((e) => e._id === examId);
      if (ex) ex.status = 'MARKS_ENTRY';
    }

    return sendSuccess(res, 'Exam marks saved successfully', savedRecords);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * BACKEND-DRIVEN RESULT CALCULATION ENGINE
 * Executed completely server-side to prevent browser manipulation.
 * Evaluates configurable grading scale, calculates student percentage, GPA, pass/fail status, and class rankings.
 */
export const calculateExamResults = async (req, res) => {
  try {
    const { examId } = req.body;

    if (!examId) {
      return sendError(res, 'examId is required for result processing', 400);
    }

    let exam;
    let gradingScale;
    let allMarks = [];

    if (mongoose.connection.readyState === 1) {
      exam = await Exam.findById(examId);
      if (!exam) return sendError(res, 'Exam not found', 404);
      gradingScale = (await GradingScale.findById(exam.gradingScaleId)) || (await GradingScale.findOne({ isDefault: true }));
      allMarks = await ExamMark.find({ examId });
    } else {
      exam = mockExams.find((e) => e._id === examId);
      if (!exam) return sendError(res, 'Exam not found', 404);
      gradingScale = mockGradingScales.find((gs) => gs._id === exam.gradingScaleId) || mockGradingScales[0];
      allMarks = mockExamMarks.filter((m) => m.examId === examId);
    }

    // Group marks by student ID
    const studentMap = {};
    for (const m of allMarks) {
      if (!studentMap[m.studentId]) {
        studentMap[m.studentId] = [];
      }
      studentMap[m.studentId].push(m);
    }

    // Server-side Result Calculation per student
    const studentSummaries = [];

    for (const [studentId, marksList] of Object.entries(studentMap)) {
      let totalObtained = 0;
      let totalMax = 0;
      let isAnySubjectFailed = false;

      const subjectResults = marksList.map((m) => {
        totalObtained += m.isAbsent ? 0 : m.marksObtained;
        totalMax += m.maxMarks;

        const subPassingMarks = exam.subjects.find((s) => s.subjectId === m.subjectId)?.passingMarks || 35;
        const isPassed = !m.isAbsent && m.marksObtained >= subPassingMarks;
        if (!isPassed) isAnySubjectFailed = true;

        const subPercentage = (m.marksObtained / m.maxMarks) * 100;
        const { grade, gradePoint } = resolveGradeFromScale(subPercentage, gradingScale);

        return {
          subjectId: m.subjectId,
          subjectName: m.subjectId,
          marksObtained: m.marksObtained,
          maxMarks: m.maxMarks,
          grade,
          gradePoint,
          isAbsent: m.isAbsent,
          isPassed,
        };
      });

      const percentage = totalMax > 0 ? parseFloat(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
      const { grade: overallGrade, gradePoint: gpa } = resolveGradeFromScale(percentage, gradingScale);

      const passThreshold = gradingScale.passingPercentage || 35;
      const status = percentage >= passThreshold && !isAnySubjectFailed ? 'PASSED' : 'FAILED';

      studentSummaries.push({
        schoolId: exam.schoolId,
        examId: exam._id,
        studentId,
        classId: exam.classId,
        sectionId: exam.sectionId,
        totalObtained,
        totalMax,
        percentage,
        overallGrade,
        gpa,
        status,
        subjectResults,
      });
    }

    // Compute Class Rankings (Sorted by percentage descending)
    studentSummaries.sort((a, b) => b.percentage - a.percentage);
    studentSummaries.forEach((summary, index) => {
      summary.classRank = index + 1;
    });

    // Save or Update ReportCard Documents
    const savedReportCards = [];

    if (mongoose.connection.readyState === 1) {
      for (const summary of studentSummaries) {
        const rc = await ReportCard.findOneAndUpdate(
          { examId: summary.examId, studentId: summary.studentId },
          summary,
          { upsert: true, new: true }
        );
        savedReportCards.push(rc);
      }
      await Exam.findByIdAndUpdate(examId, { status: 'CALCULATED' });
    } else {
      mockReportCards = mockReportCards.filter((rc) => rc.examId !== examId);
      studentSummaries.forEach((s) => {
        const newRc = {
          _id: `rc_${s.studentId}`,
          ...s,
          calculatedAt: new Date().toISOString(),
        };
        mockReportCards.push(newRc);
        savedReportCards.push(newRc);
      });
      exam.status = 'CALCULATED';
    }

    return sendSuccess(
      res,
      'Backend result calculation completed & official class ranks computed',
      {
        examId,
        totalStudentsEvaluated: savedReportCards.length,
        reportCards: savedReportCards,
      }
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get Calculated Report Cards
 */
export const getExamReportCards = async (req, res) => {
  try {
    const { examId, studentId } = req.query;

    if (!examId) {
      return sendError(res, 'examId query parameter is required', 400);
    }

    if (mongoose.connection.readyState === 1) {
      const query = { examId };
      if (studentId) query.studentId = studentId;

      const reportCards = await ReportCard.find(query).sort({ classRank: 1 });
      return sendSuccess(res, 'Calculated report cards fetched', reportCards);
    } else {
      let filtered = mockReportCards.filter((rc) => rc.examId === examId);
      if (studentId) filtered = filtered.filter((rc) => rc.studentId === studentId);

      filtered.sort((a, b) => a.classRank - b.classRank);
      return sendSuccess(res, 'Calculated report cards fetched (Dev Store)', filtered);
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
