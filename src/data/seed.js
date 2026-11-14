/*
  Demo data for the front-end prototype (there is no backend in Phase 4).
  Dates are created relative to "today" so states like "Closes in 2 days" always show.

  Collections (each one is an array in the store):
    accounts, students, companies, listings, applications, externalApplications,
    saved, notifications, shortlistTables, assistantChats, importedListings,
    externalSources, auditLog

  Demo logins are listed in README.md and on the login page.
*/
import { ACCOUNT_STATUS, APP_STATUS, LISTING_SOURCE, POSTING_STATUS, ROLES } from '../lib/constants'
import { daysFromNow } from '../lib/format'

const DEMO_PASSWORD_STUDENT = 'Student123'
const DEMO_PASSWORD_COMPANY = 'Company123'
const DEMO_PASSWORD_ADMIN = 'Admin1234'

// ---------- companies ----------
function buildCompanies() {
  const base = (id, name, extra) => ({
    id,
    name,
    crNumber: '',
    industry: 'Technology',
    city: 'Riyadh',
    email: '',
    contactPerson: '',
    phone: '+966 50 000 0000',
    website: '',
    description: '',
    size: '',
    logo: null,
    submittedAt: daysFromNow(-120),
    ...extra,
  })

  return [
    base('c_aramco', 'Aramco Digital', {
      crNumber: '2051234567',
      industry: 'Technology',
      city: 'Dhahran',
      email: 'hr@aramcodigital.sa',
      contactPerson: 'Faisal Alharbi',
      website: 'https://example.com/aramco-digital',
      size: '1,000+ employees',
      description:
        "Aramco Digital builds digital products that support Saudi Arabia's digital transformation, from industrial IoT to cloud platforms.",
    }),
    base('c_stc', 'stc', {
      crNumber: '1010150269',
      industry: 'Telecommunications',
      city: 'Riyadh',
      email: 'early.careers@stc.sa',
      contactPerson: 'Reem Alotaibi',
      website: 'https://example.com/stc',
      size: '10,000+ employees',
      description: 'stc is a leading digital enabler in the region, offering telecom, cloud and data services.',
    }),
    base('c_sabic', 'SABIC', {
      crNumber: '2055002316',
      industry: 'Petrochemicals',
      city: 'Jubail',
      email: 'training@sabic.sa',
      contactPerson: 'Khalid Alshammari',
      website: 'https://example.com/sabic',
      size: '10,000+ employees',
      description: 'SABIC is a global chemicals company with manufacturing sites across the Kingdom.',
    }),
    base('c_tamara', 'Tamara', {
      crNumber: '1010687812',
      industry: 'Finance',
      city: 'Riyadh',
      email: 'talent@tamara.sa',
      contactPerson: 'Lama Alsaud',
      website: 'https://example.com/tamara',
      size: '500+ employees',
      description: 'Tamara is a Saudi fintech offering buy-now-pay-later shopping for millions of customers.',
    }),
    base('c_rawabi', 'Rawabi Holding', {
      crNumber: '2051009876',
      industry: 'Energy',
      city: 'Khobar',
      email: 'careers@rawabi.sa',
      contactPerson: 'Majed Alqahtani',
      website: 'https://example.com/rawabi',
      size: '5,000+ employees',
      description: 'Rawabi Holding is a diversified group working in energy services, trading and industry.',
    }),
    base('c_lucidya', 'Lucidya', {
      crNumber: '1010456789',
      industry: 'Technology',
      city: 'Riyadh',
      email: 'jobs@lucidya.sa',
      contactPerson: 'Sara Almutairi',
      website: 'https://example.com/lucidya',
      size: '100+ employees',
      description: 'Lucidya is a Saudi SaaS company that turns customer conversations into insights using AI.',
    }),
    // waiting for admin approval (FR-A2, FR-AD1)
    base('c_naseej', 'Naseej Technology', {
      crNumber: '1010793482',
      industry: 'Technology',
      city: 'Riyadh',
      email: 'admin@naseej.sa',
      contactPerson: 'Ahmed Alqahtani',
      submittedAt: daysFromNow(-1, 10),
    }),
    base('c_gulf', 'Gulf Energy Services', {
      crNumber: '2050147291',
      industry: 'Energy',
      city: 'Khobar',
      email: 'hr@gulfenergy.sa',
      contactPerson: 'Yousef Aldossary',
      submittedAt: daysFromNow(-2, 14),
    }),
    base('c_madar', 'Madar Logistics', {
      crNumber: '4030291847',
      industry: 'Logistics',
      city: 'Jeddah',
      email: 'people@madar.sa',
      contactPerson: 'Hind Alzahrani',
      submittedAt: daysFromNow(-3, 11),
    }),
    // rejected by admin
    base('c_nova', 'Nova Retail', {
      crNumber: '1010333444',
      industry: 'Retail',
      city: 'Jeddah',
      email: 'careers@novaretail.sa',
      contactPerson: 'Omar Bakr',
      submittedAt: daysFromNow(-6),
    }),
  ]
}

