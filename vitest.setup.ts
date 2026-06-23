import { vi } from 'vitest';

vi.mock('react-native', () => {
  const RN = {
    StyleSheet: { create: (styles: Record<string, any>) => styles, flatten: (style: any) => style },
    Platform: { OS: 'ios', select: (obj: any) => obj.ios ?? obj.default },
    Dimensions: { get: () => ({ width: 390, height: 844 }) },
    FlatList: ({ children }: any) => children,
    View: ({ children }: any) => children,
    Text: ({ children }: any) => children,
    TextInput: ({ children }: any) => children,
    ScrollView: ({ children }: any) => children,
    TouchableOpacity: ({ children }: any) => children,
    Pressable: ({ children }: any) => children,
    RefreshControl: () => null,
    ActivityIndicator: () => null,
    StatusBar: () => null,
    Modal: ({ children }: any) => children,
  };
  return { default: RN, ...RN };
});

vi.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
  useLocalSearchParams: () => ({}),
  Link: ({ children }: any) => children,
  Redirect: () => null,
}));

vi.mock('expo-status-bar', () => ({ StatusBar: () => null }));

vi.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
  Swipeable: ({ children }: any) => children,
  TouchableOpacity: ({ children }: any) => children,
}));

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  notificationAsync: vi.fn(),
  NotificationFeedbackType: { Success: 'Success', Error: 'Error', Warning: 'Warning' },
}));

vi.mock('react-native-draggable-flatlist', () => ({
  default: ({ children }: any) => children,
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: any) => children,
  useQuery: vi.fn(),
  useMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

vi.mock('zustand', () => {
  const actual = vi.importActual('zustand');
  return actual;
});

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock('expo-sqlite', () => ({
  openDatabaseAsync: vi.fn(),
  SQLiteProvider: ({ children }: any) => children,
  useSQLiteContext: vi.fn(() => ({
    runAsync: vi.fn(),
    getAllAsync: vi.fn(),
    getFirstAsync: vi.fn(),
  })),
}));

vi.mock('../../database', () => ({
  getDatabase: vi.fn(),
}));

vi.mock('../../database/repositories/workout-repository', () => ({
  createWorkoutRepository: vi.fn(() => ({
    getAll: vi.fn(() => Promise.resolve([])),
    getById: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    addExercises: vi.fn(),
    removeExercise: vi.fn(),
    reorderExercises: vi.fn(),
  })),
}));
