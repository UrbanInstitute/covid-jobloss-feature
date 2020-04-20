import csv
import json

countyReader = csv.reader(open("data/source/sum_job_loss_us.csv","r"), delimiter=",")

countyHeader = next(countyReader)

# a convenience function to map column header names to row indices
def rowToObject(rowList, header):
	rowObj = {}
	for i in range(0, len(rowList)):
		rowObj[header[i]] = rowList[i]
	return rowObj

outData = {}
for rowList in countyReader:
	row = rowToObject(rowList, countyHeader)

	vals = []
	geoid = ""
	total = 0

	for (key,val) in row.items():
		# there's a single GEOID in the output json (99)
		if key == "GEOID":
			geoid = val
		# seperate out the total val, since that won't end up on the bar chart
		elif key == "X000":
			total = float(val)
		# otherwise make an object that's formatted nicely for d3. Note I'm using short key names here
		# this is a bit of a relic when I was testing out if I could pull ALL geojson in from a static file (now it's)
		# bound to mapbox data. But no reason not to keep as-is.
		else:
			vals.append({"k":key,"v": float(val)})
	outData[geoid] = {"t":total, "vs":vals}


with open('data/sum_job_loss_us.json', 'wt') as out:
    json.dump(outData, out, sort_keys=True, separators=(',', ':'))