// ---------- students ----------
const STUDENT_ROWS = [
  // id, name, email, university, major, level, gradMonths, gpa, scale, skills, cities, types
  ['s_nora', 'Nora Alqahtani', 'nora@iau.edu.sa', 'Imam Abdulrahman Bin Faisal University', 'Computer Science', 'Senior', 8, 4.6, 5, ['JavaScript', 'React', 'Python', 'SQL'], ['Dhahran', 'Khobar', 'Riyadh'], ['Co-op', 'Internship']],
  ['s_omar', 'Omar Alharbi', 'omar@kfupm.edu.sa', 'King Fahd University of Petroleum and Minerals', 'Computer Science', 'Junior', 14, 3.4, 4, ['Java', 'Python', 'Problem Solving', 'Git'], ['Khobar', 'Dhahran'], ['Co-op']],
  ['s_layan', 'Layan Alotaibi', 'layan@ksu.edu.sa', 'King Saud University', 'Software Engineering', 'Senior', 6, 3.8, 4, ['TypeScript', 'React', 'Node.js', 'Testing'], ['Riyadh'], ['Co-op', 'Internship']],
  ['s_faisal', 'Faisal Alghamdi', 'faisal@kau.edu.sa', 'King Abdulaziz University', 'Data Science', 'Senior', 5, 4.4, 5, ['Python', 'Machine Learning', 'pandas', 'SQL'], ['Jeddah', 'Riyadh'], ['Internship']],
  ['s_reem', 'Reem Alshehri', 'reem@pnu.edu.sa', 'Princess Nourah bint Abdulrahman University', 'Computer Science', 'Senior', 7, 3.9, 4, ['Python', 'TensorFlow', 'Machine Learning', 'Data Visualization'], ['Riyadh'], ['Co-op']],
  ['s_abdullah', 'Abdullah Alzahrani', 'abdullah@kfupm.edu.sa', 'King Fahd University of Petroleum and Minerals', 'Computer Engineering', 'Senior', 6, 3.2, 4, ['C++', 'Embedded Systems', 'Python'], ['Dhahran'], ['Co-op']],
  ['s_hessa', 'Hessa Aldossary', 'hessa@iau.edu.sa', 'Imam Abdulrahman Bin Faisal University', 'Information Systems', 'Junior', 13, 4.1, 5, ['SQL', 'Power BI', 'Python', 'Excel'], ['Dammam', 'Khobar'], ['Internship', 'Summer training']],
  ['s_khalid', 'Khalid Almutairi', 'khalid@psu.edu.sa', 'Prince Sultan University', 'Software Engineering', 'Recent graduate', -2, 3.6, 4, ['Java', 'Spring', 'Docker', 'AWS'], ['Riyadh'], ['Internship']],
  ['s_sara', 'Sara Alanazi', 'sara@alfaisal.edu', 'Alfaisal University', 'Data Science', 'Senior', 9, 3.7, 4, ['Python', 'Deep Learning', 'NLP', 'PyTorch'], ['Riyadh'], ['Co-op', 'Internship']],
  ['s_majed', 'Majed Alshammari', 'majed@kfupm.edu.sa', 'King Fahd University of Petroleum and Minerals', 'Computer Science', 'Senior', 10, 3.1, 4, ['Python', 'Linux', 'Networking', 'Security'], ['Dhahran', 'Jubail'], ['Co-op', 'Summer training']],
  ['s_dana', 'Dana Alqahtani', 'dana@ksu.edu.sa', 'King Saud University', 'Computer Science', 'Junior', 15, 4.7, 5, ['Python', 'Machine Learning', 'R', 'Statistics'], ['Riyadh'], ['Internship']],
  ['s_turki', 'Turki Alenezi', 'turki@uqu.edu.sa', 'Umm Al-Qura University', 'Computer Engineering', 'Senior', 7, 3.3, 4, ['Cybersecurity', 'Python', 'Networking'], ['Makkah', 'Jeddah'], ['Summer training']],
  ['s_ghada', 'Ghada Alharthi', 'ghada@effat.edu.sa', 'Effat University', 'Software Engineering', 'Senior', 6, 3.85, 4, ['JavaScript', 'Vue', 'UX Design', 'Figma'], ['Jeddah'], ['Internship']],
  ['s_yazeed', 'Yazeed Albalawi', 'yazeed@kfupm.edu.sa', 'King Fahd University of Petroleum and Minerals', 'Data Science', 'Senior', 8, 3.5, 4, ['Python', 'Spark', 'SQL', 'Airflow'], ['Dhahran', 'Khobar'], ['Co-op']],
  // used for login error states
  ['s_new', 'Mohammed Alsaleh', 'new.student@ksu.edu.sa', 'King Saud University', 'Finance', 'Sophomore', 24, null, 4, [], [], []],
  ['s_suspended', 'Badr Alrashid', 'suspended@ksu.edu.sa', 'King Saud University', 'Marketing', 'Junior', 18, 3.0, 4, ['Marketing'], ['Riyadh'], ['Internship']],
]

