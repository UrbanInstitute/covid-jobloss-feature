#!/bin/sh

### Shell script to download data files from S3

curl -O https://ui-lodes-job-change-public.s3.amazonaws.com/reshaped/sum_job_loss_us.json

curl -O https://ui-lodes-job-change-public.s3.amazonaws.com/reshaped/sum_job_loss_county_reshaped.json

curl -O https://ui-lodes-job-change-public.s3.amazonaws.com/reshaped/sum_job_loss_cbsa_reshaped.json
