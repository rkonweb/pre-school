
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
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
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  address: 'address',
  email: 'email',
  phone: 'phone',
  brandColor: 'brandColor',
  city: 'city',
  country: 'country',
  currency: 'currency',
  dateFormat: 'dateFormat',
  facebook: 'facebook',
  foundingYear: 'foundingYear',
  instagram: 'instagram',
  latitude: 'latitude',
  linkedin: 'linkedin',
  logo: 'logo',
  printableLogo: 'printableLogo',
  longitude: 'longitude',
  motto: 'motto',
  state: 'state',
  timezone: 'timezone',
  maxBranches: 'maxBranches',
  twitter: 'twitter',
  website: 'website',
  youtube: 'youtube',
  zip: 'zip',
  googleMapsApiKey: 'googleMapsApiKey',
  academicYearEnd: 'academicYearEnd',
  academicYearStart: 'academicYearStart',
  academicYearStartMonth: 'academicYearStartMonth',
  primaryColor: 'primaryColor',
  schoolTimings: 'schoolTimings',
  secondaryColor: 'secondaryColor',
  workingDays: 'workingDays',
  timetableConfig: 'timetableConfig',
  customDomain: 'customDomain',
  modulesConfig: 'modulesConfig',
  addonsConfig: 'addonsConfig',
  integrationsConfig: 'integrationsConfig'
};

exports.Prisma.AcademicYearScalarFieldEnum = {
  id: 'id',
  name: 'name',
  startDate: 'startDate',
  endDate: 'endDate',
  status: 'status',
  isCurrent: 'isCurrent',
  schoolId: 'schoolId'
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
  updatedAt: 'updatedAt',
  branchId: 'branchId',
  marketingStatus: 'marketingStatus',
  score: 'score',
  counsellorId: 'counsellorId',
  lastMeaningfulActionAt: 'lastMeaningfulActionAt',
  tourStatus: 'tourStatus',
  feeConcernLevel: 'feeConcernLevel',
  distanceConcern: 'distanceConcern',
  timingConcern: 'timingConcern',
  programFit: 'programFit',
  seatAvailability: 'seatAvailability',
  automationPaused: 'automationPaused'
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
  subjects: 'subjects',
  bankName: 'bankName',
  bankAccountNo: 'bankAccountNo',
  bankIfsc: 'bankIfsc',
  facebook: 'facebook',
  linkedin: 'linkedin',
  twitter: 'twitter',
  instagram: 'instagram',
  customRoleId: 'customRoleId',
  biometricId: 'biometricId',
  branchId: 'branchId',
  signupStep: 'signupStep',
  avatarAdjustment: 'avatarAdjustment'
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
  minFullDayHours: 'minFullDayHours',
  minHalfDayHours: 'minHalfDayHours',
  maxDailyPunchEvents: 'maxDailyPunchEvents',
  minPunchGapMins: 'minPunchGapMins',
  roleId: 'roleId',
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
  customAdditions: 'customAdditions',
  customDeductions: 'customDeductions',
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
  updatedAt: 'updatedAt',
  capacity: 'capacity',
  roomNumber: 'roomNumber',
  timetable: 'timetable',
  branchId: 'branchId'
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
  promotedToClassroomId: 'promotedToClassroomId',
  promotedToGrade: 'promotedToGrade',
  schoolId: 'schoolId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  admissionNumber: 'admissionNumber',
  joiningDate: 'joiningDate',
  leavingDate: 'leavingDate',
  branchId: 'branchId'
};

