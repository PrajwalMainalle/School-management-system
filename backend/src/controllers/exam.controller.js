import GradingScale from '../models/gradingScale.model.js';
import Exam from '../models/exam.model.js';
import ExamMark from '../models/examMark.model.js';
import ReportCard from '../models/reportCard.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const defaultBoundaries = [
  { minPercentage: 90, grade: 'A+', gradePoint: 10, remarks: 'Outstanding' },
  { minPercentage: 80, grade: 'A', gradePoint: 9, remarks: 'Excellent' },
  { minPercentage: 70, grade: 'B+', gradePoint: 8, remarks: 'Very Good' },
  { minPercentage: 60, grade: 'B', gradePoint: 7, remarks: 'Good' },
  { minPercentage: 50, grade: 'C', gradePoint: 6, remarks: 'Satisfactory' },
  { minPercentage: 35, grade: 'D', gradePoint: 4, remarks: 'Pass' },
  { minPercentage: 0, grade: 'F', gradePoint: 0, remarks: 'Needs Improvement / Fail' },
];

/**
 * Helper to resolve Grade & GPA from configurable Grading Scale boundaries
 */
const resolveGradeFromScale = (percentage, gradingScale) => {
  const boundaries = gradingScale?.boundaries?.length ? gradingScale.boundaries : defaultBoundaries;
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
export const createGradingScale = async (req, res, next) => {
  try {
    const { schoolId = req.user?.schoolId || 'SCHOOL_MAIN', name, passingPercentage = 35, boundaries = [] } = req.body;

    if (!name || !boundaries.length) {
      return sendError(res, 'Grading scale name and boundaries are required', null, 400);
    }

    const scaleDoc = await GradingScale.create({
      schoolId,
      name,
      passingPercentage,
      boundaries,
    });

    return sendSuccess(res, 'Configurable grading scale created successfully', scaleDoc, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Configurable Grading Scales
 */
export const getGradingScales = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || req.query.schoolId || 'SCHOOL_MAIN';
    const scales = await GradingScale.find({ schoolId });
    return sendSuccess(res, 'Grading scales fetched', scales);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Exam Configuration
 */
export const createExam = async (req, res, next) => {
  try {
    const {
      schoolId = req.user?.schoolId || 'SCHOOL_MAIN',
      branchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS',
      academicYearId = 'AY_2026_27',
      name,
      examType = 'MID_TERM',
      classId,
      sectionId,
      gradingScaleId,
      subjects = [],
    } = req.body;

    if (!name || !classId || !sectionId || !subjects.length) {
      return sendError(res, 'Exam name, classId, sectionId, and subjects are required', null, 400);
    }

    const examDoc = await Exam.create({
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

    return sendSuccess(res, 'Exam created successfully', examDoc, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Exams List
 */
export const getExams = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || req.query.schoolId || 'SCHOOL_MAIN';
    const query = { schoolId };
    if (req.query.classId) query.classId = req.query.classId;
    if (req.query.sectionId) query.sectionId = req.query.sectionId;

    const exams = await Exam.find(query).sort({ createdAt: -1 });
    return sendSuccess(res, 'Exams list fetched', exams);
  } catch (error) {
    next(error);
  }
};

/**
 * Batch Save Marks Entry (Teacher Input)
 */
export const saveMarksBatch = async (req, res, next) => {
  try {
    const { examId, subjectId, marksList = [], teacherId } = req.body;

    if (!examId || !subjectId || !marksList.length) {
      return sendError(res, 'examId, subjectId, and marksList array are required', null, 400);
    }

    const savedRecords = [];
    for (const item of marksList) {
      const markDoc = await ExamMark.findOneAndUpdate(
        { examId, studentId: item.studentId, subjectId },
        {
          marksObtained: item.marksObtained || 0,
          maxMarks: item.maxMarks || 100,
          isAbsent: item.isAbsent || false,
          teacherComments: item.teacherComments || '',
          enteredBy: teacherId || req.user?._id,
        },
        { upsert: true, new: true }
      );
      savedRecords.push(markDoc);
    }

    await Exam.findByIdAndUpdate(examId, { status: 'MARKS_ENTRY' });
    return sendSuccess(res, 'Exam marks saved successfully', savedRecords);
  } catch (error) {
    next(error);
  }
};

/**
 * Backend-Driven Result Calculation Engine
 */
export const calculateExamResults = async (req, res, next) => {
  try {
    const { examId } = req.body;

    if (!examId) {
      return sendError(res, 'examId is required for result processing', null, 400);
    }

    const exam = await Exam.findById(examId);
    if (!exam) return sendError(res, 'Exam not found', null, 404);

    let gradingScale = null;
    if (exam.gradingScaleId) {
      gradingScale = await GradingScale.findById(exam.gradingScaleId);
    }
    if (!gradingScale) {
      gradingScale = await GradingScale.findOne({ schoolId: exam.schoolId, isDefault: true }) || { boundaries: defaultBoundaries, passingPercentage: 35 };
    }

    const allMarks = await ExamMark.find({ examId });

    // Group marks by student ID
    const studentMap = {};
    for (const m of allMarks) {
      if (!studentMap[m.studentId]) {
        studentMap[m.studentId] = [];
      }
      studentMap[m.studentId].push(m);
    }

    // Result Calculation per student
    const studentSummaries = [];

    for (const [studentId, marksList] of Object.entries(studentMap)) {
      let totalObtained = 0;
      let totalMax = 0;
      let isAnySubjectFailed = false;

      const subjectResults = marksList.map((m) => {
        totalObtained += m.isAbsent ? 0 : m.marksObtained;
        totalMax += m.maxMarks;

        const subPassingMarks = exam.subjects?.find((s) => s.subjectId === m.subjectId)?.passingMarks || 35;
        const isPassed = !m.isAbsent && m.marksObtained >= subPassingMarks;
        if (!isPassed) isAnySubjectFailed = true;

        const subPercentage = m.maxMarks > 0 ? (m.marksObtained / m.maxMarks) * 100 : 0;
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

    // Compute Class Rankings
    studentSummaries.sort((a, b) => b.percentage - a.percentage);
    studentSummaries.forEach((summary, index) => {
      summary.classRank = index + 1;
    });

    const savedReportCards = [];
    for (const summary of studentSummaries) {
      const rc = await ReportCard.findOneAndUpdate(
        { examId: summary.examId, studentId: summary.studentId },
        summary,
        { upsert: true, new: true }
      );
      savedReportCards.push(rc);
    }

    await Exam.findByIdAndUpdate(examId, { status: 'CALCULATED' });

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
    next(error);
  }
};

/**
 * Get Calculated Report Cards
 */
export const getExamReportCards = async (req, res, next) => {
  try {
    const { examId, studentId } = req.query;

    if (!examId) {
      return sendError(res, 'examId query parameter is required', null, 400);
    }

    const query = { examId };
    if (studentId) query.studentId = studentId;

    const reportCards = await ReportCard.find(query).sort({ classRank: 1 });
    return sendSuccess(res, 'Calculated report cards fetched', reportCards);
  } catch (error) {
    next(error);
  }
};
