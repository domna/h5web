import { getSupportedVis } from './utils';
import { Vis } from '../visualizations';
import {
  compoundType,
  intType,
  scalarShape,
  makeAttr,
  makeStrAttr,
  makeDataset,
  makeGroup,
  makeNxDataGroup,
  makeSimpleDataset,
} from '../providers/mock/utils';

describe('Visualizer utilities', () => {
  describe('getSupportedVis', () => {
    it('should return supported visualizations', () => {
      const datasetRaw = makeDataset('raw', scalarShape, compoundType);
      const supportedVis = getSupportedVis(datasetRaw);

      expect(supportedVis).toEqual({ supportedVis: [Vis.Raw] });
    });

    it('should not include Raw vis if any other visualization is supported', () => {
      const datasetInt1D = makeSimpleDataset('dataset', intType, [5]);
      const supportedVis = getSupportedVis(datasetInt1D);

      expect(supportedVis).toEqual({ supportedVis: [Vis.Matrix, Vis.Line] });
    });

    it('should not include NxSpectrum vis if any other visualization is supported', () => {
      const datasetInt2D = makeSimpleDataset('dataset', intType, [5, 3]);
      const nxDataSignal2D = makeNxDataGroup('foo', { signal: datasetInt2D });
      const supportedVis = getSupportedVis(nxDataSignal2D);

      expect(supportedVis).toEqual({ supportedVis: [Vis.NxImage] });
    });

    it('should return empty array if no visualization is supported', () => {
      const groupEmpty = makeGroup('group_empty');
      const supportedVis = getSupportedVis(groupEmpty);

      expect(supportedVis).toEqual({ supportedVis: [] });
    });

    it('should return error if entity has malformed NeXus metadata', () => {
      const nxDataMalformed = makeGroup('foo', [], {
        attributes: [
          makeStrAttr('NX_class', 'NXdata'),
          makeAttr('signal', scalarShape, intType, 42), // `signal` attribute should be string
        ],
      });

      const supportedVis = getSupportedVis(nxDataMalformed);

      expect(supportedVis).toEqual({
        supportedVis: [],
        error: expect.any(TypeError),
      });
    });
  });
});
