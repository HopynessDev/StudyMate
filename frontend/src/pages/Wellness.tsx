import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wellnessApi } from '../services/api';
import type { WellnessRecord } from '../types';
import {
  Heart,
  TrendingUp,
  Calendar,
  Wind,
  Brain,
  Save,
  CheckCircle
} from 'lucide-react';

const Wellness: React.FC = () => {
  const navigate = useNavigate();

  const [wellnessData, setWellnessData] = useState({
    stressLevel: 5,
    mood: 'neutral' as 'very-happy' | 'happy' | 'neutral' | 'sad' | 'very-sad',
    activities: [] as string[],
    notes: '',
    sleepQuality: 5,
    relaxationSession: null as {
      type: 'breathing' | 'meditation' | 'guided-relaxation';
      duration: number;
      completed: boolean;
    } | null
  });

  const [history, setHistory] = useState<WellnessRecord[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'check-in' | 'history' | 'relaxation'>('check-in');

  useEffect(() => {
    const loadWellnessData = async () => {
      try {
        const [historyResponse, trendsResponse] = await Promise.all([
          wellnessApi.getHistory({ days: 7 }),
          wellnessApi.getTrends({ days: 7 })
        ]);

        setHistory(historyResponse.data.data.records);
        setTrends(trendsResponse.data.data.trends);

        // Check if there's already a record for today
        const today = new Date().toDateString();
        const todayRecord = historyResponse.data.data.records.find(
          r => new Date(r.date).toDateString() === today
        );

        if (todayRecord) {
          setWellnessData({
            stressLevel: todayRecord.stressLevel,
            mood: todayRecord.mood,
            activities: todayRecord.activities,
            notes: todayRecord.notes || '',
            sleepQuality: todayRecord.sleepQuality || 5,
            relaxationSession: todayRecord.relaxationSession || null
          });
        }
      } catch (error) {
        console.error('Error loading wellness data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWellnessData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await wellnessApi.record(wellnessData);
      // Reload data
      const historyResponse = await wellnessApi.getHistory({ days: 7 });
      setHistory(historyResponse.data.data.records);
    } catch (error) {
      console.error('Error saving wellness data:', error);
    } finally {
      setSaving(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moods: Record<string, string> = {
      'very-happy': '😄',
      'happy': '🙂',
      'neutral': '😐',
      'sad': '😢',
      'very-sad': '😭'
    };
    return moods[mood] || '😐';
  };

  const getStressColor = (level: number) => {
    if (level <= 3) return 'text-green-600';
    if (level <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading wellness data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Wellness Center</h1>
        <p className="text-white/80">Track your wellbeing and find relaxation tools</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {['check-in', 'history', 'relaxation'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-primary-600'
                : 'text-white hover:bg-white/10'
            }`}
          >
            {tab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Check-in Tab */}
      {activeTab === 'check-in' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Check-in */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-red-100 p-3 rounded-lg">
                <Heart size={24} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Daily Check-in</h2>
            </div>

            <div className="space-y-6">
              {/* Stress Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How stressed are you feeling today?
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessData.stressLevel}
                  onChange={(e) => setWellnessData({
                    ...wellnessData,
                    stressLevel: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between mt-2">
                  <span className={`text-2xl font-bold ${getStressColor(1)}`}>1</span>
                  <span className={`text-3xl font-bold ${getStressColor(wellnessData.stressLevel)}`}>
                    {wellnessData.stressLevel}
                  </span>
                  <span className={`text-2xl font-bold ${getStressColor(10)}`}>10</span>
                </div>
                <div className="text-center mt-1 text-sm text-gray-600">
                  {wellnessData.stressLevel <= 3 ? 'Very Low' :
                   wellnessData.stressLevel <= 6 ? 'Moderate' : 'High'}
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How are you feeling today?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['very-happy', 'happy', 'neutral', 'sad', 'very-sad'].map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setWellnessData({
                        ...wellnessData,
                        mood: mood as any
                      })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        wellnessData.mood === mood
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-1">{getMoodEmoji(mood)}</div>
                      <div className="text-xs text-gray-600">
                        {mood.replace('-', ' ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How was your sleep quality last night?
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={wellnessData.sleepQuality}
                  onChange={(e) => setWellnessData({
                    ...wellnessData,
                    sleepQuality: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-600">Poor</span>
                  <span className="text-lg font-bold text-gray-900">
                    {wellnessData.sleepQuality}/10
                  </span>
                  <span className="text-sm text-gray-600">Excellent</span>
                </div>
              </div>

              {/* Activities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What wellness activities did you do today?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['meditation', 'breathing-exercise', 'stretching', 'walk', 'music', 'reading'].map((activity) => (
                    <button
                      key={activity}
                      onClick={() => {
                        const newActivities = wellnessData.activities.includes(activity)
                          ? wellnessData.activities.filter(a => a !== activity)
                          : [...wellnessData.activities, activity];
                        setWellnessData({ ...wellnessData, activities: newActivities });
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        wellnessData.activities.includes(activity)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200'
                      }`}
                    >
                      {activity.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={wellnessData.notes}
                  onChange={(e) => setWellnessData({
                    ...wellnessData,
                    notes: e.target.value
                  })}
                  placeholder="Any additional thoughts or feelings..."
                  rows={4}
                  className="input-field resize-none"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <CheckCircle size={20} className="animate-pulse" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Check-in</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Wellness Trends */}
          <div className="space-y-6">
            {trends && (
              <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <TrendingUp size={24} className="text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">This Week's Trends</h2>
                </div>

                <div className="space-y-4">
                  {/* Average Stress */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Average Stress</span>
                      <span className={`text-2xl font-bold ${getStressColor(trends.averageStress)}`}>
                        {trends.averageStress.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {trends.trend === 'improving' && (
                        <span className="text-sm text-green-600">↓ Improving</span>
                      )}
                      {trends.trend === 'declining' && (
                        <span className="text-sm text-red-600">↑ Needs attention</span>
                      )}
                      {trends.trend === 'stable' && (
                        <span className="text-sm text-gray-600">→ Stable</span>
                      )}
                    </div>
                  </div>

                  {/* Mood Distribution */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Mood Distribution</h3>
                    <div className="flex items-center space-x-2">
                      {Object.entries(trends.moodDistribution || {}).map(([mood, count]: [string, any]) => (
                        <div
                          key={mood}
                          className="flex items-center space-x-1"
                        >
                          <span>{getMoodEmoji(mood)}</span>
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Frequency */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Most Done Activities</h3>
                    <div className="space-y-2">
                      {Object.entries(trends.activityFrequency || {})
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 3)
                        .map(([activity, count]: [string, any]) => (
                          <div
                            key={activity}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-700 capitalize">
                              {activity.replace('-', ' ')}
                            </span>
                            <span className="font-medium text-gray-900">{count}x</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent History */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Calendar size={24} className="text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Check-ins</h2>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {history.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getMoodEmoji(record.mood)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-600">
                          Stress: {record.stressLevel}/10
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setWellnessData({
                        stressLevel: record.stressLevel,
                        mood: record.mood,
                        activities: record.activities,
                        notes: record.notes || '',
                        sleepQuality: record.sleepQuality || 5,
                        relaxationSession: record.relaxationSession || null
                      })}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Wellness History</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {history.map((record) => (
              <div
                key={record.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getMoodEmoji(record.mood)}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">
                        {record.mood.replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${getStressColor(record.stressLevel)}`}>
                    {record.stressLevel}
                  </div>
                </div>

                {record.activities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {record.activities.map((activity) => (
                      <span
                        key={activity}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                      >
                        {activity.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                )}

                {record.notes && (
                  <p className="text-sm text-gray-600">{record.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relaxation Tab */}
      {activeTab === 'relaxation' && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Wind size={24} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Relaxation Exercises</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <span>🧘</span>
                <span>Breathing Exercises</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-400 transition-colors">
                  <h4 className="font-semibold text-gray-900 mb-2">Box Breathing</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    A simple breathing technique to reduce stress
                  </p>
                  <div className="text-sm text-gray-700">
                    <p>1. Breathe in for 4 seconds</p>
                    <p>2. Hold for 4 seconds</p>
                    <p>3. Exhale for 4 seconds</p>
                    <p>4. Hold empty lungs for 4 seconds</p>
                    <p>5. Repeat for 5 minutes</p>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-400 transition-colors">
                  <h4 className="font-semibold text-gray-900 mb-2">4-7-8 Breathing</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    A breathing pattern that helps with relaxation
                  </p>
                  <div className="text-sm text-gray-700">
                    <p>1. Breathe in for 4 seconds</p>
                    <p>2. Hold for 7 seconds</p>
                    <p>3. Exhale for 8 seconds</p>
                    <p>4. Repeat for 3 minutes</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <span>🧘‍♀️</span>
                <span>Meditation</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-400 transition-colors">
                  <h4 className="font-semibold text-gray-900 mb-2">Body Scan Meditation</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Progressive muscle relaxation technique
                  </p>
                  <div className="text-sm text-gray-700">
                    <p>1. Find a comfortable position and close your eyes</p>
                    <p>2. Focus on your breathing</p>
                    <p>3. Scan your body from toes to head</p>
                    <p>4. Notice and release tension</p>
                    <p>5. Practice for 10 minutes</p>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-400 transition-colors">
                  <h4 className="font-semibold text-gray-900 mb-2">Mindfulness Meditation</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Present moment awareness practice
                  </p>
                  <div className="text-sm text-gray-700">
                    <p>1. Sit comfortably and close your eyes</p>
                    <p>2. Focus on natural breathing</p>
                    <p>3. Notice thoughts without judgment</p>
                    <p>4. Return focus to breathing when distracted</p>
                    <p>5. Practice for 5 minutes</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <span>🧠</span>
                <span>Mental Health Resources</span>
              </h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-gray-700 mb-3">
                  Taking care of your mental health is important. If you're feeling overwhelmed,
                  consider these resources:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Talk to a trusted friend or family member</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Practice regular exercise and sleep</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Consider professional mental health support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wellness;