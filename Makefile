# grunt felt too verbose, gulp's piping felt too magical.
# Makefiles work until I have time to make sense of that shit.

BIN = ./node_modules/.bin
RESUNIQ != cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1

web: clean
	mkdir web_build
	$(BIN)/browserify client/client.jsx --outfile web_build/bundle.$(RESUNIQ).js --debug --extension=.jsx -t [ reactify --es6 ] -t ./esx6ify
	cp client/index.html web_build
	sed -i -e s/@@BUNDLEJS@@/bundle.$(RESUNIQ).js/g web_build/index.html

clean:
	rm -rf web_build

