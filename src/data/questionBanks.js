// --- General Education Imports ---
import genEdA from '../assets/general_education/set_A.json';
import genEdB from '../assets/general_education/set_B.json';
import genEdC from '../assets/general_education/set_C.json';
import genEdD from '../assets/general_education/set_D.json';
import genEdE from '../assets/general_education/set_E.json';

// --- Professional Education Imports ---
import profEdA from '../assets/professional_education/set_A.json';
import profEdB from '../assets/professional_education/set_B.json';
import profEdC from '../assets/professional_education/set_C.json';
import profEdD from '../assets/professional_education/set_D.json';
import profEdE from '../assets/professional_education/set_E.json';

// --- Science Major Imports ---
import scienceA from '../assets/science/set_A.json';
import scienceB from '../assets/science/set_B.json';
import scienceC from '../assets/science/set_C.json';
import scienceD from '../assets/science/set_D.json';
import scienceE from '../assets/science/set_E.json';

function extractQuestionList(rawData) {
  if (Array.isArray(rawData)) return rawData;

  if (!rawData || typeof rawData !== 'object') {
    return [];
  }

  const possibleKeys = [
    'questions',
    'items',
    'data',
    'questionBank',
    'question bank',
    'quiz'
  ];

  for (const key of possibleKeys) {
    if (Array.isArray(rawData[key])) {
      return rawData[key];
    }
  }

  return [];
}

function normalizeQuestions(rawData, defaultCategory, domain) {
  const rawList = extractQuestionList(rawData);

  return rawList
    .map((item, idx) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      let options = [];

      const rawOptions =
        item.options ||
        item.choices ||
        item.answers ||
        item.alternatives;

      if (Array.isArray(rawOptions)) {
        options = rawOptions.map((option, optionIndex) => {
          const defaultId = String.fromCharCode(65 + optionIndex);

          if (typeof option === 'string') {
            return {
              id: defaultId,
              text: option
            };
          }

          return {
            id: String(
              option.id ||
              option.key ||
              option.letter ||
              defaultId
            ).toUpperCase(),
            text: String(
              option.text ||
              option.label ||
              option.value ||
              ''
            )
          };
        });
      } else if (rawOptions && typeof rawOptions === 'object') {
        options = Object.entries(rawOptions).map(([key, value]) => ({
          id: key.toUpperCase(),
          text: String(
            typeof value === 'object'
              ? value.text || value.label || value.value || ''
              : value
          )
        }));
      }

      const correctAnswer =
        item.correctAnswer ??
        item.correct_answer ??
        item.answer ??
        item.correct ??
        item.correctOption ??
        'A';

      const rawChoiceAnalysis =
        item.choiceAnalysis ||
        item.choice_analysis ||
        item.rationalization ||
        item.whyEachChoice ||
        item.why_each_choice ||
        item.choiceExplanations ||
        item.choice_explanations ||
        item.explanations ||
        item.explanationByChoice ||
        item.explanation_by_choice ||
        null;

      const choiceAnalysis = rawChoiceAnalysis && typeof rawChoiceAnalysis === 'object'
        ? Object.fromEntries(
            Object.entries(rawChoiceAnalysis).map(([key, value]) => {
              const optionId = key.match(/[A-D]$/i)?.[0]?.toUpperCase() || key.toUpperCase();
              return [optionId, typeof value === 'object'
                ? value.text || value.explanation || value.rationale || ''
                : String(value)];
            })
          )
        : null;

      return {
        id: String(item.id || `${domain}_${idx + 1}`),
        category: item.category || defaultCategory,
        difficulty: item.difficulty || 'Medium',
        domain,
        question:
          item.question ||
          item.questionText ||
          item.question_text ||
          item.prompt ||
          '',
        options,
        correctAnswer: String(
          typeof correctAnswer === 'object'
            ? correctAnswer.id || correctAnswer.key || 'A'
            : correctAnswer
        ).toUpperCase(),
        rationale:
          item.rationale ||
          item.explanation ||
          'Correct answer based on standard curriculum.',
        memoryTip:
          item.memoryTip ||
          item.tip ||
          item.memory_tip ||
          '',
        choiceAnalysis
      };
    })
    .filter(item => item && item.question && item.options.length > 0);
}

// Master Organized Question Bank Map
export const QUESTION_BANKS = {
  general_education: {
    title: "General Education",
    tag: "Gen Ed",
    icon: "📖",
    sets: {
      Set_A: normalizeQuestions(genEdA, "GENERAL EDUCATION", "gened"),
      Set_B: normalizeQuestions(genEdB, "GENERAL EDUCATION", "gened"),
      Set_C: normalizeQuestions(genEdC, "GENERAL EDUCATION", "gened"),
      Set_D: normalizeQuestions(genEdD, "GENERAL EDUCATION", "gened"),
      Set_E: normalizeQuestions(genEdE, "GENERAL EDUCATION", "gened")
    }
  },
  professional_education: {
    title: "Professional Education",
    tag: "Prof Ed",
    icon: "👨‍🏫",
    sets: {
      Set_A: normalizeQuestions(profEdA, "PROFESSIONAL EDUCATION", "profed"),
      Set_B: normalizeQuestions(profEdB, "PROFESSIONAL EDUCATION", "profed"),
      Set_C: normalizeQuestions(profEdC, "PROFESSIONAL EDUCATION", "profed"),
      Set_D: normalizeQuestions(profEdD, "PROFESSIONAL EDUCATION", "profed"),
      Set_E: normalizeQuestions(profEdE, "PROFESSIONAL EDUCATION", "profed")
    }
  },
  science: {
    title: "Science (Major)",
    tag: "Major",
    icon: "🧪",
    sets: {
      Set_A: normalizeQuestions(scienceA, "SCIENCE SPECIALIZATION", "science"),
      Set_B: normalizeQuestions(scienceB, "SCIENCE SPECIALIZATION", "science"),
      Set_C: normalizeQuestions(scienceC, "SCIENCE SPECIALIZATION", "science"),
      Set_D: normalizeQuestions(scienceD, "SCIENCE SPECIALIZATION", "science"),
      Set_E: normalizeQuestions(scienceE, "SCIENCE SPECIALIZATION", "science")
    }
  }
};

// Helper: Get questions for a specific set
export function getSetQuestions(folderKey, setKey) {
  return QUESTION_BANKS[folderKey]?.sets[setKey] || [];
}

// Helper: Get random mixed drill (e.g. 50 random items)
export function getRandomMixedDrill(count = 50) {
  const allQuestions = [];
  Object.values(QUESTION_BANKS).forEach(subject => {
    Object.values(subject.sets).forEach(setList => {
      allQuestions.push(...setList);
    });
  });

  // Shuffle and slice
  return [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, count);
}