function monthsFromNow(m) {
  const d = new Date()
  d.setMonth(d.getMonth() + m)
  d.setDate(1)
  return d.toISOString()
}

function buildStudents() {
  return STUDENT_ROWS.map(([id, name, email, university, major, academicLevel, grad, gpa, gpaScale, skills, preferredCities, preferredTypes], i) => ({
    id,
    name,
    email,
    phone: `+966 5${(i % 9) + 1} ${100 + i * 7} ${4000 + i * 13}`,
    university,
    major,
    academicLevel,
    graduationDate: monthsFromNow(grad),
    gpa,
    gpaScale,
    skills,
    preferredCities,
    preferredTypes,
    bio:
      id === 's_nora'
        ? ''
        : `${academicLevel} ${major} student interested in hands-on training and real projects.`,
    // resume.status: 'analysed' | 'pending' | 'unreadable'
    resume:
      id === 's_new'
        ? null
        : {
            fileName: `${name.split(' ')[0]}_Resume.pdf`,
            dataUrl: null, // null means "use /sample-resume.pdf" in the viewer
            uploadedAt: daysFromNow(-20 + i),
            status: 'analysed',
          },
    notifyStatusUpdates: true,
    createdAt: daysFromNow(-55 + i * 3),
  }))
}

// ---------- accounts ----------
function buildAccounts(students, companies) {
  const studentAccounts = students.map((s) => ({
    id: s.id,
    role: ROLES.STUDENT,
    email: s.email,
    password: DEMO_PASSWORD_STUDENT,
    name: s.name,
    status:
      s.id === 's_new' ? ACCOUNT_STATUS.UNVERIFIED : s.id === 's_suspended' ? ACCOUNT_STATUS.SUSPENDED : ACCOUNT_STATUS.ACTIVE,
    suspendReason: s.id === 's_suspended' ? 'Posting misleading information in applications.' : '',
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: s.createdAt,
  }))

  const statusFor = (id) => {
    if (['c_naseej', 'c_gulf', 'c_madar'].includes(id)) return ACCOUNT_STATUS.PENDING
    if (id === 'c_nova') return ACCOUNT_STATUS.REJECTED
    return ACCOUNT_STATUS.ACTIVE
  }

  const companyAccounts = companies.map((c, i) => ({
    id: c.id,
    role: ROLES.COMPANY,
    email: c.email,
    password: DEMO_PASSWORD_COMPANY,
    name: c.name,
    status: statusFor(c.id),
    rejectReason:
      c.id === 'c_nova'
        ? 'The CR number does not match the company name on the commercial register. Please check the details and resubmit.'
        : '',
    suspendReason: '',
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: c.submittedAt ?? daysFromNow(-90 + i * 5),
  }))

  const admin = {
    id: 'a_admin',
    role: ROLES.ADMIN,
    email: 'admin@internconnect.sa',
    password: DEMO_PASSWORD_ADMIN,
    name: 'Abdulrahman Almalki',
    status: ACCOUNT_STATUS.ACTIVE,
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: daysFromNow(-200),
  }

  return [...studentAccounts, ...companyAccounts, admin]
}

// ---------- listings ----------
function listing(id, fields) {
  return {
    id,
    source: LISTING_SOURCE.INTERNAL,
    companyId: null,
    companyName: null, // only for external listings
    externalUrl: null,
    title: '',
    summary: '',
    description: '',
    responsibilities: [],
    requirements: [],
    skills: [],
    trainingType: 'Internship',
    majors: [],
    academicLevels: ['Junior', 'Senior'],
    city: 'Riyadh',
    workMode: 'On-site',
    durationWeeks: 12,
    startDate: daysFromNow(90),
    deadline: daysFromNow(30),
    openings: 3,
    paid: true,
    stipend: null,
    screeningQuestions: [],
    status: POSTING_STATUS.OPEN,
    removedReason: '',
    postedAt: daysFromNow(-5),
    shortlistApprovedAt: null,
    finalizedAt: null,
    ...fields,
  }
}

const SWE_QUESTIONS = [
  { id: 'q1', text: 'Are you able to start full time on the listed start date?', type: 'yesno', required: true },
  { id: 'q2', text: 'Link to a project you are proud of (GitHub, portfolio, etc.)', type: 'text', required: false },
]

