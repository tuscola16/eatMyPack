/**
 * Tests for cloudSync service.
 * Mocks Firestore to verify correct document paths and data shapes.
 */

import { uploadPlan, deletePlanRemote, fetchPlans, uploadPreferences, fetchPreferences } from '../services/cloudSync';
import type { PackPlan } from '../types/plan';

// Mock firebase/firestore
const mockSetDoc = jest.fn().mockResolvedValue(undefined);
const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockDoc = jest.fn((...args: any[]) => args.join('/'));
const mockCollection = jest.fn((...args: any[]) => args.join('/'));
const mockServerTimestamp = jest.fn(() => 'SERVER_TIMESTAMP');

jest.mock('firebase/firestore', () => ({
  doc: (...args: any[]) => mockDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  collection: (...args: any[]) => mockCollection(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

jest.mock('../services/firebase', () => ({
  db: 'MOCK_DB',
}));

const TEST_UID = 'user-abc-123';

const mockPlan: PackPlan = {
  id: 'plan-001',
  name: 'Test 100K Plan',
  created_at: '2026-04-04T00:00:00.000Z',
  race_config: {
    distance: '100K',
    expected_duration_hours: 14,
    conditions: 'moderate',
  },
  phases: [],
  total_calories: 5000,
  total_weight_g: 1200,
  total_volume_ml: 0,
  total_items: 15,
  rejected_food_ids: [],
  pinned_food_ids: [],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('uploadPlan', () => {
  test('writes plan to correct Firestore path', async () => {
    await uploadPlan(TEST_UID, mockPlan);

    expect(mockDoc).toHaveBeenCalledWith('MOCK_DB', 'users', TEST_UID, 'savedPlans', 'plan-001');
    expect(mockSetDoc).toHaveBeenCalledTimes(1);

    const writtenData = mockSetDoc.mock.calls[0][1];
    expect(writtenData.id).toBe('plan-001');
    expect(writtenData.total_calories).toBe(5000);
    expect(writtenData.updatedAt).toBe('SERVER_TIMESTAMP');
  });

  test('preserves all plan fields', async () => {
    await uploadPlan(TEST_UID, mockPlan);

    const writtenData = mockSetDoc.mock.calls[0][1];
    expect(writtenData.race_config.distance).toBe('100K');
    expect(writtenData.race_config.conditions).toBe('moderate');
    expect(writtenData.phases).toEqual([]);
    expect(writtenData.rejected_food_ids).toEqual([]);
  });
});

describe('deletePlanRemote', () => {
  test('deletes the correct document', async () => {
    await deletePlanRemote(TEST_UID, 'plan-001');

    expect(mockDoc).toHaveBeenCalledWith('MOCK_DB', 'users', TEST_UID, 'savedPlans', 'plan-001');
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
  });
});

describe('fetchPlans', () => {
  test('returns array of plans from Firestore', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        { data: () => ({ ...mockPlan, updatedAt: { seconds: 123 } }) },
        { data: () => ({ ...mockPlan, id: 'plan-002', updatedAt: { seconds: 456 } }) },
      ],
    });

    const plans = await fetchPlans(TEST_UID);

    expect(mockCollection).toHaveBeenCalledWith('MOCK_DB', 'users', TEST_UID, 'savedPlans');
    expect(plans).toHaveLength(2);
    expect(plans[0].id).toBe('plan-001');
    expect(plans[1].id).toBe('plan-002');
  });

  test('strips updatedAt from returned plans', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [{ data: () => ({ ...mockPlan, updatedAt: { seconds: 123 } }) }],
    });

    const plans = await fetchPlans(TEST_UID);
    expect((plans[0] as any).updatedAt).toBeUndefined();
  });

  test('returns empty array when no plans exist', async () => {
    mockGetDocs.mockResolvedValueOnce({ docs: [] });

    const plans = await fetchPlans(TEST_UID);
    expect(plans).toEqual([]);
  });
});

describe('uploadPreferences', () => {
  test('writes pinned food IDs with merge', async () => {
    await uploadPreferences(TEST_UID, ['food-1', 'food-2']);

    expect(mockDoc).toHaveBeenCalledWith('MOCK_DB', 'users', TEST_UID, 'preferences');
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.anything(),
      { pinnedFoodIds: ['food-1', 'food-2'], updatedAt: 'SERVER_TIMESTAMP' },
      { merge: true }
    );
  });

  test('handles empty pinned array', async () => {
    await uploadPreferences(TEST_UID, []);

    const writtenData = mockSetDoc.mock.calls[0][1];
    expect(writtenData.pinnedFoodIds).toEqual([]);
  });
});

describe('fetchPreferences', () => {
  test('returns preferences when document exists', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ pinnedFoodIds: ['food-1', 'food-3'], updatedAt: {} }),
    });

    const prefs = await fetchPreferences(TEST_UID);

    expect(mockDoc).toHaveBeenCalledWith('MOCK_DB', 'users', TEST_UID, 'preferences');
    expect(prefs).toEqual({ pinnedFoodIds: ['food-1', 'food-3'] });
  });

  test('returns null when no preferences document exists', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => false,
    });

    const prefs = await fetchPreferences(TEST_UID);
    expect(prefs).toBeNull();
  });

  test('defaults pinnedFoodIds to empty array if missing', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ updatedAt: {} }),
    });

    const prefs = await fetchPreferences(TEST_UID);
    expect(prefs).toEqual({ pinnedFoodIds: [] });
  });
});
