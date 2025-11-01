import { useState } from 'react';
import { getSkillRecommendation } from '../api/skillRecommender';

export default function SkillRecommenderDemo() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function run() {
    setLoading(true);
    setError('');
    try {
      const res = await getSkillRecommendation({
        name: 'Ayesha Khan',
        completedTopics: ['algebra-1', 'geometry basics'],
        accuracy: 72,
        avgTime: 28
      });
      setResult(res);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to fetch recommendation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <h3 style={{ margin: '0 0 8px' }}>AI Skill Path Recommender (Demo)</h3>
      <button onClick={run} disabled={loading} style={{ padding: '8px 12px' }}>
        {loading ? 'Recommending…' : 'Recommend Path'}
      </button>
      {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
      <pre style={{ marginTop: 12, maxWidth: '100%', overflow: 'auto' }}>
        {result ? JSON.stringify(result, null, 2) : 'No result yet'}
      </pre>
    </div>
  );
}
