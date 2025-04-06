export const studentData = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@school.com',
  phone: '+1 234 567 8900',
  gender: 'Male',
  parents: [
    {
      name: 'John Doe',
      email: 'test@gmail.com',
      phone: '+1 234 567 8900',
      relation: 'Jason Smith',
    },
    {
      name: 'Jane Doe',
      email: 'test@gmail.com',
      phone: '+1 234 567 8900',
      relation: 'Jane Doe',
    },
  ],
  profileImage: '/api/placeholder/150/150',
  rollNumber: '2024ST001',
  currentBatch: {
    grade: '10',
    class: '10A',
    year: '2024',
    noOfSubjects: '7',
    subjects: [
      {
        name: 'Mathematics',
        subCode: '343243',
        terms: ['Term 1', 'Term 3', 'Term 4'],
      },
      {
        name: 'Physics',
        subCode: '234234',
        terms: ['Term 2', 'Term 4'],
      },
      {
        name: 'English',
        subCode: '123123',
        terms: ['Term 1', 'Term 2', 'Term 4'],
      },
      {
        name: 'Chemistry',
        subCode: '456456',
        terms: ['Term 3'],
      },
      {
        name: 'Biology',
        subCode: '789789',
        terms: ['Term 1', 'Term 2', 'Term 3'],
      },
      {
        name: 'History',
        subCode: '112112',
        terms: ['Term 2', 'Term 3'],
      },
      {
        name: 'Geography',
        subCode: '223223',
        terms: ['Term 1', 'Term 4'],
      },
      {
        name: 'Economics',
        subCode: '334334',
        terms: ['Term 2', 'Term 3', 'Term 4'],
      },
      {
        name: 'Political Science',
        subCode: '445445',
        terms: ['Term 1', 'Term 3'],
      },
      {
        name: 'Computer Science',
        subCode: '556556',
        terms: ['Term 1', 'Term 2', 'Term 3', 'Term 4'],
      },
      {
        name: 'Environmental Science',
        subCode: '667667',
        terms: ['Term 2', 'Term 4'],
      },
      {
        name: 'Art',
        subCode: '778778',
        terms: ['Term 3', 'Term 4'],
      },
      {
        name: 'Music',
        subCode: '889889',
        terms: ['Term 1', 'Term 2'],
      },
      {
        name: 'Physical Education',
        subCode: '990990',
        terms: ['Term 1', 'Term 3'],
      },
      {
        name: 'Philosophy',
        subCode: '101010',
        terms: ['Term 2', 'Term 4'],
      },
    ],

    results: [
      {
        examName: 'Winter Exam',
        date: '2024-02-15',
        subjects: [
          { name: 'Mathematics', marks: '85/100', oral: '85%', practical: '1' },
          { name: 'Physics', marks: '85/100', oral: '85%', practical: '1' },
          { name: 'English', marks: '85/100', oral: '85%', practical: '1' },
        ],
        performance: '4 out of 7 ',
        summary: 'Learner has shown average performance in this term, Needs improvement in English',
        oral: 'A',
      },
      {
        examName: 'Summer Exam',
        date: '2024-04-20',
        subjects: [
          { name: 'Mathematics', marks: 'O' },
          { name: 'Physics', marks: 'A' },
          { name: 'English', marks: 'A' },
          { name: 'Chemistry', marks: 'A' },
        ],
        performance: '1 out of 7',
        summary: 'Learner has shown good improvement in this term',
      },
      {
        examName: 'Autum Exam',
        date: '2024-07-15',
        subjects: [
          { name: 'Mathematics', marks: 'A' },
          { name: 'Physics', marks: 'B' },
          { name: 'English', marks: 'B' },
          { name: 'Biology', marks: 'B' },
        ],
        performance: '5 out of 7',
        summary: 'Learner has shown average performance in this term',
      },
      {
        examName: 'Surprise Exam',
        date: '2024-10-05',
        status: 'Upcoming',
      },
    ],
  },
  academicHistory: [
    {
      year: '2023',
      grade: '9',
      class: '9B',
      results: {
        finalGrade: 'A',
        percentage: '88%',
      },
      assessments: [
        {
          name: 'Term 1',
          score: '87%',
          subjects: [
            { name: 'Mathematics', grade: 'A+' },
            { name: 'Science', grade: 'A' },
            { name: 'English', grade: 'B+' },
            { name: 'History', grade: 'B' },
            { name: 'Geography', grade: 'A-' },
          ],
        },
        {
          name: 'Term 2',
          score: '90%',
          subjects: [
            { name: 'Physics', grade: 'A+' },
            { name: 'Chemistry', grade: 'A' },
            { name: 'Mathematics', grade: 'A' },
            { name: 'Biology', grade: 'A' },
            { name: 'Physical Education', grade: 'B+' },
          ],
        },
        {
          name: 'Term 3',
          score: '87%',
          subjects: [
            { name: 'Mathematics', grade: 'A+' },
            { name: 'Chemistry', grade: 'A-' },
            { name: 'Geography', grade: 'A' },
            { name: 'English', grade: 'B' },
            { name: 'Computer Science', grade: 'A' },
          ],
        },
        {
          name: 'Term 4',
          score: '87%',
          subjects: [
            { name: 'Mathematics', grade: 'A+' },
            { name: 'History', grade: 'A' },
            { name: 'Science', grade: 'B+' },
            { name: 'Geography', grade: 'A-' },
            { name: 'Political Science', grade: 'B' },
          ],
        },
      ],
    },
    {
      year: '2024',
      grade: '10',
      class: '10A',
      results: {
        finalGrade: 'A',
        percentage: '92%',
      },
      assessments: [
        {
          name: 'Term 1',
          score: '91%',
          subjects: [
            { name: 'Mathematics', grade: 'A+' },
            { name: 'Physics', grade: 'A' },
            { name: 'Chemistry', grade: 'A' },
            { name: 'Biology', grade: 'A-' },
            { name: 'Computer Science', grade: 'A' },
          ],
        },
        {
          name: 'Term 2',
          score: '94%',
          subjects: [
            { name: 'Mathematics', grade: 'A+' },
            { name: 'English', grade: 'A', oral: 'A', practical: 'A' },
            { name: 'History', grade: 'A', oral: 'A', practical: 'A' },
            { name: 'Geography', grade: 'A-', oral: 'A', practical: 'A' },
            { name: 'Physical Education', grade: 'B+', oral: 'A', practical: 'A' },
          ],
        },
        {
          name: 'Term 3',
          score: '89%',
          subjects: [
            { name: 'Physics', grade: 'A', oral: 'A', practical: 'A' },
            { name: 'Mathematics', grade: 'A+', oral: 'A', practical: 'A' },
            { name: 'Computer Science', grade: 'A-', oral: 'A', practical: 'A' },
            { name: 'Biology', grade: 'A', oral: 'A', practical: 'A' },
            { name: 'Political Science', grade: 'B+', oral: 'A', practical: 'A' },
          ],
        },
        {
          name: 'Term 4',
          score: '92%',
          subjects: [
            { name: 'Mathematics', grade: 'A+' },
            { name: 'Chemistry', grade: 'A' },
            { name: 'History', grade: 'A' },
            { name: 'Biology', grade: 'A-' },
            { name: 'English', grade: 'A' },
          ],
        },
      ],
    },
    {
      year: '2025',
      grade: '11',
      class: '11A',
      results: {
        finalGrade: 'A',
        percentage: '95%',
      },
      assessments: [
        {
          name: 'Winter Exam',
          score: '93%',
          subjects: [
            { name: 'Mathematics', grade: 'A+' },
            { name: 'Physics', grade: 'A' },
            { name: 'Chemistry', grade: 'A' },
            { name: 'Biology', grade: 'A' },
            { name: 'Economics', grade: 'A-' },
          ],
        },
        {
          name: 'Summer Exam',
          score: '96%',
          subjects: [
            { name: 'English', grade: 'A+' },
            { name: 'Geography', grade: 'A' },
            { name: 'History', grade: 'A+' },
            { name: 'Physical Education', grade: 'A' },
            { name: 'Philosophy', grade: 'A' },
          ],
        },
        {
          name: 'Autum Exam',
          score: '90%',
          subjects: [
            { name: 'Physics', grade: 'A' },
            { name: 'Chemistry', grade: 'A+' },
            { name: 'Biology', grade: 'A' },
            { name: 'Geography', grade: 'B+' },
            { name: 'Economics', grade: 'A' },
          ],
        },
        {
          name: 'Surprise Exam',
          score: '92%',
          subjects: [
            { name: 'Mathematics', grade: 'A+' },
            { name: 'History', grade: 'A' },
            { name: 'Physics', grade: 'A' },
            { name: 'English', grade: 'A+' },
            { name: 'Political Science', grade: 'B+' },
          ],
        },
      ],
    },
  ],
};
