// Define the types for the data
type QuizResult = {
  score: number; // Percentage score
  correctQuestions: number;
  totalQuestions: number;
  resultDetails: ResultDetail[];
};

type ResultDetail = {
  questionId: number;
  questionText: string;
  isCorrect: boolean;
  selectedOptions: string[];
  correctOptions: string[];
};

type QuizQuestion = {
  questionId: number;
  options: string[];
};

// Dummy data
const quizResult: QuizResult = {
  score: 85.5, // Percentage score
  correctQuestions: 17,
  totalQuestions: 20,
  resultDetails: [
    {
      questionId: 1,
      questionText: 'What is the capital of France?',
      isCorrect: true,
      selectedOptions: ['Paris'],
      correctOptions: ['Paris'],
    },
    {
      questionId: 2,
      questionText: 'Which planet is known as the Red Planet?',
      isCorrect: false,
      selectedOptions: ['Venus'],
      correctOptions: ['Mars'],
    },
    {
      questionId: 3,
      questionText: 'What is 2 + 2?',
      isCorrect: true,
      selectedOptions: ['4'],
      correctOptions: ['4'],
    },
    {
      questionId: 4,
      questionText: 'Which programming language is used for web development?',
      isCorrect: false,
      selectedOptions: ['Python'],
      correctOptions: ['JavaScript'],
    },
  ],
};

const quiz_qanda: QuizQuestion[] = [
  {
    questionId: 1,
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
  },
  {
    questionId: 2,
    options: ['Earth', 'Mars', 'Venus', 'Jupiter'],
  },
  {
    questionId: 3,
    options: ['3', '4', '5', '6'],
  },
  {
    questionId: 4,
    options: ['Python', 'JavaScript', 'Ruby', 'C#'],
  },
];

// Example reset functions (with dummy placeholders)
const setQuizCompleted = (value: boolean): void => console.log(`Quiz Completed set to: ${value}`);

const setCurrentQuestion = (value: number): void => console.log(`Current Question set to: ${value}`);

const setSelectedAnswers = (answers: string[][]): void => console.log(`Selected Answers set to:`, answers);

const setQuizResult = (result: QuizResult | null): void => console.log(`Quiz Result set to:`, result);

export { quizResult, quiz_qanda, setQuizCompleted, setCurrentQuestion, setSelectedAnswers, setQuizResult };
