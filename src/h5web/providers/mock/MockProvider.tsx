import React, { ReactElement, ReactNode } from 'react';
import Provider from '../Provider';
import { myMockMetadata, mockValues, mockDomain } from './data';

interface Props {
  domain?: string;
  errorOnId?: string;
  children: ReactNode;
}

function MockProvider(props: Props): ReactElement {
  const { domain = mockDomain, errorOnId, children } = props;

  return (
    <Provider
      api={{
        domain,
        getMetadata: async () => myMockMetadata,
        getValue: async (id: keyof typeof mockValues) => {
          if (id === errorOnId) {
            // Throw error when fetching value with specific ID
            throw new Error('error');
          }

          return mockValues[id];
        },
      }}
    >
      {children}
    </Provider>
  );
}

export default MockProvider;
