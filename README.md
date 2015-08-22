# fantasy-adp-csv
fantasy-adp-csv is a node app that pulls live espn adp data from tables on their website and saves in a .csv file for analytics with R.

It currently uses ("leverages", if you're so inclined) csv-write-stream, jquery, jsdom@3.0.0, because node jquery only works with anything below jsdom@4.0.

Plans for multi-page lookup are in development. See: https://github.com/joshuarichard/fantasy-adp-csv/issues/1

# Building
Building's simple. Just run:
```shell
npm install
```

# Running
Running's also simple. Just run:
```shell
node app.js
```

# Developing
Grunt is also hooked up for developers right now, but all it does is run jshint.
