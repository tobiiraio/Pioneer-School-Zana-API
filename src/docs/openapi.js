const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'PJSA API',
    version: '1.0.0',
    description: `
## Pioneer School Zana — API Reference

Passwordless OTP-based authentication. All protected endpoints require a Bearer JWT access token.

### Auth flow
1. \`POST /auth/request-otp\` — send OTP to registered email
2. \`POST /auth/verify-otp\` — verify code, receive \`accessToken\` + \`refreshToken\`
3. Use \`Authorization: Bearer <accessToken>\` on all protected endpoints
4. \`POST /auth/refresh\` — get a new access token when it expires
5. \`POST /auth/logout\` — revoke session

### Roles & permissions
| Role | Subrole | Access |
|------|---------|--------|
| admin | — | Full access to everything |
| staff | teacher | Own assigned classes + grade entry |
| staff | classteacher | Full view of assigned class + all grades |
| staff | bursar | Financial data + requirements lifecycle + partial student/parent info |
| staff | non-teaching | Read-only on classes, subjects, terms |
| parent | — | No API access |
| student | — | No API access |
    `
  },
  servers: [{ url: '/pjsa', description: 'API base path' }],
  tags: [
    { name: 'Auth', description: 'Authentication — OTP login, token management, user registration' },
    { name: 'Users', description: 'User account management (admin only)' },
    { name: 'Students', description: 'Student records' },
    { name: 'Parents', description: 'Parent/guardian records' },
    { name: 'Staff', description: 'Staff records' },
    { name: 'Classes', description: 'School classes' },
    { name: 'Subjects', description: 'Subjects taught' },
    { name: 'Academic Years', description: 'Academic year definitions' },
    { name: 'Academic Terms', description: 'Terms within an academic year' },
    { name: 'Requirements', description: 'Requirement definitions (books, uniforms, etc.)' },
    { name: 'Requirement Sets', description: 'Bundled requirements per class/term' },
    { name: 'Requirement Fulfillments', description: 'Student requirement fulfillment tracking' },
    { name: 'School Fees', description: 'Fee transactions and balance management' },
    { name: 'Metadata', description: 'School information and settings' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {

      // ── Auth ────────────────────────────────────────────────
      RegisterUser: {
        type: 'object', required: ['name', 'email', 'role'],
        properties: {
          name: { type: 'string', example: 'Mary Tendo' },
          email: { type: 'string', format: 'email', example: 'mary@school.com' },
          role: { type: 'string', enum: ['admin', 'staff', 'parent', 'student'] },
          subrole: { type: 'string', enum: ['teacher', 'bursar', 'classteacher', 'non-teaching'], description: 'Required when role is staff' }
        }
      },
      RequestOtp: {
        type: 'object', required: ['email'],
        properties: { email: { type: 'string', format: 'email', example: 'mary@school.com' } }
      },
      VerifyOtp: {
        type: 'object', required: ['email', 'code'],
        properties: {
          email: { type: 'string', format: 'email' },
          code: { type: 'string', example: '482916' }
        }
      },
      TokenResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'staff', 'parent', 'student'] },
          subrole: { type: 'string', nullable: true }
        }
      },
      RefreshRequest: {
        type: 'object', required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } }
      },
      LogoutRequest: {
        type: 'object', required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } }
      },

      // ── Users ───────────────────────────────────────────────
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'staff', 'parent', 'student'] },
          subrole: { type: 'string', nullable: true, enum: ['teacher', 'bursar', 'classteacher', 'non-teaching'] },
          status: { type: 'string', enum: ['active', 'suspended', 'deactivated'] },
          staff_id: { type: 'string', nullable: true },
          student_id: { type: 'string', nullable: true },
          parent_id: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      UpdateUser: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'staff', 'parent', 'student'], description: 'Admin only' },
          subrole: { type: 'string', enum: ['teacher', 'bursar', 'classteacher', 'non-teaching'], description: 'Admin only' }
        }
      },
      SetUserStatus: {
        type: 'object', required: ['status'],
        properties: { status: { type: 'string', enum: ['active', 'suspended', 'deactivated'] } }
      },

      // ── Students ─────────────────────────────────────────────
      CreateStudent: {
        type: 'object', required: ['firstName', 'lastName', 'gender'],
        properties: {
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          otherName: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date', example: '2010-03-15' },
          gender: { type: 'string', enum: ['Male', 'Female'] },
          religion: { type: 'string' },
          nationality: { type: 'string', example: 'Ugandan' },
          address: { type: 'string' },
          EMISNo: { type: 'string' },
          LINNumber: { type: 'string' },
          currentClass: { type: 'string', description: 'Class ObjectId' },
          academicStatus: { type: 'string', enum: ['Active', 'Inactive', 'Graduated', 'Transferred', 'Suspended'], default: 'Active' },
          disabilities: { type: 'array', items: { type: 'string' } },
          immunized: { type: 'boolean' },
          allergies: { type: 'array', items: { type: 'string' } }
        }
      },
      Student: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          otherName: { type: 'string' },
          fullName: { type: 'string', description: 'Virtual field' },
          dateOfBirth: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['Male', 'Female'] },
          EMISNo: { type: 'string' },
          LINNumber: { type: 'string' },
          currentClass: { type: 'object', description: 'Populated class object' },
          academicStatus: { type: 'string', enum: ['Active', 'Inactive', 'Graduated', 'Transferred', 'Suspended'] },
          parents: { type: 'array', items: { type: 'object', properties: { parent: { type: 'string' }, relationship: { type: 'string' }, isPrimaryContact: { type: 'boolean' } } } },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      AddParentToStudent: {
        type: 'object', required: ['studentId', 'parentId', 'relationship'],
        properties: {
          studentId: { type: 'string' },
          parentId: { type: 'string' },
          relationship: { type: 'string', enum: ['Father', 'Mother', 'Guardian'] },
          isPrimaryContact: { type: 'boolean', default: false }
        }
      },
      UpdatePrimaryContact: {
        type: 'object', required: ['studentId', 'parentId'],
        properties: {
          studentId: { type: 'string' },
          parentId: { type: 'string' }
        }
      },
      CreateStudentWithAccount: {
        type: 'object', required: ['firstName', 'lastName', 'gender', 'email'],
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          gender: { type: 'string', enum: ['Male', 'Female'] },
          email: { type: 'string', format: 'email', description: 'Used to create the user account' },
          currentClass: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' }
        }
      },

      // ── Parents ──────────────────────────────────────────────
      CreateParent: {
        type: 'object', required: ['fullName', 'relationship', 'phone'],
        properties: {
          fullName: { type: 'string', example: 'Alice Nakato' },
          NIN: { type: 'string', example: 'CM12345678ABCD' },
          occupation: { type: 'string' },
          phone: { type: 'string', example: '+256700000000' },
          alternatePhone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          address: { type: 'string' },
          nationality: { type: 'string' },
          relationship: { type: 'string', enum: ['Father', 'Mother', 'Guardian'] },
          guardianRelationship: { type: 'string', description: 'Specify if relationship is Guardian' },
          isPrimaryContact: { type: 'boolean' }
        }
      },
      Parent: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          fullName: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          relationship: { type: 'string' },
          students: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      AddStudentToParent: {
        type: 'object', required: ['parentId', 'studentId'],
        properties: {
          parentId: { type: 'string' },
          studentId: { type: 'string' }
        }
      },

      // ── Staff ────────────────────────────────────────────────
      CreateStaff: {
        type: 'object', required: ['fullName', 'gender', 'email'],
        properties: {
          fullName: { type: 'string', example: 'Peter Ssemakula' },
          NIN: { type: 'string' },
          gender: { type: 'string', enum: ['Male', 'Female'] },
          dateOfBirth: { type: 'string', format: 'date' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          department: { type: 'string' },
          qualifications: { type: 'array', items: { type: 'string' } },
          employmentDate: { type: 'string', format: 'date' },
          employmentStatus: { type: 'string', enum: ['Full-time', 'Part-time', 'Contract', 'Probation', 'Suspended', 'Terminated'], default: 'Full-time' }
        }
      },
      Staff: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          fullName: { type: 'string' },
          email: { type: 'string' },
          department: { type: 'string' },
          employmentStatus: { type: 'string' },
          subjects: { type: 'array', items: { type: 'string' } },
          classes: { type: 'array', items: { type: 'string' } },
          user: { type: 'string', description: 'Linked user account ObjectId' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      SetStaffStatus: {
        type: 'object', required: ['status'],
        properties: { status: { type: 'string', enum: ['Full-time', 'Part-time', 'Contract', 'Probation', 'Suspended', 'Terminated'] } }
      },
      AddSubjectToStaff: {
        type: 'object', required: ['staffId', 'subjectId'],
        properties: { staffId: { type: 'string' }, subjectId: { type: 'string' } }
      },
      AddClassToStaff: {
        type: 'object', required: ['staffId', 'classId'],
        properties: { staffId: { type: 'string' }, classId: { type: 'string' } }
      },
      CreateStaffWithAccount: {
        type: 'object', required: ['fullName', 'gender', 'email', 'subrole'],
        properties: {
          fullName: { type: 'string' },
          gender: { type: 'string', enum: ['Male', 'Female'] },
          email: { type: 'string', format: 'email' },
          subrole: { type: 'string', enum: ['teacher', 'bursar', 'classteacher', 'non-teaching'] },
          department: { type: 'string' },
          phone: { type: 'string' }
        }
      },

      // ── Classes ──────────────────────────────────────────────
      CreateClass: {
        type: 'object', required: ['name', 'shortName'],
        properties: {
          name: { type: 'string', example: 'Primary 4' },
          shortName: { type: 'string', example: 'P4' }
        }
      },
      SchoolClass: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          shortName: { type: 'string' }
        }
      },

      // ── Subjects ─────────────────────────────────────────────
      CreateSubject: {
        type: 'object', required: ['name'],
        properties: {
          name: { type: 'string', example: 'Mathematics' },
          description: { type: 'string' }
        }
      },
      Subject: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },

      // ── Academic Years ────────────────────────────────────────
      CreateAcademicYear: {
        type: 'object', required: ['name', 'start_date', 'end_date'],
        properties: {
          name: { type: 'string', example: '2024/2025' },
          start_date: { type: 'string', format: 'date', example: '2024-02-05' },
          end_date: { type: 'string', format: 'date', example: '2024-12-06' }
        }
      },
      AcademicYear: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },

      // ── Academic Terms ────────────────────────────────────────
      CreateAcademicTerm: {
        type: 'object', required: ['academic_year_id', 'name', 'start_date', 'end_date'],
        properties: {
          academic_year_id: { type: 'string', description: 'AcademicYear ObjectId' },
          name: { type: 'string', example: 'Term 1' },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' }
        }
      },
      AcademicTerm: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          academic_year_id: { type: 'object', description: 'Populated AcademicYear' },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' }
        }
      },

      // ── Requirements ──────────────────────────────────────────
      CreateRequirement: {
        type: 'object', required: ['name', 'unit'],
        properties: {
          name: { type: 'string', example: 'Exercise Books' },
          description: { type: 'string' },
          unit: { type: 'string', example: 'pieces' }
        }
      },
      Requirement: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          unit: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },

      // ── Requirement Sets ──────────────────────────────────────
      CreateRequirementSet: {
        type: 'object', required: ['name', 'SchoolClass', 'AcademicTerm', 'requirementItems'],
        properties: {
          name: { type: 'string', example: 'P4 Term 1 Requirements' },
          description: { type: 'string' },
          SchoolClass: { type: 'string', description: 'Class ObjectId' },
          AcademicTerm: { type: 'string', description: 'AcademicTerm ObjectId' },
          requirementItems: {
            type: 'array',
            items: {
              type: 'object', required: ['requirement', 'quantity'],
              properties: {
                requirement: { type: 'string', description: 'Requirement ObjectId' },
                quantity: { type: 'number', example: 5 }
              }
            }
          }
        }
      },
      RequirementSet: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          SchoolClass: { type: 'object' },
          AcademicTerm: { type: 'object' },
          requirementItems: { type: 'array', items: { type: 'object' } }
        }
      },

      // ── Requirement Fulfillments ──────────────────────────────
      CreateRequirementFulfillment: {
        type: 'object', required: ['student', 'requirementSet'],
        properties: {
          student: { type: 'string', description: 'Student ObjectId' },
          requirementSet: { type: 'string', description: 'RequirementSet ObjectId' }
        }
      },
      UpdateFulfillmentItems: {
        type: 'object', required: ['items'],
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object', required: ['requirement', 'fulfilledQuantity'],
              properties: {
                requirement: { type: 'string', description: 'Requirement ObjectId' },
                fulfilledQuantity: { type: 'number', example: 3 },
                notes: { type: 'string' }
              }
            }
          }
        }
      },
      RequirementFulfillment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          student: { type: 'object' },
          requirementSet: { type: 'object' },
          status: { type: 'string', enum: ['Incomplete', 'Partial', 'Complete'] },
          totalBalance: { type: 'number' },
          fulfilledItems: { type: 'array', items: { type: 'object' } }
        }
      },

      // ── School Fees ───────────────────────────────────────────
      CreateSchoolFees: {
        type: 'object', required: ['student', 'academicTerm', 'studentClass', 'amount', 'rn'],
        properties: {
          student: { type: 'string', description: 'Student ObjectId' },
          academicTerm: { type: 'string', description: 'AcademicTerm ObjectId' },
          studentClass: { type: 'string', description: 'Class ObjectId' },
          date: { type: 'string', format: 'date', example: '2024-03-01' },
          amount: { type: 'number', example: 150000 },
          rn: { type: 'string', description: 'Receipt/reference number', example: 'RN-2024-001' },
          bal: { type: 'number', description: 'Outstanding balance after this transaction', example: 50000 }
        }
      },
      SchoolFees: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          student: { type: 'object' },
          academicTerm: { type: 'object' },
          studentClass: { type: 'object' },
          date: { type: 'string', format: 'date' },
          amount: { type: 'number' },
          rn: { type: 'string' },
          bal: { type: 'number' }
        }
      },

      // ── Metadata ──────────────────────────────────────────────
      CreateMetadata: {
        type: 'object', required: ['name'],
        properties: {
          name: { type: 'string', example: 'Pioneer School Zana' },
          location: { type: 'string' },
          box_number: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          website: { type: 'string' },
          logo_url: { type: 'string' }
        }
      },

      // ── Common ────────────────────────────────────────────────
      MessageResponse: {
        type: 'object',
        properties: { message: { type: 'string' } }
      },
      ErrorResponse: {
        type: 'object',
        properties: { message: { type: 'string' }, error: { type: 'string' } }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {

    // ── Auth ──────────────────────────────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth'], summary: 'Register a new user account',
        description: 'Admin only. Creates a user account and sends a welcome email. No password is set — users log in via OTP.',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterUser' } } } },
        responses: {
          201: { description: 'User registered successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
          400: { description: 'Missing fields, staff without subrole, or email already exists' },
          401: { description: 'Unauthorized' }, 403: { description: 'Forbidden — admin only' },
          500: { description: 'Server error' }
        }
      }
    },
    '/auth/request-otp': {
      post: {
        tags: ['Auth'], summary: 'Request a login OTP code',
        description: 'Sends a 6-digit OTP to the email if a registered account exists. Always returns the same response regardless of whether the email is registered (security).',
        security: [],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RequestOtp' } } } },
        responses: {
          200: { description: 'Response sent (generic)', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
          400: { description: 'email is required' }, 500: { description: 'Server error' }
        }
      }
    },
    '/auth/verify-otp': {
      post: {
        tags: ['Auth'], summary: 'Verify OTP and receive tokens',
        description: 'Verifies the 6-digit code. On success returns a short-lived access token (24h) and a long-lived refresh token (30 days).',
        security: [],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyOtp' } } } },
        responses: {
          200: { description: 'Tokens issued', content: { 'application/json': { schema: { $ref: '#/components/schemas/TokenResponse' } } } },
          400: { description: 'Invalid or expired code' }, 404: { description: 'User not found' }, 500: { description: 'Server error' }
        }
      }
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'], summary: 'Refresh access token',
        description: 'Exchange a valid refresh token for a new access token.',
        security: [],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshRequest' } } } },
        responses: {
          200: { description: 'New access token', content: { 'application/json': { schema: { type: 'object', properties: { accessToken: { type: 'string' } } } } } },
          401: { description: 'Invalid or expired refresh token' }, 500: { description: 'Server error' }
        }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'], summary: 'Logout — revoke refresh token',
        description: 'Deletes the refresh token from the database. The access token will naturally expire.',
        security: [],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LogoutRequest' } } } },
        responses: {
          200: { description: 'Logged out', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
          500: { description: 'Server error' }
        }
      }
    },
    '/auth/profile': {
      get: {
        tags: ['Auth'], summary: 'Get current user profile',
        responses: {
          200: { description: 'Authenticated user info' },
          401: { description: 'Unauthorized' }
        }
      }
    },

    // ── Users ─────────────────────────────────────────────────────────────────
    '/users': {
      get: {
        tags: ['Users'], summary: 'List users',
        description: 'Admin only. Supports filtering by role, subrole, and status.',
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['admin', 'staff', 'parent', 'student'] } },
          { name: 'subrole', in: 'query', schema: { type: 'string', enum: ['teacher', 'bursar', 'classteacher', 'non-teaching'] } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'suspended', 'deactivated'] } }
        ],
        responses: {
          200: { description: 'List of users', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } },
          401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' }
        }
      }
    },
    '/users/{id}': {
      get: {
        tags: ['Users'], summary: 'Get user by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'User object', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          404: { description: 'User not found' }
        }
      },
      put: {
        tags: ['Users'], summary: 'Update user',
        description: 'Admin can update any field. Non-admins can only update their own name/email.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUser' } } } },
        responses: {
          200: { description: 'Updated user', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          403: { description: 'Forbidden' }, 404: { description: 'Not found' }
        }
      },
      delete: {
        tags: ['Users'], summary: 'Delete user (admin only)',
        description: 'Deletes user account and revokes all refresh tokens.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'User deleted' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' }
        }
      }
    },
    '/users/{id}/status': {
      patch: {
        tags: ['Users'], summary: 'Set user account status (admin only)',
        description: 'Suspending or deactivating immediately revokes all active refresh tokens.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SetUserStatus' } } } },
        responses: {
          200: { description: 'Status updated', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, userId: { type: 'string' }, status: { type: 'string' } } } } } },
          400: { description: 'Invalid status or self-modification attempt' },
          403: { description: 'Forbidden' }, 404: { description: 'Not found' }
        }
      }
    },

    // ── Students ──────────────────────────────────────────────────────────────
    '/students': {
      post: {
        tags: ['Students'], summary: 'Create student (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateStudent' } } } },
        responses: {
          201: { description: 'Student created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Student' } } } },
          400: { description: 'Validation error' }, 403: { description: 'Forbidden' }
        }
      },
      get: {
        tags: ['Students'], summary: 'List all students (admin + bursar)',
        description: 'Bursar receives partial fields (name, class, balance info only).',
        responses: {
          200: { description: 'List of students', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Student' } } } } },
          403: { description: 'Forbidden' }
        }
      }
    },
    '/students/with-account': {
      post: {
        tags: ['Students'], summary: 'Create student with user account (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateStudentWithAccount' } } } },
        responses: {
          201: { description: 'Student and user account created' }, 403: { description: 'Forbidden' }
        }
      }
    },
    '/students/add-parent': {
      post: {
        tags: ['Students'], summary: 'Add parent to student (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AddParentToStudent' } } } },
        responses: { 200: { description: 'Parent added' }, 403: { description: 'Forbidden' }, 404: { description: 'Student or parent not found' } }
      }
    },
    '/students/primary-contact': {
      put: {
        tags: ['Students'], summary: 'Set primary contact parent (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdatePrimaryContact' } } } },
        responses: { 200: { description: 'Primary contact updated' }, 403: { description: 'Forbidden' } }
      }
    },
    '/students/class/{classId}': {
      get: {
        tags: ['Students'], summary: 'Get students by class',
        description: 'Admin/bursar: all fields. Teacher/classteacher: own assigned classes only.',
        parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Students in class', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Student' } } } } },
          403: { description: 'Forbidden — teacher not assigned to this class' }
        }
      }
    },
    '/students/status/{status}': {
      get: {
        tags: ['Students'], summary: 'Get students by academic status (admin only)',
        parameters: [{ name: 'status', in: 'path', required: true, schema: { type: 'string', enum: ['Active', 'Inactive', 'Graduated', 'Transferred', 'Suspended'] } }],
        responses: { 200: { description: 'Filtered students' }, 403: { description: 'Forbidden' } }
      }
    },
    '/students/{id}': {
      get: {
        tags: ['Students'], summary: 'Get student by ID',
        description: 'Admin: full record. Bursar/classteacher: accessible. Teacher: must be assigned to student\'s class.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Student record', content: { 'application/json': { schema: { $ref: '#/components/schemas/Student' } } } },
          403: { description: 'Forbidden' }, 404: { description: 'Not found' }
        }
      },
      put: {
        tags: ['Students'], summary: 'Update student (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateStudent' } } } },
        responses: { 200: { description: 'Updated student' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } }
      },
      delete: {
        tags: ['Students'], summary: 'Delete student (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Student deleted' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } }
      }
    },
    '/students/{studentId}/parent/{parentId}': {
      delete: {
        tags: ['Students'], summary: 'Remove parent from student (admin only)',
        parameters: [
          { name: 'studentId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'parentId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Parent removed' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } }
      }
    },

    // ── Parents ───────────────────────────────────────────────────────────────
    '/parents': {
      post: {
        tags: ['Parents'], summary: 'Create parent (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateParent' } } } },
        responses: { 201: { description: 'Parent created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Parent' } } } }, 403: { description: 'Forbidden' } }
      },
      get: {
        tags: ['Parents'], summary: 'List all parents (admin + bursar)',
        description: 'Bursar sees partial fields only.',
        responses: { 200: { description: 'List of parents', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Parent' } } } } }, 403: { description: 'Forbidden' } }
      }
    },
    '/parents/with-account': {
      post: {
        tags: ['Parents'], summary: 'Create parent with user account (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { fullName: { type: 'string' }, phone: { type: 'string' }, relationship: { type: 'string' }, email: { type: 'string', format: 'email', description: 'Used to create user account' } }, required: ['fullName', 'phone', 'relationship', 'email'] } } } },
        responses: { 201: { description: 'Parent and user account created' }, 403: { description: 'Forbidden' } }
      }
    },
    '/parents/add-student': {
      post: {
        tags: ['Parents'], summary: 'Add student to parent (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AddStudentToParent' } } } },
        responses: { 200: { description: 'Student added to parent' }, 403: { description: 'Forbidden' } }
      }
    },
    '/parents/student/{studentId}': {
      get: {
        tags: ['Parents'], summary: 'Get parents of a student (admin + bursar)',
        parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'List of parents' }, 403: { description: 'Forbidden' } }
      }
    },
    '/parents/{id}': {
      get: {
        tags: ['Parents'], summary: 'Get parent by ID (admin + bursar)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Parent record', content: { 'application/json': { schema: { $ref: '#/components/schemas/Parent' } } } }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } }
      },
      put: {
        tags: ['Parents'], summary: 'Update parent (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateParent' } } } },
        responses: { 200: { description: 'Updated parent' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } }
      },
      delete: {
        tags: ['Parents'], summary: 'Delete parent (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Parent deleted' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } }
      }
    },
    '/parents/{parentId}/student/{studentId}': {
      delete: {
        tags: ['Parents'], summary: 'Remove student from parent (admin only)',
        parameters: [
          { name: 'parentId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Student removed from parent' }, 403: { description: 'Forbidden' } }
      }
    },

    // ── Staff ─────────────────────────────────────────────────────────────────
    '/staff': {
      post: {
        tags: ['Staff'], summary: 'Create staff member (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateStaff' } } } },
        responses: { 201: { description: 'Staff created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Staff' } } } }, 403: { description: 'Forbidden' } }
      },
      get: {
        tags: ['Staff'], summary: 'List all staff (admin only)',
        responses: { 200: { description: 'List of staff', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Staff' } } } } }, 403: { description: 'Forbidden' } }
      }
    },
    '/staff/with-account': {
      post: {
        tags: ['Staff'], summary: 'Create staff with user account (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateStaffWithAccount' } } } },
        responses: { 201: { description: 'Staff and user account created' }, 403: { description: 'Forbidden' } }
      }
    },
    '/staff/add-subject': {
      post: {
        tags: ['Staff'], summary: 'Assign subject to teacher (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AddSubjectToStaff' } } } },
        responses: { 200: { description: 'Subject assigned' }, 403: { description: 'Forbidden' } }
      }
    },
    '/staff/add-class': {
      post: {
        tags: ['Staff'], summary: 'Assign class to teacher (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AddClassToStaff' } } } },
        responses: { 200: { description: 'Class assigned' }, 403: { description: 'Forbidden' } }
      }
    },
    '/staff/department/{department}': {
      get: {
        tags: ['Staff'], summary: 'Get staff by department (admin only)',
        parameters: [{ name: 'department', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Filtered staff' }, 403: { description: 'Forbidden' } }
      }
    },
    '/staff/status/{status}': {
      get: {
        tags: ['Staff'], summary: 'Get staff by employment status (admin only)',
        parameters: [{ name: 'status', in: 'path', required: true, schema: { type: 'string', enum: ['Full-time', 'Part-time', 'Contract', 'Probation', 'Suspended', 'Terminated'] } }],
        responses: { 200: { description: 'Filtered staff' }, 403: { description: 'Forbidden' } }
      }
    },
    '/staff/subject/{subjectId}': {
      get: {
        tags: ['Staff'], summary: 'Get teachers by subject (admin only)',
        parameters: [{ name: 'subjectId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Teachers for subject' }, 403: { description: 'Forbidden' } }
      }
    },
    '/staff/class/{classId}': {
      get: {
        tags: ['Staff'], summary: 'Get teachers by class (admin only)',
        parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Teachers for class' }, 403: { description: 'Forbidden' } }
      }
    },
    '/staff/{id}': {
      get: {
        tags: ['Staff'], summary: 'Get staff by ID',
        description: 'Admin sees all. Staff can view their own record.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Staff record', content: { 'application/json': { schema: { $ref: '#/components/schemas/Staff' } } } }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } }
      },
      put: {
        tags: ['Staff'], summary: 'Update staff (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateStaff' } } } },
        responses: { 200: { description: 'Updated staff' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } }
      },
      delete: {
        tags: ['Staff'], summary: 'Delete staff (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Staff deleted' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } }
      }
    },
    '/staff/{id}/status': {
      patch: {
        tags: ['Staff'], summary: 'Set staff employment status (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SetStaffStatus' } } } },
        responses: { 200: { description: 'Status updated' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } }
      }
    },
    '/staff/{staffId}/subject/{subjectId}': {
      delete: {
        tags: ['Staff'], summary: 'Remove subject from teacher (admin only)',
        parameters: [
          { name: 'staffId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'subjectId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Subject removed' }, 403: { description: 'Forbidden' } }
      }
    },
    '/staff/{staffId}/class/{classId}': {
      delete: {
        tags: ['Staff'], summary: 'Remove class from teacher (admin only)',
        parameters: [
          { name: 'staffId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'classId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Class removed' }, 403: { description: 'Forbidden' } }
      }
    },

    // ── Classes ───────────────────────────────────────────────────────────────
    '/classes': {
      post: {
        tags: ['Classes'], summary: 'Create class (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateClass' } } } },
        responses: { 201: { description: 'Class created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SchoolClass' } } } }, 403: { description: 'Forbidden' } }
      },
      get: {
        tags: ['Classes'], summary: 'List classes (admin + staff)',
        responses: { 200: { description: 'List of classes', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/SchoolClass' } } } } } }
      }
    },
    '/classes/{id}': {
      get: {
        tags: ['Classes'], summary: 'Get class by ID (admin + staff)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Class', content: { 'application/json': { schema: { $ref: '#/components/schemas/SchoolClass' } } } }, 404: { description: 'Not found' } }
      },
      put: {
        tags: ['Classes'], summary: 'Update class (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateClass' } } } },
        responses: { 200: { description: 'Updated class' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } }
      },
      delete: {
        tags: ['Classes'], summary: 'Delete class (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Class deleted' }, 403: { description: 'Forbidden' } }
      }
    },

    // ── Subjects ──────────────────────────────────────────────────────────────
    '/subjects': {
      post: {
        tags: ['Subjects'], summary: 'Create subject (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateSubject' } } } },
        responses: { 201: { description: 'Subject created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Subject' } } } }, 403: { description: 'Forbidden' } }
      },
      get: {
        tags: ['Subjects'], summary: 'List subjects (admin + staff)',
        responses: { 200: { description: 'List of subjects', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Subject' } } } } } }
      }
    },
    '/subjects/{id}': {
      get: {
        tags: ['Subjects'], summary: 'Get subject by ID (admin + staff)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Subject', content: { 'application/json': { schema: { $ref: '#/components/schemas/Subject' } } } }, 404: { description: 'Not found' } }
      },
      put: {
        tags: ['Subjects'], summary: 'Update subject (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateSubject' } } } },
        responses: { 200: { description: 'Updated subject' }, 403: { description: 'Forbidden' } }
      },
      delete: {
        tags: ['Subjects'], summary: 'Delete subject (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Subject deleted' }, 403: { description: 'Forbidden' } }
      }
    },

    // ── Academic Years ────────────────────────────────────────────────────────
    '/academic-years': {
      post: {
        tags: ['Academic Years'], summary: 'Create academic year (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateAcademicYear' } } } },
        responses: { 201: { description: 'Academic year created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AcademicYear' } } } }, 403: { description: 'Forbidden' } }
      },
      get: {
        tags: ['Academic Years'], summary: 'List academic years (admin + staff)',
        responses: { 200: { description: 'List of academic years', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/AcademicYear' } } } } } }
      }
    },
    '/academic-years/{id}': {
      get: {
        tags: ['Academic Years'], summary: 'Get academic year by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Academic year', content: { 'application/json': { schema: { $ref: '#/components/schemas/AcademicYear' } } } }, 404: { description: 'Not found' } }
      },
      put: {
        tags: ['Academic Years'], summary: 'Update academic year (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateAcademicYear' } } } },
        responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } }
      },
      delete: {
        tags: ['Academic Years'], summary: 'Delete academic year (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 403: { description: 'Forbidden' } }
      }
    },

    // ── Academic Terms ────────────────────────────────────────────────────────
    '/academic-terms': {
      post: {
        tags: ['Academic Terms'], summary: 'Create academic term (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateAcademicTerm' } } } },
        responses: { 201: { description: 'Term created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AcademicTerm' } } } }, 403: { description: 'Forbidden' } }
      },
      get: {
        tags: ['Academic Terms'], summary: 'List academic terms (admin + staff)',
        responses: { 200: { description: 'List of terms', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/AcademicTerm' } } } } } }
      }
    },
    '/academic-terms/{id}': {
      get: {
        tags: ['Academic Terms'], summary: 'Get academic term by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Term', content: { 'application/json': { schema: { $ref: '#/components/schemas/AcademicTerm' } } } }, 404: { description: 'Not found' } }
      },
      put: {
        tags: ['Academic Terms'], summary: 'Update academic term (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateAcademicTerm' } } } },
        responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } }
      },
      delete: {
        tags: ['Academic Terms'], summary: 'Delete academic term (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 403: { description: 'Forbidden' } }
      }
    },

    // ── Requirements ──────────────────────────────────────────────────────────
    '/requirements': {
      post: {
        tags: ['Requirements'], summary: 'Create requirement (admin + bursar)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRequirement' } } } },
        responses: { 201: { description: 'Requirement created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Requirement' } } } }, 403: { description: 'Forbidden' } }
      },
      get: {
        tags: ['Requirements'], summary: 'List requirements (admin + bursar)',
        responses: { 200: { description: 'List of requirements', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Requirement' } } } } } }
      }
    },
    '/requirements/{id}': {
      get: {
        tags: ['Requirements'], summary: 'Get requirement by ID (admin + bursar)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Requirement', content: { 'application/json': { schema: { $ref: '#/components/schemas/Requirement' } } } }, 404: { description: 'Not found' } }
      },
      put: {
        tags: ['Requirements'], summary: 'Update requirement (admin + bursar)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRequirement' } } } },
        responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } }
      },
      delete: {
        tags: ['Requirements'], summary: 'Delete requirement (admin + bursar)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 403: { description: 'Forbidden' } }
      }
    },

    // ── Requirement Sets ──────────────────────────────────────────────────────
    '/requirement-sets': {
      post: {
        tags: ['Requirement Sets'], summary: 'Create requirement set (admin + bursar)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRequirementSet' } } } },
        responses: { 201: { description: 'Requirement set created', content: { 'application/json': { schema: { $ref: '#/components/schemas/RequirementSet' } } } }, 403: { description: 'Forbidden' } }
      },
      get: {
        tags: ['Requirement Sets'], summary: 'List requirement sets (admin + bursar)',
        responses: { 200: { description: 'List of requirement sets', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/RequirementSet' } } } } } }
      }
    },
    '/requirement-sets/{id}': {
      get: {
        tags: ['Requirement Sets'], summary: 'Get requirement set by ID (admin + bursar)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Requirement set', content: { 'application/json': { schema: { $ref: '#/components/schemas/RequirementSet' } } } }, 404: { description: 'Not found' } }
      },
      put: {
        tags: ['Requirement Sets'], summary: 'Update requirement set (admin + bursar)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRequirementSet' } } } },
        responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } }
      },
      delete: {
        tags: ['Requirement Sets'], summary: 'Delete requirement set (admin + bursar)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 403: { description: 'Forbidden' } }
      }
    },

    // ── Requirement Fulfillments ──────────────────────────────────────────────
    '/requirement-fulfillments': {
      post: {
        tags: ['Requirement Fulfillments'], summary: 'Create fulfillment record (admin + bursar)',
        description: 'Initialises a fulfillment record for a student from a requirement set. Item quantities are auto-populated from the set.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRequirementFulfillment' } } } },
        responses: { 201: { description: 'Fulfillment created', content: { 'application/json': { schema: { $ref: '#/components/schemas/RequirementFulfillment' } } } }, 403: { description: 'Forbidden' } }
      },
      get: {
        tags: ['Requirement Fulfillments'], summary: 'List all fulfillments (admin + bursar)',
        responses: { 200: { description: 'List of fulfillments' } }
      }
    },
    '/requirement-fulfillments/student/{studentId}': {
      get: {
        tags: ['Requirement Fulfillments'], summary: 'Get fulfillments by student (admin + bursar)',
        parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Student fulfillments' } }
      }
    },
    '/requirement-fulfillments/requirement-set/{requirementSetId}': {
      get: {
        tags: ['Requirement Fulfillments'], summary: 'Get fulfillments by requirement set (admin + bursar)',
        parameters: [{ name: 'requirementSetId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Fulfillments for requirement set' } }
      }
    },
    '/requirement-fulfillments/student/{studentId}/requirement-set/{requirementSetId}': {
      get: {
        tags: ['Requirement Fulfillments'], summary: 'Get specific student fulfillment for a requirement set (admin + bursar)',
        parameters: [
          { name: 'studentId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'requirementSetId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Fulfillment record' } }
      }
    },
    '/requirement-fulfillments/{id}': {
      get: {
        tags: ['Requirement Fulfillments'], summary: 'Get fulfillment by ID (admin + bursar)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Fulfillment', content: { 'application/json': { schema: { $ref: '#/components/schemas/RequirementFulfillment' } } } }, 404: { description: 'Not found' } }
      },
      put: {
        tags: ['Requirement Fulfillments'], summary: 'Update fulfillment (admin + bursar)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRequirementFulfillment' } } } },
        responses: { 200: { description: 'Updated' } }
      },
      delete: {
        tags: ['Requirement Fulfillments'], summary: 'Delete fulfillment (admin + bursar)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 403: { description: 'Forbidden' } }
      }
    },
    '/requirement-fulfillments/{fulfillmentId}/items': {
      patch: {
        tags: ['Requirement Fulfillments'], summary: 'Update fulfillment items (admin + bursar)',
        description: 'Record how many of each requirement item the student has brought. Status (Incomplete/Partial/Complete) is recalculated automatically.',
        parameters: [{ name: 'fulfillmentId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateFulfillmentItems' } } } },
        responses: { 200: { description: 'Items updated, status recalculated' }, 403: { description: 'Forbidden' } }
      }
    },

    // ── School Fees ───────────────────────────────────────────────────────────
    '/school-fees': {
      post: {
        tags: ['School Fees'], summary: 'Record a fee payment (admin + bursar)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateSchoolFees' } } } },
        responses: { 201: { description: 'Fee record created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SchoolFees' } } } }, 403: { description: 'Forbidden' } }
      },
      get: {
        tags: ['School Fees'], summary: 'List fee transactions (admin + bursar)',
        parameters: [
          { name: 'termId', in: 'query', schema: { type: 'string' }, description: 'Filter by academic term' },
          { name: 'classId', in: 'query', schema: { type: 'string' }, description: 'Filter by class' },
          { name: 'studentId', in: 'query', schema: { type: 'string' }, description: 'Filter by student' },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date range start' },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date range end' }
        ],
        responses: { 200: { description: 'List of fee transactions', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/SchoolFees' } } } } } }
      }
    },
    '/school-fees/report/summary': {
      get: {
        tags: ['School Fees'], summary: 'Generate fees summary report (admin + bursar)',
        parameters: [
          { name: 'termId', in: 'query', schema: { type: 'string' } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } }
        ],
        responses: { 200: { description: 'Aggregated fees report' }, 403: { description: 'Forbidden' } }
      }
    },
    '/school-fees/admin/view': {
      get: {
        tags: ['School Fees'], summary: 'Paginated admin view of all fees (admin + bursar)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
        ],
        responses: { 200: { description: 'Paginated fee records' }, 403: { description: 'Forbidden' } }
      }
    },
    '/school-fees/student/{studentId}': {
      get: {
        tags: ['School Fees'], summary: 'Get fee transactions for a student (admin + bursar)',
        parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Student fee history with summary' } }
      }
    },
    '/school-fees/student/{studentId}/balance': {
      get: {
        tags: ['School Fees'], summary: 'Get student balance for a term (admin + bursar)',
        parameters: [
          { name: 'studentId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'termId', in: 'query', required: true, schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Current balance', content: { 'application/json': { schema: { type: 'object', properties: { balance: { type: 'number' } } } } } } }
      }
    },
    '/school-fees/class/{classId}': {
      get: {
        tags: ['School Fees'], summary: 'Get fees by class (admin + bursar)',
        parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Per-student fee summary for class' } }
      }
    },
    '/school-fees/term/{termId}': {
      get: {
        tags: ['School Fees'], summary: 'Get fees by term (admin + bursar)',
        parameters: [{ name: 'termId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Fee transactions for term with statistics' } }
      }
    },
    '/school-fees/{id}': {
      get: {
        tags: ['School Fees'], summary: 'Get fee record by ID (admin + bursar)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Fee record', content: { 'application/json': { schema: { $ref: '#/components/schemas/SchoolFees' } } } }, 404: { description: 'Not found' } }
      },
      put: {
        tags: ['School Fees'], summary: 'Update fee record (admin + bursar)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateSchoolFees' } } } },
        responses: { 200: { description: 'Updated fee record' }, 403: { description: 'Forbidden' } }
      },
      delete: {
        tags: ['School Fees'], summary: 'Delete fee record (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 403: { description: 'Forbidden' } }
      }
    },

    // ── Metadata ──────────────────────────────────────────────────────────────
    '/metadata': {
      post: {
        tags: ['Metadata'], summary: 'Create school metadata (admin only)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMetadata' } } } },
        responses: { 201: { description: 'Metadata created' }, 403: { description: 'Forbidden' } }
      },
      get: {
        tags: ['Metadata'], summary: 'List metadata',
        responses: { 200: { description: 'Metadata entries' } }
      }
    },
    '/metadata/{id}': {
      get: {
        tags: ['Metadata'], summary: 'Get metadata by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Metadata entry' }, 404: { description: 'Not found' } }
      },
      put: {
        tags: ['Metadata'], summary: 'Update metadata (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMetadata' } } } },
        responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } }
      },
      delete: {
        tags: ['Metadata'], summary: 'Delete metadata (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 403: { description: 'Forbidden' } }
      }
    }
  }
};

module.exports = openapiSpec;
