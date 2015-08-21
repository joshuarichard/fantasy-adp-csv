# fantasy-adp-csv
fantasy-adp-csv is a node app that pulls live espn adp data from tables on their website and saves in a .csv file for analytics with R.

It currently uses ("leverages", if you're so inclined) csv-write-stream, jquery, jsdom@3.0.0, because node jquery only works with jsdom@3.x. There are plans to move away from csv-write-stream as it doesn't seem vital.

Plans for multi-page lookup are in development. See: https://github.com/joshuarichard/fantasy-adp-csv/issues/1

# building
Building's simple. Just run:
```shell
npm install
```

# running
Running's also simple. Just run:
```shell
node app.js
```

# developing
Grunt is also hooked up for developers right now, but all it does is run jshint.