function buildListings() {
  return [
    listing('l_swe_coop', {
      companyId: 'c_aramco',
      title: 'Software Engineering Co-op',
      summary: 'Build reliable digital products with an agile engineering team.',
      description:
        "Join Aramco Digital's engineering team and work on products that support Saudi Arabia's digital transformation. You will pair with experienced engineers, contribute production code, and learn modern delivery practices.",
      responsibilities: [
        'Build and test features for customer-facing web applications.',
        'Participate in code reviews, sprint planning, and team demos.',
        'Work with product and design to turn requirements into clear solutions.',
        'Document technical decisions and share learnings with the team.',
      ],
      requirements: [
        'Currently pursuing a degree in Computer Science or Software Engineering.',
        'Eligible for a university Co-op program.',
        'Foundation in JavaScript, TypeScript, or a similar language.',
        'Strong communication skills in English; Arabic is an advantage.',
      ],
      skills: ['JavaScript', 'TypeScript', 'React', 'Git'],
      trainingType: 'Co-op',
      majors: ['Computer Science', 'Software Engineering', 'Computer Engineering'],
      academicLevels: ['Junior', 'Senior'],
      city: 'Dhahran',
      workMode: 'On-site',
      durationWeeks: 24,
      startDate: daysFromNow(75),
      deadline: daysFromNow(2, 23),
      openings: 4,
      screeningQuestions: SWE_QUESTIONS,
      postedAt: daysFromNow(-2),
    }),
    listing('l_data_analytics', {
      companyId: 'c_stc',
      title: 'Data Analytics Intern',
      summary: 'Turn business data into clear insights for product teams.',
      description:
        'Work with the stc analytics team to build dashboards and analyses that help product managers make better decisions.',
      responsibilities: [
        'Clean and prepare data from several internal sources.',
        'Build dashboards in Power BI for product teams.',
        'Present findings to stakeholders every two weeks.',
      ],
      requirements: [
        'Studying Data Science, Computer Science, Information Systems or a related field.',
        'Good SQL skills and basic Python.',
        'Curious and comfortable presenting results.',
      ],
      skills: ['SQL', 'Python', 'Power BI', 'Excel'],
      trainingType: 'Internship',
      majors: ['Data Science', 'Computer Science', 'Information Systems'],
      city: 'Riyadh',
      workMode: 'Hybrid',
      durationWeeks: 12,
      deadline: daysFromNow(12, 23),
      startDate: daysFromNow(60),
      postedAt: daysFromNow(-4),
      screeningQuestions: [{ id: 'q1', text: 'Which BI tools have you used?', type: 'text', required: true }],
    }),
    listing('l_supply_chain', {
      companyId: 'c_sabic',
      title: 'Supply Chain Trainee',
      summary: 'Support planning and logistics across a global supply network.',
      description: 'Spend the summer with the SABIC supply chain team in Jubail, supporting demand planning and logistics.',
      responsibilities: ['Track shipments and update planning sheets.', 'Join weekly S&OP meetings.', 'Prepare a final improvement proposal.'],
      requirements: ['Studying Industrial Engineering, Supply Chain or Management.', 'Strong Excel skills.'],
      skills: ['Excel', 'Planning', 'Communication'],
      trainingType: 'Summer training',
      majors: ['Industrial Engineering', 'Supply Chain Management', 'Management'],
      academicLevels: ['Sophomore', 'Junior', 'Senior'],
      city: 'Jubail',
      workMode: 'On-site',
      durationWeeks: 8,
      deadline: daysFromNow(20, 23),
      startDate: daysFromNow(45),
      postedAt: daysFromNow(-7),
    }),
    listing('l_product_design', {
      companyId: 'c_tamara',
      title: 'Product Design Intern',
      summary: 'Help design simple experiences for millions of shoppers.',
      description: 'Work with the Tamara design team on the checkout and app experience, from research to high-fidelity designs.',
      responsibilities: ['Create wireframes and prototypes in Figma.', 'Run usability tests with real users.', 'Work closely with engineers during hand-off.'],
      requirements: ['Portfolio showing UX or UI work.', 'Studying Design, Software Engineering or a related field.'],
      skills: ['Figma', 'UX Design', 'Prototyping'],
      trainingType: 'Internship',
      majors: ['Graphic Design', 'Software Engineering', 'Computer Science'],
      city: 'Riyadh',
      workMode: 'Hybrid',
      durationWeeks: 12,
      deadline: daysFromNow(30, 23),
      startDate: daysFromNow(70),
      postedAt: daysFromNow(-7),
    }),
    listing('l_finance_coop', {
      companyId: 'c_rawabi',
      title: 'Finance Co-op Trainee',
      summary: 'Learn reporting, forecasting, and commercial finance operations.',
      description: 'Join the Rawabi Holding finance team in Khobar and support monthly reporting and forecasting.',
      responsibilities: ['Prepare monthly reports.', 'Support the budgeting cycle.', 'Reconcile accounts with the accounting team.'],
      requirements: ['Studying Finance or Accounting.', 'Good Excel skills.'],
      skills: ['Excel', 'Financial Analysis', 'Accounting'],
      trainingType: 'Co-op',
      majors: ['Finance', 'Accounting'],
      city: 'Khobar',
      workMode: 'On-site',
      durationWeeks: 24,
      deadline: daysFromNow(25, 23),
      startDate: daysFromNow(80),
      postedAt: daysFromNow(-8),
    }),
    listing('l_marketing', {
      companyId: 'c_lucidya',
      title: 'Marketing Summer Trainee',
      summary: 'Create campaign content for a fast-growing Saudi SaaS company.',
      description: 'Help the Lucidya marketing team plan and publish campaigns across social channels.',
      responsibilities: ['Write social media content in Arabic and English.', 'Track campaign results.', 'Support events and webinars.'],
      requirements: ['Studying Marketing or Management.', 'Excellent writing skills.'],
      skills: ['Content Writing', 'Social Media', 'Canva'],
      trainingType: 'Summer training',
      majors: ['Marketing', 'Management'],
      academicLevels: ['Sophomore', 'Junior', 'Senior'],
      city: 'Riyadh',
      workMode: 'Remote',
      durationWeeks: 10,
      paid: false,
      deadline: daysFromNow(40, 23),
      startDate: daysFromNow(50),
      postedAt: daysFromNow(-9),
    }),
    listing('l_network_coop', {
      companyId: 'c_stc',
      title: 'Network Engineering Co-op',
      summary: 'Work on the 5G core network with stc engineers.',
      description: 'Support the network operations team in planning and monitoring the 5G core network.',
      responsibilities: ['Monitor network KPIs.', 'Help plan capacity upgrades.', 'Write runbooks.'],
      requirements: ['Studying Electrical, Computer or Communications Engineering.'],
      skills: ['Networking', 'Linux', 'Python'],
      trainingType: 'Co-op',
      majors: ['Electrical Engineering', 'Computer Engineering'],
      city: 'Riyadh',
      workMode: 'On-site',
      durationWeeks: 28,
      deadline: daysFromNow(50, 23),
      startDate: daysFromNow(100),
      postedAt: daysFromNow(-1),
    }),
    listing('l_data_eng', {
      companyId: 'c_aramco',
      title: 'Data Engineering Intern',
      summary: 'Build data pipelines for industrial analytics.',
      description: 'Help the data platform team build and test pipelines that move plant data into the analytics platform.',
      responsibilities: ['Write and test ETL jobs.', 'Monitor pipeline quality.', 'Document data sources.'],
      requirements: ['Studying Computer Science, Data Science or Software Engineering.', 'Python and SQL.'],
      skills: ['Python', 'SQL', 'Spark', 'Airflow'],
      trainingType: 'Internship',
      majors: ['Computer Science', 'Data Science', 'Software Engineering'],
      city: 'Dhahran',
      workMode: 'Hybrid',
      durationWeeks: 12,
      deadline: daysFromNow(18, 23),
      startDate: daysFromNow(65),
      postedAt: daysFromNow(-3),
      screeningQuestions: [{ id: 'q1', text: 'Have you used Apache Spark before?', type: 'yesno', required: true }],
    }),
    // closed posting with applicants in Under Review -> shortlist tables are unlocked (FR-C7)
    listing('l_ai_trainee', {
      companyId: 'c_aramco',
      title: 'AI Engineer Trainee',
      summary: 'Apply machine learning to real industrial problems.',
      description: 'Work with the AI team to train and evaluate machine learning models for predictive maintenance.',
      responsibilities: ['Prepare training data.', 'Train and evaluate models.', 'Present results to engineers.'],
      requirements: ['Studying Computer Science or Data Science.', 'Python and machine learning basics.'],
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
      trainingType: 'Co-op',
      majors: ['Computer Science', 'Data Science', 'Computer Engineering'],
      city: 'Dhahran',
      workMode: 'On-site',
      durationWeeks: 24,
      openings: 3,
      deadline: daysFromNow(-4, 23),
      startDate: daysFromNow(40),
      postedAt: daysFromNow(-35),
      status: POSTING_STATUS.CLOSED,
    }),
    // closed + shortlist already approved -> export and finalize are available (FR-C9, FR-C10)
    listing('l_cyber_summer', {
      companyId: 'c_aramco',
      title: 'Cybersecurity Summer Training',
      summary: 'Protect industrial systems with the security operations team.',
      description: 'Spend the summer with the security operations center learning how industrial systems are protected.',
      responsibilities: ['Review security alerts.', 'Help with vulnerability scans.', 'Write a final report.'],
      requirements: ['Studying Computer Science or Computer Engineering.'],
      skills: ['Networking', 'Linux', 'Security', 'Python'],
      trainingType: 'Summer training',
      majors: ['Computer Science', 'Computer Engineering'],
      city: 'Dhahran',
      workMode: 'On-site',
      durationWeeks: 8,
      openings: 2,
      deadline: daysFromNow(-15, 23),
      startDate: daysFromNow(20),
      postedAt: daysFromNow(-50),
      status: POSTING_STATUS.CLOSED,
      shortlistApprovedAt: daysFromNow(-8, 13),
    }),
    // finalized posting (Nora was accepted) -> "Decline offer" in the tracker (FR-S5)
    listing('l_ux_research', {
      companyId: 'c_tamara',
      title: 'UX Research Summer Trainee',
      summary: 'Talk to customers and turn findings into product decisions.',
      description: 'Plan and run interviews with Tamara customers and share insights with product teams.',
      responsibilities: ['Plan research studies.', 'Run interviews.', 'Share insights.'],
      requirements: ['Interest in research and design.'],
      skills: ['UX Research', 'Communication'],
      trainingType: 'Summer training',
      majors: ['Computer Science', 'Graphic Design', 'Marketing'],
      city: 'Riyadh',
      workMode: 'Hybrid',
      durationWeeks: 8,
      openings: 2,
      deadline: daysFromNow(-30, 23),
      startDate: daysFromNow(15),
      postedAt: daysFromNow(-70),
      status: POSTING_STATUS.CLOSED,
      shortlistApprovedAt: daysFromNow(-22),
      finalizedAt: daysFromNow(-10),
    }),
    // removed by admin (FR-AD3)
    listing('l_chem_coop', {
      companyId: 'c_sabic',
      title: 'Chemical Process Co-op',
      summary: 'Support process engineers at a petrochemical plant.',
      description: 'Work with process engineers to monitor and improve plant operations.',
      skills: ['Process Simulation', 'Excel'],
      trainingType: 'Co-op',
      majors: ['Chemical Engineering'],
      city: 'Jubail',
      durationWeeks: 24,
      deadline: daysFromNow(22, 23),
      postedAt: daysFromNow(-10),
      status: POSTING_STATUS.REMOVED,
      removedReason: 'Duplicate of an existing posting with different dates. Please keep one posting per role.',
    }),
    // imported from the external job API (FR-AD4) - apply on the original site
    listing('l_ext_cloud', {
      source: LISTING_SOURCE.EXTERNAL,
      companyName: 'Elm Company',
      externalUrl: 'https://example.com/jobs/elm-cloud-support-intern',
      title: 'Cloud Support Intern',
      summary: 'Help operate cloud infrastructure for government digital services.',
      description: 'This listing was imported from an external job board. Apply on the original website.',
      skills: ['Linux', 'Cloud', 'Networking'],
      trainingType: 'Internship',
      majors: ['Computer Science', 'Computer Engineering', 'Information Systems'],
      city: 'Riyadh',
      workMode: 'On-site',
      durationWeeks: 12,
      deadline: daysFromNow(16, 23),
      postedAt: daysFromNow(-6),
    }),
    listing('l_ext_mech', {
      source: LISTING_SOURCE.EXTERNAL,
      companyName: "Ma'aden",
      externalUrl: 'https://example.com/jobs/maaden-mechanical-summer',
      title: 'Mechanical Engineering Summer Trainee',
      summary: 'Summer training at a mining and metals site.',
      description: 'This listing was imported from an external job board. Apply on the original website.',
      skills: ['AutoCAD', 'Maintenance'],
      trainingType: 'Summer training',
      majors: ['Mechanical Engineering'],
      city: 'Jubail',
      workMode: 'On-site',
      durationWeeks: 8,
      deadline: daysFromNow(28, 23),
      postedAt: daysFromNow(-11),
    }),
  ]
}

