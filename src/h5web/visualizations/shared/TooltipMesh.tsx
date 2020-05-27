import React, { ReactElement, useCallback, useContext } from 'react';
import { Dom, PointerEvent, useThree } from 'react-three-fiber';
import { TooltipWithBounds, useTooltip } from '@vx/tooltip';
import { Line } from '@vx/shape';

import styles from './TooltipMesh.module.css';
import { getAxisScale } from './utils';
import { AxisSystemContext } from './AxisSystemProvider';

const GUIDE_PROPS = {
  stroke: 'gray',
  strokeWidth: 1.5,
  strokeOpacity: 0.5,
};

type Coords = [number, number];
type Guides = 'horizontal' | 'vertical' | 'both';

interface Props {
  formatIndex: (t: Coords) => string;
  formatValue: (t: Coords) => string | undefined;
  guides?: Guides;
}

function TooltipMesh(props: Props): ReactElement {
  const { formatIndex, formatValue, guides } = props;

  const { abscissaInfo, ordinateInfo } = useContext(AxisSystemContext);
  const { camera, size } = useThree();
  const { width, height } = size;

  // Scales to compute data coordinates from unprojected mesh coordinates
  const abscissaScale = getAxisScale(abscissaInfo, width);
  const ordinateScale = getAxisScale(ordinateInfo, height);

  const {
    tooltipOpen,
    tooltipTop,
    tooltipLeft,
    tooltipData,
    showTooltip,
    hideTooltip,
  } = useTooltip<Coords>();

  // Update tooltip when pointer moves
  // When panning, events are handled and stopped by texture mesh and do not reach this mesh (which is behind)
  const onPointerMove = useCallback(
    (evt: PointerEvent) => {
      const { zoom } = camera;
      const projectedPoint = camera.worldToLocal(evt.unprojectedPoint.clone());

      const abscissaCoord = abscissaScale.invert(evt.unprojectedPoint.x);
      const ordinateCoord = ordinateScale.invert(evt.unprojectedPoint.y);

      showTooltip({
        tooltipLeft: projectedPoint.x * zoom + width / 2,
        tooltipTop: -projectedPoint.y * zoom + height / 2,
        tooltipData: [abscissaCoord, ordinateCoord],
      });
    },
    [camera, abscissaScale, ordinateScale, showTooltip, width, height]
  );

  // Hide tooltip when pointer leaves mesh or user starts panning
  const onPointerOut = useCallback(hideTooltip, [hideTooltip]);
  const onPointerDown = useCallback(hideTooltip, [hideTooltip]);

  const value = tooltipData && formatValue(tooltipData);

  return (
    <>
      <mesh {...{ onPointerMove, onPointerOut, onPointerDown }}>
        <planeBufferGeometry attach="geometry" args={[width, height]} />
      </mesh>
      <Dom style={{ width, height }}>
        {tooltipOpen && tooltipData && value ? (
          <>
            <TooltipWithBounds
              key={Math.random()}
              className={styles.tooltip}
              top={tooltipTop}
              left={tooltipLeft}
            >
              {formatIndex(tooltipData)}
              <span className={styles.tooltipValue}>{value}</span>
            </TooltipWithBounds>
            {guides && (
              <svg width={width} height={height}>
                {guides !== 'horizontal' && (
                  <Line
                    from={{ x: tooltipLeft, y: 0 }}
                    to={{ x: tooltipLeft, y: height }}
                    {...GUIDE_PROPS}
                  />
                )}
                {guides !== 'vertical' && (
                  <Line
                    from={{ x: 0, y: tooltipTop }}
                    to={{ x: width, y: tooltipTop }}
                    {...GUIDE_PROPS}
                  />
                )}
              </svg>
            )}
          </>
        ) : (
          <></>
        )}
      </Dom>
    </>
  );
}

export default TooltipMesh;