const express = require('express');
const path = require('path');
const db = require('./config/connection');
const {typeDefs, resolvers} = require('./schemas');
const {ApolloServer} = require('apollo-server-express');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
const server = new ApolloServer({
    typeDefs,
    resolvers
});

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
}

const startApolloServer = async (typeDefs, resolvers) => {
    await server.start();
    server.applyMiddleware({app});

    db.once('open', () => {
        app.listen(PORT, () => {
            console.log(`Now listening on localhost: ${PORT}`);
            console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
        });

    });
}

startApolloServer(typeDefs, resolvers);

