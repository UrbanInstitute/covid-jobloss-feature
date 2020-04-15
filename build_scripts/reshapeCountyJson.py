import geojson
import json

def bbox(coord_list):
     box = []
     for i in (0,1):
         res = sorted(coord_list, key=lambda x:x[i])
         box.append((res[0][i],res[-1][i]))
     ret = [[box[0][0], box[1][0]], [box[0][1],box[1][1]]]
     return ret

def bbox(coord_list):
     box = []
     for i in (0,1):
         res = sorted(coord_list, key=lambda x:x[i])
         box.append((res[0][i],res[-1][i]))
     ret = [[box[0][0], box[1][0]], [box[0][1],box[1][1]]]
     return ret

with open("data/source/sum_job_loss_county.geojson","r") as f:
	inData = json.load(f)["features"]

outData = {}
for d in inData:
	coords = d["geometry"]["coordinates"]
	fips = d["properties"]["county_fips"]

	# some coordinates are multipolygons (e.g. islands in michigan)
	# for hover polygons, should display full multipolygon, so grab full coords
	# for bounding boxes, bb should be for the largest polygon
		# to improve, could figure out bb of all multipolygons, but on deadline!
	bbs = []
	areas = []
	for coord in coords:
		poly = geojson.Polygon(coord)
		bb = bbox(list(geojson.utils.coords(poly)))
		bbs.append(bb)
	for bb in bbs:
		area = abs(bb[0][0] - bb[1][0])*abs(bb[0][1] - bb[1][1])
		areas.append(area)
		print(area)
	ind = areas.index(max(areas))
	bounds = bbs[ind]
	


	if(fips in outData):
		print(fips)
	else:
		outData[fips] = {"bounds": bounds, "coords": ""}

with open("data/sum_job_loss_county_reshaped.json","w") as f:
	json.dump(outData, f)