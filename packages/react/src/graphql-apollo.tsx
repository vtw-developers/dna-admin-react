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
  uri: 'http://localhost:8070/dna/api/graphql',
  cache: new InMemoryCache({
    addTypename: false
  }),
  defaultOptions: defaultOptions,
});
