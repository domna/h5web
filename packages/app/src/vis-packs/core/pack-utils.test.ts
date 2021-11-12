import {
  compoundType,
  intType,
  makeDataset,
  makeGroup,
  makeScalarDataset,
} from '@h5web/shared/src/mock/metadata-utils';

import { getSupportedCoreVis } from './pack-utils';
import { CORE_VIS } from './visualizations';

describe('getSupportedCoreVis', () => {
  it('should return supported visualizations', () => {
    const datasetRaw = makeScalarDataset('raw', compoundType);
    const supportedVis = getSupportedCoreVis(datasetRaw);

    expect(supportedVis).toEqual([CORE_VIS.Raw]);
  });

  it('should not include Raw vis if any other visualization is supported', () => {
    const datasetInt1D = makeDataset('dataset', intType, [5]);
    const supportedVis = getSupportedCoreVis(datasetInt1D);

    expect(supportedVis).toEqual([CORE_VIS.Matrix, CORE_VIS.Line]);
  });

  it('should return empty array if no visualization is supported', () => {
    const groupEmpty = makeGroup('group_empty');
    const supportedVis = getSupportedCoreVis(groupEmpty);

    expect(supportedVis).toEqual([]);
  });
});
