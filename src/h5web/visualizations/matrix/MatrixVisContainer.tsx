import React, { ReactElement, useState } from 'react';
import { range } from 'lodash-es';
import { HDF5SimpleShape } from '../../providers/models';
import { useDatasetValue } from '../shared/hooks';
import { assertDataset } from '../../providers/utils';
import MappedMatrixVis from './MappedMatrixVis';
import DimensionMapper from '../../dataset-visualizer/mapper/DimensionMapper';
import { DimensionMapping } from '../../dataset-visualizer/models';
import { VisContainerProps } from '../shared/models';

function MatrixVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);

  const value = useDatasetValue(entity.id);

  const { dims } = entity.shape as HDF5SimpleShape;
  const [mapperState, setMapperState] = useState<DimensionMapping>(
    dims.length === 1 ? ['x'] : [...range(dims.length - 2).fill(0), 'y', 'x']
  );

  if (!value) {
    return <></>;
  }

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={mapperState}
        onChange={setMapperState}
      />
      <MappedMatrixVis
        value={value}
        dataset={entity}
        mapperState={mapperState}
      />
    </>
  );
}

export default MatrixVisContainer;
