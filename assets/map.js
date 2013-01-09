var m = L.map('map').setView([42.2, -71], 8).hash();
var baseMaps = [
    "MapQuestOpen.OSM",
    "OpenStreetMap.Mapnik",
    "OpenStreetMap.DE",
    "Esri.WorldImagery",
    "Stamen.TerrainBackground",
    "Stamen.Watercolor"
];
var values={},state={};
var pointurl = location.protocol+"//"+location.host+"/ArcGIS/rest/services/Projects/Project_Points/MapServer/0/query?outFields=ProjectNumber,District,Location,ProjectType,CompletionDate,BudgetSource,Department,Status,House,Senate,Congress&where=&f=json&outSR=4326&inSR=4326&geometryType=esriGeometryEnvelope&geometry=-76.1627197265625,40.052847601823984,-65.9564208984375,44.57873024377564"
var lineurl = location.protocol+"//"+location.host+"/ArcGIS/rest/services/Projects/Project_Lines/MapServer/0/query?outFields=ProjectNumber,District,Location,ProjectType,CompletionDate,BudgetSource,Department,Status,House,Senate,Congress&where=&f=json&outSR=4326&inSR=4326&geometryType=esriGeometryEnvelope&geometry=-76.1627197265625,40.052847601823984,-65.9564208984375,44.57873024377564"
function loadFunc(){
	projects.addUrl(pointurl);
	projects.off("dataLoaded",loadFunc);
}
var projects = L.geoJson.ajax(lineurl,{style:onEach,pointToLayer:point2layer,onEachFeature:onEachFeature,middleware:toGeoJSON}).on("dataLoaded",loadFunc).addTo(m);

var overlayMaps = {"Projects":projects};

var lc = L.control.layers.filled(baseMaps, overlayMaps, {map : m});

function onEach(e) {
	if(e.geometry.type==="Point"){
     if(e.properties.Status=="Completed"){
        return{color:"#000",fillColor:"#0000ff",fillOpacity:0.8,opacity:1,weight:1};   
     }else if(e.properties.Status=="Active"){
        return{color:"#000",fillColor:"#ff0000",fillOpacity:0.8,opacity:1,weight:1};   
    }else{
        return{color:"#000",fillColor:"#00ff00",fillOpacity:0.8,opacity:1,weight:1};   
    }
	}else{
		if(e.properties.Status=="Completed"){
        return{color:"#0000ff",fillOpacity:0.8,opacity:1};   
       }else if(e.properties.Status=="Active"){
        return{color:"#ff0000",fillOpacity:0.8,opacity:1};   
       }else{
        return{color:"#00ff00",fillOpacity:0.8,opacity:1};   
       }
	}
}
function point2layer(f,latlng){
    return L.circleMarker(latlng,{radius:4});
}
function onEachFeature(e,l){
    l.bindPopup(makePop(e.properties));
}
function makePop(p){
    var a = Object.keys(p).filter(function(f){
        return true//["OBJECTID","Status","Latitude","Longitude","Icon","PhysicalTown"].indexOf(f)==-1;
    }).map(function(v){
    	var value = p[v];
    	if(["House","Senate","Congress"].indexOf(v)>-1){
    	if(value === "unk"){
    		value = "Unknown"	
    	}else{
    			value = value.replace(/([A-Z])/g," $1").slice(1);
    		}
    	}
        return v.replace(/(([a-z])([A-Z]))/g,"$2 $3") +": "+value;
    });
    return a.join("<br />");
}
function addValues(v){
    Object.keys(v).forEach(function(k){
        if(!(values[k])){
            values[k]=[];
        }
        if(values[k].indexOf(v[k])===-1){
        values[k].push(v[k]);
        }
        });
}
function query(obj){
    if(obj){
    values = {};
    state=obj;
    projects.refilter(function(v){
        
        if(Object.keys(obj).every(function(k){
           return obj[k]===v.properties[k];
        })){
            addValues(v.properties);
            return true;
        }
    });
    }else{
    	state={};
        projects.refilter(function(v){
            addValues(v.properties);
            return true;
        });
    }
    projects.fire("refiltered");
}
function reData(){
        var q = $("#query select");
        var out = {};
        q.each(function(x,v){
            if(v.value!=='all'){
            out[v.id]=v.value;
            }
        });
        query(out);
        return true;
    };
projects.on("dataLoaded",function(){
    projects._cache.forEach(function(v){
        addValues(v.properties);
    });
    projects.fire("refiltered");
});
$(function(){
    var opts = document.createDocumentFragment();
    var tabs = document.createElement("div");
    tabs.id = "tabs";
    var tList = document.createElement("ul");
    tabs.appendChild(tList);
    var search = document.createElement("li");
    var slink = document.createElement("a");
    slink.href="#search";
    slink.innerHTML="Search";
    search.appendChild(slink);
    tList.appendChild(search);
    var query = document.createElement("li");
    var qlink = document.createElement("a");
    qlink.href="#query";
    qlink.innerHTML="Query";
    query.appendChild(qlink);
    tList.appendChild(query);
    var sdiv = document.createElement("div");
    sdiv.id="search";
    tabs.appendChild(sdiv);
    var qq = document.createElement("div");
    qq.id="query";
    qq.innerHTML="<select id='Status'></select><select id='Department'></select><select id='House'></select><select id='Senate'></select><select id='Congress'></select>";
    tabs.appendChild(qq);
    opts.appendChild(tabs);
    $("body").prepend(opts);
    $( "#tabs" ).tabs({
        collapsible: true,
            selected: -1
        });
    projects.on("refiltered",function(){
    makeDrops("Status");
    makeDrops("Department");
    makeDrops("House");
    makeDrops("Senate");
    makeDrops("Congress");
    function makeDrops(id){
    var div = $("#"+id);
    div.empty();
    var frag  = document.createDocumentFragment(); 
    makeOptions("all","All "+id);
    if(id in state){
     makeOptions(values[id][0],values[id][0],"unique");
    }else{
    	values[id].sort();
        values[id].forEach(makeOptions);
    }
    div.append(frag);
    
    function makeOptions(v,vv,checked){
        if(!vv || vv>-1){
            vv=v;
        }
        if(["House","Senate","Congress"].indexOf(id)>-1){
        	if(vv !== "unk"){
        	vv=vv.replace(/([A-Z])/g," $1").slice(1)
        	}else{
        		vv = "Unknown";
        	}
        }
        var opt = document.createElement("option");
        opt.innerHTML=vv;
        opt.value=v;
        if(checked==="unique"){
            opt.setAttribute("selected","selected");
        }
        frag.appendChild(opt);
    }}});
    $("#query").on("change","select",reData);
});
var marker = new L.Marker();
var old={};