exports.Prisma.FeeScalarFieldEnum = {
  id: 'id',
  title: 'title',
  amount: 'amount',
  dueDate: 'dueDate',
  status: 'status',
  studentId: 'studentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  description: 'description',
  category: 'category',
  academicYearId: 'academicYearId',
  branchId: 'branchId'
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
  academicYearId: 'academicYearId',
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
  academicYearId: 'academicYearId',
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

exports.Prisma.SubscriptionPlanScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  price: 'price',
  currency: 'currency',
  billingPeriod: 'billingPeriod',
  features: 'features',
  maxStudents: 'maxStudents',
  maxStaff: 'maxStaff',
  maxStorageGB: 'maxStorageGB',
  additionalStaffPrice: 'additionalStaffPrice',
  tier: 'tier',
  supportLevel: 'supportLevel',
  isActive: 'isActive',
  isPopular: 'isPopular',
  includedModules: 'includedModules',
  addonUserTiers: 'addonUserTiers',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  addonUsers: 'addonUsers',
  planId: 'planId',
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
  updatedAt: 'updatedAt',
  branchId: 'branchId'
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

exports.Prisma.StudentLeaveRequestScalarFieldEnum = {
  id: 'id',
  startDate: 'startDate',
  endDate: 'endDate',
  reason: 'reason',
  status: 'status',
  studentId: 'studentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeeStructureScalarFieldEnum = {
  id: 'id',
  name: 'name',
  academicYear: 'academicYear',
  description: 'description',
  schoolId: 'schoolId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  termConfig: 'termConfig',
  classIds: 'classIds'
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
  feeStructureId: 'feeStructureId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  config: 'config'
};

exports.Prisma.CurriculumScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  color: 'color',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DayCurriculumScalarFieldEnum = {
  id: 'id',
  date: 'date',
  blocks: 'blocks',
  youtubeUrl: 'youtubeUrl',
  worksheets: 'worksheets',
  curriculumId: 'curriculumId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SystemSettingsScalarFieldEnum = {
  id: 'id',
  timezone: 'timezone',
  currency: 'currency',
  mfaEnabled: 'mfaEnabled',
  sessionTimeout: 'sessionTimeout',
  allowedDomains: 'allowedDomains',
  smtpHost: 'smtpHost',
  smtpPort: 'smtpPort',
  smtpUser: 'smtpUser',
  smtpPass: 'smtpPass',
  smtpSender: 'smtpSender',
  backupEnabled: 'backupEnabled',
  backupFrequency: 'backupFrequency',
  maintenanceMode: 'maintenanceMode',
  updatedAt: 'updatedAt',
  integrationsConfig: 'integrationsConfig'
};

exports.Prisma.HomeworkScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  instructions: 'instructions',
  videoUrl: 'videoUrl',
  voiceNoteUrl: 'voiceNoteUrl',
  worksheetUrl: 'worksheetUrl',
  attachments: 'attachments',
  assignedTo: 'assignedTo',
  targetIds: 'targetIds',
  scheduledFor: 'scheduledFor',
  dueDate: 'dueDate',
  isPublished: 'isPublished',
  fromTemplate: 'fromTemplate',
  templateId: 'templateId',
  schoolId: 'schoolId',
  createdById: 'createdById',
  classroomId: 'classroomId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  academicYearId: 'academicYearId'
};

exports.Prisma.HomeworkSubmissionScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  studentName: 'studentName',
  mediaType: 'mediaType',
  mediaUrl: 'mediaUrl',
  parentNotes: 'parentNotes',
  parentFeedback: 'parentFeedback',
  submittedAt: 'submittedAt',
  isSubmitted: 'isSubmitted',
  isReviewed: 'isReviewed',
  reviewedAt: 'reviewedAt',
  reviewedById: 'reviewedById',
  stickerType: 'stickerType',
  teacherComment: 'teacherComment',
  addedToPortfolio: 'addedToPortfolio',
  milestoneType: 'milestoneType',
  homeworkId: 'homeworkId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.HomeworkReadReceiptScalarFieldEnum = {
  id: 'id',
  homeworkId: 'homeworkId',
  parentId: 'parentId',
  studentId: 'studentId',
  viewedAt: 'viewedAt'
};

