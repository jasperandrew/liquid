#!/bin/bash

#--------------------------------------------#
#               Some variables               #
#--------------------------------------------#

# packages to install
babel="@babel/core @babel/cli @babel/preset-env"
react="react react-dom @babel/preset-react"
sass="sass"
http_server="http-server"


# babel config file
babel_config='{
	"presets": [
		"@babel/preset-env",
		"@babel/preset-react"
	]
}'


#--------------------------------------------#
#               Some functions               #
#--------------------------------------------#

build () {
	echo "[Util] Building files..."
	npx babel src/jsx/ -d scripts/
	npx sass src/sass/:styles/
}

start () {
	echo "[Util] Starting server..."
	echo "[Util] Watching files for updates..."
	trap "kill 0" EXIT
	npx http-server
	npx babel --verbose -w src/jsx/ -d scripts/ &
	npx sass --watch src/sass/:styles/ &
	wait
}

watch () {
	echo "[Util] Watching files for updates..."
	trap "kill 0" EXIT
	npx babel --verbose -w src/jsx/ -d scripts/ &
	npx sass --watch src/sass/:styles/ &
	wait
}

install () {
    npm -D i $babel $react $sass $http_server
	echo $babel_config > .babelrc
}


#--------------------------------------------#
#          Actually doing stuff now          #
#--------------------------------------------#

if [[ $# -eq 0 ]]; then help
elif [[ $# -eq 1 ]]; then

	if [[ $1 == "build" ]]; then build
	elif [[ $1 == "start" ]]; then start
	elif [[ $1 == "watch" ]]; then watch
	elif [[ $1 == "install" ]]; then install
	else echo "[Error] Invalid argument"; help
	fi

else echo "[Error] Too many arguments"; help
fi