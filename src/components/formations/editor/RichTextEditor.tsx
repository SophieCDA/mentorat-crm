import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Link, Grid, Palette } from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";

// Composant RichTextEditor corrigé
export const RichTextEditor = ({ 
    content, 
    onChange, 
    placeholder = "Commencez à écrire..." 
  }: { 
    content: string; 
    onChange: (content: string) => void;
    placeholder?: string;
  }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const isInternalChange = useRef(false);
    const lastContent = useRef(content);
  
    // Initialiser le contenu une seule fois au montage
    useEffect(() => {
      if (editorRef.current && content && !editorRef.current.innerHTML) {
        editorRef.current.innerHTML = content;
      }
    }, []);
  
    // Mettre à jour le contenu seulement si il a changé de l'extérieur
    useEffect(() => {
      if (editorRef.current && content !== lastContent.current && !isInternalChange.current) {
        // Sauvegarder la position du curseur
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        const startOffset = range?.startOffset || 0;
        const endOffset = range?.endOffset || 0;
        const startContainer = range?.startContainer;
        const endContainer = range?.endContainer;
  
        // Mettre à jour le contenu
        editorRef.current.innerHTML = content;
        lastContent.current = content;
  
        // Restaurer la position du curseur si possible
        if (selection && range && startContainer && editorRef.current.contains(startContainer.parentElement)) {
          requestAnimationFrame(() => {
            try {
              const newRange = document.createRange();
              newRange.setStart(startContainer, Math.min(startOffset, startContainer.textContent?.length || 0));
              newRange.setEnd(endContainer || startContainer, Math.min(endOffset, (endContainer || startContainer).textContent?.length || 0));
              selection.removeAllRanges();
              selection.addRange(newRange);
            } catch (e) {
              // Si la restauration échoue, placer le curseur à la fin
              const newRange = document.createRange();
              newRange.selectNodeContents(editorRef.current!);
              newRange.collapse(false);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          });
        }
      }
      isInternalChange.current = false;
    }, [content]);
  
    const execCommand = useCallback((command: string, value?: string) => {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        isInternalChange.current = true;
        const newContent = editorRef.current.innerHTML;
        lastContent.current = newContent;
        onChange(newContent);
      }
    }, [onChange]);
  
    const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
      isInternalChange.current = true;
      const newContent = e.currentTarget.innerHTML;
      lastContent.current = newContent;
      onChange(newContent);
    }, [onChange]);
  
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    }, []);
  
    const handleTextSelection = useCallback(() => {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        setSelectedText(selection.toString());
        setIsFormatMenuOpen(true);
      } else {
        setIsFormatMenuOpen(false);
      }
    }, []);
  
    const insertTable = useCallback(() => {
      const rows = prompt('Nombre de lignes:', '3');
      const cols = prompt('Nombre de colonnes:', '3');
      if (rows && cols) {
        let table = '<table class="w-full border-collapse border border-gray-300"><tbody>';
        for (let i = 0; i < parseInt(rows); i++) {
          table += '<tr>';
          for (let j = 0; j < parseInt(cols); j++) {
            table += '<td class="border border-gray-300 p-2">Cellule</td>';
          }
          table += '</tr>';
        }
        table += '</tbody></table>';
        execCommand('insertHTML', table);
      }
    }, [execCommand]);
  
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      // Gérer les raccourcis clavier
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            execCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            execCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            execCommand('underline');
            break;
        }
      }
    }, [execCommand]);
  
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center space-x-2 flex-wrap">
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()} // Empêcher la perte du focus
              onClick={() => execCommand('bold')}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Gras (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCommand('italic')}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Italique (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCommand('underline')}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Souligné (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-6 bg-gray-300" />
          
          <div className="flex items-center space-x-1">
            <select
              onMouseDown={(e) => e.preventDefault()}
              onChange={(e) => {
                execCommand('formatBlock', e.target.value);
                e.target.value = 'p'; // Reset to default
              }}
              className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100"
              defaultValue="p"
            >
              <option value="p">Paragraphe</option>
              <option value="h1">Titre 1</option>
              <option value="h2">Titre 2</option>
              <option value="h3">Titre 3</option>
              <option value="h4">Titre 4</option>
            </select>
          </div>
          
          <div className="w-px h-6 bg-gray-300" />
          
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCommand('justifyLeft')}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Aligner à gauche"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCommand('justifyCenter')}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Centrer"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCommand('justifyRight')}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Aligner à droite"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-6 bg-gray-300" />
          
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCommand('insertUnorderedList')}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Liste à puces"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCommand('insertOrderedList')}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Liste numérotée"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-6 bg-gray-300" />
          
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const url = prompt('URL du lien:');
              if (url) execCommand('createLink', url);
            }}
            className="p-2 rounded hover:bg-gray-200 transition-colors"
            title="Insérer un lien"
          >
            <Link className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={insertTable}
            className="p-2 rounded hover:bg-gray-200 transition-colors"
            title="Insérer un tableau"
          >
            <Grid className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const color = prompt('Code couleur hexadécimal:', '#000000');
              if (color) execCommand('foreColor', color);
            }}
            className="p-2 rounded hover:bg-gray-200 transition-colors"
            title="Couleur du texte"
          >
            <Palette className="w-4 h-4" />
          </button>
        </div>
        
        <div
          ref={editorRef}
          contentEditable
          className="p-4 min-h-[200px] focus:outline-none prose prose-sm max-w-none"
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onMouseUp={handleTextSelection}
          onKeyUp={handleTextSelection}
          data-placeholder={placeholder}
          suppressContentEditableWarning={true}
          style={{
            minHeight: '200px'
          }}
        />
        
        <style jsx>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
          [contenteditable] {
            outline: none;
          }
          [contenteditable]:focus {
            outline: none;
          }
        `}</style>
      </div>
    );
  };