// ---------- applications ----------
function history(entries) {
  return entries.map(([status, daysAgo, note = '']) => ({ status, at: daysFromNow(-daysAgo, 10), note }))
}

function buildApplications() {
  const A = APP_STATUS
  const apps = [
    // Nora's tracker shows every status
    { id: 'app_nora_ai', listingId: 'l_ai_trainee', studentId: 's_nora', status: A.UNDER_REVIEW, appliedAt: daysFromNow(-12), history: history([[A.APPLIED, 12], [A.UNDER_REVIEW, 4, 'Posting closed']]) },
    { id: 'app_nora_cyber', listingId: 'l_cyber_summer', studentId: 's_nora', status: A.SHORT_LISTED, appliedAt: daysFromNow(-25), history: history([[A.APPLIED, 25], [A.UNDER_REVIEW, 15, 'Posting closed'], [A.SHORT_LISTED, 8]]) },
    { id: 'app_nora_dataeng', listingId: 'l_data_eng', studentId: 's_nora', status: A.APPLIED, appliedAt: daysFromNow(-1), answers: { q1: 'No' }, history: history([[A.APPLIED, 1]]) },
    { id: 'app_nora_ux', listingId: 'l_ux_research', studentId: 's_nora', status: A.ACCEPTED, appliedAt: daysFromNow(-45), history: history([[A.APPLIED, 45], [A.UNDER_REVIEW, 30, 'Posting closed'], [A.SHORT_LISTED, 22], [A.ACCEPTED, 10]]) },
    { id: 'app_nora_old', listingId: 'l_network_coop', studentId: 's_nora', status: A.WITHDRAWN, appliedAt: daysFromNow(-1), history: history([[A.APPLIED, 1], [A.WITHDRAWN, 0]]) },
  ]

  // applicants for the closed AI Engineer Trainee posting (shortlist tables demo)
  const aiApplicants = ['s_omar', 's_layan', 's_faisal', 's_reem', 's_abdullah', 's_hessa', 's_khalid', 's_sara', 's_majed', 's_dana', 's_yazeed']
  aiApplicants.forEach((sid, i) => {
    apps.push({
      id: `app_ai_${sid}`,
      listingId: 'l_ai_trainee',
      studentId: sid,
      status: sid === 's_khalid' ? A.WITHDRAWN : A.UNDER_REVIEW,
      appliedAt: daysFromNow(-20 + i),
      history:
        sid === 's_khalid'
          ? history([[A.APPLIED, 20 - i], [A.WITHDRAWN, 10]])
          : history([[A.APPLIED, 20 - i], [A.UNDER_REVIEW, 4, 'Posting closed']]),
    })
  })

  // cyber summer: shortlist approved -> some Short-Listed, others Rejected
  const cyber = [
    ['s_majed', A.SHORT_LISTED],
    ['s_turki', A.SHORT_LISTED],
    ['s_abdullah', A.SHORT_LISTED],
    ['s_omar', A.REJECTED],
    ['s_hessa', A.REJECTED],
  ]
  cyber.forEach(([sid, status], i) => {
    apps.push({
      id: `app_cyber_${sid}`,
      listingId: 'l_cyber_summer',
      studentId: sid,
      status,
      appliedAt: daysFromNow(-30 + i),
      history: history([[A.APPLIED, 30 - i], [A.UNDER_REVIEW, 15, 'Posting closed'], [status, 8]]),
    })
  })

  // open postings with fresh applications
  ;[
    ['s_omar', 'l_swe_coop', { q1: 'Yes', q2: 'https://github.com/example/omar' }],
    ['s_layan', 'l_swe_coop', { q1: 'Yes', q2: '' }],
    ['s_ghada', 'l_swe_coop', { q1: 'No', q2: 'https://example.com/ghada-portfolio' }],
    ['s_faisal', 'l_data_eng', { q1: 'Yes' }],
    ['s_yazeed', 'l_data_eng', { q1: 'Yes' }],
    ['s_hessa', 'l_data_analytics', { q1: 'Power BI, Tableau' }],
    ['s_dana', 'l_data_analytics', { q1: 'Power BI' }],
  ].forEach(([sid, lid, answers], i) => {
    apps.push({
      id: `app_${lid}_${sid}`,
      listingId: lid,
      studentId: sid,
      status: A.APPLIED,
      appliedAt: daysFromNow(-(i % 4) - 1),
      answers,
      history: history([[A.APPLIED, (i % 4) + 1]]),
    })
  })

  // ux research (finalized): one accepted besides Nora, rest rejected
  apps.push({ id: 'app_ux_ghada', listingId: 'l_ux_research', studentId: 's_ghada', status: A.ACCEPTED, appliedAt: daysFromNow(-44), history: history([[A.APPLIED, 44], [A.UNDER_REVIEW, 30], [A.SHORT_LISTED, 22], [A.ACCEPTED, 10]]) })
  apps.push({ id: 'app_ux_sara', listingId: 'l_ux_research', studentId: 's_sara', status: A.REJECTED, appliedAt: daysFromNow(-43), history: history([[A.APPLIED, 43], [A.UNDER_REVIEW, 30], [A.REJECTED, 22]]) })

  return apps.map((a) => ({ answers: {}, external: false, ...a }))
}

