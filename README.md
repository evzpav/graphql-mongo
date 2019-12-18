# Graphql Mongo 

## Run the project locally:

## Method 1 - Run mongo on docker
### Pre-requisites: make, node and docker installed
```bash

# Install dependencies:
make install

# Run mongo on docker:
make run-mongo

# Run server:
make run

#Server will be running on: http://localhost:4000

```

1. Node.js-based server with Apollo Server.
2. A `/graphql` endpoint is serving the apollo-server.
3. Schema returns proper response for the following public query:

```graphql
{
  movies {
    title
    year
    rating
    actors {
      name
      birthday
      country
      directors {
        name
        birthday
        country
      }
    }
  }
}
```

4. Also supports the following mutation:
```graphql
mutation createUser($username: String, $password: String) {
  createUser(username: $username, password: $password) {
    token
    user {
      id
      name
    }
  }
}
```

5. A mutation-based authentication:
```graphql
mutation login($username: String, $password: String) {
  login(username: $username, password: $password) {
    token
    user {
      id
      name
    }
  }
}
```

6. Authenticated users may request additional fields for the query used earlier. New `evzpav_rating` field returns the a random string between 5.0-9.0:

```graphql
{
  movies {
    evzpav_rating

    title
    year
    rating
    actors {
      name
      birthday
      country
      directors {
        name
        birthday
        country
      }
    }
  }
}
```
