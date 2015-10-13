#!/usr/bin/env bash

# Install nodejs, yay for blindly executing remote content \o/
wget https://deb.nodesource.com/setup_0.12 -O- | bash -
#wget https://deb.nodesource.com/setup_4.x -O- | bash - #TODO precise g++ is outdated for 4.x, spin up another box for 4.x
apt-get install -y nodejs

# Install shared deps
apt-get install -y build-essential

# Install rtorrent deps
apt-get install -y git subversion wget curl libsigc++-2.0-dev libssl-dev libncurses-dev libncursesw5-dev locales libcppunit-dev autoconf automake libtool libxml2-dev libxslt1-dev libcurl3-dev unzip unrar-free

# Setup arrtorrent
cd /vagrant
npm install
cp config/arrtorrent.example.js config/arrtorrent.js
./config/ssl_setup
./grunt dev # Initial build

# Install XMLRPC
mkdir /tmp/xmlrpc
cd /tmp/xmlrpc
svn checkout http://svn.code.sf.net/p/xmlrpc-c/code/stable ./ # This feels so filthy, why are people still on SF?
./configure
make
make install

# Install libtorrent
cd /tmp
wget https://github.com/rakshasa/libtorrent/archive/0.13.6.zip -O libtorrent.zip
unzip libtorrent.zip
cd libtorrent-*
./autogen.sh
./configure
make
make install

# Install rtorrent
cd /tmp
wget https://github.com/rakshasa/rtorrent/archive/0.9.6.zip -O rtorrent.zip
unzip rtorrent.zip
cd rtorrent-*
./autogen.sh
./configure --with-xmlrpc-c
make
make install
ldconfig

# Configure rtorrent
wget https://raw.githubusercontent.com/rakshasa/rtorrent/master/doc/rtorrent.rc -O ~vagrant/.rtorrent.rc
echo 'scgi_local = /tmp/rtorrent.sock' >> ~vagrant/.rtorrent.rc

# Cleanup
chown vagrant:vagrant -R /vagrant ~vagrant
rm -rf /tmp/libtorrent* /tmp/rtorrent* /tmp/xmlrpc*

