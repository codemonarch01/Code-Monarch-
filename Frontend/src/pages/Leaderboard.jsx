import React, { useEffect, useState } from 'react'
import { gamifyAPI } from '../api/api'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award, Star, Crown, Zap, Filter, RefreshCw } from 'lucide-react'

const Leaderboard = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [grade, setGrade] = useState('')
  const [school, setSchool] = useState('')
  const [college, setCollege] = useState('')

  // Static leaderboard data with IIT, GGI and other colleges
  const staticLeaderboardData = [
    { _id: '1', name: 'Rajesh Kumar', email: 'rajesh.kumar@iitdelhi.ac.in', grade: 'B.Tech 2nd Year', ecoPoints: 485, badges: [{ id: '1', icon: '🏆', title: 'Champion', description: 'Top scorer' }, { id: '2', icon: '⭐', title: 'Star Performer', description: 'Excellent work' }], preferences: { college: 'IIT Delhi' } },
    { _id: '2', name: 'Priya Sharma', email: 'priya.sharma@ggits.ac.in', grade: 'B.Tech 3rd Year', ecoPoints: 462, badges: [{ id: '1', icon: '🥇', title: 'Gold Medal', description: 'First place' }, { id: '2', icon: '💡', title: 'Innovator', description: 'Creative thinker' }], preferences: { college: 'GGI' } },
    { _id: '3', name: 'Amit Patel', email: 'amit.patel@iitbombay.ac.in', grade: 'B.Tech 1st Year', ecoPoints: 448, badges: [{ id: '1', icon: '🚀', title: 'Rocket', description: 'Fast learner' }, { id: '2', icon: '🌟', title: 'Rising Star', description: 'Upcoming talent' }], preferences: { college: 'IIT Bombay' } },
    { _id: '4', name: 'Sneha Reddy', email: 'sneha.reddy@ggits.ac.in', grade: 'M.Tech 1st Year', ecoPoints: 432, badges: [{ id: '1', icon: '🎯', title: 'Target Master', description: 'Goal achiever' }, { id: '2', icon: '📚', title: 'Scholar', description: 'Knowledge seeker' }], preferences: { college: 'GGI' } },
    { _id: '5', name: 'Vikram Singh', email: 'vikram.singh@iitkharagpur.ac.in', grade: 'B.Tech 4th Year', ecoPoints: 418, badges: [{ id: '1', icon: '🔥', title: 'Hot Streak', description: 'Consistent performer' }], preferences: { college: 'IIT Kharagpur' } },
    { _id: '6', name: 'Ananya Gupta', email: 'ananya.gupta@ggits.ac.in', grade: 'B.Tech 2nd Year', ecoPoints: 405, badges: [{ id: '1', icon: '💎', title: 'Diamond', description: 'Precious contributor' }, { id: '2', icon: '🎨', title: 'Artist', description: 'Creative mind' }], preferences: { college: 'GGI' } },
    { _id: '7', name: 'Rohit Mehta', email: 'rohit.mehta@iitmadras.ac.in', grade: 'B.Tech 3rd Year', ecoPoints: 392, badges: [{ id: '1', icon: '⚡', title: 'Lightning', description: 'Quick learner' }], preferences: { college: 'IIT Madras' } },
    { _id: '8', name: 'Kavita Nair', email: 'kavita.nair@ggits.ac.in', grade: 'M.Tech 2nd Year', ecoPoints: 378, badges: [{ id: '1', icon: '🎓', title: 'Graduate', description: 'Advanced learner' }, { id: '2', icon: '🏅', title: 'Achiever', description: 'Goal setter' }], preferences: { college: 'GGI' } },
    { _id: '9', name: 'Aditya Joshi', email: 'aditya.joshi@iitroorkee.ac.in', grade: 'B.Tech 2nd Year', ecoPoints: 365, badges: [{ id: '1', icon: '🌟', title: 'Star', description: 'Top performer' }], preferences: { college: 'IIT Roorkee' } },
    { _id: '10', name: 'Meera Desai', email: 'meera.desai@ggits.ac.in', grade: 'B.Tech 1st Year', ecoPoints: 352, badges: [{ id: '1', icon: '🎖️', title: 'Medal', description: 'Achievement unlocked' }, { id: '2', icon: '📖', title: 'Reader', description: 'Knowledge enthusiast' }], preferences: { college: 'GGI' } },
    { _id: '11', name: 'Siddharth Verma', email: 'siddharth.verma@iitkanpur.ac.in', grade: 'B.Tech 3rd Year', ecoPoints: 338, badges: [{ id: '1', icon: '🔬', title: 'Scientist', description: 'Research oriented' }], preferences: { college: 'IIT Kanpur' } },
    { _id: '12', name: 'Divya Kapoor', email: 'divya.kapoor@ggits.ac.in', grade: 'B.Tech 2nd Year', ecoPoints: 325, badges: [{ id: '1', icon: '💻', title: 'Coder', description: 'Tech enthusiast' }, { id: '2', icon: '🎪', title: 'Performer', description: 'Active participant' }], preferences: { college: 'GGI' } },
    { _id: '13', name: 'Arjun Malhotra', email: 'arjun.malhotra@iitguwahati.ac.in', grade: 'B.Tech 1st Year', ecoPoints: 312, badges: [{ id: '1', icon: '🏃', title: 'Runner', description: 'Fast progress' }], preferences: { college: 'IIT Guwahati' } },
    { _id: '14', name: 'Pooja Shah', email: 'pooja.shah@ggits.ac.in', grade: 'M.Tech 1st Year', ecoPoints: 298, badges: [{ id: '1', icon: '🎯', title: 'Precise', description: 'Accurate learner' }, { id: '2', icon: '📊', title: 'Analyst', description: 'Data driven' }], preferences: { college: 'GGI' } },
    { _id: '15', name: 'Karan Khanna', email: 'karan.khanna@iitbhubaneswar.ac.in', grade: 'B.Tech 2nd Year', ecoPoints: 285, badges: [{ id: '1', icon: '🎮', title: 'Gamer', description: 'Interactive learner' }], preferences: { college: 'IIT Bhubaneswar' } },
  ]

  const load = async () => {
    setLoading(true)
    try {
      const res = await gamifyAPI.getLeaderboard({ grade, school, college, limit: 20 })
      const apiUsers = res?.data?.users || []
      
      // If no results from API or empty, use static data
      // Apply filters to static data if needed
      let filteredData = staticLeaderboardData
      
      if (grade) {
        filteredData = filteredData.filter(u => 
          u.grade?.toLowerCase().includes(grade.toLowerCase())
        )
      }
      
      if (school) {
        filteredData = filteredData.filter(u => 
          u.preferences?.school?.toLowerCase().includes(school.toLowerCase())
        )
      }
      
      if (college) {
        filteredData = filteredData.filter(u => 
          u.preferences?.college?.toLowerCase().includes(college.toLowerCase())
        )
      }
      
      // Use API data if available, otherwise use filtered static data
      setRows(apiUsers.length > 0 ? apiUsers : filteredData)
    } catch (_) {
      // On error, use static data with filters applied
      let filteredData = staticLeaderboardData
      
      if (grade) {
        filteredData = filteredData.filter(u => 
          u.grade?.toLowerCase().includes(grade.toLowerCase())
        )
      }
      
      if (school) {
        filteredData = filteredData.filter(u => 
          u.preferences?.school?.toLowerCase().includes(school.toLowerCase())
        )
      }
      
      if (college) {
        filteredData = filteredData.filter(u => 
          u.preferences?.college?.toLowerCase().includes(college.toLowerCase())
        )
      }
      
      setRows(filteredData)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [grade, school, college])

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    return <span className="w-5 h-5 flex items-center justify-center text-gray-500 font-bold">{rank}</span>
  }

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
    return 'bg-white border-gray-100'
  }

  const getEcoPointsColor = (points) => {
    if (points >= 400) return 'text-green-600 font-bold'
    if (points >= 300) return 'text-blue-600 font-semibold'
    if (points >= 200) return 'text-purple-600 font-semibold'
    if (points >= 100) return 'text-orange-600'
    return 'text-gray-600'
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">Eco Leaderboard</h1>
          </div>
          <button 
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border shadow-sm mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Results</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <input 
                value={grade} 
                onChange={e => setGrade(e.target.value)} 
                placeholder="e.g., Grade 12" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
              <input 
                value={school} 
                onChange={e => setSchool(e.target.value)} 
                placeholder="e.g., Delhi Public School" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
              <input 
                value={college} 
                onChange={e => setCollege(e.target.value)} 
                placeholder="e.g., IIT Delhi" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={load} 
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Apply Filter
              </button>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border rounded-xl overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-left">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="p-4 font-semibold text-gray-900">Rank</th>
                  <th className="p-4 font-semibold text-gray-900">Student</th>
                  <th className="p-4 font-semibold text-gray-900">Grade</th>
                  <th className="p-4 font-semibold text-gray-900">Eco Points</th>
                  <th className="p-4 font-semibold text-gray-900">Badges</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-8 text-center" colSpan={5}>
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600">Loading leaderboard...</span>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="p-8 text-center" colSpan={5}>
                      <div className="text-gray-500">
                        <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg font-medium">No results found</p>
                        <p className="text-sm">Try adjusting your filters or check back later</p>
                      </div>
                    </td>
                  </tr>
                ) : rows.map((u, i) => {
                  const isCurrentUser = u.name && typeof window !== 'undefined' && localStorage.getItem('edusmartUser') && (JSON.parse(localStorage.getItem('edusmartUser')).name === u.name);
                  return (
                    <motion.tr 
                      key={u._id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`border-t transition-all hover:shadow-md ${isCurrentUser ? 'bg-green-50 border-green-200' : getRankColor(i + 1)}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getRankIcon(i + 1)}
                          <span className="font-bold text-gray-900">#{i + 1}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            i === 0 ? 'bg-yellow-500' : 
                            i === 1 ? 'bg-gray-400' : 
                            i === 2 ? 'bg-amber-600' : 'bg-blue-500'
                          }`}>
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{u.name}</div>
                            {isCurrentUser && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">You</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium block mb-1">
                            {u.grade || 'Not specified'}
                          </span>
                          {u.preferences?.college && (
                            <span className="text-xs text-gray-600">{u.preferences.college}</span>
                          )}
                          {u.email && (
                            <div className="text-xs text-gray-500 mt-0.5">{u.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-green-500" />
                          <span className={`text-lg font-bold ${getEcoPointsColor(u.ecoPoints || 0)}`}>
                            {u.ecoPoints || 0}
                          </span>
                          <span className="text-sm text-gray-500">points</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {(u.badges || []).slice(0, 4).map((badge, badgeIndex) => (
                            <motion.span 
                              key={badge.id} 
                              title={`${badge.title}: ${badge.description}`}
                              className="text-2xl cursor-help hover:scale-110 transition-transform"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: (i * 0.05) + (badgeIndex * 0.1) }}
                            >
                              {badge.icon}
                            </motion.span>
                          ))}
                          {(u.badges || []).length > 4 && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              +{(u.badges || []).length - 4} more
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Stats Summary */}
        {rows.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Total Participants</h3>
                  <p className="text-2xl font-bold text-blue-600">{rows.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Highest Score</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.max(...rows.map(u => u.ecoPoints || 0))} pts
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-purple-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Average Score</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(rows.reduce((sum, u) => sum + (u.ecoPoints || 0), 0) / rows.length)} pts
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard


