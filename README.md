# MixB
MixB is legacy desktop website for Japanese people in London and other countries.

http://www.mixb.net/

This is a mobile app to optimize the user interface of MixB for small screen. Ionic Framework is awesome for this purpose. It supports iOS and Android in one code base with Apache Cordova (i.e. WebView or in-app browser). It uses AngularJS for clean separation of model and view, namely MV*.

I also use WebStorm as IDE, Karma and Jasmine for unit testing, Bower and NPM for package management, Gulp for build system.


## Setup
    npm install
    bower install
    gulp test
    ionic serve

## Run on Android
    ionic platform add android
    ionic plugin add cordova-plugin-whitelist
    ionic run android --device

## Run on iPhone simulator
    ionic platform add ios
    ionic emulate ios
