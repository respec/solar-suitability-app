import sys, os, arcpy
from arcpy import env
from arcpy.sa import *

arcpy.CheckOutExtension("spatial")

arcpy.env.overwriteOutput = True

### Parameters supplied by the map click query component in the app
pointX = arcpy.GetParameter(0)   # pointx = -94.6479228437483
pointY = arcpy.GetParameter(1)		# pointy = 45.6275948974094
filename = arcpy.GetParameter(2)	# filename = "3526-11-44_1231.img"

### Sample data for testing
#pointX = -94.6479228437483
#pointY = 45.6275948974094
#filename = "3526-11-44_1231.img"

#import pdb; pdb.set_trace()  # debug if need be

### New q250k tile scheme
quad = filename[:4]
ras = "\\\\files.umn.edu\\US\\GIS\\U-Spatial\\SolarResourceData\\MN_DSM\\DSM_Tiles_q250k\\q" + quad + "\\" + filename

arcpy.env.addOutputsToMap = False

# Set Environment Workspace
arcpy.env.scratchWorkspace = r'C:\Temp'
ws = arcpy.env.scratchGDB
#ws = "\\\\files.umn.edu\\US\\GIS\\U-Spatial\\SolarResourceData\\gpTool\\ideal\\results.gdb"

### Insolation and Duration tables
output = os.path.join(ws,"actualInsolation")
output_hr = os.path.join(ws,"sunDuration")

### Ideal shading tables
in_name = 'inTable'
out_name = 'idealTotal'
outputIdeal = os.path.join(ws,out_name)
inTable = os.path.join(ws,in_name)
outputDirect = os.path.join(ws,"idealDirect")
#outputDiffuse = os.path.join(ws,"idealDiffuse")

### Create a Table to Store input point and ideal tilt/azimuth
arcpy.CreateTable_management(ws, in_name)

### Add fields
arcpy.AddField_management(inTable, "x", "FLOAT")
arcpy.AddField_management(inTable, "y", "FLOAT")
arcpy.AddField_management(inTable, "slope", "FLOAT")
arcpy.AddField_management(inTable, "aspect", "FLOAT")

### Make a tuple of fields to update
fieldsToUpdate = ("x", "y", "slope", "aspect")

### Convert lat/lng to UTM 15n
srIn = arcpy.SpatialReference(4326)
srOut = arcpy.SpatialReference(26915)
pointGeometry = arcpy.PointGeometry(arcpy.Point(pointX,pointY),srIn,False,False)
ptGeometry = pointGeometry.projectAs(srOut)
x = ptGeometry.firstPoint.X
y = ptGeometry.firstPoint.Y

### Setup bbox to speed up calculations
arcpy.env.extent = str(x-50) + " " + str(y-50) + " " + str(x+50) + " " + str(y+50)

### Write the UTM coords to the input table along with ideal tilt/azimuth
cursor = arcpy.da.InsertCursor(inTable, fieldsToUpdate)
cursor.insertRow((x,y,45,180))
del cursor

timeSetting = arcpy.sa.TimeWholeYear(2014)
#timeSetting = arcpy.sa.TimeSpecialDays()

arcpy.sa.PointsSolarRadiation(ras,ptGeometry,output,time_configuration=timeSetting,each_interval="INTERVAL",out_direct_duration_features=output_hr)
arcpy.sa.PointsSolarRadiation(ras,inTable,outputIdeal,time_configuration=timeSetting,each_interval="INTERVAL",slope_aspect_input_type="FROM_POINTS_TABLE",out_direct_radiation_features=outputDirect)

row = arcpy.SearchCursor(output).next()
result = ""
for i in range(0,12):
    id = "T"+str(i)
    result = str(result) + str(row.getValue(id)) + "\n"

row = arcpy.SearchCursor(output_hr).next()
result_hr = ""
for i in range(0,12):
    id = "T"+str(i)
    result_hr = str(result_hr) + str(row.getValue(id)) + "\n"

row = arcpy.SearchCursor(outputIdeal).next()
result_ideal = ""
for i in range(0,12):
    id = "T"+str(i)
    result_ideal = str(result_ideal) + str(row.getValue(id)) + "\n"

arcpy.SetParameter(3,result)
#print result
arcpy.SetParameter(4,result_hr)
#print result_hr
arcpy.SetParameter(5,result_ideal)
#print result_ideal

### Clean up time!
arcpy.Delete_management(output)
arcpy.Delete_management(output_hr)
arcpy.Delete_management(outputDirect)
arcpy.Delete_management(outputIdeal)
arcpy.Delete_management(inTable)
