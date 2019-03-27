#!/bin/bash

#--------------------------------------------#
#               Some variables               #
#--------------------------------------------#

# packages to install
babel="@babel/core @babel/cli @babel/preset-env"
react="react react-dom @babel/preset-react"
sass="sass"

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
serve_port="7777"

# test environment
in_test=""

#--------------------------------------------#
#               Some functions               #
#--------------------------------------------#

build () {
	echo "[Info] Building files$in_test...\n"
	npx babel $js_src -d $js_out
	npx sass $css_src:$css_out
}

help () {
	echo "Jasper's Project Streamline Utility Script"
	echo ""
}

install () {
	echo "[Info] Installing NPM modules...\n"
    npm -D i $babel $react $sass
	echo $babel_config > .babelrc
}

server () {
	echo "[Info] Starting server$in_test...\n"
	trap "kill 0" EXIT
	cd $serve_dir && python3 -m http.server $serve_port
	wait
}

start () {
	echo -e "[Info] Watching files and starting HTTP server$in_test...\n"
	trap "kill 0" EXIT
	cd $serve_dir && python3 -m http.server $serve_port &> /dev/null &
	npx babel --verbose -w $js_src -d $js_out &
	npx sass --watch $css_src:$css_out &
	wait
}

watch () {
	echo "[Info] Watching files$in_test...\n"
	trap "kill 0" EXIT
	npx babel --verbose -w $js_src -d $js_out &
	npx sass --watch $css_src:$css_out &
	wait
}

#--------------------------------------------#
#          Actually doing stuff now          #
#--------------------------------------------#

case "$#" in

0) help ;;

2)
	if [[ $2 == "test" ]]; then
		js_src="src/test/jsx/"
		js_out="docs/test/scripts/"
		css_src="src/test/sass/"
		css_out="docs/test/styles/"
		serve_dir="docs/test/"
		in_test=" in test environment"

	else echo "[Error] Invalid argument: $2"
	fi
;&

1)
	if [[ $1 == "build" ]]; then build
	elif [[ $1 == "help" ]]; then help
	elif [[ $1 == "install" ]]; then install
	elif [[ $1 == "server" ]]; then server
	elif [[ $1 == "start" ]]; then start
	elif [[ $1 == "watch" ]]; then watch
	else echo "[Error] Invalid argument: $1"
	fi
;;

*) echo "[Error] Too many arguments" ;;

esac
