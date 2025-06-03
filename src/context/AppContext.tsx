import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, ChatMessage, Product } from '../types';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'TOGGLE_COMPARE_MODE' }
  | { type: 'SET_SELECTED_PRODUCT'; payload: Product | undefined }
  | { type: 'TOGGLE_PRODUCT_DETAIL' }
  | { type: 'RESET_CHAT' };

const initialState: AppState = {
  currentQuery: '',
  isLoading: false,
  messages: [],
  currentProducts: [],
  compareMode: false,
  selectedProduct: undefined,
  showProductDetail: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_QUERY':
      return { ...state, currentQuery: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_PRODUCTS':
      return { ...state, currentProducts: action.payload };
    case 'TOGGLE_COMPARE_MODE':
      return { ...state, compareMode: !state.compareMode };
    case 'SET_SELECTED_PRODUCT':
      return { ...state, selectedProduct: action.payload };
    case 'TOGGLE_PRODUCT_DETAIL':
      return { ...state, showProductDetail: !state.showProductDetail };
    case 'RESET_CHAT':
      return { 
        ...initialState, 
        messages: [], 
        currentProducts: [], 
        compareMode: false,
        selectedProduct: undefined,
        showProductDetail: false 
      };
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext; 