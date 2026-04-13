import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { materialsApi } from '../services/api';
import type { StudyMaterial } from '../types';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  SkipForward
} from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const StudyQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<{ question: number; answer: number; correct: boolean }[]>([]);
  const [skipped, setSkipped] = useState<number[]>([]);

  useEffect(() => {
    const loadMaterial = async () => {
      try {
        const response = await materialsApi.getMaterial(id!);
        setMaterial(response.data.data.material);
      } catch (error) {
        console.error('Error loading material:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMaterial();
  }, [id]);

  const handleAnswer = (answerIndex: number) => {
    if (showExplanation) return;

    const question = questions[currentQuestion];
    const isCorrect = answerIndex === question.correctAnswer;

    setSelectedAnswer(answerIndex);
    setAnswers([
      ...answers,
      { question: currentQuestion, answer: answerIndex, correct: isCorrect }
    ]);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const previousAnswer = answers.find(a => a.question === currentQuestion - 1);
      setSelectedAnswer(previousAnswer?.answer || null);
      setShowExplanation(!!previousAnswer);
    }
  };

  const handleSkip = () => {
    setSkipped([...skipped, currentQuestion]);
    handleNext();
  };

  const handleFinish = async () => {
    try {
      await materialsApi.updateProgress(id!, {
        completedItems: answers.length
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
    navigate('/materials');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading quiz...</div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <p className="text-gray-600 mb-4">Quiz not found</p>
          <button onClick={() => navigate('/materials')} className="btn-primary">
            Go Back to Materials
          </button>
        </div>
      </div>
    );
  }

  const questions = material.content as QuizQuestion[];
  const isComplete = currentQuestion === questions.length;

  if (isComplete) {
    const correctCount = answers.filter(a => a.correct).length;
    const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
            <p className="text-gray-600">
              You've answered {answers.length} of {questions.length} questions
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Results</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600">{correctCount}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">
                  {answers.length - correctCount}
                </div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{accuracy}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </div>

          {skipped.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                You skipped {skipped.length} question{skipped.length > 1 ? 's' : ''}. Review them later!
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentQuestion(0)}
              className="btn-primary flex-1"
            >
              Retake Quiz
            </button>
            <button
              onClick={handleFinish}
              className="btn-secondary flex-1"
            >
              Save & Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuizQuestion = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isAnswered = showExplanation;
  const isCorrect = selectedAnswer === currentQuizQuestion.correctAnswer;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/materials')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Materials</span>
        </button>
        <div className="text-white font-medium">{material.title}</div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="card mb-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {currentQuizQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuizQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === currentQuizQuestion.correctAnswer;

              let buttonClass = 'btn-secondary w-full text-left';

              if (isAnswered) {
                if (isCorrectOption) {
                  buttonClass = 'bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg w-full text-left';
                } else if (isSelected && !isCorrectOption) {
                  buttonClass = 'bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg w-full text-left';
                } else {
                  buttonClass = 'bg-gray-100 text-gray-600 py-3 px-4 rounded-lg w-full text-left cursor-not-allowed';
                }
              } else {
                buttonClass = isSelected
                  ? 'btn-primary w-full text-left'
                  : 'bg-white border-2 border-gray-300 hover:border-primary-400 text-gray-900 py-3 px-4 rounded-lg w-full text-left transition-colors';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={isAnswered}
                  className={buttonClass}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/20">
                      <span className="font-medium">{index + 1}</span>
                    </div>
                    <span>{option}</span>
                    {isAnswered && isCorrectOption && (
                      <CheckCircle size={20} className="ml-auto" />
                    )}
                    {isAnswered && isSelected && !isCorrectOption && (
                      <XCircle size={20} className="ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className={`p-4 rounded-lg mb-4 ${
            isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-start space-x-2">
              {isCorrect ? (
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-medium mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </p>
                <p className="text-sm text-gray-700">
                  {currentQuizQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {!showExplanation ? (
          <button
            onClick={handleSkip}
            className="btn-secondary"
          >
            <SkipForward size={20} className="inline mr-2" />
            Skip
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn-primary"
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        )}

        {/* Progress Info */}
        <div className="card flex items-center space-x-3">
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {answers.filter(a => a.correct).length}/{answers.length} correct
            </div>
            <div className="text-gray-600">
              {Math.round((answers.filter(a => a.correct).length / Math.max(answers.length, 1)) * 100)}% accuracy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyQuiz;