
import { questionData } from './data/questions';
import * as fs from 'fs';
import * as path from 'path';

const errors: string[] = [];
const warnings: string[] = [];

Object.entries(questionData).forEach(([moduleId, moduleData]) => {
  const seenIds = new Set<number>();
  
  moduleData.questions.forEach((q: any) => {
    // Check ID uniqueness within module
    if (seenIds.has(q.id)) {
      errors.push(`Duplicate ID ${q.id} in module ${moduleId}`);
    }
    seenIds.add(q.id);

    // Check correct answer index
    if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
      errors.push(`Invalid correctAnswer index ${q.correctAnswer} for question ${q.id} in module ${moduleId}. Options length: ${q.options.length}`);
    }

    // Check images
    if (q.image) {
      // Assuming images are in public folder
      const imagePath = path.join(process.cwd(), 'public', q.image);
      if (!fs.existsSync(imagePath)) {
        warnings.push(`Image not found: ${q.image} for question ${q.id} in module ${moduleId}`);
      }
    }
    if (q.explanationImage) {
      const imagePath = path.join(process.cwd(), 'public', q.explanationImage);
      if (!fs.existsSync(imagePath)) {
        warnings.push(`Explanation image not found: ${q.explanationImage} for question ${q.id} in module ${moduleId}`);
      }
    }
  });
});

if (errors.length > 0) {
  console.log('Errors found:');
  errors.forEach(e => console.error(e));
} else {
  console.log('No critical data errors found.');
}

if (warnings.length > 0) {
  console.log('Warnings found:');
  warnings.forEach(w => console.warn(w));
} else {
  console.log('No data warnings found.');
}
