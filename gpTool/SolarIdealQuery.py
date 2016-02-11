import arcpy
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

### New q250k tile scheme
quad = filename[:4]
ras = "\\\\files.umn.edu\\US\\GIS\\U-Spatial\\SolarResourceData\\MN_DSM\\DSM_Tiles_q250k\\q" + quad + "\\" + filename

arcpy.env.addOutputsToMap = False
#arcpy.env.workspace = r'C:\Temp\temp.gdb'

arcpy.env.workspace = "\\\\files.umn.edu\\US\\GIS\\U-Spatial\\SolarResourceData\\gpTool\\SolarPointQuery.gdb"

in_name = 'inTable'
out_name = 'outTable'
output = arcpy.env.workspace + "\\" + out_name
inTable = arcpy.env.workspace + "\\" + in_name

### Create a Table to Store input point and ideal tilt/azimuth
arcpy.CreateTable_management(arcpy.env.workspace, in_name)

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

##point = arcpy.Point(pointX, pointY)
##ptGeometry = arcpy.PointGeometry(point)

timeSetting = arcpy.sa.TimeWholeYear(2014)
#timeSetting = arcpy.sa.TimeSpecialDays()

#arcpy.sa.PointsSolarRadiation(ras,ptGeometry,output,time_configuration=timeSetting,each_interval="INTERVAL",out_direct_duration_features=output_hr)
arcpy.sa.PointsSolarRadiation(ras,inTable,output,time_configuration=timeSetting,each_interval="INTERVAL",slope_aspect_input_type="FROM_POINTS_TABLE")

#row = arcpy.SearchCursor(output).next()

#result = ""

#for i in range(0,12):
# id = "T"+str(i)
# result = str(result) + str(row.getValue(id)) + "\n"

#print result


