'use client';

import { useState } from 'react';
import { Formation, Module, Chapter } from '@/types/formation.types';

interface FormationBuilderProps {
  formation: Formation;
  onChange: (formation: Formation) => void;
}

export default function FormationBuilder({ formation, onChange }: FormationBuilderProps) {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  const updateModule = (
    index: number,
    field: keyof Pick<Module, 'titre' | 'description'>,
    value: string,
  ) => {
    const modules = [...formation.modules];
    modules[index] = { ...modules[index], [field]: value };
    onChange({ ...formation, modules });
  };

  const addModule = () => {
    const newModule: Module = {
      id: Date.now(),
      titre: 'Nouveau module',
      description: '',
      ordre: formation.modules.length,
      chapitres: [],
    };
    onChange({ ...formation, modules: [...formation.modules, newModule] });
    setSelectedModule(formation.modules.length);
    setSelectedChapter(null);
  };

  const removeModule = (index: number) => {
    const modules = formation.modules.filter((_, i) => i !== index);
    onChange({ ...formation, modules });
    setSelectedModule(null);
    setSelectedChapter(null);
  };

  const updateChapter = (
    moduleIndex: number,
    chapterIndex: number,
    field: keyof Pick<Chapter, 'titre' | 'description'>,
    value: string,
  ) => {
    const modules = [...formation.modules];
    const chapters = [...modules[moduleIndex].chapitres];
    chapters[chapterIndex] = { ...chapters[chapterIndex], [field]: value };
    modules[moduleIndex] = { ...modules[moduleIndex], chapitres: chapters };
    onChange({ ...formation, modules });
  };

  const addChapter = (moduleIndex: number) => {
    const newChapter: Chapter = {
      id: Date.now(),
      titre: 'Nouveau chapitre',
      description: '',
      ordre: formation.modules[moduleIndex].chapitres.length,
      contenu: [],
    };
    const modules = [...formation.modules];
    modules[moduleIndex] = {
      ...modules[moduleIndex],
      chapitres: [...modules[moduleIndex].chapitres, newChapter],
    };
    onChange({ ...formation, modules });
    setSelectedModule(moduleIndex);
    setSelectedChapter(formation.modules[moduleIndex].chapitres.length);
  };

  const removeChapter = (moduleIndex: number, chapterIndex: number) => {
    const modules = [...formation.modules];
    modules[moduleIndex] = {
      ...modules[moduleIndex],
      chapitres: modules[moduleIndex].chapitres.filter((_, i) => i !== chapterIndex),
    };
    onChange({ ...formation, modules });
    setSelectedChapter(null);
  };

  const currentModule =
    selectedModule !== null ? formation.modules[selectedModule] : null;
  const currentChapter =
    currentModule && selectedChapter !== null
      ? currentModule.chapitres[selectedChapter]
      : null;

  return (
    <div className="flex">
      <div className="w-1/4 pr-4 border-r">
        {formation.modules.map((module, mIndex) => (
          <div
            key={module.id}
            className={`p-2 mb-1 rounded cursor-pointer ${
              selectedModule === mIndex ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            onClick={() => {
              setSelectedModule(mIndex);
              setSelectedChapter(null);
            }}
          >
            <div className="font-medium text-sm">
              {module.titre || `Module ${mIndex + 1}`}
            </div>
            {selectedModule === mIndex && (
              <div className="mt-2 ml-2 space-y-1">
                {module.chapitres.map((chap, cIndex) => (
                  <div
                    key={chap.id}
                    className={`p-1 text-xs rounded cursor-pointer ${
                      selectedChapter === cIndex
                        ? 'bg-gray-300'
                        : 'hover:bg-gray-200'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChapter(cIndex);
                    }}
                  >
                    {chap.titre || `Chapitre ${cIndex + 1}`}
                  </div>
                ))}
                <button
                  className="text-xs text-crm-purple mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    addChapter(mIndex);
                  }}
                >
                  + Ajouter un chapitre
                </button>
              </div>
            )}
          </div>
        ))}
        <button onClick={addModule} className="mt-2 text-sm text-crm-purple">
          + Ajouter un module
        </button>
      </div>

      <div className="flex-1 pl-4">
        {currentModule && !currentChapter && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Module</h3>
              <button
                className="text-red-600 text-sm"
                onClick={() => removeModule(selectedModule!)}
              >
                Supprimer le module
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <input
                type="text"
                value={currentModule.titre}
                onChange={(e) =>
                  updateModule(selectedModule!, 'titre', e.target.value)
                }
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={currentModule.description}
                onChange={(e) =>
                  updateModule(selectedModule!, 'description', e.target.value)
                }
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        )}

        {currentModule && currentChapter && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Chapitre</h3>
              <button
                className="text-red-600 text-sm"
                onClick={() =>
                  removeChapter(selectedModule!, selectedChapter!)
                }
              >
                Supprimer le chapitre
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <input
                type="text"
                value={currentChapter.titre}
                onChange={(e) =>
                  updateChapter(
                    selectedModule!,
                    selectedChapter!,
                    'titre',
                    e.target.value
                  )
                }
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={currentChapter.description}
                onChange={(e) =>
                  updateChapter(
                    selectedModule!,
                    selectedChapter!,
                    'description',
                    e.target.value
                  )
                }
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        )}

        {!currentModule && (
          <p className="text-gray-500">
            Sélectionnez un module pour commencer.
          </p>
        )}
      </div>
    </div>
  );
}
