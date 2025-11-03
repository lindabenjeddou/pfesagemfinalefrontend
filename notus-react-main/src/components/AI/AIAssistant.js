import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useSecurity } from '../../contexts/SecurityContext';
import { useNotifications } from '../Notifications/NotificationSystem';

const AIAssistant = () => {
  const { projects, sousProjects } = useProjectContext();
  const { user } = useSecurity();
  const { addNotification } = useNotifications();
  const location = useLocation();
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedMode, setSelectedMode] = useState('chat');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [contextInfo, setContextInfo] = useState({ title: 'Général', subtitle: "", suggestions: [] });
  
  const sendAction = (type, payload) => {
    try {
      window.dispatchEvent(new CustomEvent('sage-action', { detail: { type, payload } }));
    } catch (e) {
      // no-op
    }
  };
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialiser l'assistant
  useEffect(() => {
    initializeAssistant();
    setupVoiceRecognition();
  }, [user]);

  // Adapter dynamiquement le contexte selon la page
  useEffect(() => {
    const path = location?.pathname || '';
    let ctx = { title: 'Général', subtitle: "", suggestions: [] };
    if (path.includes('/admin/assign-intervention')) {
      ctx = {
        title: 'Assigner des Interventions',
        subtitle: 'Sélectionnez une intervention, puis un testeur/technicien. Utilisez la recherche et les filtres.',
        suggestions: ['Afficher la liste', 'Actualiser données', 'Conseils d’assignation']
      };
    } else if (path.includes('/admin/validation-interventions')) {
      ctx = {
        title: 'Validation des Interventions',
        subtitle: 'Filtrez sur EN_ATTENTE pour confirmer rapidement les demandes.',
        suggestions: ['Filtrer EN_ATTENTE', 'Voir conseils validation', 'Réinitialiser filtres']
      };
    } else if (path.includes('/admin/interventions')) {
      ctx = {
        title: 'Liste des interventions',
        subtitle: 'Recherchez par #, description, type (CURATIVE / PRÉVENTIVE).',
        suggestions: ['Recherche avancée', 'Filtrer par type', 'Trier par date']
      };
    } else if (path.includes('/admin/kpi-dashboard') || path.includes('/admin/analytics')) {
      ctx = {
        title: 'KPI & Analytics',
        subtitle: 'Analyse des indicateurs et recommandations d’amélioration.',
        suggestions: ['Analyser mes KPI du mois', 'Identifier goulots d’étranglement', 'Proposer actions MTTR/MTBF']
      };
    }
    setContextInfo(ctx);

    // Injecter un message contextuel léger
    if (ctx.title !== 'Général') {
      const tip = {
        id: Date.now(),
        type: 'assistant',
        content: `📍 Contexte: ${ctx.title}\n\n${ctx.subtitle}`,
        timestamp: new Date(),
        suggestions: ctx.suggestions
      };
      setMessages(prev => (prev.length === 0 ? [tip] : [...prev, tip]));
    }
  }, [location]);

  // Auto-scroll vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeAssistant = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'assistant',
      content: `👋 Bonjour ${user?.firstName} ! Je suis **SAGE**, votre assistant IA Sagemcom.

Je peux vous aider avec :
🔧 **Diagnostics techniques** - Analyser les pannes et proposer des solutions
📊 **Analyses KPI** - Interpréter vos indicateurs de performance  
📋 **Planification** - Optimiser vos interventions et planning
📦 **Gestion PDR** - Recommander les pièces de rechange
🎯 **Conseils métier** - Partager les meilleures pratiques

Comment puis-je vous assister aujourd'hui ?`,
      timestamp: new Date(),
      suggestions: [
        'Analyser mes KPI du mois',
        'Diagnostiquer une panne compresseur',
        'Optimiser mon planning',
        'Recommander des PDR critiques'
      ]
    };
    
    setMessages([welcomeMessage]);
  };

  const setupVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
        addNotification('warning', '🎤 Erreur reconnaissance vocale');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      setVoiceEnabled(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startVoiceRecognition = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const generateAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Simulation de l'IA avec réponses contextuelles
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let response = '';
    const lowerMessage = userMessage.toLowerCase();
    
    // Diagnostics techniques
    if (lowerMessage.includes('panne') || lowerMessage.includes('problème') || lowerMessage.includes('défaillance')) {
      if (lowerMessage.includes('compresseur')) {
        response = `🔧 **Diagnostic Compresseur**

**Causes probables :**
• **Surchauffe** - Vérifier le système de refroidissement
• **Pression anormale** - Contrôler les vannes et filtres  
• **Vibrations excessives** - Examiner les supports et roulements
• **Bruit anormal** - Inspecter les courroies et accouplements

**Actions recommandées :**
1. Mesurer température et pression
2. Vérifier l'alignement
3. Contrôler l'huile de lubrification
4. Tester les capteurs

**PDR suggérées :** Roulement SKF 6205, Courroie HTD 8M, Joint d'étanchéité

Voulez-vous que je génère un bon de travail ?`;
      } else {
        response = `🔍 **Diagnostic Général**

Pour un diagnostic précis, j'ai besoin de plus d'informations :
• Quel équipement est concerné ?
• Quels sont les symptômes observés ?
• Y a-t-il des codes d'erreur ?
• Quand le problème est-il apparu ?

**Procédure standard :**
1. **Observation** - Noter tous les symptômes
2. **Mesures** - Relever les paramètres techniques
3. **Tests** - Vérifier les composants critiques
4. **Analyse** - Comparer avec les valeurs nominales

Décrivez-moi plus précisément le problème rencontré.`;
      }
    }
    
    // Analyses KPI
    else if (lowerMessage.includes('kpi') || lowerMessage.includes('indicateur') || lowerMessage.includes('performance')) {
      const mttr = 2.1;
      const mtbf = 58.5;
      const availability = 97.2;
      
      response = `📊 **Analyse KPI - ${new Date().toLocaleDateString('fr-FR')}**

**Indicateurs actuels :**
• **MTTR :** ${mttr}h (🎯 Objectif: 2.0h) - ${mttr > 2.0 ? '⚠️ Légèrement au-dessus' : '✅ Dans les objectifs'}
• **MTBF :** ${mtbf}h (🎯 Objectif: 60h) - ${mtbf < 60 ? '📈 En amélioration' : '✅ Excellent'}
• **Disponibilité :** ${availability}% (🎯 Objectif: 98%) - ${availability < 98 ? '⚠️ À améliorer' : '✅ Parfait'}

**Recommandations :**
${mttr > 2.0 ? '• Réduire MTTR : Formation techniciens, outils diagnostics' : ''}
${mtbf < 60 ? '• Améliorer MTBF : Maintenance préventive renforcée' : ''}
${availability < 98 ? '• Augmenter disponibilité : Optimiser planning maintenance' : ''}

**Tendance :** ${Math.random() > 0.5 ? '📈 Amélioration' : '📊 Stable'} par rapport au mois dernier.

Souhaitez-vous un rapport détaillé ?`;
    }
    
    // Planification
    else if (lowerMessage.includes('planning') || lowerMessage.includes('planifier') || lowerMessage.includes('optimiser')) {
      response = `📋 **Optimisation Planning**

**Analyse actuelle :**
• **Charge de travail :** 85% (optimal: 80-90%)
• **Interventions en attente :** 12
• **Techniciens disponibles :** 8/10
• **Conflits détectés :** 2

**Suggestions d'optimisation :**
1. **Répartition équilibrée** - Redistribuer 3 interventions
2. **Priorisation** - Traiter d'abord les interventions critiques
3. **Compétences** - Assigner selon l'expertise technique
4. **Géolocalisation** - Optimiser les déplacements

**Actions recommandées :**
• Reporter intervention non-critique de demain
• Assigner Mohamed Gharbi sur la maintenance préventive
• Grouper les interventions par zone géographique

Voulez-vous que j'applique ces optimisations ?`;
    }
    
    // PDR et stock
    else if (lowerMessage.includes('pdr') || lowerMessage.includes('stock') || lowerMessage.includes('pièce')) {
      response = `📦 **Gestion PDR - Recommandations**

**Alertes stock critique :**
🚨 **Roulement SKF 6205** - Stock: 2 (Min: 5) - **Commander 20 unités**
⚠️ **Courroie HTD 8M** - Stock: 8 (Min: 10) - Commander 15 unités  
🟡 **Capteur proximité** - Stock: 12 (Min: 15) - Commander 10 unités

**Analyse prédictive :**
• **Consommation mensuelle :** +15% vs mois dernier
• **Délai fournisseur :** 7-10 jours
• **Risque rupture :** Élevé pour SKF 6205

**Commandes suggérées :**
1. **Urgent** - Roulement SKF 6205 (20 unités) - 1,200€
2. **Normal** - Courroie HTD 8M (15 unités) - 450€
3. **Préventif** - Capteur proximité (10 unités) - 800€

**Total estimé :** 2,450€

Dois-je préparer les bons de commande ?`;
    }
    
    // Conseils métier
    else if (lowerMessage.includes('conseil') || lowerMessage.includes('bonne pratique') || lowerMessage.includes('améliorer')) {
      response = `💡 **Conseils & Bonnes Pratiques**

**Maintenance Préventive :**
• **Fréquence optimale :** Adapter selon l'historique des pannes
• **Check-lists numériques :** Utiliser tablettes pour traçabilité
• **Prédictif :** Intégrer capteurs IoT pour surveillance continue

**Efficacité Techniciens :**
• **Formation continue :** 2h/mois sur nouvelles technologies
• **Outils mobiles :** Scanner QR codes équipements
• **Partage d'expérience :** Réunions techniques hebdomadaires

**Optimisation Stocks :**
• **Analyse ABC :** Prioriser les pièces critiques
• **Rotation :** FIFO pour éviter obsolescence
• **Partenariats :** Accords-cadres fournisseurs

**KPI Avancés :**
• **OEE** (Overall Equipment Effectiveness)
• **Coût maintenance / CA**
• **Satisfaction client interne**

Quel domaine souhaitez-vous approfondir ?`;
    }
    
    // Réponse générale
    else {
      response = `🤖 Je comprends votre demande concernant "${userMessage}".

**Je peux vous aider avec :**
• 🔧 **Diagnostics** - "Diagnostiquer panne compresseur"
• 📊 **KPI** - "Analyser mes indicateurs"  
• 📋 **Planning** - "Optimiser mon planning"
• 📦 **PDR** - "Recommander pièces critiques"
• 💡 **Conseils** - "Bonnes pratiques maintenance"

**Exemples de questions :**
- "Comment réduire mon MTTR ?"
- "Quelles PDR commander ce mois ?"
- "Optimiser planning de la semaine"
- "Diagnostiquer vibrations moteur"

Reformulez votre question ou choisissez un domaine d'assistance.`;
    }
    
    setIsTyping(false);
    
    const aiMessage = {
      id: Date.now(),
      type: 'assistant',
      content: response,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
    
    // Synthèse vocale si activée
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response.replace(/[*#]/g, '').substring(0, 200));
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    await generateAIResponse(inputMessage);
  };

  const handleSuggestionClick = (suggestion) => {
    // Mapper quelques suggestions courantes vers des actions
    const s = suggestion.toLowerCase();
    if (contextInfo.title.includes('Assigner') && (s.includes('actualiser') || s.includes('données'))) {
      sendAction('assign:refresh');
      return;
    }
    if (contextInfo.title.includes('Validation') && s.includes('en_attente')) {
      sendAction('validation:filter-en-attente');
      return;
    }
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isMinimized) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999
      }}>
        <button
          onClick={() => setIsMinimized(false)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
            color: 'white',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'pulse 2s infinite'
          }}
        >
          🤖
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      height: '600px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999,
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
        color: 'white',
        padding: '1rem',
        borderRadius: '16px 16px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ fontSize: '1.5rem' }}>🤖</div>
          <div>
            <div style={{ fontWeight: '600' }}>SAGE Assistant</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
              {isTyping ? '✍️ En train d\'écrire...' : `🟢 ${contextInfo.title}`}
            </div>
            {contextInfo.subtitle && (
              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{contextInfo.subtitle}</div>
            )}
          </div>
        </div>
        {/* Quick actions contextuelles */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {contextInfo.title.includes('Assigner') && (
            <>
              <button onClick={() => sendAction('assign:view-assign')} style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', borderRadius:6, padding:'0.25rem 0.5rem', cursor:'pointer', fontSize:'0.75rem' }}>Assigner</button>
              <button onClick={() => sendAction('assign:view-list')} style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', borderRadius:6, padding:'0.25rem 0.5rem', cursor:'pointer', fontSize:'0.75rem' }}>Liste</button>
              <button onClick={() => sendAction('assign:refresh')} style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', borderRadius:6, padding:'0.25rem 0.5rem', cursor:'pointer', fontSize:'0.75rem' }}>Actualiser</button>
              <button onClick={() => sendAction('assign:clear-filters')} style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', borderRadius:6, padding:'0.25rem 0.5rem', cursor:'pointer', fontSize:'0.75rem' }}>Vider filtres</button>
            </>
          )}
          {contextInfo.title.includes('Validation') && (
            <>
              <button onClick={() => sendAction('validation:filter-en-attente')} style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', borderRadius:6, padding:'0.25rem 0.5rem', cursor:'pointer', fontSize:'0.75rem' }}>EN_ATTENTE</button>
            </>
          )}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            style={{
              background: voiceEnabled ? 'rgba(255,255,255,0.2)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              borderRadius: '6px',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            {voiceEnabled ? '🔊' : '🔇'}
          </button>
          
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              borderRadius: '6px',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer'
            }}
          >
            ➖
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map(message => (
          <div key={message.id} style={{
            display: 'flex',
            flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
            gap: '0.5rem',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: message.type === 'user' ? '#10b981' : '#003061',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              flexShrink: 0
            }}>
              {message.type === 'user' ? '👤' : '🤖'}
            </div>
            
            <div style={{
              maxWidth: '80%',
              padding: '0.75rem',
              borderRadius: '12px',
              background: message.type === 'user' ? '#10b981' : '#f3f4f6',
              color: message.type === 'user' ? 'white' : '#374151',
              fontSize: '0.875rem',
              lineHeight: '1.4'
            }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </div>
              
              {message.suggestions && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={{
                        padding: '0.5rem',
                        background: 'rgba(0,48,97,0.1)',
                        border: '1px solid rgba(0,48,97,0.2)',
                        borderRadius: '8px',
                        color: '#003061',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        textAlign: 'left'
                      }}
                    >
                      💡 {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#003061',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🤖
            </div>
            <div style={{
              padding: '0.75rem',
              background: '#f3f4f6',
              borderRadius: '12px',
              display: 'flex',
              gap: '0.25rem'
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6b7280', animation: 'bounce 1.4s infinite ease-in-out' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6b7280', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6b7280', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #e5e7eb',
        background: '#f9fafb',
        borderRadius: '0 0 16px 16px'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              resize: 'none',
              minHeight: '40px',
              maxHeight: '100px',
              fontSize: '0.875rem'
            }}
            rows={1}
          />
          
          {voiceEnabled && (
            <button
              onClick={startVoiceRecognition}
              disabled={isListening}
              style={{
                padding: '0.75rem',
                background: isListening ? '#ef4444' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          )}
          
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            style={{
              padding: '0.75rem',
              background: inputMessage.trim() && !isTyping ? '#003061' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
              fontSize: '1rem'
            }}
          >
            📤
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
