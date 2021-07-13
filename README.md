# Where Low-Income Jobs Are Being Lost to COVID-19

This repo contains the code needed to generate the interactive feature on the number of low-income jobs lost to COVID-19 in every tract in the US. It ingests the output from the [covid-neighborhood-job-analysis](https://github.com/UrbanInstitute/covid-neighborhood-job-analysis) repo and uses those files to populate the interactive map and lollipop chart found [here](https://www.urban.org/features/where-low-income-jobs-are-being-lost-covid-19).

## How to update:
1. The process will start the morning of the update in the #covid-job-loss-tech Slack room.
1. The map has different color scales depening on which view it's on. When zoomed out it shows either county or metro area [CBSA](https://www.census.gov/topics/housing/housing-patterns/about/core-based-statistical-areas.html). When zoomed in, it shows census tracts. The research team manually sets the color scale breakpoints each update. Check if the scale break points need to change
    - Review the bin width histograms [here](http://apps.urban.org/features/covid-jobloss-feature/breakpoints.html) to make sure the top bin contains the max value and is a nice round number
    - If anything needs to be changed, let Ajjit know to update the data json files with the new breakpoints
    - No other action needed, the legend and map will update automatically from the new files.
    - Note that as the pace of jobloss has slowed in recent months, we usually don't need to change the breakpoints at all.
3. You'll need to install a few command line utilities, namely [ndjson-cli](https://github.com/mbostock/ndjson-cli) for working with newline delimited json files, and [tippecanoe](https://github.com/mapbox/tippecanoe) for converting the geojsons into mapbox-ready `.mbtiles` files.
4. Update the Mapbox tiles for the map
    - Run `makeMaptiles.sh` from within `build_scripts/`
        - This will pull the new geojson files from S3 and add a top level id property for each feature. Then, it will convert the geojson files into mbtile tilesets for use in Mapbox via `tippecanoe`. Three output files are created:
            - `cbsas_id.mbtiles`
            - `counties_id.mbtiles`
            - `out.mbtiles` (this is the tileset for census tracts)
        - After the new .mbtiles files are generated, they will need to be uploaded to [Mapbox](https://studio.mapbox.com/tilesets/)
            - Find each tileset by the below id's, then from the 3-dot menu select `Replace` and replace with the below files.
                - `cbsas_id.mbtiles` should be uploaded to this tileset: cbsas_with_id-d4ld8q
                - `counties_id.mbtiles` should be uploaded to this tileset: counties_new-2ynusr
                - `out.mbtiles` should be uploaded to this tileset: tracts-7tqd4h
    - NOTE: as soon as you upload these files, the data that powers the live graphic will be updated (no staging server exists for Mapbox). It can take a while (30 mins?) for Mapbox's internal caches to clear, and the data to show up on the map.
5. Update the last updated date on the [urban.org feature](https://edit.urban.org/features/where-low-income-jobs-are-being-lost-covid-19)
7. Check if the overall national scale max value for the lollipop charts needs to change (that is the maximum value for the x axis, on page load). If it needs to change, the chart will look broken (the largest lollipop dot will not show up or be cut off). 
    - If so, update the hard-coded value in line 13 of `main.js`
    - As with the color scales, as jobloss rates have slowed, this number hasn't had to change in recent months.
8. Update the three json files (`sum_job_loss_cbsa_reshaped.json`, `sum_job_loss_county_reshaped.json`, `sum_job_loss_us.json`) in `data/`
    - Run `downloadData.sh` from within `data/` to download these files from S3 into the `data/` directory
    - Push the files to GitHub, then pulll them to the production server. Note that once you do this
    - NOTE: once you pull these to prod, the lollipop chart should be live. 