// ---------- everything else ----------
function buildNotifications() {
  return [
    { id: 'n1', userId: 's_nora', type: 'status', title: 'Your application moved forward', message: 'Aramco Digital is reviewing your AI Engineer Trainee application.', link: '/student/applications', read: false, createdAt: daysFromNow(0, 8) },
    { id: 'n2', userId: 's_nora', type: 'reminder', title: 'Application deadline reminder', message: 'Software Engineering Co-op at Aramco Digital closes in 2 days.', link: '/listings/l_swe_coop', read: false, createdAt: daysFromNow(0, 7) },
    { id: 'n3', userId: 's_nora', type: 'status', title: 'You were short-listed', message: 'Aramco Digital moved your Cybersecurity Summer Training application to Short-Listed.', link: '/student/applications', read: true, createdAt: daysFromNow(-1, 15) },
    { id: 'n4', userId: 'c_aramco', type: 'system', title: 'Posting closed', message: 'AI Engineer Trainee closed. 10 applicants moved to Under Review.', link: '/company/postings/l_ai_trainee/applicants', read: false, createdAt: daysFromNow(-4, 23) },
  ]
}

function buildSaved() {
  return [
    { id: 'sv1', studentId: 's_nora', listingId: 'l_swe_coop', savedAt: daysFromNow(-3), reminder: true },
    { id: 'sv2', studentId: 's_nora', listingId: 'l_product_design', savedAt: daysFromNow(-2), reminder: true },
    { id: 'sv3', studentId: 's_nora', listingId: 'l_chem_coop', savedAt: daysFromNow(-6), reminder: false },
    { id: 'sv4', studentId: 's_nora', listingId: 'l_ext_cloud', savedAt: daysFromNow(-1), reminder: true },
  ]
}

