import type { Domain, NumArray, NumericType } from '@h5web/shared';
import {
  assertDefined,
  formatTooltipVal,
  getDims,
  ScaleType,
} from '@h5web/shared';
import type { NdArray } from 'ndarray';
import type { ReactElement, ReactNode } from 'react';

import { XAxisZoom, YAxisZoom } from '../..';
import Pan from '../../interactions/Pan';
import ResetZoomButton from '../../interactions/ResetZoomButton';
import SelectToZoom from '../../interactions/SelectToZoom';
import Zoom from '../../interactions/Zoom';
import { useAxisDomain, useValueToIndexScale } from '../hooks';
import type { AxisParams, VisScaleType } from '../models';
import TooltipMesh from '../shared/TooltipMesh';
import VisCanvas from '../shared/VisCanvas';
import { DEFAULT_DOMAIN, formatNumType } from '../utils';
import ColorBar from './ColorBar';
import HeatmapMesh from './HeatmapMesh';
import styles from './HeatmapVis.module.css';
import { useAxisValues, useTextureSafeNdArray } from './hooks';
import type { ColorMap, Layout, TooltipData } from './models';

interface Props {
  dataArray: NdArray<NumArray>;
  domain: Domain | undefined;
  colorMap?: ColorMap;
  scaleType?: VisScaleType;
  layout?: Layout;
  showGrid?: boolean;
  title?: string;
  dtype?: NumericType;
  invertColorMap?: boolean;
  abscissaParams?: AxisParams;
  ordinateParams?: AxisParams;
  alpha?: { array: NdArray<NumArray>; domain: Domain };
  flipYAxis?: boolean;
  renderTooltip?: (data: TooltipData) => ReactElement;
  children?: ReactNode;
}

function HeatmapVis(props: Props) {
  const {
    dataArray,
    domain = DEFAULT_DOMAIN,
    colorMap = 'Viridis',
    scaleType = ScaleType.Linear,
    layout = 'cover',
    showGrid = false,
    invertColorMap = false,
    title,
    dtype,
    abscissaParams = {},
    ordinateParams = {},
    alpha,
    flipYAxis,
    renderTooltip,
    children,
  } = props;
  const { label: abscissaLabel, value: abscissaValue } = abscissaParams;
  const { label: ordinateLabel, value: ordinateValue } = ordinateParams;

  const { rows, cols } = getDims(dataArray);

  const abscissas = useAxisValues(abscissaValue, cols);
  const abscissaDomain = useAxisDomain(abscissas);
  assertDefined(abscissaDomain, 'Abscissas have undefined domain');

  const ordinates = useAxisValues(ordinateValue, rows);
  const ordinateDomain = useAxisDomain(ordinates);
  assertDefined(ordinateDomain, 'Ordinates have undefined domain');

  const abscissaToIndex = useValueToIndexScale(abscissas);
  const ordinateToIndex = useValueToIndexScale(ordinates);

  const safeDataArray = useTextureSafeNdArray(dataArray);
  const safeAlphaArray = useTextureSafeNdArray(alpha?.array);

  const keepRatio = layout !== 'fill';

  return (
    <figure className={styles.root} aria-label={title} data-keep-canvas-colors>
      <VisCanvas
        title={title}
        canvasRatio={layout === 'contain' ? cols / rows : undefined}
        visRatio={keepRatio ? cols / rows : undefined}
        abscissaConfig={{
          visDomain: abscissaDomain,
          showGrid,
          isIndexAxis: !abscissaValue,
          label: abscissaLabel,
        }}
        ordinateConfig={{
          visDomain: ordinateDomain,
          showGrid,
          isIndexAxis: !ordinateValue,
          label: ordinateLabel,
          flip: flipYAxis,
        }}
      >
        <Pan />
        <Zoom />
        <XAxisZoom disabled={keepRatio} />
        <YAxisZoom disabled={keepRatio} />
        <SelectToZoom keepRatio={keepRatio} />
        <ResetZoomButton />
        <TooltipMesh
          guides="both"
          renderTooltip={(x, y) => {
            const xi = abscissaToIndex(x);
            const yi = ordinateToIndex(y);
            const abscissa = abscissas[xi];
            const ordinate = ordinates[yi];

            if (renderTooltip) {
              return renderTooltip({ abscissa, ordinate, xi, yi, x, y });
            }

            return (
              <>
                {`${abscissaLabel ?? 'x'}=${formatTooltipVal(abscissa)}, `}
                {`${ordinateLabel ?? 'y'}=${formatTooltipVal(ordinate)}`}
                <div className={styles.tooltipValue}>
                  <strong>{formatTooltipVal(dataArray.get(yi, xi))}</strong>
                  {dtype && <em>{` (${formatNumType(dtype)})`}</em>}
                  {alpha && ` (${formatTooltipVal(alpha.array.get(yi, xi))})`}
                </div>
              </>
            );
          }}
        />
        <HeatmapMesh
          values={safeDataArray}
          domain={domain}
          colorMap={colorMap}
          invertColorMap={invertColorMap}
          scaleType={scaleType}
          alphaValues={safeAlphaArray}
          alphaDomain={alpha?.domain}
        />
        {children}
      </VisCanvas>
      <ColorBar
        domain={domain}
        scaleType={scaleType}
        colorMap={colorMap}
        invertColorMap={invertColorMap}
        withBounds
      />
    </figure>
  );
}

export type { Props as HeatmapVisProps };
export default HeatmapVis;
