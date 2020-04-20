#!/bin/sh

### Shell script to prepare Mapbox tiles from data

### First, add an "id" as a top level property for each feature
### Second, convert the geojson with the ids into a mbtiles set that can be uploaded to Mapbox

### This process is repeated for both the CBSA and County datasets
### For the tracts dataset, only the conversion to mbtiles is needed

### Library requirements:
### ndjson-cli
### tippecanoe


### CBSA data:
# remove all line breaks from the geojson so we can use ndjson-split and add id as a top level property
cat sum_job_loss_cbsa.geojson | tr '\n' ' ' > cbsa_no_linebreaks.geojson

# turn the geojson into a newline-delimited json
ndjson-split 'd.features' < cbsa_no_linebreaks.geojson > sum_job_loss_cbsa.ndjson

# add id to each feature from its properties
ndjson-map 'd.id = +d.properties.cbsa, d' \
  < sum_job_loss_cbsa.ndjson \
  > sum_job_loss_cbsa-id.ndjson

# convert back to geojson
ndjson-reduce \
  < sum_job_loss_cbsa-id.ndjson \
  | ndjson-map '{type: "FeatureCollection", features: d}' \
  > sum_job_loss_cbsa-id.json

# convert geojson into mbtiles using tippecanoe for mapbox
tippecanoe -pk -pn -f -ps -o cbsas_id.mbtiles -Z3 -z12 sum_job_loss_cbsa-id.json


### County data:
# remove all line breaks from the geojson so we can use ndjson-split and add id as a top level property
cat sum_job_loss_county.geojson | tr '\n' ' ' > county_no_linebreaks.geojson

# turn the geojson into a newline-delimited json
ndjson-split 'd.features' < county_no_linebreaks.geojson > sum_job_loss_county.ndjson

# add id to each feature from its properties
ndjson-map 'd.id = +d.properties.county_fips, d' \
  < sum_job_loss_county.ndjson \
  > sum_job_loss_county-id.ndjson

# convert back to geojson
ndjson-reduce \
  < sum_job_loss_county-id.ndjson \
  | ndjson-map '{type: "FeatureCollection", features: d}' \
  > sum_job_loss_county-id.json


# convert geojson into mbtiles using tippecanoe for mapbox
tippecanoe -pk -pn -f -ps -o counties_id.mbtiles -Z3 -z12 sum_job_loss_county-id.json


### Tracts data:
# convert geojson into mbtiles using tippecanoe for mapbox
tippecanoe -f -z12 -Z3 -o out.mbtiles --coalesce-densest-as-needed job_loss_by_tract.geojson