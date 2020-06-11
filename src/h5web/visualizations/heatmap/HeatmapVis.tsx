import React, { useEffect } from 'react';
import shallow from 'zustand/shallow';
import { format } from 'd3-format';
import styles from './HeatmapVis.module.css';
import ColorBar from './ColorBar';
import { useValues, useDims } from './hooks';
import Mesh from './Mesh';
import TooltipMesh from '../shared/TooltipMesh';
import { useHeatmapConfig } from './config';
import PanZoomMesh from '../shared/PanZoomMesh';
import VisCanvas from '../shared/VisCanvas';
import { useDataArray } from '../../dataset-visualizer/VisProvider';

function HeatmapVis(): JSX.Element {
  const dataArray = useDataArray();
  const [keepAspectRatio, showGrid] = useHeatmapConfig(
    (state) => [state.keepAspectRatio, state.showGrid],
    shallow
  );

  // width / height <=> cols / rows
  const { rows, cols } = useDims();
  const aspectRatio = keepAspectRatio ? cols / rows : undefined;

  const values = useValues();
  const initDataDomain = useHeatmapConfig((state) => state.initDataDomain);

  useEffect(() => {
    initDataDomain(values);
  }, [initDataDomain, values]);

  return (
    <div className={styles.root}>
      <VisCanvas
        abscissaConfig={{ indexDomain: [0, cols], showGrid }}
        ordinateConfig={{ indexDomain: [0, rows], showGrid }}
        aspectRatio={aspectRatio}
      >
        <TooltipMesh
          formatIndex={([x, y]) => `x=${Math.floor(x)}, y=${Math.floor(y)}`}
          formatValue={([x, y]) => {
            return x < cols && y < rows
              ? format('.3')(dataArray.get(Math.floor(y), Math.floor(x)))
              : undefined;
          }}
          guides="both"
        />
        <PanZoomMesh />
        <Mesh />
      </VisCanvas>
      <ColorBar />
    </div>
  );
}

export default HeatmapVis;
