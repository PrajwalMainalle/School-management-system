import Admission from '../models/admission.model.js';
import Student from '../models/student.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAdmissions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const filter = { schoolId };
    if (status) filter.status = status;

    const admissions = await Admission.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, 'Admissions fetched', { admissions });
  } catch (error) {
    next(error);
  }
};

export const createEnquiry = async (req, res, next) => {
  try {
    const {
      applicantName,
      dateOfBirth,
      gender,
      parentName,
      parentPhone,
      parentEmail,
      seekingClassId,
      remarks,
      status,
      address,
      previousSchoolDetails,
      allocatedSectionId,
      documentsSubmitted,
    } = req.body;

    const applicationNumber = 'APP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const branchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS';

    const admission = await Admission.create({
      schoolId,
      branchId,
      applicationNumber,
      applicantName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('2015-01-01'),
      gender: gender || 'MALE',
      parentName,
      parentPhone,
      parentEmail: parentEmail || '',
      seekingClassId,
      remarks: remarks || '',
      status: status || 'APPLICATION',
      allocatedSectionId: allocatedSectionId || '',
      address: address || {},
      previousSchoolDetails: previousSchoolDetails || {},
      documentsSubmitted: documentsSubmitted || [],
    });

    return sendSuccess(res, 'Admission application submitted successfully', { admission }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Approve Admission & Auto-Create Student
 */
export const approveAdmission = async (req, res, next) => {
  try {
    const { allocatedSectionId } = req.body;
    const admissionId = req.params.id;

    const admission = await Admission.findById(admissionId);
    if (!admission) return sendError(res, 'Admission record not found', null, 404);

    admission.status = 'ADMITTED';
    admission.allocatedSectionId = allocatedSectionId || 'sec_10a';
    await admission.save();

    // Create Student in MongoDB
    const studentId = 'STU' + Date.now().toString().slice(-6);
    const admissionNumber = 'ADM-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const names = admission.applicantName ? admission.applicantName.split(' ') : ['Applicant'];

    const student = await Student.create({
      schoolId: admission.schoolId,
      branchId: admission.branchId,
      studentId,
      admissionNumber,
      firstName: names[0],
      lastName: names.slice(1).join(' ') || 'Student',
      dateOfBirth: admission.dateOfBirth || new Date('2015-01-01'),
      gender: admission.gender || 'MALE',
      phone: admission.parentPhone,
      address: admission.address || {},
      previousSchoolDetails: admission.previousSchoolDetails || {},
      documents: (admission.documentsSubmitted || []).map((d) => ({ name: d.documentType, url: d.url || '' })),
      classId: admission.seekingClassId,
      sectionId: allocatedSectionId || admission.allocatedSectionId || 'sec_10a',
      academicYearId: 'AY_2026_27',
      emergencyContact: {
        guardianName: admission.parentName,
        relationship: 'Parent',
        phone: admission.parentPhone,
        email: admission.parentEmail,
      },
      status: 'ACTIVE',
    });

    return sendSuccess(res, 'Admission approved and Student Profile created!', { admission, student });
  } catch (error) {
    next(error);
  }
};
