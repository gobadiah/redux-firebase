#!/bin/bash

function print_help {
  echo "Commands available, each will tag current version, which locks it :"
  echo "  publish"
  echo "  inc patch"
  echo "  inc minor"
  echo "  inc major"
}

function publish {
  git tag -l | grep -q `cat VERSION`
  if [ $? -ne 0 ]
  then
    if [ -z "$(git status --untracked-files=no --porcelain)" ]
    then
      git tag `semver tag`
    else
      git commit -am `semver tag`
      git tag `semver tag`
    fi
  else
    echo "This version has already been published."
  fi
}

function increment {
  git tag -l | grep -q `cat VERSION`
  if [ $? -ne 0 ]
  then
    echo "This version hasn't been published yet. Publishing ..."
    publish
  fi
  semver $1 $2
  Vversion=`semver tag`
  version=${Vversion:1}

  echo $version > VERSION
  sed -E "s/  \"version\": \"([0-9\.]+)\",/  \"version\": \"$version\",/" package.json > package.json.tmp
  mv package.json.tmp package.json
  git commit -am "bumped to $(semver tag)"
}

if [ $# -eq 1 ] && [ $1 == "publish" ]
then
  publish
  exit $?
elif [ $# -eq 2 ] && [ $1 == "inc" ]
then
  if [ $2 == "patch" ] || [ $2 == "minor" ] || [ $2 == "major" ]
  then
    increment $1 $2
    exit $?
  fi
fi
print_help
exit 0
