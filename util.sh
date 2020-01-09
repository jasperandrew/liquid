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
	echo "[Info] Building files$in_test..."
	npx babel $js_src -d $js_out
	npx sass $css_src:$css_out
}

clean () {
	echo "[Info] Cleaning files"
	rm *.log
}

help () {
	echo "Jasper's Project Streamline Utility Script"
	echo ""
}

install () {
	echo "[Info] Installing NPM modules..."
    npm -D i $babel $react $sass
	echo $babel_config > .babelrc
}

server () {
	echo "[Info] Starting server$in_test on port $serve_port..."
	trap "kill 0" EXIT
	cd $serve_dir && python3 -m http.server $serve_port > ../util.server.log 2>&1 &
	wait
}

watch () {
	echo "[Info] Watching files for changes$in_test..."
	trap "kill 0" EXIT
	npx babel --verbose -w $js_src -d $js_out > util.babel.log 2>&1 &
	npx sass --watch $css_src:$css_out > util.sass.log 2>&1 &
	wait
}

serverwatch () {
	trap "kill 0" EXIT
	server &
	watch &
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
	case "$1" in
	"build"|"b") build ;;
	"clean"|"c") clean ;;
	"help"|"h") help ;;
	"install"|"i") install ;;
	"server"|"s") server ;;
	"watch"|"w") watch ;;
	"serverwatch"|"sw") serverwatch ;;
	*) echo "[Error] Invalid argument: $1" ;;
	esac
;;

*) echo "[Error] Too many arguments" ;;

esac
