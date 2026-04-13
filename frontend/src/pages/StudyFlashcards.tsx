import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { materialsApi } from '../services/api';
import type { StudyMaterial } from '../types';
import {
  ArrowLeft,
  RotateCw,
  CheckCircle,
  XCircle,
  SkipForward
} from 'lucide-react';

interface Flashcard {
  question: string;
  answer: string;
}

const StudyFlashcards: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<number[]>([]);
  const [correctCount, setCorrectCount] = useState(0);

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

  const handleNext = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setFlipped(false);
    }
  };

  const handleCorrect = () => {
    if (!reviewedCards.includes(currentCard)) {
      setReviewedCards([...reviewedCards, currentCard]);
      setCorrectCount(correctCount + 1);
    }
    handleNext();
  };

  const handleIncorrect = () => {
    if (!reviewedCards.includes(currentCard)) {
      setReviewedCards([...reviewedCards, currentCard]);
    }
    handleNext();
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleFinish = async () => {
    try {
      await materialsApi.updateProgress(id!, {
        completedItems: reviewedCards.length
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
    navigate('/materials');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading flashcards...</div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <p className="text-gray-600 mb-4">Material not found</p>
          <button onClick={() => navigate('/materials')} className="btn-primary">
            Go Back to Materials
          </button>
        </div>
      </div>
    );
  }

  const flashcards = material.content as Flashcard[];
  const isComplete = currentCard === flashcards.length;

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Great Job!</h2>
            <p className="text-gray-600">
              You've completed reviewing all {flashcards.length} flashcards
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600">{correctCount}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">
                  {reviewedCards.length - correctCount}
                </div>
                <div className="text-sm text-gray-600">Needs Review</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round((correctCount / flashcards.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentCard(0)}
              className="btn-primary flex-1"
            >
              Review Again
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

  const currentFlashcard = flashcards[currentCard];
  const progress = ((currentCard + 1) / flashcards.length) * 100;

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
            Card {currentCard + 1} of {flashcards.length}
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

      {/* Flashcard */}
      <div className="card mb-6">
        <div
          className="min-h-[300px] perspective-1000 cursor-pointer"
          onClick={() => setFlipped(!flipped)}
        >
          <div
            className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
              flipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front */}
            <div
              className={`absolute w-full h-full backface-hidden flex items-center justify-center p-8 ${
                flipped ? 'hidden' : 'block'
              }`}
            >
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">Question</p>
                <p className="text-xl font-semibold text-gray-900">
                  {currentFlashcard.question}
                </p>
              </div>
            </div>

            {/* Back */}
            <div
              className={`absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-8 ${
                !flipped ? 'hidden' : 'block'
              }`}
            >
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">Answer</p>
                <p className="text-xl font-semibold text-gray-900">
                  {currentFlashcard.answer}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Flip Button */}
        <button
          onClick={() => setFlipped(!flipped)}
          className="w-full mt-4 btn-secondary flex items-center justify-center space-x-2"
        >
          <RotateCw size={20} />
          <span>{flipped ? 'Show Question' : 'Show Answer'}</span>
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentCard === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <button
          onClick={handleSkip}
          className="btn-secondary"
        >
          <SkipForward size={20} className="inline mr-2" />
          Skip
        </button>

        <button
          onClick={handleIncorrect}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <XCircle size={20} className="inline mr-2" />
          Incorrect
        </button>

        <button
          onClick={handleCorrect}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <CheckCircle size={20} className="inline mr-2" />
          Correct
        </button>
      </div>

      {/* Progress Info */}
      <div className="mt-6 card">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">Progress</span>
              <span className="font-medium text-gray-900">
                {reviewedCards.length}/{flashcards.length} cards reviewed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${(reviewedCards.length / flashcards.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyFlashcards;