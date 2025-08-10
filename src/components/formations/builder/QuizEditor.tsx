import React, { useState } from 'react';
import { 
  Plus, HelpCircle, ChevronDown, ChevronRight, Trash2, Copy, 
  Clock, Search, Filter, Target, Award
} from 'lucide-react';
import { ContentBlock, QuizQuestion } from '@/types/formation.types';
import { useNotifications } from '@/contexts/NotificationContext';

interface PremiumQuizEditorProps {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
}

export const PremiumQuizEditor: React.FC<PremiumQuizEditorProps> = ({ block, onUpdate }) => {
  const { addNotification } = useNotifications();
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: generateId(),
      type: 'multiple_choice',
      question: 'Nouvelle question',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correct_answer: 'Option 1',
      explanation: '',
      points: 1,
      difficulty: 'easy',
      tags: [],
      time_limit: 60
    };

    const updatedQuestions = [...(block.data.questions || []), newQuestion];
    onUpdate({ data: { ...block.data, questions: updatedQuestions } });
    addNotification('Question ajoutée', 'success');
  };

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    const updatedQuestions = block.data.questions.map((q: QuizQuestion) =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    onUpdate({ data: { ...block.data, questions: updatedQuestions } });
  };

  const deleteQuestion = (questionId: string) => {
    const updatedQuestions = block.data.questions.filter((q: QuizQuestion) => q.id !== questionId);
    onUpdate({ data: { ...block.data, questions: updatedQuestions } });
    addNotification('Question supprimée', 'info');
  };

  const duplicateQuestion = (questionId: string) => {
    const question = block.data.questions.find((q: QuizQuestion) => q.id === questionId);
    if (question) {
      const duplicatedQuestion = {
        ...question,
        id: generateId(),
        question: question.question + ' (copie)'
      };
      const updatedQuestions = [...block.data.questions, duplicatedQuestion];
      onUpdate({ data: { ...block.data, questions: updatedQuestions } });
      addNotification('Question dupliquée', 'success');
    }
  };

  const filteredQuestions = block.data.questions?.filter((q: QuizQuestion) => {
    const matchesFilter = filter === 'all' || q.difficulty === filter;
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  const totalPoints = block.data.questions?.reduce((sum: number, q: QuizQuestion) => sum + q.points, 0) || 0;

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Quiz Interactif Premium</h3>
              <p className="text-gray-600">Créez un quiz engageant pour vos apprenants</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{block.data.questions?.length || 0}</div>
              <div className="text-gray-600">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
              <div className="text-gray-600">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.ceil((totalPoints * 2) / 60)}</div>
              <div className="text-gray-600">Min</div>
            </div>
          </div>
        </div>

        {/* Configuration du quiz */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Titre du Quiz</label>
            <input
              type="text"
              value={block.data.titre || ''}
              onChange={(e) => onUpdate({ data: { ...block.data, titre: e.target.value } })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Quiz de validation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Note de passage (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={block.data.note_passage || 70}
              onChange={(e) => onUpdate({ data: { ...block.data, note_passage: parseInt(e.target.value) } })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Tentatives max</label>
            <input
              type="number"
              min="1"
              max="10"
              value={block.data.tentatives_max || 3}
              onChange={(e) => onUpdate({ data: { ...block.data, tentatives_max: parseInt(e.target.value) } })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Temps limite (min)</label>
            <input
              type="number"
              min="0"
              value={block.data.temps_limite || 0}
              onChange={(e) => onUpdate({ data: { ...block.data, temps_limite: parseInt(e.target.value) } })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="0 = illimité"
            />
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une question..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les difficultés</option>
            <option value="easy">Facile</option>
            <option value="medium">Moyen</option>
            <option value="hard">Difficile</option>
          </select>
        </div>
        <button
          onClick={addQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all ml-auto"
        >
          <Plus className="w-4 h-4" />
          Nouvelle question
        </button>
      </div>

      {/* Liste des questions */}
      <div className="space-y-4">
        {filteredQuestions.map((question: QuizQuestion, index: number) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            isSelected={selectedQuestion === index}
            onSelect={() => setSelectedQuestion(selectedQuestion === index ? null : index)}
            onUpdate={(updates) => updateQuestion(question.id, updates)}
            onDelete={() => deleteQuestion(question.id)}
            onDuplicate={() => duplicateQuestion(question.id)}
          />
        ))}

        {filteredQuestions.length === 0 && (
          <EmptyQuizState onAddQuestion={addQuestion} hasSearch={!!searchTerm || filter !== 'all'} />
        )}
      </div>
    </div>
  );
};

// Composant pour une carte de question
interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onSelect}
      >
        <div className="flex items-center gap-4">
          {isSelected ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${getDifficultyColor(question.difficulty || 'easy')}`}>
            {index + 1}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 truncate max-w-md">{question.question}</h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full capitalize">
                {question.type.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500">{question.points} pt{question.points > 1 ? 's' : ''}</span>
              {question.time_limit && (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {question.time_limit}s
                </span>
              )}
              <span className="text-xs text-gray-500 capitalize">{question.difficulty}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Dupliquer"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isSelected && (
        <QuestionEditor question={question} onUpdate={onUpdate} />
      )}
    </div>
  );
};

// Composant pour éditer une question
interface QuestionEditorProps {
  question: QuizQuestion;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onUpdate }) => {
  return (
    <div className="border-t bg-gray-50 p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Question</label>
            <textarea
              value={question.question}
              onChange={(e) => onUpdate({ question: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 resize-none h-24"
              placeholder="Saisissez votre question ici..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Type de question</label>
              <select
                value={question.type}
                onChange={(e) => onUpdate({ type: e.target.value as QuizQuestion['type'] })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="multiple_choice">Choix multiple</option>
                <option value="true_false">Vrai/Faux</option>
                <option value="text">Texte libre</option>
                <option value="number">Nombre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Difficulté</label>
              <select
                value={question.difficulty}
                onChange={(e) => onUpdate({ difficulty: e.target.value as QuizQuestion['difficulty'] })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Points</label>
              <input
                type="number"
                min="1"
                max="10"
                value={question.points}
                onChange={(e) => onUpdate({ points: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Temps limite (s)</label>
              <input
                type="number"
                min="0"
                value={question.time_limit || 0}
                onChange={(e) => onUpdate({ time_limit: parseInt(e.target.value) || undefined })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="0 = illimité"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {question.type === 'multiple_choice' && (
            <MultipleChoiceEditor question={question} onUpdate={onUpdate} />
          )}

          {question.type === 'true_false' && (
            <TrueFalseEditor question={question} onUpdate={onUpdate} />
          )}

          {(question.type === 'text' || question.type === 'number') && (
            <TextAnswerEditor question={question} onUpdate={onUpdate} />
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Explication (optionnelle)</label>
            <textarea
              value={question.explanation || ''}
              onChange={(e) => onUpdate({ explanation: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 resize-none h-24"
              placeholder="Expliquez pourquoi cette réponse est correcte..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Éditeur pour les questions à choix multiple
const MultipleChoiceEditor: React.FC<QuestionEditorProps> = ({ question, onUpdate }) => {
  const addOption = () => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
    onUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = [...(question.options || [])];
    newOptions.splice(index, 1);
    onUpdate({ options: newOptions });
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-700">Options de réponse</label>
      <div className="space-y-2">
        {question.options?.map((option, optIndex) => (
          <div key={optIndex} className="flex items-center gap-3">
            <input
              type="radio"
              name={`correct_${question.id}`}
              checked={question.correct_answer === option}
              onChange={() => onUpdate({ correct_answer: option })}
              className="text-pink-500 w-4 h-4"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...(question.options || [])];
                newOptions[optIndex] = e.target.value;
                onUpdate({ options: newOptions });
              }}
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500"
              placeholder={`Option ${optIndex + 1}`}
            />
            {question.options && question.options.length > 2 && (
              <button
                onClick={() => removeOption(optIndex)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {question.options && question.options.length < 6 && (
          <button
            onClick={addOption}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
          >
            + Ajouter une option
          </button>
        )}
      </div>
    </div>
  );
};

// Éditeur pour les questions Vrai/Faux
const TrueFalseEditor: React.FC<QuestionEditorProps> = ({ question, onUpdate }) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-700">Réponse correcte</label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            name={`tf_${question.id}`}
            checked={question.correct_answer === true}
            onChange={() => onUpdate({ correct_answer: true })}
            className="text-green-500 w-4 h-4"
          />
          <span className="text-green-600 font-medium">Vrai</span>
        </label>
        <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            name={`tf_${question.id}`}
            checked={question.correct_answer === false}
            onChange={() => onUpdate({ correct_answer: false })}
            className="text-red-500 w-4 h-4"
          />
          <span className="text-red-600 font-medium">Faux</span>
        </label>
      </div>
    </div>
  );
};

// Éditeur pour les réponses texte/nombre
const TextAnswerEditor: React.FC<QuestionEditorProps> = ({ question, onUpdate }) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-700">
        Réponse correcte {question.type === 'number' ? '(nombre)' : '(texte)'}
      </label>
      <input
        type={question.type === 'number' ? 'number' : 'text'}
        value={question.correct_answer as string || ''}
        onChange={(e) => {
          const value = question.type === 'number' ? parseFloat(e.target.value) : e.target.value;
          onUpdate({ correct_answer: value });
        }}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500"
        placeholder={question.type === 'number' ? 'Entrez le nombre correct' : 'Entrez la réponse correcte'}
      />
    </div>
  );
};

// État vide pour le quiz
interface EmptyQuizStateProps {
  onAddQuestion: () => void;
  hasSearch: boolean;
}

const EmptyQuizState: React.FC<EmptyQuizStateProps> = ({ onAddQuestion, hasSearch }) => {
  return (
    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
      <HelpCircle className="mx-auto mb-4 text-gray-400" size={48} />
      <h3 className="text-lg font-medium text-gray-600 mb-2">
        {hasSearch ? 'Aucune question trouvée' : 'Quiz vide'}
      </h3>
      <p className="text-gray-500 mb-6">
        {hasSearch 
          ? 'Essayez de modifier vos filtres de recherche' 
          : 'Créez votre première question pour commencer le quiz'
        }
      </p>
      {!hasSearch && (
        <button
          onClick={onAddQuestion}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all mx-auto"
        >
          <Plus className="w-5 h-5" />
          Créer ma première question
        </button>
      )}
    </div>
  );
};