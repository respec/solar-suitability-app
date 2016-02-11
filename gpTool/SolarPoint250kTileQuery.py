
# Esri start of added imports
import sys, os, arcpy
# Esri end of added imports

# Esri start of added variables
g_ESRI_variable_1 = u'%scratchGDB%\\test_fast'
g_ESRI_variable_2 = u'%scratchGDB%\\test_hr_fast'
# Esri end of added variables

import arcpy
from arcpy import env
from arcpy.sa import *

arcpy.CheckOutExtension("spatial")

arcpy.env.overwriteOutput = True

pointX = arcpy.GetParameter(0)
pointY = arcpy.GetParameter(1)
filename = arcpy.GetParameter(2)

# New q250k tile scheme
quad = filename[:4]
ras = "\\\\files.umn.edu\\US\\GIS\\U-Spatial\\SolarResourceData\\MN_DSM\\DSM_Tiles_q250k\\q" + quad + "\\" + filename

# Old tile scheme
#ras = "\\\\files.umn.edu\\US\\GIS\\U-Spatial\\SolarResourceData\\MN_DSM\\MN_DSM_Tiles\\" + filename

# dspatial server local drive tile scheme
#ras = "E:\\fishnet_tiles\\" + filename
#output = r'E:\pyGDB\pygdb.gdb\test_fast'
#output_hr = r'E:\pyGDB\pygdb.gdb\test_hr_fast'

output = g_ESRI_variable_1
output_hr = g_ESRI_variable_2

srIn = arcpy.SpatialReference(4326)
srOut = arcpy.SpatialReference(26915)

pointGeometry = arcpy.PointGeometry(arcpy.Point(pointX,pointY),srIn,False,False)
ptGeometry = pointGeometry.projectAs(srOut)

x = ptGeometry.firstPoint.X
y = ptGeometry.firstPoint.Y

arcpy.env.extent = str(x-50) + " " + str(y-50) + " " + str(x+50) + " " + str(y+50)

##point = arcpy.Point(pointX, pointY)
##ptGeometry = arcpy.PointGeometry(point)

timeSetting = arcpy.sa.TimeWholeYear(2014)

arcpy.sa.PointsSolarRadiation(ras,ptGeometry,output,time_configuration=timeSetting,each_interval="INTERVAL",out_direct_duration_features=output_hr)

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

arcpy.SetParameter(3,result)

arcpy.SetParameter(4,result_hr)