function buildExternalApplications() {
  return [
    { id: 'ext1', studentId: 's_nora', company: 'Elm Company', title: 'Cloud Support Intern', link: 'https://example.com/jobs/elm-cloud-support-intern', appliedAt: daysFromNow(-5), status: APP_STATUS.APPLIED, notes: 'Applied through their careers page.', fromListingId: 'l_ext_cloud', history: history([[APP_STATUS.APPLIED, 5]]) },
    { id: 'ext2', studentId: 's_nora', company: 'Lean Technologies', title: 'Backend Engineering Intern', link: '', appliedAt: daysFromNow(-18), status: APP_STATUS.REJECTED, notes: 'Got an email after the first interview.', fromListingId: null, history: history([[APP_STATUS.APPLIED, 18], [APP_STATUS.REJECTED, 6]]) },
  ]
}

function buildShortlistTables() {
  return [
    { id: 'tbl_cyber_final', listingId: 'l_cyber_summer', name: 'Final shortlist', applicationIds: ['app_cyber_s_majed', 'app_cyber_s_turki', 'app_cyber_s_abdullah'], isShortlist: true, createdBy: 'company', createdAt: daysFromNow(-9) },
    { id: 'tbl_ai_python', listingId: 'l_ai_trainee', name: 'Strong ML background', applicationIds: ['app_ai_s_reem', 'app_ai_s_faisal', 'app_ai_s_sara'], isShortlist: false, createdBy: 'company', createdAt: daysFromNow(-2) },
  ]
}

