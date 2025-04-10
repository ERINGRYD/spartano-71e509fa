
import { Subject, Question, QuestionType, Enemy } from './types';
import { v4 as uuidv4 } from 'uuid';

export const createQuestionMultipleChoice = (
  text: string,
  options: { text: string, isCorrect: boolean, comment?: string }[],
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  examBoard?: string,
  year?: number,
  organization?: string
): Question => {
  return {
    id: uuidv4(),
    text,
    type: 'multiple_choice',
    options: options.map(option => ({
      id: uuidv4(),
      text: option.text,
      isCorrect: option.isCorrect,
      comment: option.comment
    })),
    difficulty,
    examBoard,
    year,
    organization
  };
};

export const createQuestionTrueFalse = (
  text: string,
  isCorrect: boolean,
  correctComment?: string,
  incorrectComment?: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  examBoard?: string,
  year?: number,
  organization?: string
): Question => {
  return {
    id: uuidv4(),
    text,
    type: 'true_false',
    options: [
      {
        id: uuidv4(),
        text: 'Certo',
        isCorrect,
        comment: isCorrect ? correctComment : incorrectComment
      },
      {
        id: uuidv4(),
        text: 'Errado',
        isCorrect: !isCorrect,
        comment: !isCorrect ? correctComment : incorrectComment
      }
    ],
    difficulty,
    examBoard,
    year,
    organization
  };
};

export const generateSampleImportData = (type: QuestionType): string => {
  if (type === 'multiple_choice') {
    const subject: Subject = {
      id: uuidv4(),
      name: 'Matemática',
      topics: [
        {
          id: uuidv4(),
          name: 'Álgebra',
          subTopics: [
            {
              id: uuidv4(),
              name: 'Equações do 2º grau',
              questions: [
                createQuestionMultipleChoice(
                  'Em uma equação do segundo grau ax² + bx + c = 0, como calculamos o discriminante?',
                  [
                    { 
                      text: 'Δ = b² - 4ac', 
                      isCorrect: true,
                      comment: 'O discriminante é calculado pela fórmula Δ = b² - 4ac' 
                    },
                    { 
                      text: 'Δ = b² + 4ac', 
                      isCorrect: false,
                      comment: 'Esta resposta está incorreta.' 
                    },
                    { 
                      text: 'Δ = 2ac - b²', 
                      isCorrect: false,
                      comment: 'Esta resposta está incorreta.' 
                    },
                    { 
                      text: 'Δ = 4ac - b²', 
                      isCorrect: false,
                      comment: 'Esta resposta está incorreta.' 
                    }
                  ],
                  'easy',
                  'ENEM',
                  2022,
                  'INEP'
                )
              ],
              progress: 0
            }
          ],
          questions: [
            createQuestionMultipleChoice(
              'Qual é a solução da equação x² - 5x + 6 = 0?',
              [
                { 
                  text: 'x = 2 e x = 3', 
                  isCorrect: true,
                  comment: 'Usando a fatoração: x² - 5x + 6 = (x-2)(x-3) = 0, portanto x = 2 ou x = 3' 
                },
                { 
                  text: 'x = -2 e x = -3', 
                  isCorrect: false,
                  comment: 'Esta resposta está incorreta.' 
                },
                { 
                  text: 'x = 1 e x = 6', 
                  isCorrect: false,
                  comment: 'Esta resposta está incorreta.' 
                },
                { 
                  text: 'x = -1 e x = -6', 
                  isCorrect: false,
                  comment: 'Esta resposta está incorreta.' 
                }
              ],
              'medium',
              'ENEM',
              2023,
              'INEP'
            )
          ],
          progress: 0
        }
      ],
      progress: 0
    };
    
    return JSON.stringify(subject, null, 2);
  } else {
    const subject: Subject = {
      id: uuidv4(),
      name: 'Direito Constitucional',
      topics: [
        {
          id: uuidv4(),
          name: 'Direitos Fundamentais',
          subTopics: [
            {
              id: uuidv4(),
              name: 'Direitos Políticos',
              questions: [
                createQuestionTrueFalse(
                  'No Brasil, o voto é facultativo para os analfabetos, para os maiores de 70 anos e para os maiores de 16 e menores de 18 anos.',
                  true,
                  'O artigo 14, § 1º, II da Constituição Federal estabelece a facultatividade do voto para esses grupos.',
                  'Esta resposta está incorreta.',
                  'easy',
                  'CESPE',
                  2021,
                  'TSE'
                )
              ],
              progress: 0
            }
          ],
          questions: [
            createQuestionTrueFalse(
              'De acordo com a Constituição Federal de 1988, os direitos sociais incluem educação, saúde, alimentação, trabalho, moradia, transporte, lazer, segurança, previdência social e proteção à maternidade e à infância.',
              true,
              'O artigo 6º da Constituição Federal prevê esses direitos sociais.',
              'Esta resposta está incorreta.',
              'medium',
              'CESPE',
              2022,
              'STF'
            )
          ],
          progress: 0
        }
      ],
      progress: 0
    };
    
    return JSON.stringify(subject, null, 2);
  }
};

export const createSampleEnemy = (
  subjectId: string,
  topicId: string,
  subTopicId?: string,
  name: string = 'Inimigo de exemplo',
  status: 'ready' | 'battle' | 'wounded' | 'observed' = 'ready'
): Enemy => {
  return {
    id: uuidv4(),
    subjectId,
    topicId,
    subTopicId,
    name,
    status,
    progress: 0,
    icon: 'shield'
  };
};
