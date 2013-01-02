import arcpy,os,tempfile

data=[
    {'in':'3','out':'2','source':'S:\\HQ\\Planning\\DataResources\\TransportationProjects\\ProjectData\\BoundaryData.gdb\\HOUSE10','field':'House','fn':'House'},
    {'in':'2','out':'1','source':'S:\\HQ\\Planning\\DataResources\\TransportationProjects\\ProjectData\\BoundaryData.gdb\\SENATE10','field':'Sen','fn':'Senate'},
    {'in':'1','out':'','source':'S:\\HQ\\Planning\\DataResources\\TransportationProjects\\ProjectData\\BoundaryData.gdb\\cong112','field':'Cong','fn':'Congress'}
    ]

def mergeForWeb(ls):
    hwLine = "S:\\HQ\\Planning\\DataResources\\TransportationProjects\\ProjectData\\ProjectExports_Projects.mdb\\Projects_Corridor"
    tLine = "S:\\HQ\\Planning\\DataResources\\TransportationProjects\\ProjectData\\ProjectExports_Projects.mdb\\Projects_MBTACorridor"
    hwPoint="S:\\HQ\\Planning\\DataResources\\TransportationProjects\\ProjectData\\ProjectExports_Projects.mdb\\Projects_BridgeIntersection"
    tPoint="S:\\HQ\\Planning\\DataResources\\TransportationProjects\\ProjectData\\ProjectExports_Projects.mdb\\Projects_MBTAInfrastructure"
    print "creating temp dir"
    temp = tempfile.mkdtemp()
    arcpy.env.workspace=temp
    arcpy.CreateFileGDB_management(temp,"temp.gdb")
    tempgdb=temp+"\\temp.gdb\\"
    print "merging"
    lBase=tempgdb+"line"
    pBase=tempgdb+"pt"
    arcpy.Merge_management([hwLine,tLine],lBase+"3")
    arcpy.Merge_management([hwPoint,tPoint],pBase+"3")
    print "adding fields"
    for d in data:
        sj(lBase+d['in'],d['source'],lBase+d['out'],d['field'],d['fn'])
        sj(pBase+d['in'],d['source'],pBase+d['out'],d['field'],d['fn'])
    print "cleaning fields"
    cleanFields(lBase)
    cleanFields(pBase)
    ofs=["ProjectNumber","ContractNumber","ProjectInfoLink","District","ProjectType","Location","Description","TIPYear","AdvDate","BidOpened","AwardDate","NTPDate","CompletionDate","MaxOfCompletionDate","TIPTotalCost","BidAmt","BidRejected","OfficeEst","SumOfLine_Amount","MaxOfPctComp","BudgetSource","RecentMapChange","Status","Progress","ProjectProgress","Division","Department","House","Senate","Congress"]
    print "exporting"
    arcpy.Dissolve_management(lBase,ls+"\\line",ofs,multi_part="SINGLE_PART")
    arcpy.Dissolve_management(pBase,ls+"\\pt",ofs,multi_part="SINGLE_PART")
    #arcpy.FeatureClassToGeodatabase_conversion([lBase,pBase],ls)


def sj(inf,joinf,outf,fld,fn):
    dIn=arcpy.Describe(inf)
    dJoin=arcpy.Describe(joinf)
    if dJoin.shapeType!="Polygon":
        raise ShapeError("join needs to be a polygon")
    if dIn.shapeType=="Point" or dIn.shapeType=="Polyline":
        temp = tempfile.mkdtemp()
        print "setting up temp dir"
        arcpy.CreateFileGDB_management(temp,"temp.gdb")
        tempgdb=temp+"\\temp.gdb\\"
        print "errasing"
        arcpy.Erase_analysis(inf,joinf,tempgdb+"unk")
        print "splitting"
        arcpy.Split_analysis(inf,joinf,fld,tempgdb)
        ws=arcpy.env.workspace
        arcpy.env.workspace=tempgdb
        shL=arcpy.ListFeatureClasses()
        for fc in shL:
            print "starting on " + fc
            arcpy.AddField_management(fc,fn,"TEXT")
            arcpy.CalculateField_management(fc,fn,"'"+fc+"'","PYTHON")
            print "done with " + fc
        print "merging"
        arcpy.Merge_management(shL,outf)
    else:
        raise ShapeError("input needts to be polyline or point")
 
def cleanFields(inPut):
    rows = arcpy.UpdateCursor(inPut)
    df=[["District","MBTA"],["BudgetSource","MBTA"],["Progress",1],["ProjectProgress","On Time"],["Division",2],["Department","MBTA"]]
    for row in rows:
        for f in df:
            if row.isNull(f[0]):
                row.setValue(f[0],f[1])
        rows.updateRow(row)
    del row 
    del rows
    
        
 
class Error(Exception):
    """Base class for exceptions in this module."""
    pass

class ShapeError(Error):
    """Exception raised for errors in the input's shape.

    Attributes:
        expr -- input expression in which the error occurred
        msg  -- explanation of the error
    """

    def __init__(self, expr, msg):
        self.expr = expr
        self.msg = msg
    

    
mergeForWeb(arcpy.GetParameterAsText(0))
    
#def newMap(in1, in2):
#    fMappings = arcpy.FieldMappings()
#    fMappings.addTable(in1)
#    fMappings.addTable(in2)
#    return fMapping
    
#class fields:
#    def __init__(self,in1,in2):
#        self.first = in1
#        self.second=in2
#        self.mapping=arcpy.FieldMappings()
#        self.mapping.addTable(in1)
#        self.mapping.addTable(in2)
#    def merge(oName,in1,in2=false):
#        fldMap = arcpy.FieldMap()
#        fldMap.addInputField(in1,self.first)
#        if in2:
#            fldMap_streetName.addInputField(in2,self.second)
#        nme = fldMap.outputField
#        nme.name = oName
#        fldMap.outputField = name
#        self.addFieldMap(fldMap)