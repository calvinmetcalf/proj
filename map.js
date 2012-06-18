google.load('visualization', '1', {});
$(function() {
var g = google.maps;
var zoom = 8;
var center = new g.LatLng(41.914541,-71.592407);
var tid=4018032;
var ql={};
var a =['Congress','Senate','House'];
$( "#tabs" ).tabs({
    collapsible: true,
    selected: -1
});
          
$( "input:submit,input:reset" ).button();

$('input, textarea').placeholder();

var m = new g.Map(document.getElementById('map'), {
    center: center,
    zoom: zoom,
    mapTypeId: 'roadmap'
});

var mainLayer = new g.FusionTablesLayer(tid);
  mainLayer.setQuery("SELECT 'geometry' FROM " + tid);
  mainLayer.setMap(m);
var gv={};
gv.q = function(column,cb){
        var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq='  + encodeURIComponent("SELECT " + column + ", COUNT() FROM " + tid + " GROUP BY " + column));
        query.send(cb);  
        };
gv.a =function(data){
    var rows = data.getDataTable().getNumberOfRows();
    var a = [];
    var i;
    for(i = 0; i < rows; i++) {
        a.push(data.getDataTable().getValue(i, 0));
    }
    return a;
};
function getV(column,cb){
     gv.q(column,function(data){
         cb(gv.a(data),column);
         });
}
 
getV("Status",statusCB);

function statusCB(data,name){
    $('#tabs-2').append('<select id="Status"><option value="all">Any ' + name + '</option></select>');
    $.each(data.sort(),function(i,p){
        var rx = new RegExp("\\B[A-Z]","g");
        var ps = p.replace(rx," " + "$&"); 
        $('#Status').append('<option value="' + p + '">' + ps + '</option>'); 
    });
    $('#Status').change(function(){
        var val = $('#Status').val();
        if(val === "all"){
            setQ("status",'');
        }else{
            setQ("status","'" + name + "' = '" + val +"'");
        }
    });
getRep();
}

function setQ(r,q){
    var where;
    if(q===""){
     delete ql[r]   ; 
    }else{
    ql[r]=q;}
    var qs =[];
    $.each(ql,function(k,v){
       qs.push(v);
    });
    if(qs.length===0){
        where = ""; 
    }else if(qs.length===1){
     where = qs.pop();   
    }else{
     where = qs.join(' and ');   
    }
   
 mainLayer.setQuery("SELECT 'geometry' FROM " + tid + " WHERE " + where);
}
function getRep(){
    $('#tabs-2').append('<select id="which"><option value="none">Representative Type</option></select>');
    $.each(a,function(i,p){
        $('#which').append('<option value="' + p + '">' + p + '</option>');  
    });
    $('#which').change(function(){
        var val = $('#which').val();
        $('#Select').remove();
        setQ("dist","");
    if(val !== 'none'){
        getV(val,sCB);
  }
});

function sCB(data,name){
    $('#tabs-2').append('<select id="Select"><option value="all">Any ' + name + '</option></select>');
   $.each(data.sort(),function(i,p){
       var rx = new RegExp("\\B[A-Z]","g");
       var ps = p.replace(rx," " + "$&"); 
    $('#Select').append('<option value="' + p + '">' + ps + '</option>'); 
   });
   $('#Select').change(function(){
      var val = $('#Select').val();
     
      if(val === "all"){
       setQ("dist",'');
      }
      else{
       setQ("dist","'" + name + "' = '" + val +"'");
      }
   });
     
 }

};
geocoder();
function geocoder(geof,addrf,resetf){
    var gc = new g.Geocoder();
    geof = geof||'geocode';
    addrf = addrf||'address';
    resetf = resetf||'resetgeo';
    gc.geomarker = new g.Marker();
    var geoinfo = new g.InfoWindow();
    $('#' + geof).click(function(){
        gc.geocode( { 'address': $("#" + addrf).val()}, function(results, status) {
            if (status == g.GeocoderStatus.OK) {
                var r = results[0];
                m.setCenter(r.geometry.location);
                m.setZoom(14);
                gc.geomarker.content = "<div class='geoinfo'>Formatted address:<br/>"+r.formatted_address+"</div>";
                gc.geomarker.setPosition(r.geometry.location); 
                gc.geomarker.setMap(m);
                g.event.addListener(gc.geomarker, 'click',function(){
                                geoinfo.setContent(gc.geomarker.content);
                              geoinfo.open(m,gc.geomarker);
							});
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    });

    $('#' + resetf).click(function(){
        m.setCenter(center);
        m.setZoom(zoom);
        gc.geomarker.setMap(null);
    });
};

});