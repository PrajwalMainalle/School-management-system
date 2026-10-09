import mongoose from 'mongoose';
import Admission from '../models/admission.model.js';
import Student from '../models/student.model.js';
import User from '../models/user.model.js';
import { mockStudents } from './student.controller.js';
import { mockUsersStore } from './auth.controller.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const mockAdmissions = [
  {
    _id: 'adm_1',
    applicationNumber: 'APP-2026-101',
    applicantName: 'Vikram Gowda',
    dateOfBirth: '2016-04-12',
    gender: 'MALE',
    parentName: 'Chandrashekar Gowda',
    parentPhone: '+91 99887 66554',
    parentEmail: 'chandru@gmail.com',
    seekingClassId: 'cls_5',
    status: 'VERIFICATION',
    remarks: 'Documents submitted. Pending principal sign-off.',
    documentsSubmitted: [
      { documentType: 'Birth Certificate', isVerified: true, url: '#' },
      { documentType: 'Previous TC', isVerified: false, url: '#' },
    ],
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
  {
    _id: 'adm_2',
    applicationNumber: 'APP-2026-102',
    applicantName: 'Pooja Hegde',
    dateOfBirth: '2011-09-05',
    gender: 'FEMALE',
    parentName: 'Shridhar Hegde',
    parentPhone: '+91 99887 11223',
    parentEmail: 'shridhar@gmail.com',
    seekingClassId: 'cls_10',
    status: 'ENQUIRY',
    remarks: 'Enquired via website portal for Class 10 admission.',
    documentsSubmitted: [],
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
];

export const getAdmissions = async (req, res, next) => {
  try {
    const { status } = req.query;
    if (mongoose.connection.readyState === 1) {
      const filter = { schoolId: req.user.schoolId };
      if (status) filter.status = status;
      const admissions = await Admission.find(filter).sort({ createdAt: -1 });
      return sendSuccess(res, 'Admissions fetched', { admissions });
    } else {
      let filtered = [...mockAdmissions];
      if (status) filtered = filtered.filter((a) => a.status === status);
      return sendSuccess(res, 'Admissions fetched (Dev Mode)', { admissions: filtered });
    }
  } catch (error) {
    next(error);
  }
};

export const createEnquiry = async (req, res, next) => {
  try {
    const { applicantName, dateOfBirth, gender, parentName, parentPhone, parentEmail, seekingClassId, remarks } = req.body;
    const applicationNumber = 'APP-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);

    if (mongoose.connection.readyState === 1) {
      const admission = await Admission.create({
        schoolId: req.user.schoolId,
        branchId: req.user.branchId,
        applicationNumber,
        applicantName,
        dateOfBirth,
        gender,
        parentName,
        parentPhone,
        parentEmail,
        seekingClassId,
        remarks,
        status: 'ENQUIRY',
      });
      return sendSuccess(res, 'Admission enquiry created', { admission }, 201);
    } else {
      const admission = {
        _id: 'adm_' + Date.now(),
        applicationNumber,
        applicantName,
        dateOfBirth,
        gender,
        parentName,
        parentPhone,
        parentEmail,
        seekingClassId,
        remarks,
        status: 'ENQUIRY',
        documentsSubmitted: [],
        schoolId: req.user.schoolId || 'SCHOOL_GREENWOOD_MAIN',
        branchId: req.user.branchId || 'BRANCH_MAIN_CAMPUS',
      };
      mockAdmissions.unshift(admission);
      return sendSuccess(res, 'Admission enquiry created (Dev Mode)', { admission }, 201);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Approve Admission & Auto-Create Student & User Login
 */
export const approveAdmission = async (req, res, next) => {
  try {
    const { allocatedSectionId } = req.body;
    const admissionId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const admission = await Admission.findById(admissionId);
      if (!admission) return sendError(res, 'Admission record not found', null, 404);

      admission.status = 'ADMITTED';
      admission.allocatedSectionId = allocatedSectionId || 'sec_10a';
      await admission.save();

      // Create Student
      const studentId = 'STU' + Date.now().toString().slice(-6);
      const admissionNumber = 'ADM-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
      const names = admission.applicantName.split(' ');

      const student = await Student.create({
        schoolId: admission.schoolId,
        branchId: admission.branchId,
        studentId,
        admissionNumber,
        firstName: names[0],
        lastName: names.slice(1).join(' ') || 'Student',
        dateOfBirth: admission.dateOfBirth,
        gender: admission.gender,
        phone: admission.parentPhone,
        email: admission.parentEmail,
        classId: admission.seekingClassId,
        sectionId: allocatedSectionId || 'sec_10a',
        academicYearId: 'ay_2026_27',
        emergencyContact: {
          guardianName: admission.parentName,
          relationship: 'Parent',
          phone: admission.parentPhone,
        },
        status: 'ACTIVE',
      });

      return sendSuccess(res, 'Admission approved and Student Profile created!', { admission, student });
    } else {
      const adm = mockAdmissions.find((a) => a._id === admissionId);
      if (adm) {
        adm.status = 'ADMITTED';
        adm.allocatedSectionId = allocatedSectionId || 'sec_10a';

        const studentId = 'STU' + Date.now().toString().slice(-6);
        const admissionNumber = 'ADM-2026-' + Math.floor(100 + Math.random() * 900);
        const names = adm.applicantName.split(' ');

        const newStudent = {
          _id: 'stu_' + Date.now(),
          studentId,
          admissionNumber,
          firstName: names[0],
          lastName: names.slice(1).join(' ') || 'Student',
          dateOfBirth: adm.dateOfBirth,
          gender: adm.gender,
          phone: adm.parentPhone,
          email: adm.parentEmail || 'student@greenwood.edu',
          classId: adm.seekingClassId,
          sectionId: allocatedSectionId || 'sec_10a',
          academicYearId: 'ay_2026_27',
          admissionDate: new Date().toISOString(),
          status: 'ACTIVE',
          emergencyContact: { guardianName: adm.parentName, relationship: 'Parent', phone: adm.parentPhone },
          documents: [],
          academicHistory: [],
          userId: null,
          schoolId: adm.schoolId,
          branchId: adm.branchId,
        };
        mockStudents.unshift(newStudent);
        return sendSuccess(res, 'Admission approved & Student profile created (Dev Mode)', { admission: adm, student: newStudent });
      }
      return sendError(res, 'Admission application not found', null, 404);
    }
  } catch (error) {
    next(error);
  }
};
