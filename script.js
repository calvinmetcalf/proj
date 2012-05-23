var g = google.maps;
var m,d;
var zoom = 8;
var center = new g.LatLng(41.914541,-71.592407);
//var geocoder = new g.Geocoder();
 
//var tid = 4006317;
//var d;
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
     tid: 4009020
     
     });
 m.geocoder();

 m.getUV("cong",sCB);
 m.getUV("SENATOR",sCB);
 m.getUV("REP",sCB);
 
});
var sCB = function(data,name){
    $('#tabs-2').append('<select id="' + name + 'Select"><option value="all">Any ' + name + '</option></select>');
   $.each(data.sort(),function(i,p){
    $('#' + name + 'Select').append('<option value="' + p + '">' + p + '</option>'); 
   });
   $('#' + name + 'Select').change(function(){
      var val = $('#' + name + 'Select').val();
      d = val;
      if(val === "all"){
       m.setQ('');
      }
      else{
       m.setQ("'" + name + "' = '" + val +"'");
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
this.setQ = function(q){
 _where = q;   
 _name.layer.setQuery("SELECT '" + _geometry + "' FROM " + _tid + " WHERE " + _where);
}
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