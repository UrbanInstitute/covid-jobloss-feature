import csv
import json

countyReader = csv.reader(open("barTest.csv","r"), delimiter="\t")

countyHeader = next(countyReader)

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
		if key == "GEOID":
			geoid = val
		elif key == "X000":
			total = float(val)
		else:
			vals.append({"k":key,"v": float(val)})
	outData[geoid] = {"t":total, "vs":vals}


with open('data/countyMedian.json', 'wt') as out:
    json.dump(outData, out, sort_keys=True, separators=(',', ':'))

