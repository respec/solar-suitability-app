"""
@Title: Solar Point Query Using 250k DSM Tiles (SolarPoint250kTileQuery.py)
@Description: Geoprocessing tool which runs ArcGIS Spatial Analyst's PointsSolarRadiation
on a given point and DSM tile
@Author: Andy Walz <dev@andywalz.com>

@Params: longitude, latitude, DSM Tile Filename
"""

import sys, os, arcpy
from arcpy import env
from arcpy.sa import *

arcpy.CheckOutExtension("spatial")

arcpy.env.overwriteOutput = True

### Parameters supplied by the map click query component in the app
pointX = arcpy.GetParameter(0)      # pointX = -94.6479228437483
pointY = arcpy.GetParameter(1)      # pointY = 45.6275948974094
filename = arcpy.GetParameter(2)    # filename = "3526-11-44_1231.img"

# New q250k tile scheme
quad = filename[:4]
ras = "\\\\files.umn.edu\\US\\GIS\\U-Spatial\\SolarResourceData\\MN_DSM\\DSM_Tiles_q250k\\q" + quad + "\\" + filename

arcpy.env.addOutputsToMap = False

# Set Environment Workspace
arcpy.env.scratchWorkspace = r'C:\Temp'
ws = arcpy.env.scratchGDB

### Insolation and Duration tables
output = os.path.join(ws,"actualInsolation")
output_hr = os.path.join(ws,"sunDuration")

srIn = arcpy.SpatialReference(4326)
srOut = arcpy.SpatialReference(26915)
pointGeometry = arcpy.PointGeometry(arcpy.Point(pointX,pointY),srIn,False,False)
ptGeometry = pointGeometry.projectAs(srOut)
x = ptGeometry.firstPoint.X
y = ptGeometry.firstPoint.Y

### Setup bbox to speed up calculations
arcpy.env.extent = str(x-50) + " " + str(y-50) + " " + str(x+50) + " " + str(y+50)

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

### Clean up time!
arcpy.Delete_management(output)
arcpy.Delete_management(output_hr)


