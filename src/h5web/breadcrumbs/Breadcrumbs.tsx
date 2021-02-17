import { ReactElement, useContext } from 'react';
import styles from './BreadcrumbsBar.module.css';
import { assertAbsolutePath } from '../guards';
import { ProviderContext } from '../providers/context';
import Crumb from './Crumb';

interface Props {
  path: string;
  onSelect: (path: string) => void;
  showFilepath: boolean;
}

function Breadcrumbs(props: Props): ReactElement {
  const { path, onSelect, showFilepath } = props;

  assertAbsolutePath(path);
  const { filepath } = useContext(ProviderContext);

  if (path === '/') {
    return (
      <h1 className={styles.breadCrumbs}>
        <span className={styles.crumb} data-current>
          {filepath}
        </span>
      </h1>
    );
  }

  // Remove leading /
  const crumbs = path.slice(1).split('/');

  return (
    <h1 className={styles.breadCrumbs}>
      {showFilepath && <Crumb name={filepath} onClick={() => onSelect('/')} />}
      {crumbs.slice(0, -1).map((crumb, i) => {
        const crumbPath = `/${crumbs.slice(0, i + 1).join('/')}`;
        return (
          <Crumb
            key={crumbPath}
            name={crumb}
            onClick={() => onSelect(crumbPath)}
          />
        );
      })}
      <span className={styles.crumb} data-current>
        {crumbs[crumbs.length - 1]}
      </span>
    </h1>
  );
}

export default Breadcrumbs;
