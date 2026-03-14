import rawData from './questions.json';
import { ModuleData } from './types';

// 类型断言，确保导入的数据符合 ModuleData 结构
export const questionData: Record<string, ModuleData> = rawData as unknown as Record<string, ModuleData>;

// Make sure IDs are strings (UUIDs)
// This is a runtime patch if json still has numbers, but we migrated json already.
// Just in case:
Object.values(questionData).forEach(module => {
  module.questions.forEach(q => {
    if (typeof q.id === 'number') {
      q.id = String(q.id);
    }
  });
});

// 重新导出类型，以兼容现有代码
export type { Question, ModuleData } from './types';
