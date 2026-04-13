import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { materialsApi } from '../services/api';
import type { StudyMaterial } from '../types';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle
} from 'lucide-react';

interface Summary {
  keyPoints: string[];
  explanation: string;
}

const StudySummary: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleMarkComplete = async () => {
    try {
      await materialsApi.updateProgress(id!, {
        completedItems: 1
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
    navigate('/materials');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading summary...</div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <p className="text-gray-600 mb-4">Summary not found</p>
          <button onClick={() => navigate('/materials')} className="btn-primary">
            Go Back to Materials
          </button>
        </div>
      </div>
    );
  }

  const summary = material.content as Summary;
  const isCompleted = material.progress.completedItems >= material.progress.totalItems;

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
        <div className="flex items-center space-x-2">
          {isCompleted && (
            <CheckCircle size={20} className="text-green-600" />
          )}
          <div className="text-white font-medium">{material.title}</div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card mb-6">
        {/* Material Info */}
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
          <div className="bg-primary-100 p-3 rounded-lg">
            <BookOpen size={24} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{material.title}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Summary</span>
              {material.subject && (
                <>
                  <span>•</span>
                  <span>{material.subject}</span>
                </>
              )}
              {material.topic && (
                <>
                  <span>•</span>
                  <span>{material.topic}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Key Points */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <span>📌</span>
            <span>Key Points</span>
          </h3>
          <ul className="space-y-3">
            {summary.keyPoints.map((point, index) => (
              <li
                key={index}
                className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary-500 text-white text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-gray-700 flex-1">{point}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Explanation */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <span>📖</span>
            <span>Summary</span>
          </h3>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {summary.explanation}
            </p>
          </div>
        </div>

        {/* Original Text */}
        {material.originalText && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <span>📝</span>
              <span>Original Notes</span>
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="text-gray-600 text-sm whitespace-pre-line">
                {material.originalText}
              </p>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {material.imageUrl && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <span>🖼️</span>
              <span>Source Image</span>
            </h3>
            <img
              src={`http://localhost:5000${material.imageUrl}`}
              alt="Source notes"
              className="w-full rounded-lg border border-gray-200"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleMarkComplete}
          className={`flex-1 ${
            isCompleted
              ? 'btn-secondary'
              : 'btn-primary'
          }`}
        >
          {isCompleted ? 'Completed ✓' : 'Mark as Complete'}
        </button>
        <button
          onClick={() => navigate('/materials/create')}
          className="btn-primary"
        >
          Create Another
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="card flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <BookOpen size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Word Count</p>
            <p className="text-lg font-bold text-gray-900">{material.metadata.wordCount}</p>
          </div>
        </div>
        <div className="card flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <CheckCircle size={20} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Status</p>
            <p className={`text-lg font-bold ${isCompleted ? 'text-green-600' : 'text-gray-900'}`}>
              {isCompleted ? 'Complete' : 'In Progress'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySummary;