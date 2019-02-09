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

# directory config
js_src="src/jsx/"
js_out="docs/scripts/"
css_src="src/sass/"
css_out="docs/styles/"
serve_dir="docs/"

#--------------------------------------------#
#               Some functions               #
#--------------------------------------------#

build () {
	echo "[Util] Building files..."
	npx babel $js_src -d $js_out
	npx sass $css_src:$css_out
}

server () {
	echo "[Util] Starting server..."
	trap "kill 0" EXIT
	npx http-server $serve_dir
	wait
}

watch () {
	echo "[Util] Watching files for updates..."
	trap "kill 0" EXIT
	npx babel --verbose -w $js_src -d $js_out &
	npx sass --watch $css_src:$css_out &
	wait
}

start () {
	echo "[Util] Starting server..."
	echo "[Util] Watching files for updates..."
	trap "kill 0" EXIT
	npx http-server $serve_dir --silent &
	npx babel --verbose -w $js_src -d $js_out &
	npx sass --watch $css_src:$css_out &
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
	elif [[ $1 == "server" ]]; then server
	elif [[ $1 == "watch" ]]; then watch
	elif [[ $1 == "install" ]]; then install
	else echo "[Error] Invalid argument"; help
	fi

else echo "[Error] Too many arguments"; help
fi