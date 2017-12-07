angular.module('starter.controllers', ['ngCordova'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

})

.controller('ProfileCtrl', function($scope,$state,$http,$ionicPopup,jalanServices,$ionicLoading) {
  $scope.$on('$ionicView.enter', function(e) {
    $scope.nama = window.localStorage.getItem('nama');
    $scope.nip = window.localStorage.getItem('nip');
    $scope.jabatan = window.localStorage.getItem('jabatan');
    $scope.email = window.localStorage.getItem('email');
    $scope.telepon = window.localStorage.getItem('telepon');
    console.log($scope.nama);
  });
  var user = {};
  var link = 'http://laporan.sukara.me/pegawai/update'; //Link tempat file login.php diupload atau disimpan
  var config = {
   headers : {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},
   cache: false,
  };
  //----
  $scope.profil = function() {
      console.log($scope.nama);
      user = {
        'nama' : $scope.nama, 
        'jabatan' : $scope.jabatan ,
        'nomor_hp' : $scope.telepon,
        'email' : $scope.email,
        'nip' : window.localStorage.getItem('nip')
      };
      $ionicLoading.show({
        template:'Loading...',
        duration:1000
      });
      $http.post(link,user,config)
        .then(function(data){
          // alert(JSON.stringify(data));
          $ionicLoading.hide();
          response = data.data;
          console.log(response);
          if(response.status !== 'gagal') {
            var alertPopup = $ionicPopup.alert({
                                title: 'Success',
                                template: response.pesan
                              });
            $state.transitionTo('app.profile', null, {'reload':true});
          }
          else{
            var alertPopup = $ionicPopup.alert({
                            title: 'Warning',
                            template: 'isi data dengan lengkap'
                          });
          }
        }
        ,function(){
          var alertPopup = $ionicPopup.alert({
                            title: 'Warning',
                            template: 'Periksa Koneksi kamu'
                          });
        });
      $state.reload();
  }
})

.controller('MapCtrl', function($scope,$http,$ionicPopup,$cordovaGeolocation,jalanServices) {
  $scope.$on('$ionicView.enter', function(e) {
    var options = {timeout: 10000, enableHighAccuracy: true};
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
      
      var latLng = new google.maps.LatLng(-2.9786144, 104.761441);
      var directionsService = new google.maps.DirectionsService;
      var directionsDisplay = new google.maps.DirectionsRenderer;
      var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var labelIndex = 0;
      var mapOptions = {
        center: latLng,
        zoom: 9,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      function addMarker(location, map,nama) {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(location),
          map: map,
          title:nama
        });
      }
      var infoWindow = new google.maps.InfoWindow;
      var map = new google.maps.Map(document.getElementById("map"), mapOptions);
      var link ='http://laporan.sukara.me/jalan/get_jalan';
      function bindInfoWindow(marker, map, infoWindow, html) {
        google.maps.event.addListener(marker, 'click', function() {
          infoWindow.setContent(html);
          infoWindow.open(map, marker);
        });
      }

      jalanServices.get()
      .success(function (jalan) {
          var data = jalan.data;
          // alert(JSON.stringify(data));
          for (var i = 0; i < data.length; i++) {
            var location = data[i].latitude+','+data[i].longitude;
            var html =  '<div class="list card">' +
                          '<div class="item item-divider">'+ data[i].nama + '</div>' +
                        '<div class="item item-body">' +
                          '<img src="http://laporan.sukara.me/img/'+ data[i].id_data +'.jpg" class="full-image">' +
                          '<ul class="list">'+
                            '<li class="item">Kelurahan :'+data[i].kelurahan+'</li>'+
                            '<li class="item">Kecamatan : '+data[i].kecamatan+'</li>'+
                            '<li class="item">Perkerasan Jalan : '+data[i].tipe+'</li>'+
                            '<li class="item">Kondisi Jalan : '+data[i].kondisi+'</li>'+
                        '</ul>'+
                        '</div>'+
                      '</div>';
            var marker = new google.maps.Marker({
              position: new google.maps.LatLng(102,3),
              map: map,
              title:data[i].nama
            });
            // addMarker(location,map,data[i].nama);
            bindInfoWindow(marker, map, infoWindow, html);
          }
      })
      .error(function (error) {
          var alertPopup = $ionicPopup.alert({
                  title: 'Warning',
                  template: 'Koneksi Error'
          });
      });
          // Add a marker at the center of the map.
          // addMarker(latLng, map);
        directionsDisplay.setMap(map);
        // calculateAndDisplayRoute(directionsService, directionsDisplay);
        $scope.map = map;  
    }, function(error){
      console.log("Could not get location");
    });
  });
})

.controller('LaporansCtrl', function($scope,$http,$ionicPopup,jalanServices) {
  $scope.$on('$ionicView.enter', function(e) {
    jalanServices.get()
      .success(function (jalan) {
          $scope.playlists = jalan.data;
      })
      .error(function (error) {
          $scope.status = 'Unable to load data: ' + error.message;
          alert($scope.status);
      });
  });
})

