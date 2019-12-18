const { ApolloServer, gql } = require('apollo-server');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs")
const movieExample = require("./movie.js")

const MONGO_URL = 'mongodb://localhost:27017'
const SECRET = "mysecret"

const start = async () => {

  try {
    let bearerToken;
    const db = await MongoClient.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    const dbo = db.db("evzpav")

    await dbo.createCollection("users")
    const Users = dbo.collection("users")

    await dbo.createCollection("movies")
    const Movies = dbo.collection("movies")

    await Movies.insertOne(movieExample)

    const typeDefs = gql` 
        type Movies {
          evzpav_rating: String
          title: String
          year: String
          rating: String
          actors: Actors
        }

        type Actors {
          name: String
          birthday: String
          country: String
          directors: Directors
        }

        type Directors {
          name: String
          birthday: String
          country: String
        }

        type Query {
          movies: [Movies]
        }

        type UserAuth {
          token: String
          user: User
        }

        type User {
          username: String!
          password: String!
          name: String
          id: String
        }

        type Mutation {
          createUser(username: String, password: String): UserAuth
          login(username: String, password: String): UserAuth
        }
      `;

    const resolvers = {
      Query: {
        movies: async () => {

          moviesArray = await Movies.find({}).toArray();

          if (bearerToken) {
            const token = bearerToken.replace('Bearer ', '');
            const { userId } = jwt.verify(token, SECRET);

            if (userId) {
              moviesArray.forEach((movie) => {
                movie["evzpav_rating"] = generateRandomRating();
              })
            }

          }

          return moviesArray;

        },
      },
      Mutation: {
        createUser: async (parent, userAuth) => {

          if (!userAuth.username || !userAuth.password) {
            throw new Error('Username or password missing');
          }

          userAuth.password = await bcrypt.hash(userAuth.password, 10);
          userAuth["name"] = userAuth.username;

          await Users.insertOne(userAuth);
          userAuth.id = userAuth._id.toString();

          const token = jwt.sign({ userId: userAuth.id }, SECRET);

          return {
            token,
            user: userAuth
          }
        },

        login: async (parent, userAuth) => {

          if (!userAuth.username || !userAuth.password) {
            throw new Error('Username or password missing');
          }


          const user = await Users.findOne({ username: userAuth.username });
          if (!user) {
            throw new Error('Invalid credentials');
          }

          const valid = await bcrypt.compare(userAuth.password, user.password);
          if (!valid) {
            throw new Error('Invalid credentials');
          }

          user.id = user._id.toString();

          const token = jwt.sign({ userId: user.id }, SECRET);

          return {
            token,
            user
          }
        },
      }
    };


    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => {
        bearerToken = req.headers.authorization || '';
      },
    });


    server.listen().then(({ url }) => {
      console.log(`Server ready at ${url}`);
    });

  } catch (e) {
    console.log(e);
  }
}


function generateRandomRating() {
  return (Math.floor(Math.random() * (90 - 50 + 10) + 50) / 10).toFixed(1);
}

start();