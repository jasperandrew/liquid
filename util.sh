#!/bin/bash

#--------------------------------------------#
#               Some functions               #
#--------------------------------------------#

build () {
    echo -n "[Info] Building files..."
    npx babel src/js/ -d docs/scripts/
    npx sass src/sass/:docs/styles/
}

clean () {
    echo "[Info] Cleaning files"
    rm *.log
}

help () {
    echo "Jasper's Project Streamline Utility Script"
    echo "    build, b         Build project"
    echo "    clean, c         Clean log files"
    echo "    help, h          Display this help message"
    echo "    server, s        Run a basic http server on docs/"
    echo "    watch, w         Watch files for changes"
    echo "    start, all, a    Start the server and watch processes"
}

server () {
    echo "[Info] Starting server on port 7000..."
    trap "kill 0" EXIT
    cd docs/ && python3 -m http.server 7000 > ../util.server.log 2>&1 &
    wait
}

watch () {
    echo "[Info] Watching files for changes..."
    trap "kill 0" EXIT
    npx babel --verbose -w src/js/ -d docs/scripts/ > util.babel.log 2>&1 &
    npx sass --watch src/sass/:docs/styles/ > util.sass.log 2>&1 &
    wait
}

startall () {
    trap "kill 0" EXIT
    server &
    watch &
    wait
}

#--------------------------------------------#
#                    Main                    #
#--------------------------------------------#

case "$#" in

0) help ;;

1)
    case "$1" in
    "build"|"b") build ;;
    "clean"|"c") clean ;;
    "help"|"h") help ;;
    "server"|"s") server ;;
    "watch"|"w") watch ;;
    "start"|"all"|"a") startall ;;
    *) echo "[Error] Invalid argument: $1" ;;
    esac
;;

*) echo "[Error] Too many arguments" ;;

esac
