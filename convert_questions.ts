
import { questionData } from './data/questions';
import * as fs from 'fs';
import * as path from 'path';

const outputPath = path.join(process.cwd(), 'data', 'questions.json');
fs.writeFileSync(outputPath, JSON.stringify(questionData, null, 2), 'utf-8');

console.log(`Successfully converted questions.ts to ${outputPath}`);
