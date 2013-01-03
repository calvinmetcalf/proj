var dd;
//set the options
var toGeo = communist();
toGeo.add("toGeo",toGeoJSON);
var m= L.map('map').setView([42.3584308,-71.0597732], 8);
new L.Hash(m);
var mapQuestAttr = 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ';
var osmDataAttr = 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
var opt = {
    url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpeg',
    urla: 'http://oatile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpeg',
    options: {attribution:mapQuestAttr + osmDataAttr, subdomains:'1234'}
  };
var mq=L.tileLayer(opt.url,opt.options);
mq.addTo(m);


var ac;
var sw=0;

//create the tiles    

//create the map

    var g = L.layerGroup().addTo(m);
var gl =   L.geoJson({ "type": "FeatureCollection",  "features": []},{pointToLayer:pl,onEachFeature:gjon,filter:filterFunc});
var gp =   L.geoJson({ "type": "FeatureCollection",  "features": []},{pointToLayer:pl,onEachFeature:gjon,filter:filterFunc});
var lu= L.geoJson({ "type": "FeatureCollection",  "features": []},{pointToLayer:pl,onEachFeature:luon}).addTo(m);

function luon(e,l) {
    if (e.properties){
        l.bindPopup(makePop(e.properties));
    }if(l.setStyles){
     l.setStyle({color:"#0000ff",fillOpacity:1,opacity:1});   
    }
}
function filterFunc(feature, layer){
    return "Status" in feature.properties;
}
//create empty geojson object and add it to the map

//create the popups
function gjon(e,l) {
    if (e.properties){
        l.bindPopup(makePop(e.properties));
    }if(e.properties.Status&&l.setRadius){
          if(e.properties.Status=="Completed"){
        l.setStyle({color:"#000",fillColor:"#0000ff",fillOpacity:0.8,opacity:1,weight:1});   
       }else if(e.properties.Status=="Active"){
        l.setStyle({color:"#000",fillColor:"#ff0000",fillOpacity:0.8,opacity:1,weight:1});   
       }else{
        l.setStyle({color:"#000",fillColor:"#00ff00",fillOpacity:0.8,opacity:1,weight:1});   
       }
    }else if(e.properties.Status&&l.setStyle){
        
       if(e.properties.Status=="Completed"){
        l.setStyle({color:"#0000ff",fillOpacity:0.8,opacity:1});   
       }else if(e.properties.Status=="Active"){
        l.setStyle({color:"#ff0000",fillOpacity:0.8,opacity:1});   
       }else{
        l.setStyle({color:"#00ff00",fillOpacity:0.8,opacity:1});   
       }
    
    }
}
setStatuses();
/*var icon={
    red:L.icon({iconUrl:"img/red.png",iconSize: L.point(9, 9)}),
    yellow:L.icon({iconUrl:"img/yellow.png",iconSize:  L.point(9, 9)}),
    green:L.icon({iconUrl:"img/green.png",iconSize:  L.point(9, 9)})
}*/
//get the current bounds
//the url. note we're only getting a subset of fields
var url = {};
url.line = "http://services.massdot.state.ma.us/ArcGIS/rest/services/Projects/Project_Lines/MapServer/0/query?";
url.point = "http://services.massdot.state.ma.us/ArcGIS/rest/services/Projects/Project_Points/MapServer/0/query?";
url.fields="ProjectNumber,District,Location,ProjectType,CompletionDate,BudgetSource,Department,Status,House,Senate,Congress";
url.where={};
url.setW=function(k,v){
 url.where[k]=v;   
};
url.rmW=function(k){
    if(typeof k === "string"){
    delete url.where[k];
    }else{
        var len = k.length;
        var i = 0;
        while(i<len){
        if(url.where[k[i]]){
            delete url.where[k[i]];
        }
        i++;
        }
    }
};
url.getW=function(){
    var a = [];
 for(var k in url.where){
     a.push(k+"%3D%27"+url.where[k]+"%27");
 }
 return a.join("%20AND%20");
};
url.end = "&f=json";
/*
the following isn't really neccisary at the moment but might be helpful latter
*/
url.spacial={
    base:"&outSR=4326&inSR=4326&geometryType=",
    sq:"esriGeometryEnvelope&geometry=",
    getBBox:function(){url.spacial.bbox="-76.1627197265625,40.052847601823984,-65.9564208984375,44.57873024377564";},//m.getBounds().toBBoxString();},
    getSpatial:function(){
      
     return url.spacial.base+url.spacial.sq+url.spacial.bbox;
    }
    };
