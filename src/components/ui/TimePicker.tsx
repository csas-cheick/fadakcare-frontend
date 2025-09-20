import React, { useState, useRef, useEffect } from 'react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  minTime?: string;
  maxTime?: string;
  step?: number; // minutes (par défaut 15)
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "Sélectionner une heure",
  className = "",
  minTime,
  maxTime,
  step = 15
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le sélecteur quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  };

  const generateTimeOptions = () => {
    const times = [];
    const startHour = minTime ? parseInt(minTime.split(':')[0]) : 8;
    const endHour = maxTime ? parseInt(maxTime.split(':')[0]) : 18;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += step) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Vérifier les contraintes min/max
        if (minTime && timeString < minTime) continue;
        if (maxTime && timeString > maxTime) continue;
        
        times.push(timeString);
      }
    }
    
    return times;
  };

  const handleTimeSelect = (time: string) => {
    onChange(time);
    setIsOpen(false);
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={value ? formatDisplayTime(value) : ''}
          placeholder={placeholder}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 
            shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden 
            focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 
            dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800
            cursor-pointer
            ${className}
          `}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto w-full"
        >
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              Heures disponibles
            </div>
            
            {timeOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Aucune heure disponible
              </div>
            ) : (
              <div className="space-y-1 mt-2">
                {timeOptions.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeSelect(time)}
                    className={`
                      w-full text-left px-3 py-2 text-sm rounded-md transition-colors
                      ${value === time 
                        ? 'bg-brand-500 text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                      }
                    `}
                  >
                    {formatDisplayTime(time)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
