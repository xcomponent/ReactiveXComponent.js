#!/bin/bash
version=`git tag -l --points-at HEAD`

if [ ! -z "$version" ]; then
	if [[ $string == *"-BETA" ]]; then
		echo "BETA"
	else
		echo "RELEASE"
	fi
else
	echo "FAILED"
fi