exports.Prisma.HomeworkTemplateScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  category: 'category',
  instructions: 'instructions',
  videoUrl: 'videoUrl',
  worksheetUrl: 'worksheetUrl',
  attachments: 'attachments',
  isPremium: 'isPremium',
  ageGroup: 'ageGroup',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  userType: 'userType',
  title: 'title',
  message: 'message',
  type: 'type',
  relatedId: 'relatedId',
  relatedType: 'relatedType',
  actionUrl: 'actionUrl',
  isRead: 'isRead',
  readAt: 'readAt',
  sentVia: 'sentVia',
  deliveredAt: 'deliveredAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PushSubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  userType: 'userType',
  endpoint: 'endpoint',
  keys: 'keys',
  deviceType: 'deviceType',
  userAgent: 'userAgent',
  isActive: 'isActive',
  lastUsed: 'lastUsed',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScheduleScalarFieldEnum = {
  id: 'id',
  type: 'type',
  scheduledFor: 'scheduledFor',
  targetUserId: 'targetUserId',
  targetUserType: 'targetUserType',
  targetGroup: 'targetGroup',
  title: 'title',
  message: 'message',
  relatedId: 'relatedId',
  relatedType: 'relatedType',
  status: 'status',
  sentAt: 'sentAt',
  failureReason: 'failureReason',
  sendVia: 'sendVia',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  type: 'type',
  title: 'title',
  lastMessageAt: 'lastMessageAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  content: 'content',
  senderType: 'senderType',
  senderId: 'senderId',
  senderName: 'senderName',
  conversationId: 'conversationId',
  isRead: 'isRead',
  readAt: 'readAt',
  createdAt: 'createdAt'
};

exports.Prisma.DiaryEntryScalarFieldEnum = {
  id: 'id',
  title: 'title',
  content: 'content',
  type: 'type',
  scheduledFor: 'scheduledFor',
  publishedAt: 'publishedAt',
  status: 'status',
  attachments: 'attachments',
  authorId: 'authorId',
  schoolId: 'schoolId',
  classroomId: 'classroomId',
  priority: 'priority',
  requiresAck: 'requiresAck',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  academicYearId: 'academicYearId'
};