url.spacial.getBBox();
//get the features
getLayers();
//this is the call back from the jsonp ajax request
function parseLine(data){
/*you'd think you'd want to put the command to clear the old layer here instead of after zooming, but the markers are not not visible when you zoom, so it ends up being much less noticeable clearing them earlier*/
toGeo.send("toGeo",data,function(e,d){gl.addData(d);g.addLayer(gl).addLayer(gp);});
makeAuto(data);
}
function parsePoint(data){
/*you'd think you'd want to put the command to clear the old layer here instead of after zooming, but the markers are not not visible when you zoom, so it ends up being much less noticeable clearing them earlier*/
toGeo.send("toGeo",data,function(e,d){gp.addData(d)});
makeAuto(data);
}
/*set up listeners on both drag and zoom events
m.on("dragend",redo);
m.on("zoomend",redo);
the function called by those event listeners*/
function redo(){

     g.clearLayers();
    gl.clearLayers();
    gp.clearLayers();//clear the current layers
   getLayers();//ajax request
}
//the function called earlier to make the popup, it goes through all the attributes and makes them into a nice key value list
function makePop(p){
var a = [];
function up(word){return word.substring(0,1).toUpperCase()+word.substring(1);}
for(var key in p){
     if (key!=="Progress"){
         if (key==="CompletionDate"){
             var d =  new Date(parseInt(p[key], 10));
            a.push(key.replace(/(([a-z])([A-Z]))/g,"$2 $3")+": "+ d.toDateString());
             }else if(key==="Location"||key==="ProjectType"){
                 var lower = p[key].toLowerCase();
                 var loc = lower.replace(/\b\w+\b/g,up);
                 a.push(key.replace(/(([a-z])([A-Z]))/g,"$2 $3")+": "+loc);
                 }else{
         var value;
         if (["House","Senate","Congress"].indexOf(key.replace(/(([a-z])([A-Z]))/g,"$2 $3")) >= 0){
             value = p[key].replace(/([A-Z])/g," $1").slice(1);
         }else {
             value = p[key];
         }
     a.push(key.replace(/(([a-z])([A-Z]))/g,"$2 $3")+": "+value);
         }
     }
 }
 return a.join("<br/>");
}
function getLayers(){
    ac={};
    toGeo.send("toGeo",url.point+"outFields="+url.fields+"&where="+url.getW()+url.end+url.spacial.getSpatial(),function(e,d){
        gp.addData(d);
        makeAuto(d);
    });
    toGeo.send("toGeo",url.line+"outFields="+url.fields+"&where="+url.getW()+url.end+url.spacial.getSpatial(),function(e,d){
        gl.addData(d);g.addLayer(gl).addLayer(gp);
         makeAuto(d);
    });
}
function pl(f,latlng){
    return L.circleMarker(latlng,{radius:4});
}
$(function() {
        $( "#tabs" ).tabs({
        collapsible: true,
            selected: -1
        });
       $( "input:submit,input:reset" ).button();
        $('input, textarea').placeholder();
});
var marker = new L.Marker();
var old={};
function geocode(){
    old.center=m.getCenter();
    old.zoom=m.getZoom();
 var address =$("#address").val();
 var gURL = 'http://open.mapquestapi.com/nominatim/v1/search?countrycodes=us&exclude_place_ids=955483008,950010827&viewbox=-76.212158203125%2C44.46123053905882%2C-66.005859375%2C40.107487419012415&bounded=1&format=json&q=';
  $.ajax({
       type: "GET",
       url: gURL + address,
       dataType: 'jsonp',
       jsonp: 'json_callback',
       success: function (data, textStatus) {
           if(textStatus=="success"){
          var latlng = new L.LatLng(data[0].lat, data[0].lon);
         marker.setLatLng(latlng);
        
         m.addLayer(marker);
         m.setView(latlng,17);
      
           }
       }
  });
  return false;
}

function resetgeo(){
    m.removeLayer(marker);
    m.setView(old.center, old.zoom);
}
$("#geocoder").submit(geocode);
$("#resetgeo").click(resetgeo);
$("#getStatus").change(function(){
      var val = $("#getStatus").val();
      if(val===""){
        url.rmW("Status");
      }else{
        url.setW("Status",val);
      }
      redo();
    });
