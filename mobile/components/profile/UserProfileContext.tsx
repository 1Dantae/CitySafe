import React, { createContext, useContext, useReducer } from 'react';

interface User {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
}

interface Report {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  incidentType: string;
  witnesses: string;
  anonymous: boolean;
  name?: string;
  phone?: string;
  email?: string;
  mediaUri?: string | null; // For photo/video
  status: 'pending' | 'in-progress' | 'resolved';
  media_url?: string;
}

interface UserProfileState {
  user: User | null;
  reports: Report[];
  loading: boolean;
}

type UserProfileAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'ADD_REPORT'; payload: Report }
  | { type: 'SET_REPORTS'; payload: Report[] }
  | { type: 'UPDATE_REPORT'; payload: Report }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_USER' };

const initialState: UserProfileState = {
  user: null,
  reports: [],
  loading: false,
};

const UserProfileReducer = (state: UserProfileState, action: UserProfileAction): UserProfileState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    case 'ADD_REPORT':
      return { ...state, reports: [...state.reports, action.payload] };
    case 'SET_REPORTS':
      return { ...state, reports: action.payload };
    case 'UPDATE_REPORT':
      return {
        ...state,
        reports: state.reports.map(report =>
          report.id === action.payload.id ? action.payload : report
        ),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'CLEAR_USER':
      return { ...initialState };
    default:
      return state;
  }
};

interface UserProfileContextType extends UserProfileState {
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;
  addReport: (report: Report) => void;
  fetchMyReports: (userId?: string) => Promise<void>;
  updateReport: (report: Report) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

interface UserProfileProviderProps {
  children: React.ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(UserProfileReducer, initialState);

  const setUser = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    if (state.user) {
      dispatch({ type: 'SET_USER', payload: { ...state.user, ...userData } });
    }
  };

  const addReport = (report: Report) => {
    dispatch({ type: 'ADD_REPORT', payload: report });
  };

  const fetchMyReports = async (userId?: string) => {
    setLoading(true);
    try {
      // lazy import to avoid circular deps
      const api = await import('../../../mobile/services/api');
      const reports = await api.getReports(0, 100, userId);
      // map backend shape to local Report shape
      const mapped = (reports || []).map((r: any) => ({
        id: r.id || r._id,
        title: r.incidentType || 'Report',
        description: r.description || '',
        location: typeof r.location === 'string' ? r.location : (r.location?.coordinates ? `${r.location.coordinates[1]}, ${r.location.coordinates[0]}` : ''),
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
        status: 'pending' as const,
      }));
      dispatch({ type: 'SET_REPORTS', payload: mapped });
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  const updateReport = (report: Report) => {
    dispatch({ type: 'UPDATE_REPORT', payload: report });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const clearUser = () => {
    dispatch({ type: 'CLEAR_USER' });
  };

  return (
    <UserProfileContext.Provider
      value={{
        ...state,
        setUser,
        updateUser,
        addReport,
        fetchMyReports,
        updateReport,
        setLoading,
        clearUser,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};