import rawData from './questions.json';
import { ModuleData } from './types';

// 类型断言，确保导入的数据符合 ModuleData 结构
export const questionData: Record<string, ModuleData> = rawData as any;

// 重新导出类型，以兼容现有代码
export type { Question, ModuleData } from './types';
