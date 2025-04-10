
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { QuizResult } from '@/utils/types';

interface ResultsChartProps {
  result: QuizResult;
}

const ResultsChart = ({ result }: ResultsChartProps) => {
  // Calculate stats
  const correctPercent = (result.correctAnswers / result.totalQuestions) * 100;
  const incorrectPercent = 100 - correctPercent;
  
  // Count confidence levels
  const confidenceCounts = {
    'certainty': 0,
    'doubt': 0,
    'unknown': 0
  };
  
  result.answers.forEach(answer => {
    if (answer.confidenceLevel) {
      confidenceCounts[answer.confidenceLevel]++;
    }
  });
  
  // Prepare data for charts
  const performanceData = [
    { name: 'Corretas', value: result.correctAnswers },
    { name: 'Incorretas', value: result.totalQuestions - result.correctAnswers }
  ];
  
  const confidenceData = [
    { name: 'Certeza', value: confidenceCounts.certainty },
    { name: 'Dúvida', value: confidenceCounts.doubt },
    { name: 'Não sabia', value: confidenceCounts.unknown }
  ];
  
  const COLORS = ['#27AE60', '#F39C12', '#E74C3C'];
  
  // Format time
  const formatTime = (timeInMs: number) => {
    const seconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  return (
    <div className="w-full p-4">
      <h3 className="text-xl font-bold mb-4 text-center">Análise de Combate</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Performance chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium mb-2">Desempenho</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {
                  performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#27AE60' : '#E74C3C'} />
                  ))
                }
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-sm mt-2">
            <p className="text-warrior-green">Acertos: {result.correctAnswers}/{result.totalQuestions}</p>
            <p className="text-warrior-red">Erros: {result.totalQuestions - result.correctAnswers}/{result.totalQuestions}</p>
          </div>
        </div>
        
        {/* Confidence chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium mb-2">Nível de Confiança</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={confidenceData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" name="Quantidade">
                {
                  confidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Stats summary */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium mb-2">Resumo</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Pontuação: <span className="font-medium">{Math.round(correctPercent)}/100</span></p>
            <p className="text-sm text-gray-600">Tempo total: <span className="font-medium">{formatTime(result.timeSpent)}</span></p>
            <p className="text-sm text-gray-600">Média por questão: <span className="font-medium">
              {formatTime(result.timeSpent / result.totalQuestions)}
            </span></p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Nível de confiança: <span className="font-medium">
              {Math.round(result.confidenceScore)}%
            </span></p>
            <p className="text-sm text-gray-600">Data: <span className="font-medium">
              {new Date(result.date).toLocaleDateString()}
            </span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsChart;
