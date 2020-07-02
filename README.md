# Where Low-Income Jobs Are Being Lost to COVID-19

This repo contains the code needed to generate the interactive feature on the number of low-income jobs lost to COVID-19 in every tract in the US. It ingests the output from the [covid-neighborhood-job-analysis](https://github.com/UrbanInstitute/covid-neighborhood-job-analysis) repo and uses those files to populate the interactive map and lollipop chart found [here](https://www.urban.org/features/where-low-income-jobs-are-being-lost-covid-19).

## How to update:

1. Check if the scale break points need to change
    - Review the bin width histograms [here](http://apps.urban.org/features/covid-jobloss-feature/breakpoints.html) to make sure the top bin contains the max value and is a nice round number
    - If anything needs to be changed, let Ajjit know to update the data json files with the new breakpoints

2. Update the three json files (`sum_job_loss_cbsa_reshaped.json`, `sum_job_loss_county_reshaped.json`, `sum_job_loss_us.json`) in `data/`
    - Run `downloadData.sh` from within `data/` to pull these files from S3 into the `data/` directory
    - Push the files to the production server

3. Check if the overall national scale max value for the lollipop charts needs to change
    - If so, update the value in line 13 of `main.js`

4. Update the Mapbox tiles for the map
    - Run `makeMaptiles.sh` from within `build_scripts/`
        - This will pull the new geojson files from S3 and add a top level id property for each feature. Then, it will convert the geojson files into mbtile tilesets for use in Mapbox via `tippecanoe`. Three output files are created:
            - `cbsas_id.mbtiles`
            - `counties_id.mbtiles`
            - `out.mbtiles` (this is the tileset for census tracts)
        - After the new .mbtiles files are generated, they will need to be uploaded to [Mapbox](https://studio.mapbox.com/tilesets/)
            - `cbsas_id.mbtiles` should be uploaded to this tileset: cbsas_with_id-d4ld8q
            - `counties_id.mbtiles` should be uploaded to this tileset: counties_new-2ynusr
            - `out.mbtiles` should be uploaded to this tileset: tracts-7tqd4h
