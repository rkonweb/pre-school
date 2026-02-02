
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  detectRuntime,
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.10.2
 * Query Engine version: 5a9203d0590c951969e85a7d07215503f4672eb9
 */
Prisma.prismaVersion = {
  client: "5.10.2",
  engine: "5a9203d0590c951969e85a7d07215503f4672eb9"
}

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  throw new Error(`empty is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  throw new Error(`join is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  throw new Error(`raw is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  throw new Error(`Extensions.getExtensionContext is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  throw new Error(`Extensions.defineExtension is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.SchoolScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  address: 'address',
  city: 'city',
  state: 'state',
  zip: 'zip',
  country: 'country',
  latitude: 'latitude',
  longitude: 'longitude',
  phone: 'phone',
  email: 'email',
  website: 'website',
  motto: 'motto',
  foundingYear: 'foundingYear',
  logo: 'logo',
  brandColor: 'brandColor',
  facebook: 'facebook',
  twitter: 'twitter',
  linkedin: 'linkedin',
  instagram: 'instagram',
  youtube: 'youtube',
  currency: 'currency',
  timezone: 'timezone',
  dateFormat: 'dateFormat',
  googleMapsApiKey: 'googleMapsApiKey',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdmissionScalarFieldEnum = {
  id: 'id',
  studentName: 'studentName',
  studentAge: 'studentAge',
  studentGender: 'studentGender',
  dateOfBirth: 'dateOfBirth',
  parentName: 'parentName',
  parentEmail: 'parentEmail',
  parentPhone: 'parentPhone',
  secondaryPhone: 'secondaryPhone',
  relationship: 'relationship',
  fatherName: 'fatherName',
  fatherPhone: 'fatherPhone',
  fatherEmail: 'fatherEmail',
  fatherOccupation: 'fatherOccupation',
  motherName: 'motherName',
  motherPhone: 'motherPhone',
  motherEmail: 'motherEmail',
  motherOccupation: 'motherOccupation',
  address: 'address',
  city: 'city',
  state: 'state',
  country: 'country',
  zip: 'zip',
  officialStatus: 'officialStatus',
  stage: 'stage',
  priority: 'priority',
  enrolledGrade: 'enrolledGrade',
  source: 'source',
  notes: 'notes',
  bloodGroup: 'bloodGroup',
  medicalConditions: 'medicalConditions',
  allergies: 'allergies',
  emergencyContactName: 'emergencyContactName',
  emergencyContactPhone: 'emergencyContactPhone',
  previousSchool: 'previousSchool',
  documents: 'documents',
  accessToken: 'accessToken',
  admissionFormStep: 'admissionFormStep',
  dateReceived: 'dateReceived',
  schoolId: 'schoolId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  mobile: 'mobile',
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  designation: 'designation',
  department: 'department',
  joiningDate: 'joiningDate',
  status: 'status',
  avatar: 'avatar',
  address: 'address',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  schoolId: 'schoolId',
  documents: 'documents',
  gender: 'gender',
  dateOfBirth: 'dateOfBirth',
  bloodGroup: 'bloodGroup',
  emergencyContactName: 'emergencyContactName',
  emergencyContactPhone: 'emergencyContactPhone',
  emergencyContactRelation: 'emergencyContactRelation',
  addressCity: 'addressCity',
  addressState: 'addressState',
  addressZip: 'addressZip',
  addressCountry: 'addressCountry',
  qualifications: 'qualifications',
  experience: 'experience',
  employmentType: 'employmentType',
  bankName: 'bankName',
  bankAccountNo: 'bankAccountNo',
  bankIfsc: 'bankIfsc',
  facebook: 'facebook',
  linkedin: 'linkedin',
  twitter: 'twitter',
  instagram: 'instagram'
};

exports.Prisma.LeavePolicyScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  effectiveFrom: 'effectiveFrom',
  effectiveTo: 'effectiveTo',
  isDefault: 'isDefault',
  schoolId: 'schoolId',
  lateComingGrace: 'lateComingGrace',
  lateComingMax: 'lateComingMax',
  earlyLeavingGrace: 'earlyLeavingGrace',
  earlyLeavingMax: 'earlyLeavingMax',
  permissionAllowed: 'permissionAllowed',
  permissionMaxMins: 'permissionMaxMins',
  permissionMaxOccur: 'permissionMaxOccur',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeaveTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  totalDays: 'totalDays',
  canCarryForward: 'canCarryForward',
  maxCarryForward: 'maxCarryForward',
  isPaid: 'isPaid',
  allowHalfDay: 'allowHalfDay',
  minNoticePeriod: 'minNoticePeriod',
  requiresApproval: 'requiresApproval',
  gender: 'gender',
  policyId: 'policyId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeaveBalanceScalarFieldEnum = {
  id: 'id',
  total: 'total',
  used: 'used',
  pending: 'pending',
  remaining: 'remaining',
  userId: 'userId',
  leaveTypeId: 'leaveTypeId',
  year: 'year',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SalaryRevisionScalarFieldEnum = {
  id: 'id',
  amount: 'amount',
  currency: 'currency',
  revisionDate: 'revisionDate',
  effectiveDate: 'effectiveDate',
  reason: 'reason',
  type: 'type',
  basic: 'basic',
  hra: 'hra',
  allowance: 'allowance',
  tax: 'tax',
  pf: 'pf',
  insurance: 'insurance',
  otherDeductions: 'otherDeductions',
  netSalary: 'netSalary',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ClassroomScalarFieldEnum = {
  id: 'id',
  name: 'name',
  schoolId: 'schoolId',
  teacherId: 'teacherId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StudentScalarFieldEnum = {
  id: 'id',
  firstName: 'firstName',
  lastName: 'lastName',
  avatar: 'avatar',
  age: 'age',
  gender: 'gender',
  dateOfBirth: 'dateOfBirth',
  grade: 'grade',
  status: 'status',
  parentName: 'parentName',
  parentMobile: 'parentMobile',
  parentEmail: 'parentEmail',
  bloodGroup: 'bloodGroup',
  medicalConditions: 'medicalConditions',
  allergies: 'allergies',
  emergencyContactName: 'emergencyContactName',
  emergencyContactPhone: 'emergencyContactPhone',
  classroomId: 'classroomId',
  schoolId: 'schoolId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeeScalarFieldEnum = {
  id: 'id',
  title: 'title',
  amount: 'amount',
  dueDate: 'dueDate',
  status: 'status',
  studentId: 'studentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeePaymentScalarFieldEnum = {
  id: 'id',
  amount: 'amount',
  date: 'date',
  method: 'method',
  reference: 'reference',
  feeId: 'feeId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttendanceScalarFieldEnum = {
  id: 'id',
  date: 'date',
  status: 'status',
  notes: 'notes',
  studentId: 'studentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReportCardScalarFieldEnum = {
  id: 'id',
  term: 'term',
  marks: 'marks',
  comments: 'comments',
  published: 'published',
  studentId: 'studentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OtpScalarFieldEnum = {
  id: 'id',
  mobile: 'mobile',
  code: 'code',
  expiresAt: 'expiresAt',
  verified: 'verified',
  createdAt: 'createdAt'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  planId: 'planId',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  schoolId: 'schoolId'
};

exports.Prisma.MasterDataScalarFieldEnum = {
  id: 'id',
  type: 'type',
  name: 'name',
  code: 'code',
  parentId: 'parentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StaffAttendanceScalarFieldEnum = {
  id: 'id',
  date: 'date',
  status: 'status',
  notes: 'notes',
  totalHours: 'totalHours',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StaffPunchScalarFieldEnum = {
  id: 'id',
  type: 'type',
  timestamp: 'timestamp',
  attendanceId: 'attendanceId'
};

exports.Prisma.LeaveRequestScalarFieldEnum = {
  id: 'id',
  startDate: 'startDate',
  endDate: 'endDate',
  type: 'type',
  reason: 'reason',
  status: 'status',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeeStructureScalarFieldEnum = {
  id: 'id',
  name: 'name',
  academicYear: 'academicYear',
  description: 'description',
  termConfig: 'termConfig',
  schoolId: 'schoolId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeeComponentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  amount: 'amount',
  currency: 'currency',
  frequency: 'frequency',
  dueDate: 'dueDate',
  dueDay: 'dueDay',
  dueMonth: 'dueMonth',
  isOptional: 'isOptional',
  isRefundable: 'isRefundable',
  midTermRule: 'midTermRule',
  config: 'config',
  feeStructureId: 'feeStructureId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  School: 'School',
  Admission: 'Admission',
  User: 'User',
  LeavePolicy: 'LeavePolicy',
  LeaveType: 'LeaveType',
  LeaveBalance: 'LeaveBalance',
  SalaryRevision: 'SalaryRevision',
  Classroom: 'Classroom',
  Student: 'Student',
  Fee: 'Fee',
  FeePayment: 'FeePayment',
  Attendance: 'Attendance',
  ReportCard: 'ReportCard',
  Otp: 'Otp',
  Subscription: 'Subscription',
  MasterData: 'MasterData',
  StaffAttendance: 'StaffAttendance',
  StaffPunch: 'StaffPunch',
  LeaveRequest: 'LeaveRequest',
  FeeStructure: 'FeeStructure',
  FeeComponent: 'FeeComponent'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        const runtime = detectRuntime()
        const edgeRuntimeName = {
          'workerd': 'Cloudflare Workers',
          'deno': 'Deno and Deno Deploy',
          'netlify': 'Netlify Edge Functions',
          'edge-light': 'Vercel Edge Functions or Edge Middleware',
        }[runtime]

        let message = 'PrismaClient is unable to run in '
        if (edgeRuntimeName !== undefined) {
          message += edgeRuntimeName + '. As an alternative, try Accelerate: https://pris.ly/d/accelerate.'
        } else {
          message += 'this browser environment, or has been bundled for the browser (running in `' + runtime + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
