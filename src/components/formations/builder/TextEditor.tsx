import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, List, Quote, Code2, Settings, 
  ChevronDown, ChevronRight, RotateCcw, Clock
} from 'lucide-react';
import { ContentBlock } from '@/types/formation.types';

interface PremiumTextEditorProps {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
}

export const PremiumTextEditor: React.FC<PremiumTextEditorProps> = ({ block, onUpdate }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showHTMLMode, setShowHTMLMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const text = block.data.content || '';
    const plainText = text.replace(/<[^>]*>/g, '');
    const words = plainText.trim().split(/\s+/).filter((word: string | any[]) => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // 200 mots par minute
  }, [block.data.content]);

  const formatText = (command: string, value?: string) => {
    if (!showHTMLMode) {
      document.execCommand(command, false, value);
      updateContentFromVisualEditor();
    } else {
      insertHTMLTag(command, value);
    }
  };

  const insertHTMLTag = (command: string, value?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let newText;
    switch (command) {
      case 'bold':
        newText = beforeText + '<strong>' + selectedText + '</strong>' + afterText;
        break;
      case 'italic':
        newText = beforeText + '<em>' + selectedText + '</em>' + afterText;
        break;
      case 'underline':
        newText = beforeText + '<u>' + selectedText + '</u>' + afterText;
        break;
      case 'createLink':
        newText = beforeText + `<a href="${value}">${selectedText || 'Lien'}</a>` + afterText;
        break;
      default:
        return;
    }

    onUpdate({ data: { ...block.data, content: newText } });

    // Restaurer la position du curseur
    setTimeout(() => {
      const newPosition = start + newText.length - beforeText.length - afterText.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 10);
  };

  const updateContentFromVisualEditor = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onUpdate({ data: { ...block.data, content } });
    }
  };

  const insertTemplate = (template: string) => {
    if (showHTMLMode) {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const beforeText = textarea.value.substring(0, start);
      const afterText = textarea.value.substring(start);
      const newText = beforeText + template + afterText;
      
      onUpdate({ data: { ...block.data, content: newText } });
    } else {
      document.execCommand('insertHTML', false, template);
      updateContentFromVisualEditor();
    }
  };

  const templates = [
    {
      name: 'Citation',
      icon: Quote,
      html: '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">Votre citation ici</blockquote>'
    },
    {
      name: 'Code',
      icon: Code2,
      html: '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto"><code>// Votre code ici</code></pre>'
    },
    {
      name: 'Alerte Info',
      icon: Settings,
      html: '<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4"><div class="flex items-center"><span class="text-blue-600 mr-2">ℹ️</span><strong>Information:</strong></div><p>Votre message informatif</p></div>'
    },
    {
      name: 'Alerte Succès',
      icon: Settings,
      html: '<div class="bg-green-50 border border-green-200 rounded-lg p-4 my-4"><div class="flex items-center"><span class="text-green-600 mr-2">✅</span><strong>Succès:</strong></div><p>Votre message de succès</p></div>'
    },
    {
      name: 'Alerte Warning',
      icon: Settings,
      html: '<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4"><div class="flex items-center"><span class="text-yellow-600 mr-2">⚠️</span><strong>Attention:</strong></div><p>Votre message d\'attention</p></div>'
    }
  ];

  const stripHTML = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  return (
    <div className="space-y-4">
      {/* Barre d'outils principale */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Éditeur de texte premium</span>
          <div className="flex items-center gap-2">
            <div className="flex bg-white rounded border">
              <button
                onClick={() => setShowHTMLMode(false)}
                className={`px-3 py-1 text-xs rounded-l ${!showHTMLMode ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Visuel
              </button>
              <button
                onClick={() => setShowHTMLMode(true)}
                className={`px-3 py-1 text-xs rounded-r ${showHTMLMode ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                HTML
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Formatage de base */}
          <div className="flex items-center border-r pr-2 mr-2">
            <button
              onClick={() => formatText('bold')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Gras (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Italique (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('underline')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Souligné (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          {/* Titres */}
          <div className="flex items-center border-r pr-2 mr-2">
            <select
              onChange={(e) => formatText('formatBlock', e.target.value)}
              className="text-sm border rounded px-2 py-1"
              defaultValue=""
            >
              <option value="">Style</option>
              <option value="h1">Titre 1</option>
              <option value="h2">Titre 2</option>
              <option value="h3">Titre 3</option>
              <option value="p">Paragraphe</option>
            </select>
          </div>

          {/* Couleurs */}
          <div className="flex items-center border-r pr-2 mr-2">
            <input
              type="color"
              onChange={(e) => formatText('foreColor', e.target.value)}
              className="w-8 h-8 border rounded cursor-pointer"
              title="Couleur du texte"
            />
            <input
              type="color"
              onChange={(e) => formatText('hiliteColor', e.target.value)}
              className="w-8 h-8 border rounded cursor-pointer ml-1"
              title="Couleur de fond"
            />
          </div>

          {/* Alignement */}
          <div className="flex items-center border-r pr-2 mr-2">
            <button
              onClick={() => formatText('justifyLeft')}
              className="p-2 hover:bg-gray-100 rounded transition-colors text-sm"
              title="Aligner à gauche"
            >
              ⬅
            </button>
            <button
              onClick={() => formatText('justifyCenter')}
              className="p-2 hover:bg-gray-100 rounded transition-colors text-sm"
              title="Centrer"
            >
              ↔
            </button>
            <button
              onClick={() => formatText('justifyRight')}
              className="p-2 hover:bg-gray-100 rounded transition-colors text-sm"
              title="Aligner à droite"
            >
              ➡
            </button>
          </div>

          {/* Listes */}
          <div className="flex items-center border-r pr-2 mr-2">
            <button
              onClick={() => formatText('insertUnorderedList')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Liste à puces"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('insertOrderedList')}
              className="p-2 hover:bg-gray-100 rounded transition-colors text-sm"
              title="Liste numérotée"
            >
              1.
            </button>
          </div>

          {/* Lien */}
          <button
            onClick={() => {
              const url = prompt('URL du lien:');
              if (url) formatText('createLink', url);
            }}
            className="p-2 hover:bg-gray-100 rounded transition-colors text-sm"
            title="Insérer un lien"
          >
            🔗
          </button>

          {/* Actions */}
          <button
            onClick={() => formatText('undo')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Annuler"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Templates rapides */}
        <div className="flex flex-wrap gap-2 mb-4">
          {templates.map((template, index) => (
            <button
              key={index}
              onClick={() => insertTemplate(template.html)}
              className="flex items-center gap-2 px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded-md text-sm transition-colors"
            >
              <template.icon className="w-4 h-4" />
              {template.name}
            </button>
          ))}
        </div>

        {/* Options avancées */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          <Settings className="w-4 h-4" />
          Options avancées
          {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Taille de police</label>
                <select
                  onChange={(e) => formatText('fontSize', e.target.value)}
                  className="w-full text-sm border rounded px-2 py-1"
                  defaultValue="3"
                >
                  <option value="1">Très petit</option>
                  <option value="2">Petit</option>
                  <option value="3">Normal</option>
                  <option value="4">Grand</option>
                  <option value="5">Très grand</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Police</label>
                <select
                  onChange={(e) => formatText('fontName', e.target.value)}
                  className="w-full text-sm border rounded px-2 py-1"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zone d'édition */}
      {showHTMLMode ? (
        /* Mode HTML */
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={block.data.content || ''}
            onChange={(e) => onUpdate({ data: { ...block.data, content: e.target.value } })}
            className="w-full p-4 border-2 border-gray-200 rounded-lg resize-none h-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="<p>Saisissez votre HTML ici...</p>"
          />
          <div className="absolute bottom-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
            Mode HTML
          </div>
        </div>
      ) : (
        /* Mode Visuel */
        <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-500 transition-colors">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={updateContentFromVisualEditor}
            dangerouslySetInnerHTML={{ __html: block.data.content || '<p>Commencez à écrire votre contenu...</p>' }}
            className="min-h-[300px] p-6 focus:outline-none prose max-w-none"
            style={{ lineHeight: '1.7' }}
          />
          <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            Mode Visuel
          </div>
        </div>
      )}

      {/* Aperçu en temps réel (uniquement en mode HTML) */}
      {showHTMLMode && (
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Aperçu</span>
            <span className="text-xs text-gray-500">Rendu en temps réel</span>
          </div>
          <div 
            className="prose max-w-none min-h-[60px] p-3 bg-white rounded border"
            dangerouslySetInnerHTML={{ __html: block.data.content || '<p class="text-gray-400">Votre texte apparaîtra ici...</p>' }}
          />
        </div>
      )}

      {/* Statistiques du contenu */}
      <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <span>{wordCount} mots</span>
        <span>{readingTime} min de lecture</span>
        <span>{stripHTML(block.data.content || '').length} caractères</span>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Sauvegarde automatique</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Guide rapide */}
      <details className="text-sm text-gray-600 bg-blue-50 rounded-lg">
        <summary className="cursor-pointer p-3 font-medium hover:text-blue-700 transition-colors">
          💡 Conseils d'utilisation
        </summary>
        <div className="px-3 pb-3 space-y-2">
          <p>• Utilisez <kbd className="bg-gray-200 px-1 rounded">Ctrl+B/I/U</kbd> pour le formatage rapide</p>
          <p>• Les templates vous font gagner du temps pour les éléments récurrents</p>
          <p>• L'aperçu en temps réel montre le rendu final</p>
          <p>• La sauvegarde est automatique à chaque modification</p>
          <p>• Utilisez le mode HTML pour un contrôle avancé</p>
        </div>
      </details>
    </div>
  );
};