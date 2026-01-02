export interface QuestionOption {
  key: string;
  text: string;
}

export interface QuestionOptionDto {
  isCorrect: boolean;
  key: string;
  text: string;
}

export interface QuestionOptionResponse {
  isCorrect: boolean;
  optionKey: string;
  optionText: string;
}

export interface QuestionResponse {
  difficulty: string;
  domain: string;
  examId: string;
  id: string;
  options: QuestionOptionResponse[];
  text: string;
}

export interface CreateQuestionRequest {
  difficulty: string;
  domain: string;
  examId: string;
  options: QuestionOptionDto[];
  text: string;
}

export interface PageMetadata {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Pageable {
  page: number;
  size: number;
  sort?: string[];
}

export interface PagedModelQuestionResponse {
  content: QuestionResponse[];
  page: PageMetadata;
}

