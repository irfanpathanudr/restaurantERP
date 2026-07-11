import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setTheme,
  setThemeColor,
  selectTheme,
  selectThemeColor,
  selectActualTheme,
  ThemeMode,
  ThemeColor,
} from '@/store/slices/uiSlice';
import { Sun, Moon, Monitor, Check, Palette } from 'lucide-react';
import { cn } from '@/utils/cn';

export const ThemeController: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const themeColor = useSelector(selectThemeColor);
  const actualTheme = useSelector(selectActualTheme);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const themes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  const colors: { value: ThemeColor; label: string; color: string }[] = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'pink', label: 'Pink', color: 'bg-pink-500' },
  ];

  const handleThemeChange = (newTheme: ThemeMode) => {
    dispatch(setTheme(newTheme));
  };

  const handleColorChange = (color: ThemeColor) => {
    dispatch(setThemeColor(color));
    setShowColorPicker(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Theme Mode Selector */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {themes.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => handleThemeChange(value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors',
              theme === value
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
            title={label}
          >
            {icon}
            <span className="text-sm font-medium hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Color Picker */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Theme Color"
        >
          <Palette className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>

        {showColorPicker && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowColorPicker(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-50">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Theme Color
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {colors.map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => handleColorChange(value)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                      themeColor === value
                        ? 'border-current shadow-sm'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-full', color)} />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {label}
                    </span>
                    {themeColor === value && (
                      <div className="absolute top-1 right-1">
                        <Check className="h-4 w-4 text-current" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
