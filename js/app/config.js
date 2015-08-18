define(['esri/symbols/PictureMarkerSymbol'],

  function(PMS) {

    var pinSymbol = new PMS({
      'angle': 0,
      'xoffset': 0,
      'yoffset': 8,
      'type': 'esriPMS',
      'url': 'http://static.arcgis.com/images/Symbols/Shapes/BluePin1LargeB.png',
      'contentType': 'image/png',
      'width': 30,
      'height': 30
    });

    var solarPanelSymbol = new PMS({
      'angle': 90,
      'xoffset': 0,
      'yoffset': 8,
      'type': 'esriPMS',
      'url': 'assets/images/solar-panel-flash-drive.png',
      'contentType': 'image/png',
      'width': 30,
      'height': 30
    });


    return {
      
      applicationTitle: 'MN Solar Suitability Analysis App',
      apiKey: 'AIzaSyCI5rFXoNNM-IGDP-BZ1opjXTtB9wZalEI',
      gitHub: 'https://github.com/cmartin616/SolarApp2.0',

      emailAddress: 'test@testing.com',
      appDomain: 'http://solar.maps.umn.edu/app',

      // Esri Basemap Urls
      imagery: 'http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer',
      streets: 'http://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/',

      // Esri defaults
      geometryService: 'http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer',

      // Solar data
      gpTool: 'http://us-dspatialgis.oit.umn.edu:6080/arcgis/rest/services/solar/SolarPointQuery_fast/GPServer/Script',

      /* Solar raster - query*/
      // solarImageryUrl: 'http://gis.uspatial.umn.edu/arcgis/rest/services/solar/mn_solar/ImageServer/',
      solarImageryUrl: 'http://gis.uspatial.umn.edu/arcgis/rest/services/solar/MnSolarRef/ImageServer/',
      //solar data for querying insolation
      // imgIdentifyUrl: 'http://gis.uspatial.umn.edu/arcgis/rest/services/solar/mn_solar/ImageServer/identify',
      imgIdentifyUrl: 'http://gis.uspatial.umn.edu/arcgis/rest/services/solar/MnSolarRef/ImageServer/identify',
      // Vector data for querying vector datasets
      vectorDataUrl: 'http://us-dspatialgis.oit.umn.edu:6080/arcgis/rest/services/solar/solar_fgdb/MapServer/',
      bareEarthCountyUrl: 'http://us-dspatialgis.oit.umn.edu:6080/arcgis/rest/services/solar/solar_fgdb/MapServer/1',
      eusaUrl: 'http://us-dspatialgis.oit.umn.edu:6080/arcgis/rest/services/solar/solar_fgdb/MapServer/0',

      centerLat: 44.971795,
      centerLng: -93.243322,
      defaultZoom: 13,
      queryZoom: 18,

      pinSymbol: pinSymbol,
      solarPanelSymbol: solarPanelSymbol

    };
  });