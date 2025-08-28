import React, { useState, useEffect } from 'react';
import { useSecurity } from '../../contexts/SecurityContext';
import { useNotifications } from '../Notifications/NotificationSystem';

const GamificationDashboard = () => {
  const { user } = useSecurity();
  const { addNotification } = useNotifications();
  
  const [userStats, setUserStats] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [selectedTab, setSelectedTab] = useState('dashboard');

  useEffect(() => {
    initializeGamificationData();
  }, [user]);

  const initializeGamificationData = () => {
    const stats = {
      level: 13,
      xp: 2850,
      xpToNextLevel: 1150,
      totalInterventions: 47,
      successRate: 94.5,
      avgResponseTime: 1.8,
      streak: 12,
      badges: 8,
      rank: 3,
      totalUsers: 25
    };
    setUserStats(stats);

    const ranking = [
      { id: 1, name: 'Mohamed Gharbi', role: 'Technicien Préventif', level: 15, xp: 4250, avatar: '👨‍🔧', badges: 12, successRate: 97.2, streak: 18 },
      { id: 2, name: 'Fatma Trabelsi', role: 'Chef de Secteur', level: 14, xp: 3980, avatar: '👩‍💼', badges: 11, successRate: 96.8, streak: 15 },
      { id: 3, name: user?.firstName + ' ' + user?.lastName, role: user?.role, level: stats.level, xp: stats.xp, avatar: '🧑‍🔧', badges: stats.badges, successRate: stats.successRate, streak: stats.streak, isCurrentUser: true },
      { id: 4, name: 'Ahmed Ben Ali', role: 'Technicien Curatif', level: 12, xp: 2650, avatar: '👨‍🔧', badges: 7, successRate: 92.1, streak: 8 },
      { id: 5, name: 'Leila Mansouri', role: 'Magasinier', level: 11, xp: 2420, avatar: '👩‍💼', badges: 6, successRate: 89.5, streak: 5 }
    ];
    setLeaderboard(ranking);

    const userAchievements = [
      { id: 'speed_demon', name: 'Démon de la Vitesse', description: 'Terminer 10 interventions en moins de 1h', icon: '⚡', earned: true, earnedDate: '2024-01-15', rarity: 'rare', xpReward: 200 },
      { id: 'perfectionist', name: 'Perfectionniste', description: 'Maintenir un taux de succès de 95%+ sur 30 interventions', icon: '🎯', earned: true, earnedDate: '2024-01-20', rarity: 'epic', xpReward: 350 },
      { id: 'team_player', name: 'Esprit d\'Équipe', description: 'Aider 5 collègues sur leurs interventions', icon: '🤝', earned: true, earnedDate: '2024-01-25', rarity: 'common', xpReward: 100 },
      { id: 'early_bird', name: 'Lève-tôt', description: 'Commencer 20 interventions avant 8h', icon: '🌅', earned: false, progress: 15, target: 20, rarity: 'uncommon', xpReward: 150 }
    ];
    setAchievements(userAchievements);

    const activeChallenges = [
      { id: 'weekly_sprint', name: 'Sprint Hebdomadaire', description: 'Terminer 15 interventions cette semaine', type: 'weekly', progress: 8, target: 15, timeLeft: '3 jours', reward: '300 XP + Badge Sprint', icon: '🏃‍♂️', difficulty: 'medium' },
      { id: 'quality_focus', name: 'Focus Qualité', description: 'Maintenir 100% de succès sur 10 interventions', type: 'ongoing', progress: 6, target: 10, timeLeft: 'Permanent', reward: '500 XP + Badge Qualité', icon: '⭐', difficulty: 'hard' }
    ];
    setChallenges(activeChallenges);

    const availableRewards = [
      { id: 'coffee_voucher', name: 'Bon Café', description: 'Café gratuit à la cafétéria', cost: 100, icon: '☕', available: true, category: 'food' },
      { id: 'parking_spot', name: 'Place de Parking VIP', description: 'Place réservée pendant 1 semaine', cost: 250, icon: '🅿️', available: true, category: 'privilege' },
      { id: 'training_course', name: 'Formation Spécialisée', description: 'Accès à une formation de votre choix', cost: 500, icon: '📚', available: true, category: 'development' },
      { id: 'extra_day_off', name: 'Jour de Congé Bonus', description: 'Jour de congé supplémentaire', cost: 800, icon: '🏖️', available: userStats.xp >= 800, category: 'time' }
    ];
    setRewards(availableRewards);
  };

  const claimReward = (reward) => {
    if (userStats.xp >= reward.cost) {
      setUserStats(prev => ({ ...prev, xp: prev.xp - reward.cost }));
      addNotification('success', '🎁 Récompense réclamée!', { subtitle: reward.name, duration: 5000 });
    } else {
      addNotification('warning', '❌ XP insuffisant', { subtitle: `Il vous faut ${reward.cost - userStats.xp} XP de plus` });
    }
  };

  const getRarityColor = (rarity) => {
    const colors = { common: '#6b7280', uncommon: '#10b981', rare: '#3b82f6', epic: '#8b5cf6', legendary: '#f59e0b' };
    return colors[rarity] || '#6b7280';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };
    return colors[difficulty] || '#6b7280';
  };

  const MainDashboard = () => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)', color: 'white', borderRadius: '16px', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧑‍🔧</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Niveau {userStats.level}</div>
            <div style={{ opacity: 0.9 }}>{userStats.xp} XP • Rang #{userStats.rank}/{userStats.totalUsers}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>🏆 {userStats.badges} Badges</div>
            <div style={{ opacity: 0.9 }}>🔥 {userStats.streak} jours de série</div>
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <span>Progression niveau {userStats.level + 1}</span>
            <span>{userStats.xpToNextLevel} XP restants</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', height: '100%', width: `${((4000 - userStats.xpToNextLevel) / 4000) * 100}%`, borderRadius: '10px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{userStats.totalInterventions}</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Interventions</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{userStats.successRate}%</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Taux succès</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{userStats.avgResponseTime}h</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Temps moyen</div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>🎯 Défis Actifs</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {challenges.map(challenge => (
            <div key={challenge.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '2rem' }}>{challenge.icon}</div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#374151' }}>{challenge.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{challenge.description}</div>
                  </div>
                </div>
                <div style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', background: getDifficultyColor(challenge.difficulty) + '20', color: getDifficultyColor(challenge.difficulty) }}>
                  {challenge.difficulty === 'easy' ? '🟢 Facile' : challenge.difficulty === 'medium' ? '🟡 Moyen' : '🔴 Difficile'}
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <span>Progression: {challenge.progress}/{challenge.target}</span>
                  <span>⏰ {challenge.timeLeft}</span>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', height: '100%', width: `${(challenge.progress / challenge.target) * 100}%`, borderRadius: '10px', transition: 'width 0.3s ease' }} />
                </div>
              </div>
              <div style={{ padding: '0.75rem', background: '#f0f9ff', borderRadius: '8px', fontSize: '0.875rem', color: '#0c4a6e' }}>
                🎁 Récompense: {challenge.reward}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const LeaderboardTab = () => (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>🏆 Classement Équipe</h3>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {leaderboard.map((player, index) => (
          <div key={player.id} style={{ background: player.isCurrentUser ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 'white', border: player.isCurrentUser ? '2px solid #f59e0b' : '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: index < 3 ? (index === 0 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' : index === 1 ? 'linear-gradient(135deg, #c0c0c0 0%, #e5e5e5 100%)' : 'linear-gradient(135deg, #cd7f32 0%, #daa520 100%)') : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: index < 3 ? 'white' : '#6b7280' }}>
              {index + 1}
            </div>
            <div style={{ fontSize: '2rem' }}>{player.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#374151' }}>{player.name} {player.isCurrentUser && '(Vous)'}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{player.role}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '600', color: '#374151' }}>Niveau {player.level}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{player.xp} XP</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              <div>🏆 {player.badges}</div>
              <div>🔥 {player.streak}</div>
              <div>✅ {player.successRate}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RewardsTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', margin: 0 }}>🛍️ Boutique Récompenses</h3>
        <div style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', borderRadius: '12px', fontWeight: '600' }}>💰 {userStats.xp} XP disponibles</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {rewards.map(reward => (
          <div key={reward.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', opacity: reward.available ? 1 : 0.6 }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{reward.icon}</div>
              <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>{reward.name}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{reward.description}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ padding: '0.5rem 1rem', background: '#f3f4f6', borderRadius: '8px', fontWeight: '600', color: '#374151' }}>💰 {reward.cost} XP</div>
              <button onClick={() => claimReward(reward)} disabled={!reward.available} style={{ padding: '0.5rem 1rem', background: reward.available ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#9ca3af', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: reward.available ? 'pointer' : 'not-allowed' }}>
                {reward.available ? '🛒 Échanger' : '🔒 Verrouillé'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#003061', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🎮 Gamification Dashboard</h2>
        <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>Motivez vos équipes avec des défis et récompenses</p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        {[
          { id: 'dashboard', label: '🏠 Dashboard' },
          { id: 'leaderboard', label: '🏆 Classement' },
          { id: 'achievements', label: '🏅 Badges' },
          { id: 'rewards', label: '🛍️ Boutique' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setSelectedTab(tab.id)} style={{ padding: '0.75rem 1.5rem', background: selectedTab === tab.id ? '#003061' : 'transparent', color: selectedTab === tab.id ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }}>
            {tab.label}
          </button>
        ))}
      </div>
      {selectedTab === 'dashboard' && <MainDashboard />}
      {selectedTab === 'leaderboard' && <LeaderboardTab />}
      {selectedTab === 'rewards' && <RewardsTab />}
      {selectedTab === 'achievements' && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>🏅 Tous les Badges</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {achievements.map(achievement => (
              <div key={achievement.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', opacity: achievement.earned ? 1 : 0.7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '3rem' }}>{achievement.icon}</div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#374151' }}>{achievement.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{achievement.description}</div>
                  </div>
                </div>
                {achievement.earned ? (
                  <div style={{ padding: '0.5rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600' }}>
                    ✅ Obtenu le {achievement.earnedDate}
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                      <span>Progression: {achievement.progress}/{achievement.target}</span>
                    </div>
                    <div style={{ background: '#f3f4f6', borderRadius: '10px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', height: '100%', width: `${(achievement.progress / achievement.target) * 100}%`, borderRadius: '10px' }} />
                    </div>
                  </div>
                )}
                <div style={{ marginTop: '0.5rem', display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', background: getRarityColor(achievement.rarity) + '20', color: getRarityColor(achievement.rarity) }}>
                  +{achievement.xpReward} XP
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationDashboard;