$("#getDi").change(function(){
      var val = $("#getDi").val();
      if(val===""){
        url.rmW("Department");
      }else{
        url.setW("Department",val); 
      }
      redo();
    });
function makeAuto(d){
   var f= d.features;
   var len = d.features.length;
   var i = 0;
   dd=[];
   while(i<len){
       dd.push({House:f[i].properties.House,Senate:f[i].properties.Senate,Congress:f[i].properties.Congress});
       if(!ac[f[i].properties.ProjectNumber]){
       ac[f[i].properties.ProjectNumber]=d.geometryType;
       }
       i++;
    }
if(sw===0){sw++;}else if(sw===1){
    sw--;
    var a=[];
    for(var k in ac){
     a.push(k);   
    }
    
$("#ProjNum").autocomplete({source:a});
}
}
$("#ProjLookUp").submit(lookUp);
var b;
function lookUp(){
    b= [m.getCenter(),m.getZoom()];
    var t= {esriGeometryPoint:"point",esriGeometryPolyline:"line"};
    var v=$("#ProjNum").val();
    $.get(url[t[ac[v]]]+"outFields="+url.fields+"&where=ProjectNumber%3D%27"+v+"%27"+url.end+url.spacial.getSpatial(),parseLookUp,"JSONP");
    function parseLookUp(data){
        toGeo.send("toGeo",data,function(e,d){
            lu.addData(d);
            m.fitBounds(lu.getBounds());
            });
    }
   
return false;
}
$("#ProjReset").click(function(){
    lu.clearLayers();
    m.setView(b[0],b[1]);
    });
function setStatuses(){
var statuses = ["Active","Advertised with a Bid", "Advertised without a Bid", "Completed", "Future", "Scheduled to be Advertised"];
var len = statuses.length;
var i = 0;
while(i<len){
 $("#getStatus").append("<option value='"+ statuses[i]+"'>"+statuses[i]+"</option>");
 i++;
}
}
(function(){
    (function(){
        var chambers = ["House","Senate","Congress"];
        var frag = document.createDocumentFragment();
        var sel = document.createElement("select");
        sel.id="getCham";
        var makeOpt = function(v,tx){
          var opt = document.createElement("option");  
          opt.value=v;
          opt.innerHTML=tx;
         sel.appendChild(opt); 
        };
    
        makeOpt("All","Pick a Chamber");
        var len = chambers.length;
        var i = 0;
        while(i<len){
            makeOpt(chambers[i],chambers[i]);
            i++;
        }
        frag.appendChild(sel);
        var qDiv = document.getElementById("query");
        qDiv.appendChild(frag);
    }());
(function(){
    var sel = $("#getCham");
    toGeo.add("getHouses",function(chamber,data){
        var out = [];
        var len = data.length;
        var i = 0;
        while(i<len){
            var rep = data[i][chamber];
            if(out.indexOf(rep)==-1){
            out.push(rep);
            }
            i++;
        }
        out.sort();
        return out;
    });
    $("#query").on("change","#getRep",function(){
        var val = $("#getRep").val();
        if(val==="All"){
            url.rmW(sel.val());
        }else{
            url.setW(sel.val(),val);
        }
         redo();
    });
    sel.change(function(){
        var oDiv = document.getElementById("getRep");
        url.rmW(["House","Senate","Congress"]);
        if(oDiv){
            oDiv.parentNode.removeChild(oDiv);
        }
        if(sel.val()!=="All"){
            toGeo.send("getHouses",sel.val(),dd,function(err,data){
                var len = data.length;
                var i = 0;
                var frag = document.createDocumentFragment();
                var selc = document.createElement("select");
                selc.id="getRep";
                var makeOpt = function(v,tx){
          var opt = document.createElement("option");  
          opt.value=v;
          opt.innerHTML=tx;
         selc.appendChild(opt); 
        };
        makeOpt("All","Select A Rep");
                while(i<len){
                    makeOpt(data[i],data[i].replace(/((?!^)([A-Z]))/g," $2"));
                i++;
                }
                frag.appendChild(selc);
                var qDiv = document.getElementById("query");
        qDiv.appendChild(frag);
            });
        }
    })
}())
}())

