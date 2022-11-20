const {AuthenticationError} = require('apollo-server-express');
const {User} = require('../models');
const {signToken} = require('../utils/auth');

const resolvers = {
    Query: {
        async me(_, {_id}) {
            return User.findOne(_id);
        }
    },
    Mutation: {
        async login(_, {email, password}) {
            const user = await User.findOne({email});
            if (!user) {
                throw new AuthenticationError('Login information is invalid.');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Login information is invalid.');
            }
            const token = signToken(user);
            return {token, user};
        },
        async addUser(parent, args) {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        async saveBook(_, {_id, book}, context) {
            if (context.user) {
                return User.findOneAndUpdate(
                    {_id: _id},
                    {$addToSet: {savedBooks: book}},
                    {new: true, runValidators: true}
                );
            }
        },
        async removeBook(_, {_id, bookId}, context) {
            if (context.user) {
                return User.findOneAndUpdate(
                    {_id: _id},
                    {$pull: {savedBooks: {bookId: bookId}}},
                    {new: true}
                );
            }
            throw new AuthenticationError('You need to be logged in to do this!');
        }
    }
}

module.exports = resolvers;