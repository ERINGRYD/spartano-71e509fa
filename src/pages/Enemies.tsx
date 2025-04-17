
import { useState, useEffect } from 'react';
import { getEnemies, getSubjects } from '@/utils/storage';
import { Subject, Enemy } from '@/utils/types';
import EnemyCard from '@/components/EnemyCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, SkipForward, Shield } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import EnemyForm from '@/components/EnemyForm';
import ImportEnemies from '@/components/ImportEnemies';
import DailyChallenges from '@/components/spartan/DailyChallenges';
import SpartanAvatar from '@/components/spartan/SpartanAvatar';

export default function Enemies() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    const loadedSubjects = getSubjects();
    const loadedEnemies = getEnemies();
    
    setSubjects(loadedSubjects);
    setEnemies(loadedEnemies);
  };
  
  const handleEnemyAdded = () => {
    setShowAddForm(false);
    loadData();
  };
  
  const handleImportComplete = () => {
    setShowImportForm(false);
    loadData();
  };
  
  const getFilteredEnemies = () => {
    let filtered = [...enemies];
    
    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(enemy => enemy.status === selectedFilter);
    }
    
    // Apply search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(enemy => 
        enemy.name.toLowerCase().includes(term) ||
        subjects.find(s => s.id === enemy.subjectId)?.name.toLowerCase().includes(term) ||
        subjects.find(s => s.id === enemy.subjectId)?.topics.find(t => t.id === enemy.topicId)?.name.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };
  
  const filteredEnemies = getFilteredEnemies();
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              <Shield className="mr-2 h-6 w-6 text-red-700" />
              {t('nav.enemies')}
            </h1>
            <div className="flex mt-3 sm:mt-0 space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowImportForm(true)}
              >
                <SkipForward className="mr-1 h-4 w-4" />
                {t('enemies.import')}
              </Button>
              <Button 
                onClick={() => setShowAddForm(true)}
                size="sm"
              >
                <PlusCircle className="mr-1 h-4 w-4" />
                {t('enemies.add')}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('common.search')}
                className="w-full px-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="w-full px-4 py-2 border rounded-md bg-white"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">{t('enemies.allStatus')}</option>
                <option value="ready">{t('enemies.ready')}</option>
                <option value="battle">{t('enemies.battle')}</option>
                <option value="wounded">{t('enemies.wounded')}</option>
                <option value="observed">{t('enemies.observed')}</option>
              </select>
            </div>
          </div>
          
          {filteredEnemies.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <Shield className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-500">
                {t('enemies.noEnemies')}
              </h3>
              <p className="mt-2 text-gray-500">
                {searchTerm || selectedFilter !== 'all' ? 
                  t('enemies.noMatchingEnemies') : 
                  t('enemies.addYourFirstEnemy')}
              </p>
              {(searchTerm || selectedFilter !== 'all') && (
                <Button 
                  variant="ghost"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedFilter('all');
                  }}
                >
                  {t('enemies.clearFilters')}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredEnemies.map((enemy) => (
                <EnemyCard 
                  key={enemy.id}
                  enemy={enemy}
                  onUpdate={loadData}
                />
              ))}
            </div>
          )}
          
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <EnemyForm 
                  onSave={handleEnemyAdded} 
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            </div>
          )}
          
          {showImportForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <ImportEnemies
                  onImport={handleImportComplete}
                  onCancel={() => setShowImportForm(false)}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Spartan-themed sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <DailyChallenges />
        </div>
      </div>
    </div>
  );
}
