import { useEffect, useState } from 'react';
import { progressApi as api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { StudySession, Achievement, Goal } from '../types';
import {
  BarChart3,
  Award,
  Target,
  Clock,
  Flame,
  TrendingUp,
  Plus,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';

const Progress: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [statistics, setStatistics] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const loadProgressData = async () => {
      try {
        setLoading(true);
        const [statsResponse, achievementsResponse, goalsResponse, sessionsResponse] =
          await Promise.all([
            progressApi.getStatistics({ days: 7 }),
            progressApi.getAchievements(),
            progressApi.getGoals({ status: 'active' }),
            progressApi.getSessions({ limit: 5 })
          ]);

        setStatistics(statsResponse.data.data.statistics);
        setAchievements(achievementsResponse.data.data.achievements);
        setGoals(goalsResponse.data.data.goals);
        setSessions(sessionsResponse.data.data.sessions);
      } catch (error) {
        console.error('Error loading progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgressData();
  }, [isAuthenticated, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading progress...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Your Progress</h1>
        <p className="text-white/80">Track your learning journey and achievements</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock size={24} className="text-blue-600" />
            </div>
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <p className="text-sm text-gray-600">Total Study Time</p>
          <p className="text-3xl font-bold text-gray-900">
            {statistics?.totalStudyTime || 0}m
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Flame size={24} className="text-purple-600" />
            </div>
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <p className="text-sm text-gray-600">Current Streak</p>
          <p className="text-3xl font-bold text-gray-900">
            {statistics?.currentStreak || 0}🔥
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-green-100 p-3 rounded-lg">
              <Target size={24} className="text-green-600" />
            </div>
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <p className="text-sm text-gray-600">Quiz Accuracy</p>
          <p className="text-3xl font-bold text-gray-900">
            {statistics?.avgPerformance || 0}%
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-orange-100 p-3 rounded-lg">
              <BarChart3 size={24} className="text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Study Sessions</p>
          <p className="text-3xl font-bold text-gray-900">
            {statistics?.totalSessions || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sessions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Study Sessions</h2>

          {sessions.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {session.materialId?.title || 'Unknown Material'}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {session.materialId?.type && (
                          <span className="capitalize">{session.materialId.type}</span>
                        )}
                        {session.materialId?.subject && (
                          <span> • {session.materialId.subject}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {session.duration} min
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(session.startTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {session.performance !== null && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-sm text-gray-700">Performance:</span>
                      <span className={`text-sm font-medium ${
                        session.performance >= 80 ? 'text-green-600' :
                        session.performance >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {session.performance}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No study sessions yet</p>
              <button
                onClick={() => window.location.href = '/materials'}
                className="btn-primary"
              >
                Start Studying
              </button>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>

          {achievements.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg ${
                    achievement.completed
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        achievement.completed ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm ${
                        achievement.completed ? 'text-gray-700' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                      {!achievement.completed && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.target}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-primary-600 h-1.5 rounded-full"
                              style={{
                                width: `${(achievement.progress / achievement.target) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Start studying to unlock achievements!</p>
            </div>
          )}
        </div>
      </div>

      {/* Goals */}
      <div className="card mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Active Goals</h2>
        </div>

        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                  <button
                    onClick={async () => {
                      try {
                        await progressApi.deleteGoal(goal.id);
                        setGoals(goals.filter(g => g.id !== goal.id));
                      } catch (error) {
                        console.error('Error deleting goal:', error);
                      }
                    }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-3 capitalize">
                  {goal.period} goal • {goal.type.replace('-', ' ')}
                </p>

                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>
                      {goal.currentValue}/{goal.targetValue}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (goal.currentValue / goal.targetValue) >= 1
                          ? 'bg-green-500'
                          : 'bg-primary-600'
                      }`}
                      style={{
                        width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>

                {(goal.currentValue / goal.targetValue) >= 1 && !goal.completed && (
                  <button
                    onClick={async () => {
                      try {
                        await progressApi.updateGoalProgress(goal.id, {
                          currentValue: goal.currentValue,
                          completed: true
                        });
                        setGoals(goals.filter(g => g.id !== goal.id));
                      } catch (error) {
                        console.error('Error completing goal:', error);
                      }
                    }}
                    className="w-full btn-primary text-sm"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No active goals</p>
            <button className="btn-primary flex items-center space-x-2 mx-auto">
              <Plus size={20} />
              <span>Create Goal</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;