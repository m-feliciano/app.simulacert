export interface ExamResponse {
  description?: string;
  id: string;
  title: string;
}

export interface CreateExamRequest {
  description?: string;
  title: string;
}

export interface UpdateExamRequest {
  description?: string;
  title: string;
}

