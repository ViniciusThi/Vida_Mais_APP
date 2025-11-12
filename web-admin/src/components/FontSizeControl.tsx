import { useFontSize } from '../contexts/FontSizeContext';
import { Type } from 'lucide-react';

export default function FontSizeControl() {
  const { fontSize, setFontSize } = useFontSize();

  const sizes = [
    { value: 'small' as const, label: 'Pequeno', size: 'A' },
    { value: 'normal' as const, label: 'Normal', size: 'A' },
    { value: 'large' as const, label: 'Grande', size: 'A' },
    { value: 'xlarge' as const, label: 'Muito Grande', size: 'A' }
  ];

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
      <Type size={16} className="text-gray-600" />
      <div className="flex gap-1">
        {sizes.map((size, index) => (
          <button
            key={size.value}
            onClick={() => setFontSize(size.value)}
            className={`
              px-2 py-1 rounded transition-colors
              ${fontSize === size.value 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            title={size.label}
            style={{
              fontSize: `${0.75 + (index * 0.125)}rem`,
              fontWeight: fontSize === size.value ? 'bold' : 'normal'
            }}
          >
            {size.size}
          </button>
        ))}
      </div>
    </div>
  );
}

