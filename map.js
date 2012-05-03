var m,mainLayer;
var zoom = 8;
var center = new google.maps.LatLng(42.04113400940814,-71.795654296875);
var tid = 3772658;

$(function() {
     $( "#tabs" ).tabs({
        	collapsible: true,
            selected: -1
		});
    map();
    popLists();
});

function map(){
            m = new google.maps.Map(document.getElementById('map'), {
      center: center,
      zoom: zoom,
      mapTypeId: 'roadmap'
    });
     mainLayer = new google.maps.FusionTablesLayer(tid);
     mainLayer.setQuery("SELECT 'geometry' FROM " + tid);
      mainLayer.setMap(m);
}

function popLists(){    
    MakePopList('Cong',getCongData);
   MakePopList('Status',getStatusData);
    }
 google.load('visualization', '1', {});
function MakePopList(columnName,callfunc){
 var queryText = encodeURIComponent("SELECT " +columnName + ", COUNT() FROM " + tid + " GROUP BY " +columnName);
    var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq='  + queryText);
    query.send(callfunc);
    }
    
    var getCongData = MakeData("cong"," 'Cong' like '");
    var getStatusData = MakeData("status"," 'Status' like '");
    function MakeData(selectID,querryText){

function getData(response) {
  // Get the number of rows
var numRows = response.getDataTable().getNumberOfRows();
  
  // Add options to the select menu based on the results
 var typeSelect = document.getElementById(selectID);  
  for(i = 0; i < numRows; i++) {
      var ftData = response.getDataTable().getValue(i, 0);
      if (!ftData)
     { continue;}
    
     else
     { var newoption = document.createElement('option');
      newoption.setAttribute('value',querryText + ftData + "'");
    newoption.innerHTML = ftData;
    typeSelect.appendChild(newoption);}
  }  
}
return getData;
}   

function changeMap() {
var cong = document.getElementById('cong').value.replace("'", "\\'");
 var status = document.getElementById('status').value.replace("'", "\\'");
 var andz = " and ";
 if(cong === "" ||status === "")
 {andz = "";}
  mainLayer.setQuery("SELECT 'geometry' FROM " + tid + " WHERE " + cong + andz + status);
 
}