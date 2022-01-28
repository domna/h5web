import 'normalize.css';
import '@h5web/lib/src/styles.css';
import '../src/styles.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  docs: { source: { excludeDecorators: true } },
  options: {
    storySort: {
      order: [
        'Getting started',
        'Utilities',
        'Customization',
        'Visualizations',
        'Building Blocks',
        ['VisCanvas'],
      ],
    },
  },
};
