import { ApolloClient, DefaultOptions, InMemoryCache } from '@apollo/client';

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};

export const apollo = new ApolloClient({
  uri: `http://${window.location.hostname}:8075/dna/admin/graphql`,
  cache: new InMemoryCache({
    addTypename: false,
  }),
  defaultOptions: defaultOptions,
});
