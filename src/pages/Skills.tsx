
import { useState, useEffect } from 'react';
import { Cpu, Star, Award, TrendingUp, BookOpen, LineChart } from 'lucide-react';
import { getSubjects, getQuizResults, getEnemies } from '@/utils/storage';
import { Subject, QuizResult, Enemy } from '@/utils/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart as RechartsLineChart, Line } from 'recharts';
import ProgressBar from '@/components/ProgressBar';

const COLORS = ['#27AE60', '#F39C12', '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C'];

const Skills = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  
  // Stats
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [averageConfidence, setAverageConfidence] = useState(0);
  const [subjectProgress, setSubjectProgress] = useState<{name: string, progress: number}[]>([]);
  const [dailyActivity, setDailyActivity] = useState<{date: string, count: number}[]>([]);
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    calculateStats();
  }, [results, subjects, enemies, selectedSubject]);
  
  const loadData = () => {
    const loadedSubjects = getSubjects();
    const loadedResults = getQuizResults();
    const loadedEnemies = getEnemies();
    
    setSubjects(loadedSubjects);
    setResults(loadedResults);
    setEnemies(loadedEnemies);
  };
  
  const calculateStats = () => {
    // Filter results by selected subject if needed
    const filteredResults = selectedSubject === 'all' 
      ? results 
      : results.filter(r => {
          const enemy = enemies.find(e => e.id === r.enemyId);
          return enemy && enemy.subjectId === selectedSubject;
        });
    
    // Total and correct questions
    let totalQ = 0;
    let correctQ = 0;
    
    filteredResults.forEach(result => {
      totalQ += result.totalQuestions;
      correctQ += result.correctAnswers;
    });
    
    setTotalQuestions(totalQ);
    setCorrectAnswers(correctQ);
    
    // Total time spent
    const timeSum = filteredResults.reduce((sum, r) => sum + r.timeSpent, 0);
    setTotalTime(timeSum);
    
    // Average confidence
    const avgConfidence = filteredResults.length > 0 
      ? filteredResults.reduce((sum, r) => sum + r.confidenceScore, 0) / filteredResults.length 
      : 0;
    setAverageConfidence(avgConfidence);
    
    // Subject progress
    const progress = subjects.map(subject => ({
      name: subject.name,
      progress: subject.progress
    }));
    setSubjectProgress(progress);
    
    // Daily activity
    const activityMap = new Map<string, number>();
    
    filteredResults.forEach(result => {
      const date = new Date(result.date).toLocaleDateString();
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    });
    
    const activity = Array.from(activityMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
    
    // Sort by date
    activity.sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
    
    setDailyActivity(activity);
  };
  
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Skills</h1>
        
        <div>
          <select 
            className="border rounded-md px-3 py-2"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="all">Todas as matérias</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {results.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <Cpu className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nenhuma estatística disponível</h2>
          <p className="text-gray-600">
            Complete batalhas e revisões para visualizar suas skills e progressos!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total questions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Questões Resolvidas</p>
                  <h3 className="text-2xl font-bold">{totalQuestions}</h3>
                </div>
                <BookOpen className="w-12 h-12 text-warrior-blue opacity-70" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Taxa de acerto: {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
              </p>
            </div>
            
            {/* Time spent */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tempo Total</p>
                  <h3 className="text-2xl font-bold">{formatTime(totalTime)}</h3>
                </div>
                <TrendingUp className="w-12 h-12 text-warrior-green opacity-70" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Média por questão: {totalQuestions > 0 ? formatTime(totalTime / totalQuestions) : '0s'}
              </p>
            </div>
            
            {/* Confidence */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Confiança Média</p>
                  <h3 className="text-2xl font-bold">{Math.round(averageConfidence)}%</h3>
                </div>
                <Star className="w-12 h-12 text-warrior-yellow opacity-70" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Baseada nas suas auto-avaliações
              </p>
            </div>
            
            {/* Completed enemies */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Inimigos Observados</p>
                  <h3 className="text-2xl font-bold">
                    {enemies.filter(e => e.status === 'observed').length}
                  </h3>
                </div>
                <Award className="w-12 h-12 text-warrior-red opacity-70" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                De um total de {enemies.length} inimigos
              </p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject progress */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Progresso por Matéria</h3>
              <div className="space-y-4">
                {subjectProgress.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm">{Math.round(item.progress)}%</span>
                    </div>
                    <ProgressBar 
                      progress={item.progress} 
                      colorClass={`bg-[${COLORS[index % COLORS.length]}]`}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Daily activity */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Atividade Diária</h3>
              {dailyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsLineChart data={dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="Questões" 
                      stroke="#3498DB" 
                      activeDot={{ r: 8 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Sem dados suficientes para gerar gráfico.
                </div>
              )}
            </div>
          </div>
          
          {/* Additional charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accuracy chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Desempenho Geral</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Acertos', value: correctAnswers },
                      { name: 'Erros', value: totalQuestions - correctAnswers }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#27AE60" />
                    <Cell fill="#E74C3C" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Confidence distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Distribuição de Confiança</h3>
              
              {results.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      { 
                        name: 'Certeza', 
                        value: results.reduce((sum, r) => 
                          sum + r.answers.filter(a => a.confidenceLevel === 'certainty').length, 0) 
                      },
                      { 
                        name: 'Dúvida', 
                        value: results.reduce((sum, r) => 
                          sum + r.answers.filter(a => a.confidenceLevel === 'doubt').length, 0) 
                      },
                      { 
                        name: 'Não sabia', 
                        value: results.reduce((sum, r) => 
                          sum + r.answers.filter(a => a.confidenceLevel === 'unknown').length, 0) 
                      }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Quantidade">
                      <Cell fill="#27AE60" />
                      <Cell fill="#F39C12" />
                      <Cell fill="#E74C3C" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Sem dados suficientes para gerar gráfico.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
