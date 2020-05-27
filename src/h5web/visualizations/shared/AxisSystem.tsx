import React, { useState, useContext } from 'react';
import { useThree, useFrame, Dom } from 'react-three-fiber';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { format } from 'd3-format';
import { TickRendererProps } from '@vx/axis/lib/types';
import { GridColumns, GridRows } from '@vx/grid';
import styles from './AxisSystem.module.css';
import { AxisOffsets, Domain } from './models';
import { getTicksProp, getAxisScale } from './utils';
import { AxisSystemContext } from './AxisSystemProvider';

const AXIS_PROPS = {
  tickStroke: 'grey',
  hideAxisLine: true,
  tickFormat: format('0'),
  tickClassName: styles.tick,
  tickComponent: ({ formattedValue, ...tickProps }: TickRendererProps) => (
    <text {...tickProps}>{formattedValue}</text>
  ),
};

interface Props {
  axisOffsets: AxisOffsets;
}

function AxisSystem(props: Props): JSX.Element {
  const { axisOffsets } = props;

  const { abscissaInfo, ordinateInfo } = useContext(AxisSystemContext);
  const { camera, size } = useThree();
  const { width, height } = size;

  const abscissaScale = getAxisScale(abscissaInfo, width);
  const ordinateScale = getAxisScale(ordinateInfo, height);

  // axisDomains are the complete domains. visibleDomains change with the camera
  const [visibleDomains, setVisibleDomains] = useState<[Domain, Domain]>([
    abscissaInfo.domain,
    ordinateInfo.domain,
  ]);

  useFrame(() => {
    const { position, zoom } = camera;

    // Finds the visible domains from the camera FOV (zoom and position).
    setVisibleDomains([
      [
        abscissaScale.invert(-width / (2 * zoom) + position.x),
        abscissaScale.invert(width / (2 * zoom) + position.x),
      ],
      [
        ordinateScale.invert(-height / (2 * zoom) + position.y),
        ordinateScale.invert(height / (2 * zoom) + position.y),
      ],
    ]);
  });

  // Restrain ticks scales to visible domains
  const xTicksScale = abscissaInfo.scaleFn();
  xTicksScale.domain(visibleDomains[0]);
  xTicksScale.range([0, width]);

  const yTicksScale = ordinateInfo.scaleFn();
  yTicksScale.domain(visibleDomains[1]);
  yTicksScale.range([height, 0]);

  const xTicksProp = getTicksProp(abscissaInfo, visibleDomains[0], width);
  const yTicksProp = getTicksProp(ordinateInfo, visibleDomains[1], height);

  return (
    <Dom
      className={styles.axisSystem}
      style={{
        // Take over space reserved for axis by VisCanvas
        width: width + axisOffsets.left + axisOffsets.right,
        height: height + axisOffsets.bottom + axisOffsets.top,
        top: -axisOffsets.top,
        left: -axisOffsets.left,
        gridTemplateColumns: `${axisOffsets.left}px 1fr ${axisOffsets.right}px`,
        gridTemplateRows: `${axisOffsets.top}px 1fr ${axisOffsets.bottom}px`,
      }}
    >
      <>
        <div className={styles.bottomAxisCell}>
          <svg className={styles.axis} data-orientation="bottom">
            <AxisBottom scale={xTicksScale} {...xTicksProp} {...AXIS_PROPS} />
          </svg>
        </div>
        <div className={styles.leftAxisCell}>
          <svg className={styles.axis} data-orientation="left">
            <AxisLeft
              scale={yTicksScale}
              left={axisOffsets.left}
              {...yTicksProp}
              {...AXIS_PROPS}
            />
          </svg>
        </div>
        <div className={styles.axisGridCell}>
          <svg width={width} height={height}>
            {abscissaInfo.showGrid && (
              <GridColumns
                scale={xTicksScale}
                {...xTicksProp}
                width={width}
                height={height}
                stroke={AXIS_PROPS.tickStroke}
                strokeOpacity={0.33}
              />
            )}
            {ordinateInfo.showGrid && (
              <GridRows
                scale={yTicksScale}
                {...yTicksProp}
                width={width}
                height={height}
                stroke={AXIS_PROPS.tickStroke}
                strokeOpacity={0.33}
              />
            )}
          </svg>
        </div>
      </>
    </Dom>
  );
}

export default AxisSystem;