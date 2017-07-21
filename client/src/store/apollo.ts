import { ApolloClient, createNetworkInterface } from 'react-apollo';

const networkInterface = createNetworkInterface({
  uri: '/api/graphql',
  opts: {
    credentials: 'same-origin',
  },
});

networkInterface.use([{
  applyMiddleware(req, next) {
    const token = localStorage.getItem('token');
    if (token) {
      if (!req.options.headers) {
        req.options.headers = {};  // Create the header object if needed.
      }
      req.options.headers.authorization = `JWT ${token}`;
    }
    next();
  },
}]);

export default new ApolloClient({
  networkInterface,
  dataIdFromObject: (o: any) => {
    if (o.id) {
      if (o.__typename === 'User') {
        return `${o.__typename}:${o.username},`;
      } else if (o.__typename === 'Label' || o.__typename === 'Issue') {
        // Label and issue ids are only unique within a project.
        return `${o.__typename}:${o.project}:${o.id},`;
      } else {
        return `${o.__typename}:${o.id},`;
      }
    }
    return null;
  },
  // TODO: finish
  // shouldBatch: true,
});
