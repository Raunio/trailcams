# Trailcams

=======

## Description

Trailcams REST API project.

## Setup

Before running the containers, AWS credentials should be provided to the application. Create a credentials file as per official documentation, found here: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/loading-node-credentials-shared.html

## Running the app

```bash
$ docker-compose up -d
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Apidoc

The api documentation can be accessed locally from localhost:{port}/api
