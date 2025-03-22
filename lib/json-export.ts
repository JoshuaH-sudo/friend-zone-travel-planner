import type { Friend } from './types';

// Type for the entire application state
export interface AppState {
  groupName: string;
  friends: Friend[];
}

// Convert dates to strings for JSON serialization
export function serializeState(state: AppState): string {
  // console.log(state);
  // const serializedFriends = state.friends.map((friend) => ({
  //   ...friend,
  //   availableDates: friend.availableDates.map((date) => date.toISOString()),
  // }));

  // const serializedState = {
  //   ...state,
  //   friends: serializedFriends,
  // };

  return JSON.stringify(state, null, 2);
}

// Parse the serialized state back to the AppState format
export function deserializeState(jsonString: string): AppState {
  try {
    const parsedState = JSON.parse(jsonString);

    // Convert date strings back to Date objects
    const deserializedFriends = parsedState.friends.map((friend: any) => ({
      ...friend,
      availableDates: friend.availableDates.map(
        (dateStr: string) => new Date(dateStr)
      ),
    }));

    return {
      groupName: parsedState.groupName || '',
      friends: deserializedFriends,
    };
  } catch (error) {
    throw new Error('Failed to parse state file');
  }
}

// Download state as a JSON file
export function downloadStateFile(state: AppState) {
  const serializedState = serializeState(state);
  const filename = state.groupName
    ? `${state.groupName.replace(/\s+/g, '_')}_planner_state.json`
    : 'friend_planner_state.json';

  const blob = new Blob([serializedState], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Read state from a JSON file
export async function readStateFile(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const state = deserializeState(content);
        resolve(state);
      } catch (error) {
        reject(new Error('Failed to parse state file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
