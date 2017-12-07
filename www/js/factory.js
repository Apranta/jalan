angular.module('jalanFactory', ['ngCordova'])

.factory('jalanServices', function($http) {
	var jalan = {};
	var link ="http://laporan.sukara.me/jalan/get_jalan";
	jalan.get = function () {
        return $http.get(link);
    };
    jalan.get_row = function (id) {
        return $http.get(link +"?id_data="+id);
    };
    return jalan;
	
})