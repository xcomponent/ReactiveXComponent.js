#!/bin/bash
version=`git tag -l --points-at HEAD`

if [ ! -z "$version" ]; then
	echo "OK"
else
	echo "FAILED"
fi