.controller('LoginCtrl', function($scope,$http,$state,$ionicPopup) {
  $scope.user = {};
  $scope.login = function() {
    var link = 'http://laporan.sukara.me/login/secret-login-url'; //Link tempat file login.php diupload atau disimpan
    var config = {
     headers : {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},
     cache: false,
    };
    var user = {
      'nip'       : $scope.user.nip,
      'password'  : $scope.user.password
    };
    //declare
    $http.post(link, user, config)
      .then(
        function(response){
          // alert(JSON.stringify(response));
          $scope.data = response.data;
          if ($scope.data.error === false) {

            var json = $scope.data.profile;
            var user = JSON.parse(json);
            console.log(user);
            window.localStorage.setItem('nip',user.nip);
            window.localStorage.setItem('nama',user.nama);
            window.localStorage.setItem('jabatan',user.jabatan);
            window.localStorage.setItem('email',user.email);
            window.localStorage.setItem('telepon',user.nomor_hp);
            $state.go('app.laporans');
            $scope.user = {};
          }
          else{
            var alertPopup = $ionicPopup.alert({
              title: 'Warning',
              template: 'username atau password salah'
            });
          }
        }, 
        function(response){
          console.log(response);
          var alertPopup = $ionicPopup.alert({
              title: 'Warning',
              template: 'Koneksi Error Gan'
          });
        }
    );
      
  }
})

.controller('MainCtrl', function($scope, $ionicModal, $stateParams, $http, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, $cordovaDevice, $ionicPopup, $cordovaActionSheet,$ionicActionSheet, $base64) {
  $scope.image = null;
  $scope.jalan = {};
  var jalan = {};
  $scope.showAlert = function(title, msg) {
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: msg
    });
  };

  // Present Actionsheet for switch beteen Camera / Library
  $scope.loadImage = function() {
    var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: '<p align="center"><b>Load from Library</b></p>' },
       { text: '<p align="center"><b>Use Camera</b></p>' }
     ],
     titleText: 'Select Image Source',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
          $ionicActionSheet.hide();
        },
     buttonClicked: function(btnIndex) {
      var type = null;
      if (btnIndex === 0) {
        type = Camera.PictureSourceType.PHOTOLIBRARY;
      } else if (btnIndex === 1) {
        type = Camera.PictureSourceType.CAMERA;
      }
      if (type !== null) {
        $scope.selectPicture(type);
      }
     }
   });
  };

  $ionicModal.fromTemplateUrl('templates/modal-map.html', {
      scope: $scope,
      animation: 'slide-in-up',
   }).then(function(modal) {
      $scope.modal = modal;
   });
  
   $scope.openModal = function() {
      $scope.modal.show();
   };
  
   $scope.closeModal = function() {
      $scope.modal.hide();
   };
  
   //Cleanup the modal when we're done with it!
   $scope.$on('$destroy', function() {
      $scope.modal.remove();
   });
  
   // Execute action on hide modal
   $scope.$on('modal.hidden', function() {
      // Execute action
   });
  
   // Execute action on remove modal
   $scope.$on('modal.removed', function() {
      // Execute action
   });
  // Take image with the camera or from library and store it inside the app folder
  // Image will not be saved to users Library.
  $scope.selectPicture = function(sourceType) {
    var options = {
      quality: 100,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: sourceType,
      saveToPhotoAlbum: false
    };
   
    $cordovaCamera.getPicture(options).then(function(imagePath) {
      // Grab the file name of the photo in the temporary directory
      var currentName = imagePath.replace(/^.*[\\\/]/, '');
   
      //Create a new name for the photo
      var d = new Date(),
      n = d.getTime(),
      newFileName =  n + ".jpg";
   
      // If you are trying to load image from the gallery on Android we need special treatment!
      if ($cordovaDevice.getPlatform() == 'Android' && sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {
        window.FilePath.resolveNativePath(imagePath, function(entry) {
          window.resolveLocalFileSystemURL(entry, success, fail);
          function fail(e) {
            console.error('Error: ', e);
          }
   
          function success(fileEntry) {
            var namePath = fileEntry.nativeURL.substr(0, fileEntry.nativeURL.lastIndexOf('/') + 1);
            // Only copy because of access rights
            $cordovaFile.copyFile(namePath, fileEntry.name, cordova.file.dataDirectory, newFileName).then(function(success){
              $scope.image = newFileName;
            }, function(error){
              $scope.showAlert('Error', error.exception);
            });
          };
        }
      );
      } else {
        var namePath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        // Move the file to permanent storage
        $cordovaFile.moveFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(function(success){
          $scope.image = newFileName;
        }, function(error){
          $scope.showAlert('Error', error.exception);
        });
      }
    },
    function(err){
      // Not always an error, maybe cancel was pressed...
    })
  };

  $scope.pathForImage = function(image) {
    if (image === null) {
      return '';
    } else {
      return cordova.file.dataDirectory + image;
    }
  };

  $scope.uploadImage = function() {
    // Destination URL
    var url = "http://laporan.sukara.me/jalan/set_jalan";
    var targetPath = $scope.pathForImage($scope.image);
    jalan = {
      'nama' : $scope.jalan.nama, 
      'kelurahan' : $scope.jalan.kelurahan ,
      'kecamatan' : $scope.jalan.kecamatan,
      'perkerasan' : $scope.jalan.perkerasan,
      'kondisi' : $scope.jalan.kondisi,
      'latlong' : $scope.jalan.latlong,
    };
    // File for Upload
    var config = {
     headers : {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},
     cache: false,
    };
   
    // File name only
    var filename = $scope.image;
   
    var options = {
      fileKey: "file",
      fileName: filename,
      chunkedMode: false,
      mimeType: "image/jpg",
      params: jalan
    };
    // $http.post(url, jalan,config)
    //   .then(function(data){
    //     alert(JSON.stringify(data));
    //   });
    var url1 = 'http://laporan.sukara.me/jalan/tes_upload';
    $cordovaFileTransfer.upload(url1, targetPath, options).then(function(result) {
      // alert('Success', 'Image upload finished.');
        alert(JSON.stringify(result));
    })
    .error(function(error) {
      alert(error);
    });
  }
})

