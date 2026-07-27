import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database data...');
  // Clear tables in reverse dependency order
  await prisma.projectTechnology.deleteMany({});
  await prisma.caseStudy.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.technology.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.education.deleteMany({});
  await prisma.certification.deleteMany({});
  await prisma.experience.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.adminUser.deleteMany({});

  console.log('Seeding database with updated skills & tech stack...');

  // 1. Create Admin User with fixed ID
  const passwordHash = await bcrypt.hash('NadiaAdmin2026!', 10);
  const admin = await prisma.adminUser.create({
    data: {
      id: 'admin-user-nadia-id',
      name: 'Nadia Deari Hanifah',
      email: 'admin@nadia.com',
      passwordHash,
    },
  });

  // 2. Create Profile
  const profile = await prisma.profile.create({
    data: {
      name: 'Nadia Deari Hanifah',
      headline: 'Information Systems Graduate & IT System Analyst',
      shortBio: 'Information Systems graduate with hands-on experience in business process analysis, requirements analysis, system design, and web-based information system development.',
      bio: 'Information Systems graduate with hands-on experience in business process analysis, requirements analysis, system design, and web-based information system development. Skilled in analyzing business needs, modeling business processes using BPMN, designing system architecture and databases, and translating business requirements into practical system solutions. Experienced in supporting the development and testing of information systems through internships, academic projects, and organizational activities. Strong analytical, problem-solving, communication, and documentation skills with an interest in pursuing a career as an IT System Analyst.',
      profileImage: '/images/nadia_profile.jpg',
      email: 'nadyadearihanifah@gmail.com',
      phone: '+62 831-2451-7280',
      location: 'Jakarta, Indonesia',
      linkedinUrl: 'https://linkedin.com/in/nadiadearihanifah',
      githubUrl: 'https://github.com/nadia1624',
      instagramUrl: 'https://instagram.com/nadiadeari',
      cvUrl: '/documents/Nadia_Deari_Hanifah_CV.pdf',
    },
  });

  // 3. Create Technologies (Tech Stack)
  const techData = [
    // Languages
    { name: 'PHP', category: 'Languages', icon: 'php' },
    { name: 'JavaScript', category: 'Languages', icon: 'javascript' },
    { name: 'Java', category: 'Languages', icon: 'java' },
    { name: 'Python', category: 'Languages', icon: 'python' },
    
    // Frontend
    { name: 'HTML', category: 'Frontend', icon: 'html5' },
    { name: 'CSS', category: 'Frontend', icon: 'css3' },
    { name: 'Bootstrap', category: 'Frontend', icon: 'bootstrap' },
    { name: 'React.js', category: 'Frontend', icon: 'react' },
    { name: 'Tailwind CSS', category: 'Frontend', icon: 'tailwindcss' },
    
    // Backend
    { name: 'Laravel', category: 'Backend', icon: 'laravel' },
    { name: 'Node.js', category: 'Backend', icon: 'nodejs' },
    { name: 'Express.js', category: 'Backend', icon: 'express' },
    
    // Database
    { name: 'MySQL', category: 'Database', icon: 'mysql' },
    { name: 'PostgreSQL', category: 'Database', icon: 'postgresql' },
    { name: 'Sequelize ORM', category: 'Database', icon: 'database' },
    
    // Testing
    { name: 'Jest', category: 'Testing', icon: 'test-tube' },
    { name: 'React Testing Library', category: 'Testing', icon: 'check-square' },
    { name: 'Selenium WebDriver', category: 'Testing', icon: 'globe' },

    // Tools
    { name: 'Git', category: 'Tools', icon: 'git' },
    { name: 'GitHub', category: 'Tools', icon: 'github' },
    { name: 'Visual Studio Code', category: 'Tools', icon: 'vscode' },
    { name: 'Figma', category: 'Tools', icon: 'figma' },
  ];

  const technologies: { [key: string]: any } = {};
  for (const tech of techData) {
    const createdTech = await prisma.technology.create({ data: tech });
    technologies[tech.name] = createdTech;
  }
  console.log(`Created ${Object.keys(technologies).length} technologies`);

  // 4. Create Skills
  const skillsData = [
    // 1. System Analysis
    { name: 'Business Process Modeling (BPMN)', category: 'System Analysis', icon: 'Workflow', displayOrder: 1 },
    { name: 'Requirements Gathering & Analysis', category: 'System Analysis', icon: 'FileSearch', displayOrder: 2 },
    { name: 'System Modeling (UML, Use Case, DFD)', category: 'System Analysis', icon: 'Layers', displayOrder: 3 },
    { name: 'Database Design (ERD & SQL)', category: 'System Analysis', icon: 'Database', displayOrder: 4 },
    
    // 2. Technical Skills
    { name: 'Web Application Development', category: 'Technical Skills', icon: 'Code', displayOrder: 5 },
    { name: 'Software Development Life Cycle (SDLC)', category: 'Technical Skills', icon: 'Cpu', displayOrder: 6 },
    { name: 'System Testing (Black Box & UAT)', category: 'Technical Skills', icon: 'CheckSquare', displayOrder: 7 },
    { name: 'Database Management', category: 'Technical Skills', icon: 'Server', displayOrder: 8 },

    // 3. Soft Skills
    { name: 'Technical Documentation & Reporting', category: 'Soft Skills', icon: 'FileText', displayOrder: 9 },
    { name: 'Analytical & Problem-Solving Skills', category: 'Soft Skills', icon: 'BrainCircuit', displayOrder: 10 },
    { name: 'Communication & Collaboration', category: 'Soft Skills', icon: 'Users', displayOrder: 11 },
    { name: 'Attention to Detail', category: 'Soft Skills', icon: 'Sparkles', displayOrder: 12 },
  ];

  for (const skill of skillsData) {
    await prisma.skill.create({ data: skill });
  }
  console.log(`Created ${skillsData.length} skills`);

  // 5. Create Education
  const eduData = [
    {
      institution: 'Universitas Andalas',
      degree: 'Bachelors in Information Systems',
      fieldOfStudy: 'Faculty of Information Technology',
      startDate: new Date('2022-08-15'),
      endDate: new Date('2026-06-30'),
      description: 'Thesis: "Development of a Web-Based Leadership Agenda Management Information System at the Protocol and Leadership Communication Division of the Padang City Regional Secretariat". Conducted business process analysis and developed a web-based information system to support leadership agenda management, including agenda submission, verification, confirmation, scheduling, and reporting. Applied the Software Development Life Cycle (SDLC) using the Waterfall methodology, covering business process modeling with BPMN, system modeling with UML, UI/UX and database design, and system implementation. Conducted Black Box Testing and User Acceptance Testing (UAT) to ensure that the system functionality met requirements and was accepted by users.',
      gpa: '3.86 / 4.00',
      achievement: 'Graduated with 3.86 GPA in Information Systems.',
      displayOrder: 1,
    },
  ];

  for (const edu of eduData) {
    await prisma.education.create({ data: edu });
  }

  // 6. Create Certifications & Trainings
  const certData = [
    // Certifications
    {
      name: 'System Analyst & Business Process Modeling Certification',
      issuingOrganization: 'Faculty of Information Technology UNAND',
      issueDate: new Date('2025-06-01'),
      credentialId: 'UNAND-IS-2026',
      credentialUrl: 'https://fit.unand.ac.id/verify/cert-2026',
      certificateImage: '/images/cert_scrum.jpg',
      type: 'Certification',
      description: 'Validation of competency in SDLC Waterfall execution, BPMN process modeling, UML diagrams, ERD database design, and UAT testing.',
    },
    {
      name: 'Scrum Foundation Professional Certificate (SFPC)',
      issuingOrganization: 'CertiProf International',
      issueDate: new Date('2024-04-10'),
      credentialId: 'SFPC-987123',
      credentialUrl: 'https://certiprof.com/verify/sfpc',
      certificateImage: '/images/cert_scrum.jpg',
      type: 'Certification',
      description: 'Validates knowledge of Scrum principles, agile software development frameworks, sprint planning, and backlog management.',
    },
    {
      name: 'Responsive Web Design Certification',
      issuingOrganization: 'freeCodeCamp',
      issueDate: new Date('2023-11-20'),
      credentialId: 'FCC-RWD-777',
      credentialUrl: 'https://freecodecamp.org/certification/nadiadeari/responsive-web-design',
      certificateImage: '/images/cert_fcc_web.jpg',
      type: 'Certification',
      description: 'Completed 300 hours of coursework covering HTML5, CSS3, Flexbox, CSS Grid, and responsive layout design.',
    },

    // Trainings & Workshops
    {
      name: 'Enterprise Architecture & TOGAF ADM Intensive Training',
      issuingOrganization: 'Laboratory of Enterprise Application (LEA) UNAND',
      issueDate: new Date('2024-09-01'),
      credentialId: 'LEA-EAF-2024',
      credentialUrl: null,
      certificateImage: '/images/cert_lea_ea.jpg',
      type: 'Training',
      description: 'Completed comprehensive practical training on building and planning Enterprise Architecture blueprints using TOGAF ADM phases A through D.',
    },
    {
      name: 'Full-stack Web Information System Development Workshop',
      issuingOrganization: 'PT. Semen Padang ICT Unit',
      issueDate: new Date('2025-01-15'),
      credentialId: 'SP-ICT-2025',
      credentialUrl: null,
      certificateImage: '/images/cert_fcc_web.jpg',
      type: 'Training',
      description: 'Internal corporate training on developing enterprise web applications with Node.js, Express, Sequelize ORM, and MySQL database.',
    },
    {
      name: 'BPMN 2.0 Business Process Analysis & Optimization Workshop',
      issuingOrganization: 'System Development Laboratory (LSD)',
      issueDate: new Date('2024-11-05'),
      credentialId: 'LSD-BPMN-2024',
      credentialUrl: null,
      certificateImage: '/images/cert_lea_ea.jpg',
      type: 'Training',
      description: 'Hands-on workshop on analyzing AS-IS business workflows and engineering TO-BE process diagrams for institutional systems.',
    },
  ];

  for (const cert of certData) {
    await prisma.certification.create({ data: cert });
  }

  // 7. Create Experiences
  const expData = [
    {
      company: 'PT. Semen Padang',
      position: 'Web Developer Intern',
      employmentType: 'Internship',
      location: 'Padang, Indonesia',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-02-28'),
      isCurrent: false,
      description: 'Analyzed business requirements and existing business processes within the ICT Unit to identify system needs and improvement opportunities.',
      responsibilities: [
        'Analyzed business requirements and existing business processes within the ICT Unit to identify system needs and improvement opportunities.',
        'Designed and developed a web-based asset management system for the Workshop ICT Unit to support asset data management and monitoring.',
        'Translated business requirements into system designs, including database structures, system workflows, and user interfaces.',
        'Developed and implemented system features using Node.js, Express.js, EJS, Sequelize ORM, and MySQL.',
        'Conducted system testing and maintenance to ensure system functionality and data accuracy.',
        'Supported the maintenance and management of ICT workshop assets to improve asset monitoring and operational efficiency.',
      ],
      technologies: ['Node.js', 'Express.js', 'EJS Templates', 'Sequelize ORM', 'MySQL', 'BPMN 2.0'],
      companyLogo: '/images/semen_padang.png',
      displayOrder: 1,
    },
    {
      company: 'System Development Laboratory (LSD) in UNAND',
      position: 'Secretary General',
      employmentType: 'Student Organization',
      location: 'Padang, Indonesia',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2026-02-28'),
      isCurrent: false,
      description: 'Coordinated administrative activities and maintained organizational documentation to support effective laboratory operations.',
      responsibilities: [
        'Coordinated administrative activities and maintained organizational documentation to support effective laboratory operations.',
        'Managed meeting schedules, correspondence, and official documents, ensuring accurate and well-organized records.',
        'Coordinated communication and information distribution among laboratory members to support academic and organizational activities.',
        'Assisted in organizing laboratory programs, activities, and internal coordination.',
      ],
      technologies: ['Administration', 'Documentation', 'Process Coordination'],
      companyLogo: '/images/lsd_logo.png',
      displayOrder: 2,
    },
    {
      company: 'System Development Laboratory (LSD) in UNAND',
      position: 'Laboratory Assistant',
      employmentType: 'Academic Appointment',
      location: 'Padang, Indonesia',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-06-30'),
      isCurrent: false,
      description: 'Assisted lecturers and instructors in delivering practical sessions related to web programming.',
      responsibilities: [
        'Assisted lecturers and instructors in delivering practical sessions related to web programming.',
        'Guided students in completing programming exercises and troubleshooting technical issues during practical sessions.',
        'Supported the preparation of practical materials and assisted in evaluating student assignments and activities.',
      ],
      technologies: ['Web Programming', 'Mentoring', 'Evaluation'],
      companyLogo: '/images/lsd_logo.png',
      displayOrder: 3,
    },
    {
      company: 'Himpunan Mahasiswa Sistem Informasi (HMSI) in UNAND',
      position: 'Human Resources Development Staff',
      employmentType: 'Student Organization',
      location: 'Padang, Indonesia',
      startDate: new Date('2023-10-01'),
      endDate: new Date('2024-10-31'),
      isCurrent: false,
      description: 'Participated in organizational activities and supported the implementation of student programs and events.',
      responsibilities: [
        'Participated in organizational activities and supported the implementation of student programs and events.',
        'Collaborated with fellow members in planning and executing activities to support students in the Information Systems program.',
      ],
      technologies: ['HR Development', 'Event Planning', 'Team Collaboration'],
      companyLogo: '/images/hmsi_logo.png',
      displayOrder: 4,
    },
  ];

  for (const exp of expData) {
    await prisma.experience.create({ data: exp });
  }

  // 8. Create Projects
  const project1 = await prisma.project.create({
    data: {
      title: 'Leadership Agenda Management Information System',
      slug: 'leadership-agenda-management-system',
      shortDescription: 'A web-based information system designed to streamline agenda submission, verification, confirmation, scheduling, staff assignment, and reporting for city secretariat leadership.',
      fullDescription: 'Analyzed and redesigned leadership agenda management processes using the Waterfall SDLC, including AS-IS and TO-BE business process modeling with BPMN. Designed the system using UML, ERD, and UI/UX, and developed features for agenda submission, verification, confirmation, scheduling, staff assignment, and reporting. Integrated the Google Calendar API and conducted User Acceptance Testing (UAT) to support agenda synchronization and ensure the system met user requirements.',
      category: 'Systems Analysis & Web Application',
      role: 'Lead Systems Analyst & Developer (Thesis Project)',
      thumbnail: '/images/projects/agenda_thumbnail.jpg',
      projectImages: ['/images/projects/agenda_screenshot1.jpg'],
      liveUrl: 'https://agenda-padang.demo.com',
      githubUrl: 'https://github.com/nadia1624/leadership-agenda-system',
      featured: true,
      displayOrder: 1,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'ICT Workshop Asset Management Information System',
      slug: 'ict-workshop-asset-management-system',
      shortDescription: 'A web-based Asset Management Information System developed for PT. Semen Padang to support asset data management, monitoring, and maintenance.',
      fullDescription: 'Analyzed business requirements and existing asset management processes within the ICT Workshop to identify system needs and improvement opportunities. Designed and developed a web-based Asset Management Information System to support asset data management, monitoring, and maintenance. Designed system workflows and database structures, and implemented the system using Node.js, Express.js, EJS, Sequelize ORM, and MySQL.',
      category: 'Web Application & Asset Management',
      role: 'Systems Analyst & Web Developer Intern',
      thumbnail: '/images/projects/semen_padang_thumbnail.jpg',
      projectImages: ['/images/projects/semen_padang_screenshot.jpg'],
      liveUrl: null,
      githubUrl: 'https://github.com/nadia1624/ict-asset-management',
      featured: true,
      displayOrder: 2,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      title: 'SILAPOR — Lost and Found Reporting Information System',
      slug: 'silapor-lost-and-found-system',
      shortDescription: 'A web-based reporting system to facilitate the reporting, cataloging, and recovery of lost and found items at Universitas Andalas.',
      fullDescription: 'Designed and developed a web-based Lost and Found Reporting Information System to facilitate the reporting and management of lost and found items at Universitas Andalas. Implemented features for lost and found item reporting, item data management, and item search to help users identify and recover lost belongings. Designed the system workflow and database structure and implemented the system using Node.js, Express.js, EJS, Sequelize ORM, and MySQL.',
      category: 'Web Application',
      role: 'Full-stack Developer & System Designer',
      thumbnail: '/images/projects/silapor_thumbnail.jpg',
      projectImages: ['/images/projects/silapor_screenshot.jpg'],
      liveUrl: 'https://silapor.unand.ac.id',
      githubUrl: 'https://github.com/nadia1624/silapor-unand',
      featured: true,
      displayOrder: 3,
    },
  });

  const project4 = await prisma.project.create({
    data: {
      title: 'BIMTA – Final Project Guidance Management System',
      slug: 'bimta-final-project-guidance-system',
      shortDescription: 'A web-based guidance and final project management system designed to streamline proposal submission, supervisor selection, and approval processes.',
      fullDescription: 'Designed and developed a web-based Final Project Management Information System to support the management of final project processes for Information Systems students. Implemented features for final project submission, supervisor selection, supervisor approval, and final project management to streamline the academic process. Designed system workflows and database structures to support an organized and efficient final project management process.',
      category: 'Web Application',
      role: 'Full-stack Developer & System Designer',
      thumbnail: '/images/projects/bimta_thumbnail.jpg',
      projectImages: ['/images/projects/bimta_screenshot.jpg'],
      liveUrl: 'https://bimta.unand.ac.id',
      githubUrl: 'https://github.com/nadia1624/bimta-system',
      featured: false,
      displayOrder: 4,
    },
  });

  // 9. Create ProjectTechnology relations
  const p1Techs = ['React.js', 'Express.js', 'PostgreSQL', 'Sequelize ORM', 'HTML', 'CSS', 'JavaScript'];
  for (const tName of p1Techs) {
    if (technologies[tName]) {
      await prisma.projectTechnology.create({
        data: {
          projectId: project1.id,
          technologyId: technologies[tName].id,
        },
      });
    }
  }

  const p2Techs = ['Node.js', 'Express.js', 'Sequelize ORM', 'MySQL', 'JavaScript', 'HTML'];
  for (const tName of p2Techs) {
    if (technologies[tName]) {
      await prisma.projectTechnology.create({
        data: {
          projectId: project2.id,
          technologyId: technologies[tName].id,
        },
      });
    }
  }

  const p3Techs = ['Node.js', 'Express.js', 'Sequelize ORM', 'MySQL', 'JavaScript'];
  for (const tName of p3Techs) {
    if (technologies[tName]) {
      await prisma.projectTechnology.create({
        data: {
          projectId: project3.id,
          technologyId: technologies[tName].id,
        },
      });
    }
  }

  const p4Techs = ['Laravel', 'PHP', 'MySQL', 'Bootstrap'];
  for (const tName of p4Techs) {
    if (technologies[tName]) {
      await prisma.projectTechnology.create({
        data: {
          projectId: project4.id,
          technologyId: technologies[tName].id,
        },
      });
    }
  }

  // 10. Create Case Studies
  await prisma.caseStudy.create({
    data: {
      projectId: project1.id,
      overview: 'Development of a Web-Based Leadership Agenda Management Information System at the Protocol and Leadership Communication Division of the Padang City Regional Secretariat.',
      background: 'The leadership agenda management process at the Padang City Regional Secretariat was previously handled manually, resulting in potential scheduling overlaps, delayed confirmations, and difficulties in generating real-time agenda reports for city officials.',
      problem: 'Manual agenda coordination, scheduling conflicts between city leaders, lack of real-time status tracking for agenda requests, and inefficient report generation.',
      process: 'Applied the Software Development Life Cycle (SDLC) using the Waterfall methodology, covering business process modeling with BPMN, system modeling with UML, UI/UX and database design, implementation, and UAT testing.',
      businessProcess: 'Agenda submission → Secretariat verification → Leadership confirmation → Staff assignment → Google Calendar sync → Reporting.',
      asIsProcess: 'External/internal entities submit paper agenda requests → Staff manually check availability → Paper routing for approval → Confirmation communicated via phone/letter.',
      toBeProcess: 'Entities submit digital requests online → Automated verification queue → Leadership confirms with one click → Real-time Google Calendar sync and digital report export.',
      requirementsAnalysis: 'Functional Requirements: (1) Agenda submission portal, (2) Verification & confirmation dashboard, (3) Google Calendar API integration, (4) Staff assignment & report generation.',
      bpmn: '/images/case_studies/agenda_bpmn.png',
      uml: '/images/case_studies/agenda_uml.png',
      uiUxDesign: 'Designed institutional dashboards in Figma with responsive layout controls for mobile and desktop access.',
      databaseDesign: '/images/case_studies/agenda_erd.png',
      development: 'Developed using React.js on the frontend, Express.js & Sequelize ORM on the backend, and PostgreSQL database with Google Calendar API integration.',
      testing: 'Executed Black Box Testing for functional validation across all user roles and conducted User Acceptance Testing (UAT).',
      uat: 'Successfully conducted UAT with secretariat staff and protocol officers, achieving 95% satisfaction and complete functional acceptance.',
      result: 'Digitized leadership agenda scheduling, eliminated paper delays, and enabled instant agenda synchronization with Google Calendar.',
    },
  });

  await prisma.caseStudy.create({
    data: {
      projectId: project2.id,
      overview: 'Web-based Asset Management Information System developed during internship at PT. Semen Padang for the ICT Workshop Unit.',
      background: 'The ICT Unit at PT. Semen Padang required a centralized system to track equipment repair, asset lifecycle, hardware assignments, and maintenance logs across departments.',
      problem: 'Dispersed asset records, difficulty tracking repair statuses, manual maintenance logging, and inventory inaccuracy.',
      process: 'Analyzed ICT Unit business requirements, designed database schema and system workflows, and developed full-stack web application using Node.js & Sequelize ORM.',
      businessProcess: 'Asset registration → Maintenance request → Workshop assignment → Repair tracking → Status completion.',
      asIsProcess: 'Manual logbooks and spreadsheets used to track hardware repairs and ICT equipment dispatches.',
      toBeProcess: 'Centralized web portal where asset movements, maintenance requests, and repair logs are updated in real-time with automated reporting.',
      requirementsAnalysis: 'Requirements: Asset cataloging, repair lifecycle tracking, user role management, exportable maintenance reports.',
      bpmn: '/images/case_studies/asset_bpmn.png',
      uml: '/images/case_studies/asset_uml.png',
      uiUxDesign: 'Designed clean administrative tables and status badges in EJS & Tailwind CSS.',
      databaseDesign: '/images/case_studies/asset_erd.png',
      development: 'Built using Node.js, Express.js, EJS templates, Sequelize ORM, and MySQL database.',
      testing: 'Conducted unit testing and integration testing within the ICT Unit environment.',
      uat: 'Validated with ICT Workshop staff and system administrators.',
      result: 'Improved ICT workshop asset monitoring, reduced maintenance tracking errors, and boosted operational efficiency.',
    },
  });

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
