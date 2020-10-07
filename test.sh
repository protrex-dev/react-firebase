#!/bin/bash
set -e

cd react-firebase

yarn
yarn build
yarn test
