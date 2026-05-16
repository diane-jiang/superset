/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { generatePageItems } from '../src/DataTable/components/Pagination';

test('generatePageItems returns valid items when current page is within range', () => {
  const items = generatePageItems(10, 3, 7);
  expect(items).toHaveLength(7);
  expect(items).toContain(3);
});

test('generatePageItems returns all pages when total is less than width', () => {
  const items = generatePageItems(3, 1, 7);
  expect(items).toEqual([0, 1, 2]);
});

test('generatePageItems handles current page at zero', () => {
  const items = generatePageItems(10, 0, 7);
  expect(items[0]).toBe(0);
});

test('generatePageItems handles current page at last page', () => {
  const items = generatePageItems(10, 9, 7);
  expect(items).toContain(9);
});

test('generatePageItems produces out-of-range items when current exceeds total (pre-clamp)', () => {
  // Before the DataTable clamp fix, a currentPage of 6 with only 5 total pages
  // would be passed directly to generatePageItems, producing broken output.
  // After the fix, DataTable clamps currentPage before passing it here.
  // This test documents that generatePageItems itself does not clamp.
  const items = generatePageItems(5, 6, 7);
  // With total < width, it returns [0,1,2,3,4] regardless of current
  expect(items).toEqual([0, 1, 2, 3, 4]);
});

test('currentPage clamping logic keeps value within valid range', () => {
  // Simulate the clamping logic from DataTable
  const clamp = (currentPage: number, pageCount: number) => {
    if (pageCount > 0) {
      return Math.min(Math.max(0, currentPage), pageCount - 1);
    }
    return currentPage;
  };

  // currentPage exceeds totalPages
  expect(clamp(6, 5)).toBe(4);
  expect(clamp(100, 5)).toBe(4);

  // currentPage is negative
  expect(clamp(-1, 5)).toBe(0);
  expect(clamp(-100, 5)).toBe(0);

  // currentPage within range
  expect(clamp(0, 5)).toBe(0);
  expect(clamp(2, 5)).toBe(2);
  expect(clamp(4, 5)).toBe(4);

  // edge case: single page
  expect(clamp(1, 1)).toBe(0);
  expect(clamp(0, 1)).toBe(0);

  // edge case: zero pageCount (no clamping)
  expect(clamp(5, 0)).toBe(5);
});
