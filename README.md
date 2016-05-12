# MN.gov/solarapp

## Synopsis

Solar Site Suitability Application built on the statewide surface model and solar model produced by the University of Minnesota Solar Suitability Analysis Team (http://solar.maps.umn.edu/). This application allows users to search an address (or locate a site on a map) and report information on solar potential at that location.


## Motivation

The core motivation for this project is to promote the awareness and use of solar energy with ultimate goal of mitigating climate change. Solar technology is quickly becoming more efficient and cost effective but getting started can be intimidating and tedious. Currently, to determine site suitability and ideal solar panel placement, an on-site analysis must be completed by a professional solar installer. For homeowners and businesses potentially interested in a PV solar system, there is a demand for more detailed information before reaching the step of hiring a solar installer.

The UMN Solar Suitability Analysis Team produced a high resolution solar suitability model using publicly available LiDAR data for the state of Minnesota. This app brings that data to users by allowing them to locate their home, current location, or point of interest and report on potential for photovoltaic systems (solar panels) and make informed decisions about solar resources. With this data, and the services provided through this application homeowners can identify the solar potential of their property, solar installers can more efficiently provide site assessments, energy companies can site large industrial arrays that integrate with their current network, planners can identify measure solar as resource for neighborhoods, cities, and counties… from anywhere, without the upfront need for costly, and sometimes hazardous (e.g. climbing on rooftops in winter), on-site analysis.


## Installation

First, clone this repository onto your webserver:
* git clone git@github.com:respec/solar-suitability-app.git

Next run these build commands:
* npm install
* grunt -V (check version)
* bower install (if wanting full libraries)

Use the following Grunt tasks for development:
* grunt watch
  * sass compiling
* grunt release
  * copies all (only) files required to run the application into a directory named /release. Useful for copying files to production enviroment if not using Git


## Setup

Configure settings for email delivery of solar reports, bug/issues, etc here:
* api/email_config.ini

All other settings (e.g. service urls, cacluation constants, list of MiM service providers, etc) here:
* js/app/config.js


## Data Requirements

The application is dependent on the following services:
* Point Solar GeoProcessing Service - SolarPoint250kTileQuery (Source: gpTool/SolarPoint250kTileQuery.py) UMN Url: https://gis.uspatial.umn.edu/arcgis/rest/services/solar/SolarPoint250kTileQuery/GPServer/SolarPoint250kTileQuery
* MN Solar Model - ArcGIS Image Service - MnSolarRef (Source: Solar Raster Mosaic Dataset) UMN Url: http://gis.uspatial.umn.edu/arcgis/rest/services/solar/MnSolarRef/ImageServer/
* MN Digital Surface Model - ArcGIS Image Service - MnDSMRef (Source: Digital Surface Model Mosaic Dataset) UMN Url: https://gis.uspatial.umn.edu/arcgis/rest/services/solar/MnDSMRef/ImageServer
* Vector Data for Canada Mask, MN Counties, Water, Bare earth only lidar counties, Lidar collect dates - ArcGIS Map Service - UMN Url: https://gis.uspatial.umn.edu/arcgis/rest/services/solar/MNVectorDataForSolarApp/MapServer
* Electric Utility Service Areas (EUSA) - ArcGIS Map Service - State URL: 'http://geoserver.state.mn.us/arcgis/rest/services/EUSA/EUSA/MapServer/0',
* Existing Solar Installations - GeoRSS XML source - CERTS Url: http://www.cleanenergyprojectbuilder.org/solar-projects.xml


## Authors
* Andy Walz <dev@andywalz.com> (651) 504-2230
* Chris Martin <cmartin616@gmail.com>


## Bug Reporting
energy.info@state.mn.us


## License
TBD
