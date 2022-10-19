const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password")
  
        return userData;
      }
    

      throw new AuthenticationError("You are not logged in.");
    },
    users: async () => {
      return User.find().select('-__v -password')
      .populate('thoughts')
      .populate('friends');
    }
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials - please try again.");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials - please try again.");
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { favorite}, context) => {
      if (context.user) {
         const userData = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: favorite} },
          { new: true }
        );
  
        return userData;
      }
  
      throw new AuthenticationError("You are required to log in.");
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
         const user = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { bookid: {bookId}} },
          { new: true }
        );
  
        return user;
      }
  
      throw new AuthenticationError("You are required to log in.");
    },
  },
};

module.exports = resolvers;