import { Canvas } from 'react-three-fiber';
import React, { useState } from 'react';
import Mesh from './Mesh';
import { computeTextureData, findDomain, getColorScale } from './utils';
import styles from './HeatmapVis.module.css';
import IndexAxis from './IndexAxis';
import ColorBar from './ColorBar';
import ColorMapSelector from './ColorMapSelector';
import { INTERPOLATORS } from './interpolators';
import LogScaleToggler from './LogScaleToggler';
import { useHeatmapState } from './store';

interface Props {
  dims: [number, number];
  data: number[][];
}

function HeatmapVis(props: Props): JSX.Element {
  const { dims, data } = props;

  const values = data.flat();
  const domain = findDomain(values);

  const { colorMap } = useHeatmapState();
  const interpolator = INTERPOLATORS[colorMap];

  const [logScale, setLogScale] = useState<boolean>(false);

  const colorScale = getColorScale(domain, logScale);
  const textureData = computeTextureData(values, interpolator, colorScale);

  return (
    <div className={styles.chart}>
      <div className={styles.mapArea}>
        <Canvas className={styles.heatmap} orthographic invalidateFrameloop>
          <ambientLight />
          {textureData && <Mesh dims={dims} textureData={textureData} />}
        </Canvas>
      </div>
      <IndexAxis
        className={styles.leftArea}
        orientation="left"
        numberPixels={dims[0]}
      />
      <IndexAxis
        className={styles.bottomArea}
        orientation="bottom"
        numberPixels={dims[1]}
      />
      {colorScale && (
        <div className={styles.rightArea}>
          <LogScaleToggler value={logScale} onChange={setLogScale} />
          <ColorBar
            interpolator={INTERPOLATORS[colorMap]}
            colorScale={colorScale}
          />
        </div>
      )}
      <ColorMapSelector className={styles.bottomRightArea} />
    </div>
  );
}

export default HeatmapVis;
