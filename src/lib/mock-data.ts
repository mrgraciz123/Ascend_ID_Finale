export const MOCK_STUDENT = {
 id: 'student-123',
 name: 'Aarav Sharma',
 university: 'IIT Bombay',
 major: 'Computer Science and Engineering',
 graduationYear: '2026',
 avatar: 'https://i.pravatar.cc/150?u=aarav-sharma-123',
 trustScore: 88,
 skills: ['React', 'TypeScript', 'Node.js', 'Machine Learning', 'Python', 'Firebase'],
 isDigiLockerConnected: false, // Will toggle to true in demo flow
 profileCompletion: 95,
};

export const MOCK_ACADEMIC_RECORDS = [
 {
 id: 'acad-1',
 type: 'Class 10 Marksheet',
 board: 'CBSE',
 year: '2020',
 score: '96.4%',
 verifiedBy: 'DigiLocker',
 },
 {
 id: 'acad-2',
 type: 'Class 12 Marksheet',
 board: 'CBSE',
 year: '2022',
 score: '95.8%',
 verifiedBy: 'DigiLocker',
 },
 {
 id: 'acad-3',
 type: 'Transfer Certificate',
 board: 'Delhi Public School',
 year: '2022',
 score: 'N/A',
 verifiedBy: 'DigiLocker',
 }
];

export const MOCK_ACHIEVEMENTS = [
 {
 id: 'ach-1',
 title: 'Google Developer Student Club Lead',
 type: 'Leadership',
 issuer: 'Google Developers',
 date: '2024-06-15',
 verified: true,
 impact: 'Led a community of 500+ students, organized 12 tech workshops.',
 },
 {
 id: 'ach-2',
 title: 'Smart India Hackathon Winner',
 type: 'Hackathon',
 issuer: 'Ministry of Education, Govt. of India',
 date: '2024-09-30',
 verified: true,
 impact: 'Built AI-powered disaster management system securing 1st prize.',
 },
 {
 id: 'ach-3',
 title: 'Software Engineering Intern',
 type: 'Internship',
 issuer: 'Zomato',
 date: '2025-08-30',
 verified: true,
 impact: 'Optimized delivery ETA algorithm reducing variance by 15%.',
 },
 {
 id: 'ach-4',
 title: 'AWS Certified Cloud Practitioner',
 type: 'Certificate',
 issuer: 'Amazon Web Services',
 date: '2025-10-12',
 verified: false,
 impact: 'Demonstrated foundational cloud architecture knowledge.',
 }
];

export const MOCK_OPPORTUNITIES = [
 {
 id: 'opp-1',
 title: 'Google STEP Internship',
 company: 'Google',
 type: 'Internship',
 matchScore: 96,
 tags: ['C++', 'Python', 'Algorithms'],
 logo: 'https://logo.clearbit.com/google.com',
 matchReason: 'High Trust Score + Past Google Developer Club Leadership perfectly matches STEP criteria.'
 },
 {
 id: 'opp-2',
 title: 'Microsoft Explore Program',
 company: 'Microsoft',
 type: 'Internship',
 matchScore: 92,
 tags: ['Software Engineering', 'Program Management'],
 logo: 'https://logo.clearbit.com/microsoft.com',
 matchReason: 'Your Smart India Hackathon win demonstrates strong cross-functional problem solving required for Explore.'
 },
 {
 id: 'opp-3',
 title: 'PM Scholarship Scheme',
 company: 'Govt. of India',
 type: 'Scholarship',
 matchScore: 98,
 tags: ['Merit', 'Undergraduate'],
 logo: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg',
 matchReason: 'Verified CBSE Class 12 score of 95.8% automatically qualifies you for the merit shortlist.'
 }
];
