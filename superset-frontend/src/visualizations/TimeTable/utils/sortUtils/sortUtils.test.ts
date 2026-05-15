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
import { sortNumberWithMixedTypes } from './sortUtils';
import type { ColumnConfig } from '../../types';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('sortNumberWithMixedTypes', () => {
  const createMockRow = (
    value: any,
    columnOverrides: Partial<ColumnConfig> = {},
  ) => ({
    values: {
      testColumn: {
        props: {
          valueField: 'metric',
          column: {
            key: 'testColumn',
            colType: 'time',
            bounds: undefined,
            ...columnOverrides,
          },
          reversedEntries: [{ metric: value }],
        },
      },
    },
  });

  test('should sort numbers in ascending order', () => {
    const rowA = createMockRow(10);
    const rowB = createMockRow(20);

    const result = sortNumberWithMixedTypes(rowA, rowB, 'testColumn');

    expect(result).toBeLessThan(0); // rowA should come before rowB
  });

  test('should sort numbers in descending order', () => {
    const rowA = createMockRow(10);
    const rowB = createMockRow(20);

    const result = sortNumberWithMixedTypes(rowA, rowB, 'testColumn');

    expect(result).toBeLessThan(0);
  });

  test('should handle equal values', () => {
    const rowA = createMockRow(15);
    const rowB = createMockRow(15);

    const result = sortNumberWithMixedTypes(rowA, rowB, 'testColumn');

    expect(result).toBe(0);
  });

  test('should handle null values', () => {
    const rowA = createMockRow(null);
    const rowB = createMockRow(10);

    const result = sortNumberWithMixedTypes(rowA, rowB, 'testColumn');
    expect(typeof result).toBe('number');
  });

  test('should handle string numbers', () => {
    const rowA = createMockRow('10', { colType: undefined });
    const rowB = createMockRow('20', { colType: undefined });

    const result = sortNumberWithMixedTypes(rowA, rowB, 'testColumn');

    expect(typeof result).toBe('number');
    expect(result).toBeLessThan(0);
  });

  test('should handle mixed types', () => {
    const rowA = createMockRow(10);
    const rowB = createMockRow('20');

    const result = sortNumberWithMixedTypes(rowA, rowB, 'testColumn');

    expect(typeof result).toBe('number');
  });

  test('should handle negative numbers', () => {
    const rowA = createMockRow(-10);
    const rowB = createMockRow(5);

    const result = sortNumberWithMixedTypes(rowA, rowB, 'testColumn');

    expect(result).toBeLessThan(0);
  });

  test('should handle zero values', () => {
    const rowA = createMockRow(0);
    const rowB = createMockRow(10);

    const result = sortNumberWithMixedTypes(rowA, rowB, 'testColumn');

    expect(result).toBeLessThan(0);
  });

  test('should sort ValueCell-like props numerically', () => {
    const createValueCellRow = (metricValue: number | null) => ({
      values: {
        testColumn: {
          props: {
            valueField: 'metric',
            column: {
              key: 'testColumn',
              colType: 'time',
              bounds: undefined,
            },
            reversedEntries: [{ metric: metricValue }],
          },
        },
      },
    });

    const smaller = createValueCellRow(1);
    const larger = createValueCellRow(5);

    const result = sortNumberWithMixedTypes(smaller, larger, 'testColumn');

    expect(result).toBeLessThan(0);
  });

  test('should sort by the specified column, not always the first column', () => {
    const createMultiColumnRow = (
      metricAValue: number,
      metricBValue: number,
    ) => ({
      values: {
        columnA: {
          props: {
            valueField: 'metricA',
            column: {
              key: 'columnA',
              colType: 'time',
              bounds: undefined,
            },
            reversedEntries: [{ metricA: metricAValue }],
          },
        },
        columnB: {
          props: {
            valueField: 'metricB',
            column: {
              key: 'columnB',
              colType: 'time',
              bounds: undefined,
            },
            reversedEntries: [{ metricB: metricBValue }],
          },
        },
      },
    });

    // Row 1: metricA=10, metricB=30
    // Row 2: metricA=20, metricB=5
    const row1 = createMultiColumnRow(10, 30);
    const row2 = createMultiColumnRow(20, 5);

    // Sorting by columnA: row1(10) < row2(20) => negative
    const resultA = sortNumberWithMixedTypes(row1, row2, 'columnA');
    expect(resultA).toBeLessThan(0);

    // Sorting by columnB: row1(30) > row2(5) => positive
    const resultB = sortNumberWithMixedTypes(row1, row2, 'columnB');
    expect(resultB).toBeGreaterThan(0);
  });

  test('should sort Sparkline cells using entries prop', () => {
    const createSparklineRow = (metricValue: number) => ({
      values: {
        sparkColumn: {
          props: {
            valueField: 'metric',
            column: {
              key: 'sparkColumn',
              colType: 'spark',
              bounds: undefined,
            },
            entries: [{ metric: metricValue }],
          },
        },
      },
    });

    const smaller = createSparklineRow(3);
    const larger = createSparklineRow(9);

    const result = sortNumberWithMixedTypes(smaller, larger, 'sparkColumn');
    expect(result).toBeLessThan(0);
  });

  test('should return 0 when cell props are missing', () => {
    const rowA = { values: { col: undefined } };
    const rowB = { values: { col: undefined } };

    const result = sortNumberWithMixedTypes(rowA, rowB, 'col');
    expect(result).toBe(0);
  });
});
