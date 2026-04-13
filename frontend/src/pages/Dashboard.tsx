import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { materialsApi, progressApi, wellnessApi } from '../services/api';
import type { StudyMaterial } from '../types';
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Heart,
  TrendingUp,
  Plus,
  Clock,
  Target,
  Award,
  Sparkles
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [recentMaterials, setRecentMaterials] = useState<StudyMaterial[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Load recent materials
        const materialsResponse = await materialsApi.getMaterials({ limit: 3 });
        setRecentMaterials(materialsResponse.data.data.materials);

        // Load statistics
        const statsResponse = await progressApi.getStatistics({ days: 7 });
        setStats(statsResponse.data.data.statistics);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-white/80 text-lg">
          Ready to continue your learning journey?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Study Time</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalStudyTime || 0}m
              </p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <Clock size={24} className="text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Materials</p>
              <p className="text-3xl font-bold text-gray-900">
                {recentMaterials.length}
              </p>
            </div>
            <div className="bg-secondary-100 p-3 rounded-lg">
              <BookOpen size={24} className="text-secondary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.currentStreak || 0}🔥
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Quiz Accuracy</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.avgPerformance || 0}%
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Target size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Material Card */}
          <div className="card bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Create Study Material</h2>
                <p className="text-white/90 mb-4">
                  Upload an image of your notes and let AI create flashcards, quizzes, or summaries
                </p>
                <Link
                  to="/materials/create"
                  className="inline-flex items-center space-x-2 bg-white text-primary-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Plus size={20} />
                  <span>Get Started</span>
                </Link>
              </div>
              <div className="hidden sm:block">
                <Sparkles size={64} className="text-white/30" />
              </div>
            </div>
          </div>

          {/* Recent Materials */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Materials</h2>
              <Link to="/materials" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                View All →
              </Link>
            </div>

            {recentMaterials.length > 0 ? (
              <div className="space-y-3">
                {recentMaterials.map((material) => (
                  <Link
                    key={material.id}
                    to={`/materials/${material.type}/${material.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{material.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="capitalize">{material.type}</span>
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
                      <div className="flex-shrink-0 ml-4">
                        <div className="text-sm font-medium text-primary-600">
                          {material.progress.completedItems}/{material.progress.totalItems}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No study materials yet</p>
                <Link
                  to="/materials/create"
                  className="btn-primary inline-block"
                >
                  Create Your First Material
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Wellness Check */}
          <Link
            to="/wellness"
            className="card block hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Heart size={20} className="text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900">Daily Check-in</h3>
            </div>
            <p className="text-gray-600 text-sm">
              How are you feeling today? Track your wellness and access relaxation exercises.
            </p>
          </Link>

          {/* Quick Tips */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Brain size={20} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">Study Tips</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <Award className="text-primary-600 flex-shrink-0 mt-0.5" size={16} />
                <span>Study for 25-30 minutes, then take a 5-minute break</span>
              </li>
              <li className="flex items-start space-x-2">
                <Award className="text-primary-600 flex-shrink-0 mt-0.5" size={16} />
                <span>Review flashcards daily to improve retention</span>
              </li>
              <li className="flex items-start space-x-2">
                <Award className="text-primary-600 flex-shrink-0 mt-0.5" size={16} />
                <span>Take quizzes to test your understanding</span>
              </li>
            </ul>
          </div>

          {/* Achievements Preview */}
          <Link
            to="/progress"
            className="card block hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Award size={20} className="text-yellow-600" />
                </div>
                <h3 className="font-bold text-gray-900">Achievements</h3>
              </div>
              <span className="text-sm text-primary-600">View All</span>
            </div>
            <p className="text-gray-600 text-sm">
              Track your progress and unlock achievements as you learn!
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;