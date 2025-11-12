import { useFontSize } from '../contexts/FontSizeContext';
import { Type, Plus, Minus } from 'lucide-react';

export default function FontSizeControl() {
  const { fontSize, setFontSize } = useFontSize();

  const sizes = [
    { value: 'small' as const, label: 'Pequeno' },
    { value: 'normal' as const, label: 'Normal' },
    { value: 'large' as const, label: 'Grande' },
    { value: 'xlarge' as const, label: 'Muito Grande' }
  ];

  const currentIndex = sizes.findIndex(s => s.value === fontSize);

  const increaseFontSize = () => {
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1].value);
    }
  };

  const decreaseFontSize = () => {
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1].value);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
      <Type size={16} className="text-gray-600 flex-shrink-0" />
      <div className="flex items-center gap-1">
        <button
          onClick={decreaseFontSize}
          disabled={currentIndex === 0}
          className={`
            p-1.5 rounded transition-colors
            ${currentIndex === 0 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
            }
          `}
          title="Diminuir fonte"
          aria-label="Diminuir tamanho da fonte"
        >
          <Minus size={14} />
        </button>
        
        <span className="px-2 text-xs font-medium text-gray-600 min-w-[80px] text-center">
          {sizes[currentIndex].label}
        </span>
        
        <button
          onClick={increaseFontSize}
          disabled={currentIndex === sizes.length - 1}
          className={`
            p-1.5 rounded transition-colors
            ${currentIndex === sizes.length - 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
            }
          `}
          title="Aumentar fonte"
          aria-label="Aumentar tamanho da fonte"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

