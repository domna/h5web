import React, { ReactElement, useEffect } from 'react';
import { usePrevious } from 'react-use';
import type { HDF5Dataset, HDF5Value } from '../../providers/models';
import type { DimensionMapping } from '../../dataset-visualizer/models';
import HeatmapVis from './HeatmapVis';
import { assertArray } from '../shared/utils';
import { useMappedArray, useDomain, useBaseArray } from '../shared/hooks';
import { useHeatmapConfig } from './config';

interface Props {
  value: HDF5Value;
  dataset: HDF5Dataset;
  mapperState: DimensionMapping;
}

function MappedHeatmapVis(props: Props): ReactElement {
  const { value, dataset, mapperState } = props;
  assertArray<number>(value);

  const {
    customDomain,
    colorMap,
    scaleType,
    keepAspectRatio,
    showGrid,
    resetDomains,
    autoScale,
    disableAutoScale,
  } = useHeatmapConfig();

  const baseArray = useBaseArray(dataset, value);
  const dataArray = useMappedArray(baseArray, mapperState);
  const dataDomain = useDomain(
    (autoScale ? dataArray.data : baseArray.data) as number[],
    scaleType
  );
  const prevDataDomain = usePrevious(dataDomain);

  // Disable `autoScale` for 2D datasets (baseArray and dataArray span the same values)
  useEffect(() => {
    disableAutoScale(!baseArray.shape || baseArray.shape.length <= 2);
  }, [baseArray.shape, disableAutoScale]);

  // Use `customDomain` if any, unless `dataDomain` just changed (in which case it is stale and needs to be reset - cf. `useEffect` below)
  const domain =
    customDomain && dataDomain === prevDataDomain ? customDomain : dataDomain;

  useEffect(() => {
    resetDomains(dataDomain); // in config, update `dataDomain` and reset `customDomain`
  }, [dataDomain, resetDomains]);

  return (
    <HeatmapVis
      dataArray={dataArray}
      domain={domain}
      colorMap={colorMap}
      scaleType={scaleType}
      keepAspectRatio={keepAspectRatio}
      showGrid={showGrid}
    />
  );
}

export default MappedHeatmapVis;
