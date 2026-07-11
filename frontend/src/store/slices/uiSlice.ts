import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink';

interface UiState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: ThemeMode;
  themeColor: ThemeColor;
  actualTheme: 'light' | 'dark';
  currentBranch: string | null;
  loading: boolean;
  pageTitle: string;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const getSavedTheme = (): ThemeMode => {
  const saved = localStorage.getItem('theme');
  return (saved as ThemeMode) || 'system';
};

const getSavedThemeColor = (): ThemeColor => {
  const saved = localStorage.getItem('themeColor');
  return (saved as ThemeColor) || 'blue';
};

const getActualTheme = (theme: ThemeMode): 'light' | 'dark' => {
  return theme === 'system' ? getSystemTheme() : (theme as 'light' | 'dark');
};

const savedTheme = getSavedTheme();

const initialState: UiState = {
  sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  sidebarCollapsed: false,
  theme: savedTheme,
  themeColor: getSavedThemeColor(),
  actualTheme: getActualTheme(savedTheme),
  currentBranch: localStorage.getItem('currentBranch') || null,
  loading: false,
  pageTitle: 'Dashboard',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      
      state.actualTheme = getActualTheme(action.payload);
      
      if (state.actualTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setThemeColor: (state, action: PayloadAction<ThemeColor>) => {
      state.themeColor = action.payload;
      localStorage.setItem('themeColor', action.payload);
      document.documentElement.setAttribute('data-theme-color', action.payload);
    },
    toggleTheme: (state) => {
      const newTheme = state.actualTheme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      state.actualTheme = newTheme;
      localStorage.setItem('theme', newTheme);
      
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    updateSystemTheme: (state) => {
      if (state.theme === 'system') {
        state.actualTheme = getSystemTheme();
        
        if (state.actualTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    setCurrentBranch: (state, action: PayloadAction<string | null>) => {
      state.currentBranch = action.payload;
      if (action.payload) {
        localStorage.setItem('currentBranch', action.payload);
      } else {
        localStorage.removeItem('currentBranch');
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
      document.title = `${action.payload} | Restaurant ERP`;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapse,
  setSidebarCollapsed,
  setTheme,
  setThemeColor,
  toggleTheme,
  updateSystemTheme,
  setCurrentBranch,
  setLoading,
  setPageTitle,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectSidebarOpen = (state: { ui: UiState }) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state: { ui: UiState }) => state.ui.sidebarCollapsed;
export const selectTheme = (state: { ui: UiState }) => state.ui.theme;
export const selectActualTheme = (state: { ui: UiState }) => state.ui.actualTheme;
export const selectThemeColor = (state: { ui: UiState }) => state.ui.themeColor;
export const selectCurrentBranch = (state: { ui: UiState }) => state.ui.currentBranch;
export const selectLoading = (state: { ui: UiState }) => state.ui.loading;
export const selectPageTitle = (state: { ui: UiState }) => state.ui.pageTitle;
