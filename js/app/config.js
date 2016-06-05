/**
 * Global app settings (e.g. solar calculator defaults, service urls, etc)
 *
 * @author Andy Walz <dev@andywalz.com>
 * @author Chris Martin <cmartin616@gmail.com>
 */
define(
  [
  'esri/Color',
  'esri/symbols/PictureMarkerSymbol',
  'esri/symbols/SimpleFillSymbol',
  'esri/symbols/SimpleLineSymbol'
  ],

  function(Color, PMS, SFS, SLS) {

    var pinSymbol = new PMS({
      'angle': 0,
      'xoffset': -1,
      'yoffset': 12,
      'type': 'esriPMS',
      'url': 'http://static.arcgis.com/images/Symbols/Shapes/BluePin1LargeB.png',
      'contentType': 'image/png',
      'width': 30,
      'height': 30
    });

    var installationSymbol = new PMS({
      'angle': 0,
      'xoffset': 0,
      'yoffset': 8,
      'type': 'esriPMS',
      'url': 'assets/images/existing-install.png',
      'contentType': 'image/png',
      'width': 30,
      'height': 30
    });

    var solarPanelSymbol = new SFS(SFS.STYLE_SOLID,
    new SLS(SLS.STYLE_DASHDOT,
    new Color([255,0,0]), 2),new Color([255,255,0,0.25])
  );

    return {

      applicationTitle: 'mn.gov/solarapp',
      apiKey: 'AIzaSyCI5rFXoNNM-IGDP-BZ1opjXTtB9wZalEI',
      gitHub: 'https://github.com/respec/solar-suitability-app',

      // Live App Baseurl:
      appDomain: 'http://mn.gov/solarapp',

      // Contact Us Email Address (Note forms also submit notifications here):
      appEmail: 'energy.info@state.mn.us',

      // Solar Calculator Defaults
      systemLife: 25,
      energyEscalator: 1.035,
      degradationFactor: 0.998,
      averageUsePerMonth: 800,
      costPerkWh: 0.12,
      percentElectricGoal: 0.50,
      derate: 0.77,
      lowCostPerkWh: 3560,
      highCostPerkWh: 6060,

      // External links used throughout app

      // Zip search disabled 2/2/2016 due to bug in dsire site
      //mnIncentives: 'http://programs.dsireusa.org/system/program?zip=',

      mnIncentives: 'http://programs.dsireusa.org/system/program?state=MN&',
      mnCertsSolarGardens: 'http://mncerts.org/solargardens',
      mnInstallers: 'http://www.cleanenergyprojectbuilder.org/directory?title=&field_category_tid=208&field_geofield_distance%5Borigin%5D=',
      madeInMn: 'https://mn.gov/commerce/consumers/your-home/save-energy-money/mim/',
      learnMoreAboutSolar: 'https://mn.gov/commerce/consumers/your-home/energy-info/solar/#3',
      derateDefined: 'http://rredc.nrel.gov/solar/calculators/pvwatts/system.html',

      // Esri Basemap Urls
      imagery: 'http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer',
      streets: 'http://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/',

      // Esri defaults
      geometryService: 'http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer',

      // Solar App Required Services:

      gpTool: 'https://gis.uspatial.umn.edu/arcgis/rest/services/solar/SolarPoint250kTileQuery/GPServer/SolarPoint250kTileQuery',
      //gpTool: 'https://gis.uspatial.umn.edu/arcgis/rest/services/solar/SolarappGPTool/GPServer/SolarPointQueryWithIdeal',

      solarImageryUrl: 'http://gis.uspatial.umn.edu/arcgis/rest/services/solar/MnSolarRef/ImageServer/',
      dsmImageryUrl: 'https://gis.uspatial.umn.edu/arcgis/rest/services/solar/MnDSMRef/ImageServer',
      mnGeoUrl: 'http://geoserver.state.mn.us',

      //solar data for querying insolation
      // imgIdentifyUrl: 'http://gis.uspatial.umn.edu/arcgis/rest/services/solar/mn_solar/ImageServer/identify',
      imgIdentifyUrl: 'http://gis.uspatial.umn.edu/arcgis/rest/services/solar/MnSolarRef/ImageServer/identify',
      // Vector data for querying vector datasets
      vectorDataUrl: 'https://gis.uspatial.umn.edu/arcgis/rest/services/solar/MNVectorDataForSolarApp/MapServer/',
      canadaUsMaskUrl: 'https://gis.uspatial.umn.edu/arcgis/rest/services/solar/MNVectorDataForSolarApp/MapServer/0',
      countiesUrl: 'https://gis.uspatial.umn.edu/arcgis/rest/services/solar/MNVectorDataForSolarApp/MapServer/1',
      waterUrl: 'https://gis.uspatial.umn.edu/arcgis/rest/services/solar/MNVectorDataForSolarApp/MapServer/2',
      bareEarthCountyUrl: 'https://gis.uspatial.umn.edu/arcgis/rest/services/solar/MNVectorDataForSolarApp/MapServer/3',
      eusaUrl: 'http://geoserver.state.mn.us/arcgis/rest/services/EUSA/EUSA/MapServer/0',
      //      eusaUrl: 'https://gis.uspatial.umn.edu/arcgis/rest/services/solar/MNVectorDataForSolarApp/MapServer/4',
      countyLidarUrl: 'https://gis.uspatial.umn.edu/arcgis/rest/services/solar/MNVectorDataForSolarApp/MapServer/5',

      // Existing solar installations GeoRSS xml source
      certsGeoRssUrl: 'http://www.cleanenergyprojectbuilder.org/solar-projects.xml',

      // Made in Minnesota service providers
      madeInMnCounties: ['XCEL', 'Minnesota Power', 'Otter Tail Power'],

      // Color for bar fill
      barColor: '#ff7400',
      backgroundBarColor: '#808080',

      /*MPLS*/
      // centerLat: 44.971795,
      // centerLng: -93.243322,
      // defaultZoom: 13,

      /*STATE*/
      centerLat: 46.018056,
      centerLng: -94.318333,
      defaultZoom: 7,
      queryZoom: 18,

      pinSymbol: pinSymbol,
      solarPanelSymbol: solarPanelSymbol,
      installationSymbol: installationSymbol,

      appEmailKey: 'Vdb2PwCgMQsEVV3jWfLvqEMLeXchevqq',

      chartToolTip: 'This chart displays the amount of solar radiation (insolation) received each month at the point you have selected. Hover over orange bars to see the percentage of the maximum possible solar insolation reaching the selected point. The reduction from 100% is the amount of shading the selected location has. For example, if the bar indicates 90% that would mean that there is 10% shading at that point.',

      // Max Possible Actual Insolation in each Month
      // These values were determined by sampling the solar mosaic's "hotest" spots
      // in MN's 44-46ª latitude range
      // UPDATE 4/5/2016: May lowered 1% from 171500 to 169800
      // UPDATE 4/5/2016: Sept raised 1% from 116000 to 117200
      maxActualInsolationByMonth: {
        Jan: 32700,
        Feb: 54300,
        Mar: 103000,
        Apr: 139500,
        May: 169800,
        Jun: 175000,
        Jul: 176000,
        Aug: 155000,
        Sep: 117200,
        Oct: 69200,
        Nov: 36800,
        Dec: 26000
      }

    };
  });
