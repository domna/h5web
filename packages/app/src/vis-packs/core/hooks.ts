import { getCombinedDomain } from '@h5web/lib';
import type { Dataset, Value } from '@h5web/shared';
import {
  isDefined,
  ScaleType,
  getBounds,
  getValidDomainForScale,
  assertDatasetValue,
  assertNonNullShape,
} from '@h5web/shared';
import type { NdArray } from 'ndarray';
import { useContext, useMemo } from 'react';
import { createMemo } from 'react-use';

import type { DimensionMapping } from '../../dimension-mapper/models';
import { isAxis } from '../../dimension-mapper/utils';
import { ProviderContext } from '../../providers/context';
import { applyMapping, getBaseArray, getSliceSelection } from './utils';

export function usePrefetchValues(
  datasets: (Dataset | undefined)[],
  dimMapping?: DimensionMapping
): void {
  const { valuesStore } = useContext(ProviderContext);
  datasets.filter(isDefined).forEach(({ path }) => {
    valuesStore.prefetch({ path, selection: getSliceSelection(dimMapping) });
  });
}

export function useDatasetValue<D extends Dataset>(
  dataset: D,
  dimMapping?: DimensionMapping
): Value<D>;

export function useDatasetValue<D extends Dataset>(
  dataset: D | undefined,
  dimMapping?: DimensionMapping
): Value<D> | undefined;

export function useDatasetValue(
  dataset: Dataset | undefined,
  dimMapping?: DimensionMapping
): unknown {
  const { valuesStore } = useContext(ProviderContext);

  if (!dataset) {
    return undefined;
  }

  // Dataset with null shape has no value to fetch
  assertNonNullShape(dataset);

  // If `dimMapping` is not provided or has no slicing dimension, the entire dataset will be fetched
  const value = valuesStore.get({
    path: dataset.path,
    selection: getSliceSelection(dimMapping),
  });

  assertDatasetValue(value, dataset);
  return value;
}

export function useDatasetValues<D extends Dataset>(
  datasets: D[]
): Record<string, Value<D>>;

export function useDatasetValues(datasets: Dataset[]): Record<string, unknown> {
  const { valuesStore } = useContext(ProviderContext);

  return Object.fromEntries(
    datasets.map((dataset) => {
      assertNonNullShape(dataset);

      const { name, path } = dataset;
      const value = valuesStore.get({ path });
      assertDatasetValue(value, dataset);

      return [name, value];
    })
  );
}

const useBounds = createMemo(getBounds);
const useValidDomainForScale = createMemo(getValidDomainForScale);

export function useDomain(
  valuesArray: NdArray<number[]> | number[],
  scaleType: ScaleType = ScaleType.Linear,
  errorArray?: NdArray<number[]> | number[]
) {
  const bounds = useBounds(valuesArray, errorArray);
  return useValidDomainForScale(bounds, scaleType);
}

export function useDomains(
  valuesArrays: (NdArray<number[]> | number[])[],
  scaleType: ScaleType = ScaleType.Linear
) {
  const allBounds = useMemo(() => {
    return valuesArrays.map((arr) => getBounds(arr));
  }, [valuesArrays]);

  return useMemo(
    () => allBounds.map((bounds) => getValidDomainForScale(bounds, scaleType)),
    [allBounds, scaleType]
  );
}

export const useCombinedDomain = createMemo(getCombinedDomain);

const useBaseArray = createMemo(getBaseArray);
const useApplyMapping = createMemo(applyMapping);

export function useMappedArray<T, U extends T[] | undefined>(
  value: U,
  dims: number[],
  mapping: DimensionMapping,
  autoScale?: boolean
): U extends T[] ? [NdArray<U>, NdArray<U>] : [undefined, undefined];

export function useMappedArray<T>(
  value: T[] | undefined,
  dims: number[],
  mapping: DimensionMapping,
  autoScale?: boolean
) {
  const baseArray = useBaseArray(value, dims);
  const mappedArray = useApplyMapping(baseArray, mapping);

  return [mappedArray, autoScale ? mappedArray : baseArray];
}

export function useMappedArrays(
  values: number[][],
  dims: number[],
  mapping: DimensionMapping,
  autoScale?: boolean
) {
  const baseArrays = useMemo(
    () => values.map((v) => getBaseArray(v, dims)),
    [dims, values]
  );
  const mappedArrays = useMemo(
    () => baseArrays.map((v) => applyMapping(v, mapping)),
    [baseArrays, mapping]
  );

  return [mappedArrays, autoScale ? mappedArrays : baseArrays];
}

export function useSlicedDimsAndMapping(
  dims: number[],
  dimMapping: DimensionMapping
): [number[], DimensionMapping] {
  return useMemo(
    () => [
      dims.filter((_, i) => isAxis(dimMapping[i])),
      dimMapping.filter(isAxis),
    ],
    [dimMapping, dims]
  );
}
