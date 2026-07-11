import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  currentBranch: string | null;
}

const initialState: UiState = {
  sidebarOpen: true,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  currentBranch: localStorage.getItem('currentBranch') || null,
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
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
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
  },
});

export const { toggleSidebar, setSidebarOpen, setTheme, setCurrentBranch } = uiSlice.actions;
export default uiSlice.reducer;
