export interface AttemptQuestionOption {
  key: string;
  text: string;
  isCorrect: boolean;
}

export interface AttemptQuestionResponse {
  questionId: string;
  text: string;
  domain: string;
  difficulty: string;
  options: AttemptQuestionOption[];
  selectedOption: string;
}

