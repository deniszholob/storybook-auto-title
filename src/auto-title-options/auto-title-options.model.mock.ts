// import { faker } from '@faker-js/faker';

import type { AutoTitleOptions } from './auto-title-options.model';

// ===== Simple Mock ====== //
export const MOCK_AutoTitleOptions: AutoTitleOptions = {
  dedupeAdjacent: true,
  flattenTitle: (sourceTitle: string) => sourceTitle,
  segmentTransform: (segment: string) => segment,
  stripPrefixes: [],
};

export const MOCK_AutoTitleOptions_Array: AutoTitleOptions[] = [MOCK_AutoTitleOptions];

// ===== Advanced Mock with https://v9.fakerjs.dev/api/ ====== //
// export function createMock_AutoTitleOptions(): AutoTitleOptions {
//   return {
//     id: faker.string.uuid(),
//   };
// }

// export function createMock_AutoTitleOptions_Array(count: number): AutoTitleOptions[] {
//   return faker.helpers.multiple(createMock_AutoTitleOptions, { count });
// }

// export const MOCK_AutoTitleOptions: AutoTitleOptions = createMock_AutoTitleOptions();
// export const MOCK_AutoTitleOptions_Array: AutoTitleOptions[] = createMock_AutoTitleOptions_Array(5);
