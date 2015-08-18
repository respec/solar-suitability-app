import arcpy

arcpy.env.overwriteOutput = True

pointX = arcpy.GetParameter(0)
pointY = arcpy.GetParameter(1)
filename = arcpy.GetParameter(2)
ras = "E:\\fishnet_tiles\\" + filename
output = r'E:\pyGDB\pygdb.gdb\test_fast'
output_hr = r'E:\pyGDB\pygdb.gdb\test_hr_fast'

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
