import geojson
import json

# greabbed bounding box function from here:
# https://gis.stackexchange.com/questions/313011/convert-geojson-object-to-bounding-box-using-python-3-6
def bbox(coord_list):
     box = []
     for i in (0,1):
         res = sorted(coord_list, key=lambda x:x[i])
         box.append((res[0][i],res[-1][i]))
     ret = [[box[0][0], box[1][0]], [box[0][1],box[1][1]]]
     return ret




def reshapeGeojson(geoidType):

    with open("data/source/sum_job_loss_%s.geojson"%geoidType,"r") as f:
        inData = json.load(f)["features"]

    # Use "county" and "cbsa" for filenames and logging, but need "county_fips" to grab the geoid
    # property from the geojson
    geoidKey = "county_fips" if geoidType == "county" else "cbsa"
    #iterate over the features in the geojson
    outData = {}
    for d in inData:
        coords = d["geometry"]["coordinates"]
        geoid = d["properties"][geoidKey]
        properties = d["properties"]

        # some coordinates are multipolygons (e.g. islands in michigan or NC)
        # for bounding boxes, bb should be for the largest polygon
            # to improve, could figure out bb of all multipolygons, although I don't see it being a big issue (see below)

        # note that the majority of these features are single polygons (not multi), so this is a bit of extraneous code
        # could skip most of it w/ a simple length == 1 check. That being said it's plenty fast, so no big deal.
        bboxes = []
        areas = []
        for coord in coords:
        # get the bounding boxes for each polygon in the multipolygon
            poly = geojson.Polygon(coord)
            bb = bbox(list(geojson.utils.coords(poly)))
            bboxes.append(bb)
        for bb in bboxes:
        # for each bounding box calculate the area
            area = abs(bb[0][0] - bb[1][0])*abs(bb[0][1] - bb[1][1])
            areas.append(area)
        ind = areas.index(max(areas))
        
        # this is just a smell test to see if we're alright using the largest polygon in the multipolygon for the bb
        # CBSA
        # There are 15 cbsas where the 2nd largest polygon is > 10% the area of the largest. Kill Devil Hills, NC (off the coast)
        # has the largest such ratio (92%) and works fine with the zoom behavior I've set up. So, I think these bb's are good
        # County
        # There are 32 counties where the 2nd largest polygon is > 10% the area of the largest. Aransas County, TX (off the coast)
        # has the largest such ratio (97%) and works fine with the zoom behavior I've set up. So, I think these bb's are good
        ratios = sorted(list(set(map(lambda a: a / areas[ind], areas) )), reverse=True)
        if(len(ratios) > 1 and ratios[1] > .1):
            print("2nd largest polygon area is %10f percent of largest area in %s %s"%(ratios[1]*100.0, geoidType, geoid))

        # the index of the largest bounding box is the same as the index of the largest area
        bounds = bboxes[ind]
        

        # check for duplicate id's just in case (none exist)
        if(geoid in outData):
            print("Warning: duplicate id found for %s %s"%(geoidType, geoid))
        else:
        # Write the bounding box as well as the properties object to the reshaped geojson, with geoids as
        # keys. The new key/val structure allows for rapid lookups (instead of filtering), the bboxes are used for
        # zooming in, and the properties are used in a few places (e.g. to populate the selected county/cbsa bar charts)
        # when user mouses out the map, with a county/cbsa selected
            outData[geoid] = {"bounds": bounds, "properties": properties}

    with open("data/sum_job_loss_cbsa_reshaped.json","w") as f:
        json.dump(outData, f)


reshapeGeojson("cbsa")
reshapeGeojson("county")