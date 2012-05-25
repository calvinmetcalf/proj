/** @preserve @calvinmetcalf **/

var g = google.maps;
var m;
var zoom = 8;
var center = new g.LatLng(41.914541,-71.592407);
google.load('visualization', '1', {});
$(function() {
      $( "#tabs" ).tabs({
            collapsible: true,
            selected: -1
    	});
          $( "input:submit,input:reset" ).button();
        $('input, textarea').placeholder();
  m = new ftMap({
     mapDiv: "map",
     tid: 4018032
     
     });
 m.geocoder();
a =['Congress','Senate','House'];
$('#tabs-2').append('<select id="status"><option value="all">All Statuses</option></select>');
 m.getUV("Status",stCB);
$('#tabs-2').append('<select id="which"><option value="none">Pick One</option></select>');
$.each(a,function(i,p){
    $('#which').append('<option value="' + p + '">' + p + '</option>');
    
});
$('#which').change(function(){
    var val = $('#which').val();
    $('#Select').remove();
    m.setQ("dist","");
  if(val !== 'none'){
       m.getUV(val,sCB);
  }
})

 
});
var sCB = function(data,name){
    $('#tabs-2').append('<select id="Select"><option value="all">Any ' + name + '</option></select>');
   $.each(data.sort(),function(i,p){
       var rx = new RegExp("\\B[A-Z]","g");
       var ps = p.replace(rx," " + "$&"); 
    $('#Select').append('<option value="' + p + '">' + ps + '</option>'); 
   });
   $('#Select').change(function(){
      var val = $('#Select').val();
     
      if(val === "all"){
       m.setQ("dist",'');
      }
      else{
       m.setQ("dist","'" + name + "' = '" + val +"'");
      }
   });
     
 };
 

var stCB = function(data){
     $.each(data.sort(),function(i,p){
         $('#status').append('<option value="' + p + '">' + p + '</option>');
     });
     $('#status').change(function(){
         var val = $('#status').val();
           if(val === "all"){
       m.setQ("status",'');
      }else{
         m.setQ("status","'Status' = '" + val +"'");  
      }
     });
};






var ftMap =function (params){
    params=params||{};
    var g = google.maps;
    this.name=params.name||"Map";
    var _name = this;
    var _map=params.mapDiv||null;
    var _tid=params.tid||0;
    var _geometry = params.geometry||'geometry';
    var _where = params.where||"";
    var _opp = params.layerOptions||null;
    _name.ql={};
   
    if(_map!==null){
    
  _name.map = new g.Map($('#'  + _map)[0], {
      center: center,
      zoom: zoom,
      mapTypeId: 'roadmap'
    });
    }
    if(_tid>0){
        _name.layer = new g.FusionTablesLayer(_tid);
        _name.layer.setQuery("SELECT '" + _geometry + "' FROM " + _tid + " WHERE " +_where);
        _name.layer.setMap(_name.map);
        if(_opp!==null){
        _name.layer.setOptions(_opp);
        }
    }
    var _uvg = function(column,tid,cb){
        var _q = encodeURIComponent("SELECT " + column + ", COUNT() FROM " + tid + " GROUP BY " + column);
        var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq='  + _q);
        query.send(cb);  
        };
    this.getUV = function(column,cb){
      
     _uvg(column,_tid,function(data){
         cb(_name.getArray(data),column);
         });
 };
 this.getArray = function(data){
    var rows = data.getDataTable().getNumberOfRows();
    var a = [];
    var i;
    for(i = 0; i < rows; i++) {
        a.push(data.getDataTable().getValue(i, 0));
    }
    return a;
};
this.setQ = function(r,q){
    if(q===""){
     delete _name.ql[r]   ; 
    }else{
    _name.ql[r]=q;}
    var qs =[];
    $.each(_name.ql,function(k,v){
       qs.push(v);
    });
    if(qs.length===0){
        _where = ""; 
    }else if(qs.length===1){
     _where = qs.pop();   
    }else{
     _where = qs.join(' and ');   
    }
   
 _name.layer.setQuery("SELECT '" + _geometry + "' FROM " + _tid + " WHERE " + _where);
};
this.geocoder = function(geof,addrf,resetf){
    var _geocoder = new g.Geocoder();
    geof = geof||'geocode';
    addrf = addrf||'address';
    resetf = resetf||'resetgeo';
    _geocoder.geomarker = new g.Marker();
    $('#' + geof).click(function(){
    _geocoder.geocode( { 'address': $("#" + addrf).val()}, function(results, status) {
      if (status == g.GeocoderStatus.OK) {
        m.map.setCenter(results[0].geometry.location);
        m.map.setZoom(14);
     _geocoder.geomarker.setPosition(results[0].geometry.location); 
     _geocoder.geomarker.setMap(m.map);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
}
);

$('#' + resetf).click(function(){
      m.map.setCenter(center);
    m.map.setZoom(zoom);
_geocoder.geomarker.setMap(null);
});
    
};
};