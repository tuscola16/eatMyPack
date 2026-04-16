import { useStore } from '../store/useStore';
import { AuthUser } from '../types/auth';

// Reset store between tests
beforeEach(() => {
  useStore.setState({
    user: null,
    savedPlans: [],
    pinnedFoodIds: [],
    rejectedFoodIds: [],
    currentPlan: null,
    raceConfig: null,
  });
});

const mockUser: AuthUser = {
  uid: 'test-uid-123',
  email: 'runner@example.com',
  displayName: 'Trail Runner',
  photoURL: null,
};

describe('Auth store slice', () => {
  test('user is null by default (guest mode)', () => {
    expect(useStore.getState().user).toBeNull();
  });

  test('setUser sets the authenticated user', () => {
    useStore.getState().setUser(mockUser);
    expect(useStore.getState().user).toEqual(mockUser);
  });

  test('setUser(null) clears the user (sign out)', () => {
    useStore.getState().setUser(mockUser);
    expect(useStore.getState().user).not.toBeNull();

    useStore.getState().setUser(null);
    expect(useStore.getState().user).toBeNull();
  });

  test('auth state is independent of other state slices', () => {
    useStore.getState().setUser(mockUser);
    useStore.getState().togglePinnedFood('food-1');

    expect(useStore.getState().user).toEqual(mockUser);
    expect(useStore.getState().pinnedFoodIds).toEqual(['food-1']);

    useStore.getState().setUser(null);
    // Other state should be unaffected
    expect(useStore.getState().pinnedFoodIds).toEqual(['food-1']);
  });
});

describe('subscribeWithSelector middleware', () => {
  test('subscribe can watch a specific selector', () => {
    const changes: (AuthUser | null)[] = [];

    const unsub = useStore.subscribe(
      (state) => state.user,
      (user) => {
        changes.push(user);
      }
    );

    useStore.getState().setUser(mockUser);
    useStore.getState().setUser(null);

    expect(changes).toEqual([mockUser, null]);
    unsub();
  });

  test('subscribe does not fire for unrelated state changes', () => {
    const changes: (AuthUser | null)[] = [];

    const unsub = useStore.subscribe(
      (state) => state.user,
      (user) => {
        changes.push(user);
      }
    );

    // Trigger unrelated state change
    useStore.getState().togglePinnedFood('food-1');
    useStore.getState().rejectFood('food-2');

    expect(changes).toEqual([]);
    unsub();
  });
});
