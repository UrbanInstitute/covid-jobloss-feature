import csv

cr = csv.reader(open("co-est2019-alldata.csv",encoding = "ISO-8859-1"))

head = next(cr)

cnames = []
for row in cr:
	cnames.append((row[6] + " " + row[5]).upper().replace("COUNTY","").replace("CITY","").strip())

# print(cnames)

dupes = []
for n in cnames:
	if(n in dupes):
		print(n)
	dupes.append(n)
