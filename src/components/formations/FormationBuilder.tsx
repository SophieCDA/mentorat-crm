'use client';

import { Formation, Module, Chapter } from '@/types/formation.types';

interface FormationBuilderProps {
  formation: Formation;
  onChange: (formation: Formation) => void;
}

export default function FormationBuilder({ formation, onChange }: FormationBuilderProps) {
  const updateModule = (index: number, field: keyof Module, value: any) => {
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
  };

  const removeModule = (index: number) => {
    const modules = formation.modules.filter((_, i) => i !== index);
    onChange({ ...formation, modules });
  };

  const updateChapter = (
    moduleIndex: number,
    chapterIndex: number,
    field: keyof Chapter,
    value: any
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
  };

  const removeChapter = (moduleIndex: number, chapterIndex: number) => {
    const modules = [...formation.modules];
    modules[moduleIndex] = {
      ...modules[moduleIndex],
      chapitres: modules[moduleIndex].chapitres.filter((_, i) => i !== chapterIndex),
    };
    onChange({ ...formation, modules });
  };

  return (
    <div>
      {formation.modules.map((module, mIndex) => (
        <div key={module.id} className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <input
              type="text"
              value={module.titre}
              onChange={(e) => updateModule(mIndex, 'titre', e.target.value)}
              className="flex-1 mr-2 px-2 py-1 border rounded"
            />
            <button
              onClick={() => removeModule(mIndex)}
              className="text-red-600 text-sm"
            >
              Supprimer
            </button>
          </div>
          <div className="ml-4">
            {module.chapitres.map((chap, cIndex) => (
              <div key={chap.id} className="border rounded p-2 mb-2">
                <div className="flex justify-between items-center mb-1">
                  <input
                    type="text"
                    value={chap.titre}
                    onChange={(e) =>
                      updateChapter(mIndex, cIndex, 'titre', e.target.value)
                    }
                    className="flex-1 mr-2 px-2 py-1 border rounded"
                  />
                  <button
                    onClick={() => removeChapter(mIndex, cIndex)}
                    className="text-red-600 text-xs"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => addChapter(mIndex)}
              className="text-sm text-crm-purple"
            >
              + Ajouter un chapitre
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={addModule}
        className="px-3 py-2 bg-crm-purple text-white rounded"
      >
        Ajouter un module
      </button>
    </div>
  );
}