exports.Prisma.DiaryRecipientScalarFieldEnum = {
  id: 'id',
  entryId: 'entryId',
  recipientType: 'recipientType',
  studentId: 'studentId',
  isRead: 'isRead',
  readAt: 'readAt',
  isAcknowledged: 'isAcknowledged',
  acknowledgedAt: 'acknowledgedAt',
  acknowledgedBy: 'acknowledgedBy',
  createdAt: 'createdAt'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  permissions: 'permissions',
  isSystem: 'isSystem',
  schoolId: 'schoolId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ClassAccessScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  classroomId: 'classroomId',
  canRead: 'canRead',
  canWrite: 'canWrite',
  canEdit: 'canEdit',
  canDelete: 'canDelete',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StaffAccessScalarFieldEnum = {
  id: 'id',
  managerId: 'managerId',
  staffId: 'staffId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PayrollScalarFieldEnum = {
  id: 'id',
  month: 'month',
  year: 'year',
  schoolId: 'schoolId',
  status: 'status',
  generatedAt: 'generatedAt',
  processedAt: 'processedAt',
  totalAmount: 'totalAmount'
};

exports.Prisma.PayslipScalarFieldEnum = {
  id: 'id',
  payrollId: 'payrollId',
  userId: 'userId',
  basic: 'basic',
  hra: 'hra',
  allowances: 'allowances',
  bonus: 'bonus',
  tax: 'tax',
  pf: 'pf',
  insurance: 'insurance',
  leaveDeduction: 'leaveDeduction',
  otherDeductions: 'otherDeductions',
  customAdditions: 'customAdditions',
  customDeductions: 'customDeductions',
  grossSalary: 'grossSalary',
  netSalary: 'netSalary',
  totalDays: 'totalDays',
  presentDays: 'presentDays',
  absentDays: 'absentDays',
  leaveDays: 'leaveDays',
  month: 'month',
  year: 'year',
  status: 'status',
  paidAt: 'paidAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PayrollSettingsScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  fullAttendanceBonus: 'fullAttendanceBonus',
  punctualityBonus: 'punctualityBonus',
  lateThreshold: 'lateThreshold',
  latePenalty: 'latePenalty',
  overtimeRate: 'overtimeRate',
  workDaysPerWeek: 'workDaysPerWeek',
  standardWorkHours: 'standardWorkHours',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BiometricLogScalarFieldEnum = {
  id: 'id',
  deviceId: 'deviceId',
  deviceUserId: 'deviceUserId',
  timestamp: 'timestamp',
  status: 'status',
  verifyMode: 'verifyMode',
  processed: 'processed',
  raw: 'raw',
  schoolId: 'schoolId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LibraryBookScalarFieldEnum = {
  id: 'id',
  title: 'title',
  author: 'author',
  isbn: 'isbn',
  publisher: 'publisher',
  category: 'category',
  coverUrl: 'coverUrl',
  copies: 'copies',
  shelfNo: 'shelfNo',
  schoolId: 'schoolId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  branchId: 'branchId'
};

exports.Prisma.TransportVehicleScalarFieldEnum = {
  id: 'id',
  registrationNumber: 'registrationNumber',
  model: 'model',
  capacity: 'capacity',
  schoolId: 'schoolId',
  status: 'status',
  gpsDeviceId: 'gpsDeviceId',
  insuranceNumber: 'insuranceNumber',
  insuranceExpiry: 'insuranceExpiry',
  insuranceDocUrl: 'insuranceDocUrl',
  pollutionNumber: 'pollutionNumber',
  pollutionExpiry: 'pollutionExpiry',
  pollutionDocUrl: 'pollutionDocUrl',
  fitnessExpiry: 'fitnessExpiry',
  fitnessDocUrl: 'fitnessDocUrl',
  permitNumber: 'permitNumber',
  permitExpiry: 'permitExpiry',
  permitDocUrl: 'permitDocUrl',
  rcDocUrl: 'rcDocUrl',
  documents: 'documents',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  branchId: 'branchId'
};

exports.Prisma.TransportDriverScalarFieldEnum = {
  id: 'id',
  name: 'name',
  licenseNumber: 'licenseNumber',
  phone: 'phone',
  schoolId: 'schoolId',
  status: 'status',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransportRouteScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  schoolId: 'schoolId',
  pickupVehicleId: 'pickupVehicleId',
  dropVehicleId: 'dropVehicleId',
  driverId: 'driverId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  branchId: 'branchId'
};

exports.Prisma.TransportStopScalarFieldEnum = {
  id: 'id',
  name: 'name',
  routeId: 'routeId',
  sequenceOrder: 'sequenceOrder',
  latitude: 'latitude',
  longitude: 'longitude',
  pickupTime: 'pickupTime',
  dropTime: 'dropTime',
  monthlyFee: 'monthlyFee',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StudentTransportProfileScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  routeId: 'routeId',
  pickupStopId: 'pickupStopId',
  dropStopId: 'dropStopId',
  transportFee: 'transportFee',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  applicationAddress: 'applicationAddress',
  applicationLat: 'applicationLat',
  applicationLng: 'applicationLng',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransportMaintenanceScalarFieldEnum = {
  id: 'id',
  vehicleId: 'vehicleId',
  type: 'type',
  cost: 'cost',
  date: 'date',
  description: 'description',
  fileUrl: 'fileUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LibraryTransactionScalarFieldEnum = {
  id: 'id',
  bookId: 'bookId',
  studentId: 'studentId',
  staffId: 'staffId',
  issuedDate: 'issuedDate',
  dueDate: 'dueDate',
  returnedDate: 'returnedDate',
  status: 'status',
  fineAmount: 'fineAmount',
  schoolId: 'schoolId'
};

exports.Prisma.LibrarySettingsScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  maxBooksStudent: 'maxBooksStudent',
  maxBooksStaff: 'maxBooksStaff',
  maxDaysStudent: 'maxDaysStudent',
  maxDaysStaff: 'maxDaysStaff',
  finePerDay: 'finePerDay'
};

exports.Prisma.ExamScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  date: 'date',
  type: 'type',
  category: 'category',
  classrooms: 'classrooms',
  subjects: 'subjects',
  maxMarks: 'maxMarks',
  minMarks: 'minMarks',
  gradingSystem: 'gradingSystem',
  schoolId: 'schoolId',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  questionPaperUrl: 'questionPaperUrl',
  academicYearId: 'academicYearId'
};

exports.Prisma.ExamResultScalarFieldEnum = {
  id: 'id',
  marks: 'marks',
  grade: 'grade',
  remarks: 'remarks',
  subject: 'subject',
  examId: 'examId',
  studentId: 'studentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  status: 'status'
};

exports.Prisma.StudentHealthRecordScalarFieldEnum = {
  id: 'id',
  height: 'height',
  weight: 'weight',
  bmi: 'bmi',
  visionLeft: 'visionLeft',
  visionRight: 'visionRight',
  hearingLeft: 'hearingLeft',
  hearingRight: 'hearingRight',
  dentalStatus: 'dentalStatus',
  generalHealth: 'generalHealth',
  bloodPressure: 'bloodPressure',
  pulseRate: 'pulseRate',
  recordedAt: 'recordedAt',
  recordedById: 'recordedById',
  studentId: 'studentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  academicYearId: 'academicYearId'
};

exports.Prisma.StudentActivityRecordScalarFieldEnum = {
  id: 'id',
  title: 'title',
  category: 'category',
  type: 'type',
  date: 'date',
  description: 'description',
  achievement: 'achievement',
  studentId: 'studentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  academicYearId: 'academicYearId'
};

exports.Prisma.AcademicDayScalarFieldEnum = {
  id: 'id',
  monthId: 'monthId',
  dayNumber: 'dayNumber',
  title: 'title',
  theme: 'theme',
  blocks: 'blocks',
  worksheets: 'worksheets',
  isCompleted: 'isCompleted',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AcademicMonthScalarFieldEnum = {
  id: 'id',
  curriculumId: 'curriculumId',
  monthNumber: 'monthNumber',
  title: 'title',
  description: 'description',
  theme: 'theme',
  objectives: 'objectives',
  startDate: 'startDate',
  endDate: 'endDate',
  isCompleted: 'isCompleted',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BlogPageContentScalarFieldEnum = {
  id: 'id',
  sectionKey: 'sectionKey',
  title: 'title',
  subtitle: 'subtitle',
  content: 'content',
  isEnabled: 'isEnabled',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BlogPostScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  excerpt: 'excerpt',
  content: 'content',
  coverImage: 'coverImage',
  authorId: 'authorId',
  isPublished: 'isPublished',
  publishedAt: 'publishedAt',
  tags: 'tags',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  metaKeywords: 'metaKeywords',
  ogImage: 'ogImage',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BlogAutomationSettingsScalarFieldEnum = {
  id: 'id',
  isEnabled: 'isEnabled',
  scheduledTime: 'scheduledTime',
  lastRunDate: 'lastRunDate',
  preferredTopics: 'preferredTopics',
  tone: 'tone',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CMSPageScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  content: 'content',
  isPublished: 'isPublished',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  metaKeywords: 'metaKeywords',
  ogImage: 'ogImage',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CareersPageContentScalarFieldEnum = {
  id: 'id',
  sectionKey: 'sectionKey',
  title: 'title',
  subtitle: 'subtitle',
  content: 'content',
  isEnabled: 'isEnabled',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContactPageContentScalarFieldEnum = {
  id: 'id',
  sectionKey: 'sectionKey',
  title: 'title',
  subtitle: 'subtitle',
  content: 'content',
  isEnabled: 'isEnabled',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeaturesPageContentScalarFieldEnum = {
  id: 'id',
  sectionKey: 'sectionKey',
  title: 'title',
  subtitle: 'subtitle',
  content: 'content',
  isEnabled: 'isEnabled',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.HomepageContentScalarFieldEnum = {
  id: 'id',
  sectionKey: 'sectionKey',
  title: 'title',
  subtitle: 'subtitle',
  content: 'content',
  isEnabled: 'isEnabled',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JobApplicationScalarFieldEnum = {
  id: 'id',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
  resumeUrl: 'resumeUrl',
  coverLetter: 'coverLetter',
  linkedin: 'linkedin',
  portfolio: 'portfolio',
  status: 'status',
  jobId: 'jobId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JobPostingScalarFieldEnum = {
  id: 'id',
  title: 'title',
  department: 'department',
  location: 'location',
  type: 'type',
  description: 'description',
  requirements: 'requirements',
  isOpen: 'isOpen',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PricingPageContentScalarFieldEnum = {
  id: 'id',
  sectionKey: 'sectionKey',
  title: 'title',
  subtitle: 'subtitle',
  content: 'content',
  isEnabled: 'isEnabled',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TrainingAttachmentScalarFieldEnum = {
  id: 'id',
  pageId: 'pageId',
  name: 'name',
  url: 'url',
  size: 'size',
  type: 'type',
  createdAt: 'createdAt'
};

exports.Prisma.TrainingCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TrainingModuleScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  cover: 'cover',
  role: 'role',
  categoryId: 'categoryId',
  isPublished: 'isPublished',
  slug: 'slug',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TrainingPageScalarFieldEnum = {
  id: 'id',
  topicId: 'topicId',
  title: 'title',
  content: 'content',
  order: 'order',
  isPublished: 'isPublished',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TrainingTopicScalarFieldEnum = {
  id: 'id',
  moduleId: 'moduleId',
  title: 'title',
  description: 'description',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VehicleTelemetryScalarFieldEnum = {
  id: 'id',
  vehicleId: 'vehicleId',
  latitude: 'latitude',
  longitude: 'longitude',
  heading: 'heading',
  speed: 'speed',
  status: 'status',
  delayMinutes: 'delayMinutes',
  nextStopId: 'nextStopId',
  recordedAt: 'recordedAt',
  createdAt: 'createdAt'
};

exports.Prisma.MarketingTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  category: 'category',
  baseImageUrl: 'baseImageUrl',
  previewUrl: 'previewUrl',
  config: 'config',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MarketingAttributeScalarFieldEnum = {
  id: 'id',
  type: 'type',
  name: 'name',
  createdAt: 'createdAt'
};

exports.Prisma.SchoolMarketingDesignScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  templateId: 'templateId',
  customValues: 'customValues',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BranchScalarFieldEnum = {
  id: 'id',
  name: 'name',
  schoolId: 'schoolId',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  address: 'address',
  email: 'email',
  phone: 'phone'
};

exports.Prisma.LeadScalarFieldEnum = {
  id: 'id',
  parentName: 'parentName',
  mobile: 'mobile',
  childName: 'childName',
  childAge: 'childAge',
  childDOB: 'childDOB',
  programInterested: 'programInterested',
  preferredBranchId: 'preferredBranchId',
  source: 'source',
  status: 'status',
  priority: 'priority',
  score: 'score',
  counsellorId: 'counsellorId',
  firstResponseTime: 'firstResponseTime',
  lastMeaningfulActionAt: 'lastMeaningfulActionAt',
  tourStatus: 'tourStatus',
  feeConcernLevel: 'feeConcernLevel',
  distanceConcern: 'distanceConcern',
  timingConcern: 'timingConcern',
  programFit: 'programFit',
  seatAvailability: 'seatAvailability',
  whatsappRead: 'whatsappRead',
  linkClicks: 'linkClicks',
  repliesCount: 'repliesCount',
  callConnectedCount: 'callConnectedCount',
  noAnswerCount: 'noAnswerCount',
  isReferral: 'isReferral',
  consentWhatsApp: 'consentWhatsApp',
  consentCalls: 'consentCalls',
  schoolId: 'schoolId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FollowUpScalarFieldEnum = {
  id: 'id',
  leadId: 'leadId',
  admissionId: 'admissionId',
  type: 'type',
  scheduledAt: 'scheduledAt',
  completedAt: 'completedAt',
  status: 'status',
  notes: 'notes',
  assignedToId: 'assignedToId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeadInteractionScalarFieldEnum = {
  id: 'id',
  leadId: 'leadId',
  admissionId: 'admissionId',
  type: 'type',
  content: 'content',
  staffId: 'staffId',
  createdAt: 'createdAt'
};

exports.Prisma.WhatsAppTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  category: 'category',
  body: 'body',
  variables: 'variables',
  language: 'language',
  scoreBands: 'scoreBands',
  schoolId: 'schoolId',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeadAutomationRuleScalarFieldEnum = {
  id: 'id',
  scoreBand: 'scoreBand',
  frequency: 'frequency',
  maxMessages: 'maxMessages',
  allowedCats: 'allowedCats',
  isEnabled: 'isEnabled',
  schoolId: 'schoolId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AISettingsScalarFieldEnum = {
  id: 'id',
  weights: 'weights',
  automationRules: 'automationRules',
  globalAutomationEnabled: 'globalAutomationEnabled',
  quietHours: 'quietHours',
  schoolId: 'schoolId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransportDailyLogScalarFieldEnum = {
  id: 'id',
  date: 'date',
  vehicleId: 'vehicleId',
  routeId: 'routeId',
  driverId: 'driverId',
  totalDistance: 'totalDistance',
  startTime: 'startTime',
  endTime: 'endTime',
  idleMinutes: 'idleMinutes',
  fuelConsumed: 'fuelConsumed',
  avgSpeed: 'avgSpeed',
  efficiencyScore: 'efficiencyScore',
  schoolId: 'schoolId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransportStopLogScalarFieldEnum = {
  id: 'id',
  dailyLogId: 'dailyLogId',
  stopId: 'stopId',
  scheduledArrival: 'scheduledArrival',
  actualArrival: 'actualArrival',
  delayMinutes: 'delayMinutes',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.TransportExpenseScalarFieldEnum = {
  id: 'id',
  vehicleId: 'vehicleId',
  schoolId: 'schoolId',
  category: 'category',
  amount: 'amount',
  date: 'date',
  description: 'description',
  receiptUrl: 'receiptUrl',
  status: 'status',
  rejectionReason: 'rejectionReason',
  createdById: 'createdById',
  approvedById: 'approvedById',
  isSuspicious: 'isSuspicious',
  anomalyReason: 'anomalyReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IDCardTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  layout: 'layout',
  dimensions: 'dimensions',
  orientation: 'orientation',
  isSystem: 'isSystem',
  width: 'width',
  height: 'height',
  unit: 'unit',
  bleed: 'bleed',
  safeMargin: 'safeMargin',
  schoolId: 'schoolId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  parentTemplateId: 'parentTemplateId'
};

exports.Prisma.IDCardSettingsScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  defaultTemplateId: 'defaultTemplateId',
  includeQrCode: 'includeQrCode',
  qrCodeField: 'qrCodeField',
  photoPlaceholder: 'photoPlaceholder',
  signatureImage: 'signatureImage',
  updatedAt: 'updatedAt'
};

exports.Prisma.DevelopmentDomainScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  color: 'color',
  icon: 'icon',
  order: 'order',
  schoolId: 'schoolId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DevelopmentMilestoneScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  ageGroup: 'ageGroup',
  order: 'order',
  domainId: 'domainId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MilestoneRecordScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  milestoneId: 'milestoneId',
  status: 'status',
  achievedDate: 'achievedDate',
  notes: 'notes',
  recordedById: 'recordedById',
  academicYearId: 'academicYearId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SkillItemScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  order: 'order',
  domainId: 'domainId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SkillAssessmentScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  skillId: 'skillId',
  rating: 'rating',
  term: 'term',
  notes: 'notes',
  recordedById: 'recordedById',
  academicYearId: 'academicYearId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PortfolioEntryScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  title: 'title',
  description: 'description',
  type: 'type',
  mediaUrl: 'mediaUrl',
  thumbnailUrl: 'thumbnailUrl',
  tags: 'tags',
  domainId: 'domainId',
  recordedById: 'recordedById',
  academicYearId: 'academicYearId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DevelopmentReportScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  term: 'term',
  teacherNarrative: 'teacherNarrative',
  strengthsNotes: 'strengthsNotes',
  areasToGrow: 'areasToGrow',
  parentMessage: 'parentMessage',
  published: 'published',
  publishedAt: 'publishedAt',
  recordedById: 'recordedById',
  academicYearId: 'academicYearId',
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
  AcademicYear: 'AcademicYear',
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
  SubscriptionPlan: 'SubscriptionPlan',
  Subscription: 'Subscription',
  MasterData: 'MasterData',
  StaffAttendance: 'StaffAttendance',
  StaffPunch: 'StaffPunch',
  LeaveRequest: 'LeaveRequest',
  StudentLeaveRequest: 'StudentLeaveRequest',
  FeeStructure: 'FeeStructure',
  FeeComponent: 'FeeComponent',
  Curriculum: 'Curriculum',
  DayCurriculum: 'DayCurriculum',
  SystemSettings: 'SystemSettings',
  Homework: 'Homework',
  HomeworkSubmission: 'HomeworkSubmission',
  HomeworkReadReceipt: 'HomeworkReadReceipt',
  HomeworkTemplate: 'HomeworkTemplate',
  Notification: 'Notification',
  PushSubscription: 'PushSubscription',
  NotificationSchedule: 'NotificationSchedule',
  Conversation: 'Conversation',
  Message: 'Message',
  DiaryEntry: 'DiaryEntry',
  DiaryRecipient: 'DiaryRecipient',
  Role: 'Role',
  ClassAccess: 'ClassAccess',
  StaffAccess: 'StaffAccess',
  Payroll: 'Payroll',
  Payslip: 'Payslip',
  PayrollSettings: 'PayrollSettings',
  BiometricLog: 'BiometricLog',
  LibraryBook: 'LibraryBook',
  TransportVehicle: 'TransportVehicle',
  TransportDriver: 'TransportDriver',
  TransportRoute: 'TransportRoute',
  TransportStop: 'TransportStop',
  StudentTransportProfile: 'StudentTransportProfile',
  TransportMaintenance: 'TransportMaintenance',
  LibraryTransaction: 'LibraryTransaction',
  LibrarySettings: 'LibrarySettings',
  Exam: 'Exam',
  ExamResult: 'ExamResult',
  StudentHealthRecord: 'StudentHealthRecord',
  StudentActivityRecord: 'StudentActivityRecord',
  AcademicDay: 'AcademicDay',
  AcademicMonth: 'AcademicMonth',
  BlogPageContent: 'BlogPageContent',
  BlogPost: 'BlogPost',
  BlogAutomationSettings: 'BlogAutomationSettings',
  CMSPage: 'CMSPage',
  CareersPageContent: 'CareersPageContent',
  ContactPageContent: 'ContactPageContent',
  FeaturesPageContent: 'FeaturesPageContent',
  HomepageContent: 'HomepageContent',
  JobApplication: 'JobApplication',
  JobPosting: 'JobPosting',
  PricingPageContent: 'PricingPageContent',
  TrainingAttachment: 'TrainingAttachment',
  TrainingCategory: 'TrainingCategory',
  TrainingModule: 'TrainingModule',
  TrainingPage: 'TrainingPage',
  TrainingTopic: 'TrainingTopic',
  VehicleTelemetry: 'VehicleTelemetry',
  MarketingTemplate: 'MarketingTemplate',
  MarketingAttribute: 'MarketingAttribute',
  SchoolMarketingDesign: 'SchoolMarketingDesign',
  Branch: 'Branch',
  Lead: 'Lead',
  FollowUp: 'FollowUp',
  LeadInteraction: 'LeadInteraction',
  WhatsAppTemplate: 'WhatsAppTemplate',
  LeadAutomationRule: 'LeadAutomationRule',
  AISettings: 'AISettings',
  TransportDailyLog: 'TransportDailyLog',
  TransportStopLog: 'TransportStopLog',
  TransportExpense: 'TransportExpense',
  IDCardTemplate: 'IDCardTemplate',
  IDCardSettings: 'IDCardSettings',
  DevelopmentDomain: 'DevelopmentDomain',
  DevelopmentMilestone: 'DevelopmentMilestone',
  MilestoneRecord: 'MilestoneRecord',
  SkillItem: 'SkillItem',
  SkillAssessment: 'SkillAssessment',
  PortfolioEntry: 'PortfolioEntry',
  DevelopmentReport: 'DevelopmentReport'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
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
