#!/bin/bash

workers=4
if [[ ! -z $1 ]]; then
    workers=$1
fi

gunicorn -b 0.0.0.0:5000 -w $workers cronenberg:app