.controller('LaporanCtrl', function($scope,$state, $stateParams , $http ,jalanServices,$ionicModal,$ionicPopup) {
  $scope.$on('$ionicView.enter', function(e) {
    var id = $stateParams.laporanId;
    var id_edit = $stateParams.laporanId;
    var jalan = {};
    // alert(id);
    jalanServices.get_row(id)
      .success(function (jalan) {
          $scope.data_jalan = Object.assign({},jalan.data[0]);
          $scope.data_jalan.LongLat = $scope.data_jalan.latitude +','+$scope.data_jalan.longitude;
          console.log($scope.data_jalan);
      })
      .error(function (error) {
          $scope.status = 'Unable to load data: ' + error.message;
          alert($scope.status);
      });
    $scope.delete = function() {
      // alert(id);
      var jalan1 = {
        id_data : id
      };
        var link = 'http://laporan.sukara.me/jalan/delete_jalan'; //Link tempat file login.php diupload atau disimpan
        var config = {
         headers : {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},
         cache: false,
        };
        //declare
        $http.post(link, jalan1, config)
          .then(
            function(response){
              // alert(JSON.stringify(response));
              $scope.data = response.data;
              if ($scope.data.error === false) {
                $state.go('app.laporans')
                var alertPopup = $ionicPopup.alert({
                  title: 'success',
                  template: 'Data Berhasil di hapus'
                });
              }
              else{
                var alertPopup = $ionicPopup.alert({
                  title: 'Warning',
                  template: 'Ada yang tidak beres mohon ulangi'
                });
              }
              $state.go('app.laporans')
            }, 
            function(response){
              console.log(response);
              var alertPopup = $ionicPopup.alert({
                  title: 'Warning',
                  template: 'Koneksi Error Gan'
              });
            }
        );
      };
  });

  //delete
  
  //modal
  $ionicModal.fromTemplateUrl('templates/edit_laporan.html', {
      scope: $scope,
      animation: 'slide-in-up',
   }).then(function(modal) {
      $scope.modal = modal;
   });
  
   $scope.openModal = function() {
      $scope.modal.show();
   };
  
   $scope.closeModal = function() {
      $scope.modal.hide();
   };
  
   //Cleanup the modal when we're done with it!
   $scope.$on('$destroy', function() {
      $scope.modal.remove();
   });
  
   // Execute action on hide modal
   $scope.$on('modal.hidden', function() {
      // Execute action
   });
  
   // Execute action on remove modal
   $scope.$on('modal.removed', function() {
      // Execute action
   });
    //edit
  $scope.edit = function() {
      jalan = {
        'id'  : id,
        'nama' : $scope.data_jalan.nama, 
        'kelurahan' : $scope.data_jalan.kelurahan ,
        'kecamatan' : $scope.data_jalan.kecamatan,
        'perkerasan' : $scope.data_jalan.perkerasan,
        'kondisi' : $scope.data_jalan.kondisi,
        'latlong' : $scope.data_jalan.LongLat,
      };
      var link = 'http://laporan.sukara.me/jalan/edit_jalan';
      var config = {
       headers : {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},
       cache: false,
      };
      //declare
      $http.post(link, jalan, config)
        .then(
          function(response){
            // alert(JSON.stringify(response));
            $scope.data = response.data;
            if ($scope.data.error === false) {
              var alertPopup = $ionicPopup.alert({
                title: 'success',
                template: 'Data Berhasil di Edit'
              });
            }
            else{
              var alertPopup = $ionicPopup.alert({
                title: 'Warning',
                template: 'Ada yang tidak beres mohon ulangi'
              });
            }
          }, 
          function(response){
            console.log(response);
            var alertPopup = $ionicPopup.alert({
                title: 'Warning',
                template: 'Koneksi Error Gan'
            });
          }
      );
  }
  
    
});
