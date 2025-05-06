import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { QuizResult, Question, Enemy } from '@/utils/types';
import { useTranslation } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Award, Target } from 'lucide-react';

interface SimulationAnalysisProps {
  results: QuizResult[];
  questions: Question[];
  enemies: Enemy[];
}

const SimulationAnalysis = ({ results, questions, enemies }: SimulationAnalysisProps) => {
  const { t } = useTranslation();

  const simulationData = useMemo(() => {
    // Make sure we have the required data
    if (results.length === 0 || enemies.length === 0) {
      console.log('No results or enemies in SimulationAnalysis');
      return [];
    }
    
    console.log('Processing', results.length, 'results with', enemies.length, 'enemies');
    
    // Process all results (not filtering by question count)
    const simulations = [...results];
    
    // Sort by date
    simulations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate performance metrics for each simulation
    return simulations.map((sim, index) => {
      const enemy = enemies.find(e => e.id === sim.enemyId);
      
      // Log information about each enemy
      console.log(`Simulation ${index}:`, {
        enemyId: sim.enemyId,
        foundEnemy: !!enemy,
        enemyName: enemy?.name || 'Unknown'
      });
      
      const accuracy = (sim.correctAnswers / sim.totalQuestions) * 100;
      const avgTimePerQuestion = sim.timeSpent / sim.totalQuestions;
      
      return {
        name: `Sim ${index + 1}`,
        enemyName: enemy?.name || 'Unknown',
        date: new Date(sim.date).toLocaleDateString(),
        accuracy: Math.round(accuracy),
        questions: sim.totalQuestions,
        correct: sim.correctAnswers,
        avgTime: Math.round(avgTimePerQuestion),
        confidence: Math.round(sim.confidenceScore || 0),
      };
    });
  }, [results, enemies]);

  if (simulationData.length === 0) {
    return (
      <div className="text-center p-8">
        <Shield className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('skills.noSimulationsYet') || 'No Battle Simulations Yet'}</h3>
        <p className="text-gray-500">{t('skills.completeSimulation') || 'Complete a full simulation (10+ questions) to see your battle performance metrics.'}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="mr-2 h-4 w-4 text-red-500" />
              {t('skills.accuracyTrend') || 'Accuracy Trend'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, t('skills.accuracy') || 'Accuracy']}
                    labelFormatter={(label) => `${t('skills.simulation') || 'Simulation'} ${label}`}
                  />
                  <Bar dataKey="accuracy" fill="#f97316" name={t('skills.accuracy') || 'Accuracy'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Award className="mr-2 h-4 w-4 text-amber-500" />
              {t('skills.performanceMetrics') || 'Battle Performance'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {simulationData.slice(-3).reverse().map((sim, i) => (
                <div key={i} className="bg-gray-50 p-2 rounded">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{sim.name}</span>
                    <span>{sim.date}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{sim.enemyName}</span>
                    <span>{sim.correct}/{sim.questions} ({sim.accuracy}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 mt-1 rounded-full">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-red-500 h-1.5 rounded-full" 
                      style={{ width: `${sim.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="mr-2 h-4 w-4 text-blue-500" />
              {t('skills.confidenceMetrics') || 'Battle Confidence'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, t('skills.confidence') || 'Confidence']}
                    labelFormatter={(label) => `${t('skills.simulation') || 'Simulation'} ${label}`}
                  />
                  <Bar dataKey="confidence" fill="#3b82f6" name={t('skills.confidence') || 'Confidence'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('skills.detailedSimulations') || 'Battle Simulation History'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('skills.simulation') || 'Simulation'}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('skills.date') || 'Date'}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('skills.enemy') || 'Enemy'}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('skills.questions') || 'Questions'}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('skills.accuracy') || 'Accuracy'}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('skills.avgTime') || 'Avg. Time'}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('skills.confidence') || 'Confidence'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {simulationData.map((sim, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{sim.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{sim.date}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{sim.enemyName}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{sim.questions}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{sim.accuracy}%</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{sim.avgTime}s</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{sim.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(SimulationAnalysis);
