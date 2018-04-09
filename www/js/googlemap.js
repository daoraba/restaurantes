
var latitude;
var longitude;
var db;

/**
 * funcio que cridem quan carrega la página
 */
function init() {
    var map = new GoogleMap();

    db = obtenirBaseDades();

    db.transaction(function (tx) {

        tx.executeSql('DROP TABLE IF EXISTS location');

        tx.executeSql('CREATE TABLE IF NOT EXISTS location(nom TEXT UNIQUE, lat TEXT, long TEXT, tipus TEXT, foto TEXT)');

        tx.executeSql('INSERT INTO location VALUES ( "Super Pizza", "41.413325" , "2.190745", "italiano" , "italiana" )');
        tx.executeSql('INSERT INTO location VALUES ( "fosters" ,"41.411659" , "2.188449" , "americana" , "americana" )');
        tx.executeSql('INSERT INTO location VALUES ( "tapas locas", "41.412488" , "2.188449" , "espanyola" , "espanyola" )');
        tx.executeSql('INSERT INTO location VALUES ( "sherlock", "41.412687" , "2.183870" , "anglesa" , "anglesa" )');
        tx.executeSql('INSERT INTO location VALUES ( "sushi chachi", "41.418647"  , "2.183870" , "japonesa" , "japonesa" )');
        tx.executeSql('INSERT INTO location VALUES ( "Bollywood", "41.418647"  , "2.186427" , "india" , "india" )');
        tx.executeSql('INSERT INTO location VALUES ( "Mama Mia", "41.412348"  , "2.193936" , "italiana" , "italiana" )');
        tx.executeSql('INSERT INTO location VALUES ( "Puzzle", "41.411390"  , "2.191582" , "anglesa" , "anglesa" )');
        tx.executeSql('INSERT INTO location VALUES ( "Espain", "41.432411"  , "2.184768" , "espanyola" , "espanyola" )');
        tx.executeSql('INSERT INTO location VALUES ( "Curri", "41.413868"  , "2.190391" , "india" , "india" )');
        tx.executeSql('INSERT INTO location VALUES ( "Aqua", "41.414407"  , "2.192537" , "japonesa" , "japonesa" )');
        tx.executeSql('INSERT INTO location VALUES ( "Bar Ramon", "41.410730"  , "2.189361" , "espanyola" , "espanyola" )');
        tx.executeSql('INSERT INTO location VALUES ( "chino Juan", "41.431475"  , "2.178371" , "japonesa" , "japonesa" )');
        tx.executeSql('INSERT INTO location VALUES ( "Rancho", "41.431873"  , "2.178439" , "americana" , "americana" )');

    }, error, consultaRestaurant);

    //dgetElementById('desa').addEventListener('click', function (e) {
    //    app.desar();
    //});

}

/**
 * Afaga la posicio actual
 * @constructor
 */
function GoogleMap(){
    navigator.geolocation.getCurrentPosition(onSuccess);
}

/**
 * Aqui Crea la base i carrega la taula
 * @returns {Database}
 */
function obtenirBaseDades() {
    return window.openDatabase("locationBD", "1.0", "location BD", 200000);
}

/**
 * Marca la nostra posicio actual en el mapa
 * @param posicio
 */
function onSuccess(posicio) {

    latitude = posicio.coords.latitude;
    longitude = posicio.coords.longitude;

    // agafa latitud i longitud
    var latLng  = new google.maps.LatLng(
        posicio.coords.latitude,
        posicio.coords.longitude);

    // opcions de mapa: zoom al 16, permet ajustar el zoom amb els dits, centra el mapa a la pantalla amb la teva posicio al mig
    var opcionsMapa = {
        center: latLng,
        panControl: false,
        zoomControl: true,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP};

    var mapa = new google.maps.Map(
        document.getElementById('map'),
        opcionsMapa);

    // marca en el mapa la nostra posicio amb un icono
    var marker = new google.maps.Marker({
        position: latLng,
        map: mapa });
}

/**
 * quan algo falla salta este error
 * @param err
 */
function error(err) {
    console.log(err);
}

/**
 * consultem a la base de dades filtran per tipus de restaurant o no
 */
function consultaRestaurant() {
    var type = document.getElementById('type').value;

    if(document.getElementById('type').value != 'Tipo'){
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM location WHERE tipus LIKE'+"'"+type+"'", [], consultar, error);
        }, error);
    }else {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM location', [], consultar, error);
        }, error);
    }


    //var marker = new google.maps.Marker({
    //    position: latLng,
    //    map: mapa });

}

/**
 * senyala al mapa la posicio dels restaurants proxims
 *
 * @param tx
 * @param resultats
 */
function consultar(tx, resultats) {
    // elimina les imatges actuals
    $("img").remove();
    $(".titul").remove();

    var latLng  =
        new google.maps.LatLng(
            latitude,
            longitude);
    var opcionsMapa = {
        center: latLng,
        panControl: false,
        zoomControl: true,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var mapa = new google.maps.Map(
        document.getElementById('map'),
        opcionsMapa
    );
    var marker = new google.maps.Marker({
        position: latLng,
        map: mapa });

    for(var x =0; x != resultats.rows.length; x++) {

        var dist = calcularDistancia(latitude, resultats.rows[x].lat, longitude, resultats.rows[x].long);
        var e = document.getElementById("distancia");
        var restricio = e.options[e.selectedIndex].value;

        if(dist <= restricio ){
            foto(resultats.rows[x].foto , resultats.rows[x].nom);
            var latLng2  =
                new google.maps.LatLng(
                    resultats.rows[x].lat,
                    resultats.rows[x].long);
            var marker = new google.maps.Marker({
                position: latLng2,
                map: mapa });
        }
    }

}

/**
 * Injecta codi html amb la imatge
 *
 * @param f
 * @param n
 */
function foto(f,n) {
    console.log(f);
    $("#fotos").append('<div class="part"><img src='+"img/"+f+'.jpg /><span class="titul">'+n+' </span></div>').css({
        "float":"left",
        "width":"20%",
        "overflow-y":"scroll",
        "height": "600px",
        "background-color": "#F8B451"
    });
    $("img").css({"width":"100%", "display":"block"});
    $("part").css({"display":"inline"});
    $("#map").css({
        "float":"right",
        "width":"80%",
        "height": "600px"
    });
}

/**
 * Calcula la distancia entre els dos punts en metres
 *
 * @param lat1
 * @param lat2
 * @param lon1
 * @param lon2
 * @returns {number}
 */
function calcularDistancia(lat1, lat2, lon1, lon2){

    var R = 6371; // Radio del planeta tierra en km
    var phi1 = toRadians(lat1);
    var phi2 = toRadians(lat2);

    var deltaphi = toRadians((lat2-lat1));
    var deltalambda = toRadians((lon2-lon1));

    var a = Math.sin(deltaphi/2) * Math.sin(deltaphi/2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltalambda/2) * Math.sin(deltalambda/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = R * c;
    return d*1000;
}

/**
 * Converteix un numero a radians
 *
 * @param number
 * @returns {number}
 */
function toRadians(number) {
    return number * Math.PI / 180;
}
