export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  image?: string;
  explanationImage?: string;
  examQuestionId?: number;
  sourceModule?: string;
  sourceModuleName?: string;
}

export interface ModuleData {
  title: string;
  questions: Question[];
  moduleTag?: string;
}

export type QuestionData = Record<string, ModuleData>;