function buildImportedListings() {
  return [
    { id: 'imp1', title: 'Cloud Support Intern', companyName: 'Elm Company', city: 'Riyadh', trainingType: 'Internship', majors: ['Computer Science'], startDate: daysFromNow(60), deadline: daysFromNow(16), externalUrl: 'https://example.com/jobs/elm-cloud-support-intern-2', importedAt: daysFromNow(0, 6), status: 'new', duplicateOf: 'l_ext_cloud' },
    { id: 'imp2', title: 'Petroleum Engineering Co-op', companyName: 'ADES Saudi', city: 'Khobar', trainingType: 'Co-op', majors: ['Petroleum Engineering'], startDate: daysFromNow(90), deadline: daysFromNow(35), externalUrl: 'https://example.com/jobs/ades-petroleum-coop', importedAt: daysFromNow(0, 6), status: 'new', duplicateOf: null },
    { id: 'imp3', title: 'Accounting Summer Intern', companyName: 'Almarai', city: '', trainingType: '', majors: [], startDate: null, deadline: daysFromNow(21), externalUrl: 'https://example.com/jobs/almarai-accounting', importedAt: daysFromNow(-1, 6), status: 'new', duplicateOf: null },
    { id: 'imp4', title: 'Senior Software Architect', companyName: 'Tech Corp', city: 'Riyadh', trainingType: '', majors: [], startDate: null, deadline: daysFromNow(30), externalUrl: 'https://example.com/jobs/senior-architect', importedAt: daysFromNow(-1, 6), status: 'new', duplicateOf: null },
  ]
}

function buildExternalSources() {
  return [
    { id: 'src_jobs_api', name: 'Job listing API (provider TBD)', status: 'enabled', lastSyncAt: daysFromNow(0, 6), imported: 46, lastError: null, lastErrorAt: null },
  ]
}

export function buildSeed() {
  const companies = buildCompanies()
  const students = buildStudents()
  return {
    accounts: buildAccounts(students, companies),
    students,
    companies,
    listings: buildListings(),
    applications: buildApplications(),
    externalApplications: buildExternalApplications(),
    saved: buildSaved(),
    notifications: buildNotifications(),
    shortlistTables: buildShortlistTables(),
    assistantChats: [],
    importedListings: buildImportedListings(),
    externalSources: buildExternalSources(),
    auditLog: [],
  }
}

export const DEMO_ACCOUNTS = [
  { label: 'Student', email: 'nora@iau.edu.sa', password: DEMO_PASSWORD_STUDENT },
  { label: 'Company', email: 'hr@aramcodigital.sa', password: DEMO_PASSWORD_COMPANY },
  { label: 'Company pending', email: 'admin@naseej.sa', password: DEMO_PASSWORD_COMPANY },
  { label: 'Company rejected', email: 'careers@novaretail.sa', password: DEMO_PASSWORD_COMPANY },
  { label: 'Admin', email: 'admin@internconnect.sa', password: DEMO_PASSWORD_ADMIN },
  { label: 'Unverified', email: 'new.student@ksu.edu.sa', password: DEMO_PASSWORD_STUDENT },
  { label: 'Suspended', email: 'suspended@ksu.edu.sa', password: DEMO_PASSWORD_STUDENT },
]
