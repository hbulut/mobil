//******************************************* Tanımlamalar *********************************************
var VERILER = [];
var ISTASYONVERILERI = [];
var MERKEZLER = [];

var indis;

var sicaklik = 0;
var sicaklikSon = 0;
var sicaklikBirim2 = '°';
var sicaklikBirim = window.localStorage.getItem("SicaklikBirim") == null ? '1' : window.localStorage.getItem("SicaklikBirim");
var ruzgarBirim = window.localStorage.getItem("RuzgarBirim") == null ? '9' : window.localStorage.getItem("RuzgarBirim");
var basincBirim = window.localStorage.getItem("BasincBirim") == null ? '4' : window.localStorage.getItem("BasincBirim");

var DENIZ_LIST = [];
var BolgeNo;
var today = new Date();

var IHBAR_LIST = [];
var Table;

var Sayfa = 0;

//******************************************* Fonksiyonlar ********************************************************************

function shouldRotateToOrientation(interfaceOrientation) {
    return false;//(1 === interfaceOrientation);
}


$(document).ready(function () {
   
    //alert(interfaceOrientation);

    //$(window).bind('orientationchange resize', function(event)
    //{ 
    //    if(event.orientation == 'portrait') 
    //    { //do something 
    //        alert('P');
    //    }
    //    if (event.orientation == 'landscape')
    //    {
    //        event.orientation = 'portrait';
    //    }
    //});


    //navigator.screenOrientation.set('portrait');
    //alert(interfaceOrientation);
    
   
    //$(window).on("orientationchange", function (event) {
      
    //});

    //$(window).orientationchange();
  
    IstasyonVerisiCek();
    Deniz_Xml_Oku();

});

//******************************************* Webservisten Veriler Okunur ******************************************************
function IstasyonNolar() {

    var NoDizi = "";
    for (var i = 0; i < ISTASYONVERILERI.length; i++) {

        NoDizi += ISTASYONVERILERI[i].No.toString()

        if (i + 1 < ISTASYONVERILERI.length) {
            NoDizi += ",";
        }

    }

    return NoDizi;
}

function IstasyonVerisiCek() {

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        url: "http://www.mgm.gov.tr/MobilWebServices/MobilServices.asmx/Istasyonlar",
        data: "{}",
        success: function (data) {

            IstasyonVerileri(data);

            VeriCek();
        },
        error: function (url) {

            alert("İstasyon Verileri Alınamadı!!");
        }
    });
}

function VeriCek() {

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        url: "http://www.mgm.gov.tr/MobilWebServices/MobilServices.asmx/MobileVeri",
        data: "{'IstNolar':'" + IstasyonNolar() + "'}",
        success: function (data) {

            Verileri_Eslestir(data);
            onDeviceReady();
        },
        error: function (url) {

            alert("SonDurum Verileri Alınamadı!!");
        }
    });
}

//******************************************* Webservisteki Veriler ID'ler İle Eşleşir *******************************************
function Verileri_Eslestir(VERI) {

    for (var i = 0; i < VERI.d.length; i++) {

        var veri = new Object();
        veri.IstNo = VERI.d[i].IstNo;
        veri.Istasyonlar = VERI.d[i].Istasyonlar;
        veri.SonDurumlar = VERI.d[i].SonDurumlar;
        veri.Yagislar = VERI.d[i].Yagislar;
        veri.Tahminler = VERI.d[i].Tahminler;

        VERILER.push(veri);
    }
}

function IstasyonVerileri(VERI) {

    for (var i = 0; i < VERI.d.length; i++) {

        var veri = new Object();

        veri.No = VERI.d[i].No;
        veri.Il = VERI.d[i].Il;
        veri.Ilce = VERI.d[i].Ilce;
        veri.Plaka = VERI.d[i].Plaka;
        veri.Adi = VERI.d[i].Adi;
        veri.Grup = VERI.d[i].Grup;
        veri.Enl = VERI.d[i].Enl;
        veri.Boy = VERI.d[i].Boy;
        veri.TahminNo = VERI.d[i].TahminNo;

        ISTASYONVERILERI.push(veri);
    }
}

document.addEventListener("deviceready", onDeviceReady, false);

//******************************************* Cihaz hazır olduğunda bulunulan lokasyonu alan fonksiyon ***************************
function onDeviceReady() {

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

}

//**************************** Uygulama açılırken sayfalanacak merkezleri tespit edip görüntüleyen fonksiyon *********************
function Acilis() {
 
    $("#wrap").css("background-color", "black");
    for (var i = 1; i <= 7; i++) {
        $('#M' + i).show();
    }
    
    for (var i = 7; i > MERKEZLER.length; i--) {
        $('#M' + i).hide();
       
    }
    
    $('#content').width(((MERKEZLER.length + 1) * 100) + 'vw');
    $('#content').height('100vh');
   
    for (var i = 0; i < MERKEZLER.length; i++) {

        Verileri_Doldur_Merkezler(MERKEZLER[i], i + 1);
    }
    $('#content').trigger('resetswipe');
    
   
 
   
}

function onSuccess(position) {

    indis = bulsondurum(position.coords.latitude, position.coords.longitude);

    Verileri_Doldur(ISTASYONVERILERI[indis].No);
    ILLER();

    var test = window.localStorage.getItem("favM");
    if (test != null)
        MERKEZLER = test.split(',');
    
    Ekle();

}

function ILLER() {

    var data = new Array();
    for (var i = 0; i < ISTASYONVERILERI.length; i++) {
        var satir = {};
        satir["Il"] = ISTASYONVERILERI[i].Il;
        satir["Ilce"] = ISTASYONVERILERI[i].Ilce;
        satir["Adi"] = ISTASYONVERILERI[i].Adi;
        satir["Plaka"] = ISTASYONVERILERI[i].Plaka;
        satir["No"] = ISTASYONVERILERI[i].No;
        satir["Bir"] = ISTASYONVERILERI[i].Il + " / " + ISTASYONVERILERI[i].Ilce + " - " + ISTASYONVERILERI[i].Adi;
        data.push(satir);

    }

    data.sort(function (a, b) {
        return a.Plaka > b.Plaka ? 1 : -1;
    });

    var source = {
        localdata: data,
        datatype: "array"
    };

    var dataAdapter = new $.jqx.dataAdapter(source);


    $("#input").jqxInput({ placeHolder: " İl, İlçe veya İstasyon Adı Giriniz...", width: "100%", height: 35, displayMember: "Bir", valueMember: "No", minLength: 1, searchMode: "containsignorecase", source: dataAdapter, items: 50 });
    //$('#listbox').jqxComboBox({
    //   source: dataAdapter, displayMember: "Bir", valueMember: "No", itemHeight: 35, height: 35, width: "100%", searchMode: "containsignorecase", placeHolder: "İl, İlçe veya İstasyon Adı Giriniz..."
    //    //renderer: function (index, label, value) {
    //    //    var datarecord = data[index];
    //    //    var table;
    //    //    if(index % 2 == 0)
    //    //        table = '<table style="background-color:red; width:100%"><tr><td> İl: ' + datarecord.Il + '</td></tr><tr><td> İlçe: ' + datarecord.Ilce + '</td></tr><tr><td>İstasyon Adı: ' + datarecord.Adi + '</td></tr></table>';
    //    //    else
    //    //        table = '<table style="background-color:blue; width:100%"><tr><td> İl: ' + datarecord.Il + '</td></tr><tr><td> İlçe: ' + datarecord.Ilce + '</td></tr><tr><td>İstasyon Adı: ' + datarecord.Adi + '</td></tr></table>';
    //    //    return table;
    //    //}

    //});

    $("#input").on('select', function (event) {

        if (event.args) {
            var item = event.args.item;
            document.getElementById('input').value = "";
            if (item) {
                if (item.value > 0 && MERKEZLER.length < 7) {
                    var kontrol = true;
                    for (var i = 0; i < MERKEZLER.length; i++) {
                        if (MERKEZLER[i] == item.value) {
                            kontrol = false;
                            break;
                        }
                    }
                    if (kontrol == true) {
                        MERKEZLER.push(item.value);
                        window.localStorage.setItem("favM", MERKEZLER);
                        Ekle();
                        document.location.href = '#pageMerkezler';

                    }
                    else {
                        alert(item.label + " Adlı İstasyon Merkezler Listesinde Mevcuttur!!");
                        document.location.href = '#pageMerkezler';
                    }
                }
                else {

                    if (MERKEZLER.length == 7) {
                        alert("En Fazla 7 Merkez Ekleyebilirsiniz!!");
                    }
                    else {
                        alert(item.label + " Adlı İstasyon Merkezler Listesinde Mevcuttur!!");
                    }
                    document.location.href = '#pageMerkezler';
                }
            }
        }
    });

    //$('#input').bind('close', function (event) {
    //    alert('a');
    //    //var item = $('#input').jqxInput('getSelectedItem');
    //    var value = $('#input').val();
    //    var valueMember = $('#input').jqxInput('valueMember'); 
    //    alert(valueMember);
    //    alert('b');


    //    if (item.value > 0 && MERKEZLER.length < 7) {
    //        var kontrol = true;
    //        for (var i = 0; i < MERKEZLER.length; i++) {
    //            if (MERKEZLER[i] == item.value) {
    //                kontrol = false;
    //                break;
    //            }
    //        }
    //        if (kontrol == true) {
    //            MERKEZLER.push(item.value);
    //            window.localStorage.setItem("SeciliMerkezler", MERKEZLER);
    //            Ekle();
    //            document.location.href = '#pageMerkezler';

    //        }
    //        else {
    //            alert(item.label + " Adlı İstasyon Merkezler Listesinde Mevcuttur!!");
    //            document.location.href = '#pageMerkezler';
    //        }
    //    }
    //    else {

    //        if (MERKEZLER.length == 7) {
    //            alert("En Fazla 7 Merkez Ekleyebilirsiniz!!");
    //        }
    //        else {
    //            alert(item.label + " Adlı İstasyon Merkezler Listesinde Mevcuttur!!");
    //        }
    //        document.location.href = '#pageMerkezler';
    //    }
    //});



}

function Ekle() {

    var data = new Array();

    var htm = '<ul style="margin-top:10%; margin-left:3%; overflow:scroll; height:80vh; color:black; font-size:2.5vh;">';

    for (var i = 0; i < ISTASYONVERILERI.length; i++) {
        var kontrol = false;
        for (var j = 0; j < MERKEZLER.length; j++) {
            if (ISTASYONVERILERI[i].No == MERKEZLER[j]) {
                kontrol = true;

                break;
            }
        }

        if (!kontrol) {
            continue;
        }
        else {
            htm += '<li><table style="width:95%; border-radius: 10px 10px 10px 10px; -moz-border-radius: 10px 10px 10px 10px; -webkit-border-radius: 10px 10px 10px 10px; border: solid 1px #808080; margin-bottom:5px; background-color:lightgray;"><tr><td style="width:85%; text-align:left; ">' + ISTASYONVERILERI[i].Il + ' / ' + ISTASYONVERILERI[i].Ilce + '<hr/>' + ISTASYONVERILERI[i].Adi + '</td><td  style="width:15%; border-left:solid 1px;"><img src="IMAGES/Other/delete.png" style="width:75%; height:35%" id= "' + ISTASYONVERILERI[i].No + '" onclick="Sil(this)"   \></td></tr></table></li>';
        }
    }

    htm += '</ul>';

    $('#SeciliMerkezler').html(htm);

    Acilis();
}

var SilinecekIstasyon = -1;
function onConfirm(buttonIndex) {
    if (buttonIndex == 1) {

        for (var i = 0; i < MERKEZLER.length; i++) {
            if (SilinecekIstasyon == MERKEZLER[i]) {
                //delete MERKEZLER[i];
                var MerkezlerTemp = [];
                for (var j = 0; j < MERKEZLER.length; j++) {
                    if (i != j)
                        MerkezlerTemp.push(MERKEZLER[j]);
                }

                MERKEZLER = [];

                for (var j = 0; j < MerkezlerTemp.length; j++) {
                    MERKEZLER.push(MerkezlerTemp[j]);
                }

                break;


            }
        }
   
        window.localStorage.setItem("favM", MERKEZLER);

        Ekle();
    }
    else {
        SilinecekIstasyon = -1;
    }
}

function Sil(event) {

    var istasyon;
    SilinecekIstasyon = event.id;
    for (var i = 0; i < ISTASYONVERILERI.length; i++) {
        if (ISTASYONVERILERI[i].No == SilinecekIstasyon) {
            istasyon = ISTASYONVERILERI[i].Il + " / " + ISTASYONVERILERI[i].Ilce + " \n " + ISTASYONVERILERI[i].Adi;
            break;
        }

    }
    navigator.notification.confirm(
            'Silmek İstediğinize Emin misiniz?',  // message
            onConfirm,              // callback to invoke with index of button pressed
            istasyon + ' İstasyonunu',            // title
            'Evet,Hayır'          // buttonLabels
        );

}

function bulsondurum(x, y) {

    var tempx = ISTASYONVERILERI[0].Enl;
    var tempy = ISTASYONVERILERI[0].Boy;

    var enkucuk = (tempx - x) * (tempx - x) + (tempy - y) * (tempy - y);

    var indis = 0;
    for (var i = 1; i < ISTASYONVERILERI.length; i++) {
        tempx = ISTASYONVERILERI[i].Enl;
        tempy = ISTASYONVERILERI[i].Boy;
        var temp = (tempx - x) * (tempx - x) + (tempy - y) * (tempy - y);
        if (temp < enkucuk) {
            enkucuk = temp;
            indis = i;
        }
    }
    return indis;
}

function onError(error) {
    alert('Bulunulan Lokasyon Alınamadı!!');
}

function Verileri_Doldur(IstNo) {

    for (var i = 0; i < VERILER.length; i++) {

        //...................................SONDURUMLAR.............................................

        if (VERILER[i].IstNo == IstNo) {

            $("#Istasyon_Adi0").html("<img src='IMAGES/Other/ok.png' height='14' style='padding-right:4px;' />" + VERILER[i].Istasyonlar.Ilce);

            $("#Merkez_Adi0").text("(" + VERILER[i].Istasyonlar.Adi + ")");

            sicaklikGoster(parseInt(VERILER[i].SonDurumlar.Sicaklik));

            $("#Sicaklik0").text(parseInt(sicaklikSon) + sicaklikBirim2);

            $("#Saat0").text(SaatDuzeltme(VERILER[i].SonDurumlar.GozlemZamani));

            $("#HadiseIcon0").attr("src", "src/iconset/Set4/" + VERILER[i].SonDurumlar.HadiseAdi + ".png");

            $("#HadiseAdi0").text(HadiseAdi_Latest(VERILER[i].SonDurumlar.HadiseAdi));

            $("#Nem0").text(parseInt(VERILER[i].SonDurumlar.Nem));
            $("#NemBirim0").text("%");

            ruzgar_renderer(VERILER[i].SonDurumlar.RuzgarYon);
           
            if (ruzgarBirim == '7') {

                $("#Ruzgar0").text(parseFloat(VERILER[i].SonDurumlar.RuzgarHiz));
                $("#RuzgarBirim0").text("Knot");

            }
            else if (ruzgarBirim == '8') {

                $("#Ruzgar0").text(parseInt(parseFloat(VERILER[i].SonDurumlar.RuzgarHiz) * 0.51444444444));
                $("#RuzgarBirim0").text("m/s");
            }
            else if (ruzgarBirim == '9') {

                $("#Ruzgar0").text(parseInt(parseFloat(VERILER[i].SonDurumlar.RuzgarHiz) * 1.852));
                $("#RuzgarBirim0").text("km/sa");
            }

            if (basincBirim == '4') {

                $("#Basinc0").text(parseInt(VERILER[i].SonDurumlar.Basinc));
                $("#BasincBirim0").text("hPa");
            }
            else if (basincBirim == '5') {

                $("#Basinc0").text((parseFloat(VERILER[i].SonDurumlar.Basinc) * 0.000986923266716).toFixed(4));
                $("#BasincBirim0").text("ATM");
            }
            else if (basincBirim == '6') {

                $("#Basinc0").text((parseFloat(VERILER[i].SonDurumlar.Basinc) * 0.7500616827042).toFixed(1));
                $("#BasincBirim0").text("mmHg");
            }

            //.................................YAĞIŞLAR............................................
            if (VERILER[i].Yagislar == null) {

                yagis_renderer(0);
                $("#Yagis0").text('//');
            }
            else {

                yagis_renderer(VERILER[i].Yagislar.Yagis);
                $("#Yagis0").text(VERILER[i].Yagislar.Yagis);
            }

            //...................................TAHMİNLER.........................................

            //GUN-1
            $("#GunAdi10").text(VERILER[i].Tahminler.gun1);
            $("#Icon_Gun10").attr("src", "src/iconset/Set4/" + VERILER[i].Tahminler.TD1 + ".png");
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMax1));
            $("#Max_Gun10").text(parseInt(sicaklikSon) + sicaklikBirim2);
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMin1));
            $("#Min_Gun10").text(parseInt(sicaklikSon) + sicaklikBirim2);

            //GUN-2
            $("#GunAdi20").text(VERILER[i].Tahminler.gun2);
            $("#Icon_Gun20").attr("src", "src/iconset/Set4/" + VERILER[i].Tahminler.TD2 + ".png");
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMax2));
            $("#Max_Gun20").text(parseInt(sicaklikSon) + sicaklikBirim2);
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMin2));
            $("#Min_Gun20").text(parseInt(sicaklikSon) + sicaklikBirim2);

            //GUN-3
            $("#GunAdi30").text(VERILER[i].Tahminler.gun3);
            $("#Icon_Gun30").attr("src", "src/iconset/Set4/" + VERILER[i].Tahminler.TD3 + ".png");
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMax3));
            $("#Max_Gun30").text(parseInt(sicaklikSon) + sicaklikBirim2);
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMin3));
            $("#Min_Gun30").text(parseInt(sicaklikSon) + sicaklikBirim2);

            //GUN-4
            $("#GunAdi40").text(VERILER[i].Tahminler.gun4);
            $("#Icon_Gun40").attr("src", "src/iconset/Set4/" + VERILER[i].Tahminler.TD4 + ".png");
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMax4));
            $("#Max_Gun40").text(parseInt(sicaklikSon) + sicaklikBirim2);
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMin4));
            $("#Min_Gun40").text(parseInt(sicaklikSon) + sicaklikBirim2);

            //GUN-5
            $("#GunAdi50").text(VERILER[i].Tahminler.gun5);
            $("#Icon_Gun50").attr("src", "src/iconset/Set4/" + VERILER[i].Tahminler.TD5 + ".png");
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMax5));
            $("#Max_Gun50").text(parseInt(sicaklikSon) + sicaklikBirim2);
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMin5));
            $("#Min_Gun50").text(parseInt(sicaklikSon) + sicaklikBirim2);


        }

    }

}

function Verileri_Doldur_Merkezler(IstNo, indis) {


    for (var i = 0; i < VERILER.length; i++) {

        //...................................SONDURUMLAR.............................................

        if (VERILER[i].IstNo == IstNo) {

            $("#Istasyon_Adi" + indis).text(VERILER[i].Istasyonlar.Ilce);

            $("#Merkez_Adi" + indis).text("(" + VERILER[i].Istasyonlar.Adi + ")");

            sicaklikGoster(parseInt(VERILER[i].SonDurumlar.Sicaklik));
            $("#Sicaklik" + indis).text(parseInt(sicaklikSon) + sicaklikBirim2);

            $("#Saat" + indis).text(SaatDuzeltme(VERILER[i].SonDurumlar.GozlemZamani));

            $("#HadiseIcon" + indis).attr("src", "src/iconset/Set4/" + VERILER[i].SonDurumlar.HadiseAdi + ".png");

            $("#HadiseAdi" + indis).text(HadiseAdi_Latest_Merkezler(VERILER[i].SonDurumlar.HadiseAdi, indis));

            $("#Nem" + indis).text(parseInt(VERILER[i].SonDurumlar.Nem));

            $("#NemBirim" + indis).text("%");

            ruzgar_renderer_Merkezler(VERILER[i].SonDurumlar.RuzgarYon, indis);

            if (ruzgarBirim == '7') {

                $("#Ruzgar" + indis).text(parseFloat(VERILER[i].SonDurumlar.RuzgarHiz));
                $("#RuzgarBirim" + indis).text("Knot");

            }
            else if (ruzgarBirim == '8') {

                $("#Ruzgar" + indis).text(parseInt(parseFloat(VERILER[i].SonDurumlar.RuzgarHiz) * 0.51444444444));
                $("#RuzgarBirim" + indis).text("m/s");
            }
            else if (ruzgarBirim == '9') {

                $("#Ruzgar" + indis).text(parseInt(parseFloat(VERILER[i].SonDurumlar.RuzgarHiz) * 1.852));
                $("#RuzgarBirim" + indis).text("km/sa");
            }

           
            if (basincBirim == '4') {

                $("#Basinc" + indis).text(parseInt(VERILER[i].SonDurumlar.Basinc));
                $("#BasincBirim" + indis).text("hPa");
            }
            else if (basincBirim == '5') {

                $("#Basinc" + indis).text((parseFloat(VERILER[i].SonDurumlar.Basinc) * 0.000986923266716).toFixed(4));
                $("#BasincBirim" + indis).text("ATM");
            }
            else if (basincBirim == '6') {

                $("#Basinc" + indis).text((parseFloat(VERILER[i].SonDurumlar.Basinc) * 0.7500616827042).toFixed(1));
                $("#BasincBirim" + indis).text("mmHg");
            }

            //.................................YAĞIŞLAR............................................
            if (VERILER[i].Yagislar == null) {
                yagis_renderer_Merkezler(0, indis);
                $("#Yagis" + indis).text('//');
            }
            else {
                yagis_renderer_Merkezler(VERILER[i].Yagislar.Yagis, indis);
                $("#Yagis" + indis).text(VERILER[i].Yagislar.Yagis);
            }
            //...................................TAHMİNLER.........................................

            //GUN-1
            $("#GunAdi1" + indis).text(VERILER[i].Tahminler.gun1);
            $("#Icon_Gun1" + indis).attr("src", "src/iconset/Set4/" + VERILER[i].Tahminler.TD1 + ".png");
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMax1));
            $("#Max_Gun1" + indis).text(parseInt(sicaklikSon) + sicaklikBirim2);
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMin1));
            $("#Min_Gun1" + indis).text(parseInt(sicaklikSon) + sicaklikBirim2);

            //GUN-2
            $("#GunAdi2" + indis).text(VERILER[i].Tahminler.gun2);
            $("#Icon_Gun2" + indis).attr("src", "src/iconset/Set4/" + VERILER[i].Tahminler.TD2 + ".png");
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMax2));
            $("#Max_Gun2" + indis).text(parseInt(sicaklikSon) + sicaklikBirim2);
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMin2));
            $("#Min_Gun2" + indis).text(parseInt(sicaklikSon) + sicaklikBirim2);

            //GUN-3
            $("#GunAdi3" + indis).text(VERILER[i].Tahminler.gun3);
            $("#Icon_Gun3" + indis).attr("src", "src/iconset/Set4/" + VERILER[i].Tahminler.TD3 + ".png");
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMax3));
            $("#Max_Gun3" + indis).text(parseInt(sicaklikSon) + sicaklikBirim2);
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMin3));
            $("#Min_Gun3" + indis).text(parseInt(sicaklikSon) + sicaklikBirim2);

            //GUN-4
            $("#GunAdi4" + indis).text(VERILER[i].Tahminler.gun4);
            $("#Icon_Gun4" + indis).attr("src", "src/iconset/Set4/" + VERILER[i].Tahminler.TD4 + ".png");
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMax4));
            $("#Max_Gun4" + indis).text(parseInt(sicaklikSon) + sicaklikBirim2);
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMin4));
            $("#Min_Gun4" + indis).text(parseInt(sicaklikSon) + sicaklikBirim2);

            //GUN-5
            $("#GunAdi5" + indis).text(VERILER[i].Tahminler.gun5);
            $("#Icon_Gun5" + indis).attr("src", "src/iconset/Set4/" + VERILER[i].Tahminler.TD5 + ".png");
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMax5));
            $("#Max_Gun5" + indis).text(parseInt(sicaklikSon) + sicaklikBirim2);
            sicaklikGoster(parseInt(VERILER[i].Tahminler.TMin5));
            $("#Min_Gun5" + indis).text(parseInt(sicaklikSon) + sicaklikBirim2);

            break;
        }

    }







}

function Deniz_Xml_Oku() {

    $.ajax({
        type: "GET",
        url: "http://www.mgm.gov.tr//FTPDATA/analiz/deniz/denizrapTR.xml",
        dataType: "xml",
        success: function (xml) {

            Xml_Denizler(xml);

        }

    });
}

function Xml_Denizler(xml) {


    $(xml).find('Bolgeler').each(function () {

        var DENIZ = new Object();

        DENIZ.BolgeNo = $(this).find('BolgeNo').text();
        DENIZ.Bolgeismi = $(this).find('Bolgeismi').text();
        DENIZ.Yerismi = $(this).find('Yerismi').text();
        DENIZ.Periyod = $(this).find('Periyod').text();
        DENIZ.Firtina = $(this).find('Firtina').text();
        DENIZ.HavaDurumu = $(this).find('HavaDurumu').text();
        DENIZ.Ruzgar = $(this).find('Ruzgar').text();
        DENIZ.Deniz = $(this).find('Deniz').text();
        DENIZ.Gorus = $(this).find('Gorus').text();

        DENIZ_LIST.push(DENIZ);
    });

    DenizDegerleriYaz(BolgeNo);

}

function DenizDegerleriYaz(BolgeNo) {

    saat = today.getHours();

    for (var i = 0; i < DENIZ_LIST.length; i++) {

        if (saat >= 00 && saat < 06 && DENIZ_LIST[i].BolgeNo == 0 && DENIZ_LIST[i].Periyod == 0) {

            $("#Periyod_DK").text('00:00 - 06:00 UTC');
            $("#Firtina_DK").text(DENIZ_LIST[i].Firtina);
            $("#Hava_DK").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_DK").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_DK").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_DK").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 06 && saat < 12 && DENIZ_LIST[i].BolgeNo == 0 && DENIZ_LIST[i].Periyod == 1) {

            $("#Periyod_DK").text('06:00 - 12:00 UTC');
            $("#Firtina_DK").text(DENIZ_LIST[i].Firtina);
            $("#Hava_DK").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_DK").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_DK").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_DK").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 12 && saat < 18 && DENIZ_LIST[i].BolgeNo == 0 && DENIZ_LIST[i].Periyod == 2) {

            $("#Periyod_DK").text('12:00 - 18:00 UTC');
            $("#Firtina_DK").text(DENIZ_LIST[i].Firtina);
            $("#Hava_DK").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_DK").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_DK").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_DK").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 18 && saat < 24 && DENIZ_LIST[i].BolgeNo == 0 && DENIZ_LIST[i].Periyod == 3) {

            $("#Periyod_DK").text('18:00 - 24:00 UTC');
            $("#Firtina_DK").text(DENIZ_LIST[i].Firtina);
            $("#Hava_DK").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_DK").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_DK").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_DK").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 00 && saat < 06 && DENIZ_LIST[i].BolgeNo == 1 && DENIZ_LIST[i].Periyod == 0) {

            $("#Periyod_BK").text('00:00 - 06:00 UTC');
            $("#Firtina_BK").text(DENIZ_LIST[i].Firtina);
            $("#Hava_BK").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_BK").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_BK").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_BK").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 06 && saat < 12 && DENIZ_LIST[i].BolgeNo == 1 && DENIZ_LIST[i].Periyod == 1) {

            $("#Periyod_BK").text('06:00 - 12:00 UTC');
            $("#Firtina_BK").text(DENIZ_LIST[i].Firtina);
            $("#Hava_BK").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_BK").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_BK").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_BK").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 12 && saat < 18 && DENIZ_LIST[i].BolgeNo == 1 && DENIZ_LIST[i].Periyod == 2) {

            $("#Periyod_BK").text('12:00 - 18:00 UTC');
            $("#Firtina_BK").text(DENIZ_LIST[i].Firtina);
            $("#Hava_BK").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_BK").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_BK").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_BK").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 18 && saat < 24 && DENIZ_LIST[i].BolgeNo == 1 && DENIZ_LIST[i].Periyod == 3) {

            $("#Periyod_BK").text('18:00 - 24:00 UTC');
            $("#Firtina_BK").text(DENIZ_LIST[i].Firtina);
            $("#Hava_BK").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_BK").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_BK").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_BK").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 00 && saat < 06 && DENIZ_LIST[i].BolgeNo == 2 && DENIZ_LIST[i].Periyod == 0) {

            $("#Periyod_M").text('00:00 - 06:00 UTC');
            $("#Firtina_M").text(DENIZ_LIST[i].Firtina);
            $("#Hava_M").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_M").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_M").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_M").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 06 && saat < 12 && DENIZ_LIST[i].BolgeNo == 2 && DENIZ_LIST[i].Periyod == 1) {

            $("#Periyod_M").text('06:00 - 12:00 UTC');
            $("#Firtina_M").text(DENIZ_LIST[i].Firtina);
            $("#Hava_M").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_M").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_M").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_M").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 12 && saat < 18 && DENIZ_LIST[i].BolgeNo == 2 && DENIZ_LIST[i].Periyod == 2) {

            $("#Periyod_M").text('12:00 - 18:00 UTC');
            $("#Firtina_M").text(DENIZ_LIST[i].Firtina);
            $("#Hava_M").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_M").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_M").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_M").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 18 && saat < 24 && DENIZ_LIST[i].BolgeNo == 2 && DENIZ_LIST[i].Periyod == 3) {

            $("#Periyod_M").text('18:00 - 24:00 UTC');
            $("#Firtina_M").text(DENIZ_LIST[i].Firtina);
            $("#Hava_M").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_M").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_M").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_M").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 00 && saat < 06 && DENIZ_LIST[i].BolgeNo == 3 && DENIZ_LIST[i].Periyod == 0) {

            $("#Periyod_KE").text('00:00 - 06:00 UTC');
            $("#Firtina_KE").text(DENIZ_LIST[i].Firtina);
            $("#Hava_KE").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_KE").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_KE").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_KE").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 06 && saat < 12 && DENIZ_LIST[i].BolgeNo == 3 && DENIZ_LIST[i].Periyod == 1) {

            $("#Periyod_KE").text('06:00 - 12:00 UTC');
            $("#Firtina_KE").text(DENIZ_LIST[i].Firtina);
            $("#Hava_KE").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_KE").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_KE").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_KE").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 12 && saat < 18 && DENIZ_LIST[i].BolgeNo == 3 && DENIZ_LIST[i].Periyod == 2) {

            $("#Periyod_KE").text('12:00 - 18:00 UTC');
            $("#Firtina_KE").text(DENIZ_LIST[i].Firtina);
            $("#Hava_KE").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_KE").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_KE").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_KE").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 18 && saat < 24 && DENIZ_LIST[i].BolgeNo == 3 && DENIZ_LIST[i].Periyod == 3) {

            $("#Periyod_KE").text('18:00 - 24:00 UTC');
            $("#Firtina_KE").text(DENIZ_LIST[i].Firtina);
            $("#Hava_KE").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_KE").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_KE").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_KE").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 00 && saat < 06 && DENIZ_LIST[i].BolgeNo == 4 && DENIZ_LIST[i].Periyod == 0) {

            $("#Periyod_GE").text('00:00 - 06:00 UTC');
            $("#Firtina_GE").text(DENIZ_LIST[i].Firtina);
            $("#Hava_GE").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_GE").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_GE").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_GE").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 06 && saat < 12 && DENIZ_LIST[i].BolgeNo == 4 && DENIZ_LIST[i].Periyod == 1) {

            $("#Periyod_GE").text('06:00 - 12:00 UTC');
            $("#Firtina_GE").text(DENIZ_LIST[i].Firtina);
            $("#Hava_GE").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_GE").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_GE").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_GE").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 12 && saat < 18 && DENIZ_LIST[i].BolgeNo == 4 && DENIZ_LIST[i].Periyod == 2) {

            $("#Periyod_GE").text('12:00 - 18:00 UTC');
            $("#Firtina_GE").text(DENIZ_LIST[i].Firtina);
            $("#Hava_GE").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_GE").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_GE").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_GE").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 18 && saat < 24 && DENIZ_LIST[i].BolgeNo == 4 && DENIZ_LIST[i].Periyod == 3) {

            $("#Periyod_GE").text('18:00 - 24:00 UTC');
            $("#Firtina_GE").text(DENIZ_LIST[i].Firtina);
            $("#Hava_GE").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_GE").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_GE").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_GE").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 00 && saat < 06 && DENIZ_LIST[i].BolgeNo == 5 && DENIZ_LIST[i].Periyod == 0) {

            $("#Periyod_BA").text('00:00 - 06:00 UTC');
            $("#Firtina_BA").text(DENIZ_LIST[i].Firtina);
            $("#Hava_BA").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_BA").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_BA").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_BA").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 06 && saat < 12 && DENIZ_LIST[i].BolgeNo == 5 && DENIZ_LIST[i].Periyod == 1) {

            $("#Periyod_BA").text('06:00 - 12:00 UTC');
            $("#Firtina_BA").text(DENIZ_LIST[i].Firtina);
            $("#Hava_BA").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_BA").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_BA").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_BA").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 12 && saat < 18 && DENIZ_LIST[i].BolgeNo == 5 && DENIZ_LIST[i].Periyod == 2) {

            $("#Periyod_BA").text('12:00 - 18:00 UTC');
            $("#Firtina_BA").text(DENIZ_LIST[i].Firtina);
            $("#Hava_BA").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_BA").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_BA").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_BA").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 18 && saat < 24 && DENIZ_LIST[i].BolgeNo == 5 && DENIZ_LIST[i].Periyod == 3) {

            $("#Periyod_BA").text('18:00 - 24:00 UTC');
            $("#Firtina_BA").text(DENIZ_LIST[i].Firtina);
            $("#Hava_BA").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_BA").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_BA").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_BA").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 00 && saat < 06 && DENIZ_LIST[i].BolgeNo == 6 && DENIZ_LIST[i].Periyod == 0) {

            $("#Periyod_DA").text('00:00 - 06:00 UTC');
            $("#Firtina_DA").text(DENIZ_LIST[i].Firtina);
            $("#Hava_DA").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_DA").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_DA").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_DA").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 06 && saat < 12 && DENIZ_LIST[i].BolgeNo == 6 && DENIZ_LIST[i].Periyod == 1) {

            $("#Periyod_DA").text('06:00 - 12:00 UTC');
            $("#Firtina_DA").text(DENIZ_LIST[i].Firtina);
            $("#Hava_DA").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_DA").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_DA").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_DA").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 12 && saat < 18 && DENIZ_LIST[i].BolgeNo == 6 && DENIZ_LIST[i].Periyod == 2) {

            $("#Periyod_DA").text('12:00 - 18:00 UTC');
            $("#Firtina_DA").text(DENIZ_LIST[i].Firtina);
            $("#Hava_DA").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_DA").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_DA").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_DA").text(DENIZ_LIST[i].Gorus);
        }
        if (saat >= 18 && saat < 24 && DENIZ_LIST[i].BolgeNo == 6 && DENIZ_LIST[i].Periyod == 3) {

            $("#Periyod_DA").text('18:00 - 24:00 UTC');
            $("#Firtina_DA").text(DENIZ_LIST[i].Firtina);
            $("#Hava_DA").text(DENIZ_LIST[i].HavaDurumu);
            $("#Ruzgar_DA").text(DENIZ_LIST[i].Ruzgar);
            $("#Deniz_DA").text(DENIZ_LIST[i].Deniz);
            $("#Gorus_DA").text(DENIZ_LIST[i].Gorus);
        }
    }
}

function Ihbar_Xml_Oku() {

    $.ajax({
        type: "GET",
        url: "http://www.mgm.gov.tr//FTPDATA/analiz/ihbar/yihbarson.xml",
        dataType: "xml",
        success: function (xml) {

            Xml_Ihbarlar(xml);

        }

    });
}

function Xml_Ihbarlar(xml) {

    $(xml).find('Table').each(function () {

        var IHBAR = new Object();

        IHBAR.SeriNo = $(this).find('SeriNo').text();
        IHBAR.basTarih = $(this).find('basTarih').text();
        IHBAR.sonTarih = $(this).find('sonTarih').text();
        IHBAR.GenelBaslik = $(this).find('GenelBaslik').text();
        IHBAR.hadiseZaman = $(this).find('hadiseZaman').text();
        IHBAR.riskler = $(this).find('riskler').text();
        IHBAR.GenelDurum = $(this).find('GenelDurum').text();

        IHBAR_LIST.push(IHBAR);
    });

    IhbarDegerleriYaz(Table);

}

function IhbarDegerleriYaz(Table) {

    for (var i = 0; i < IHBAR_LIST.length; i++) {

        ///////////////////////////ID'ler Eşleşecek/////////////////////////////////
    }
}

function SaatDuzeltme(Tarih) {

    return Tarih.toString().substring(8, 10) + ':' + Tarih.toString().substring(10, 12);
}

//************************************Sıcaklık Birimini Hesaplayan Fonksiyonlar********************************************
function sicaklikGoster(sicaklikDeger) {

    if (sicaklikBirim == '1') {
        sicaklikSon = sicaklikDeger;
        sicaklikBirim2 = "°";
    }
    else if (sicaklikBirim == '2') {
        sicaklikSon = (sicaklikDeger * 9) / 5 + 32;
        sicaklikBirim2 = "°";
    }
    else if (sicaklikBirim == '3') {
        sicaklikSon = sicaklikDeger + 273.15;
        sicaklikBirim2 = "°";
    }
}

//************************************Hadise Adını Değiştiren Fonksiyonlar************************************************
function HadiseAdi_Latest(HadiseKodu) {

    var Result = "";

    if (HadiseKodu == "A") {
        Result = "Açık";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/acik.jpg)';
    }
    else if (HadiseKodu == "AB") {
        Result = "Az Bulutlu";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/az_bulutlu.jpg)';
    }
    else if (HadiseKodu == "PB") {
        Result = "Parçalı Bulutlu";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/az_bulutlu.jpg)';
    }
    else if (HadiseKodu == "CB") {
        Result = "Çok Bulutlu";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/cok_bulutlu.jpg)';
    }
    else if (HadiseKodu == "HY") {
        Result = "Hafif Yağmurlu";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/yagmurlu.jpg)';
    }
    else if (HadiseKodu == "Y") {
        Result = "Yağmurlu";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/yagmurlu.jpg)';
    }
    else if (HadiseKodu == "KY") {
        Result = "Kuvvetli Yağmurlu";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/saganak.jpg)';
    }
    else if (HadiseKodu == "KKY") {
        Result = "Karla Karışık Yağmurlu";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/karli.jpg)';
    }
    else if (HadiseKodu == "HKY") {
        Result = "Hafif Kar Yağışlı";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/karli.jpg)';
    }
    else if (HadiseKodu == "K") {
        Result = "Kar Yağışlı";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/karli.jpg)';
    }
    else if (HadiseKodu == "YKY") {
        Result = "Yoğun Kar Yağışlı";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/karli.jpg)';
    }
    else if (HadiseKodu == "HSY") {
        Result = "Hafif Sağanak Yağışlı";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/saganak.jpg)';
    }
    else if (HadiseKodu == "SY") {
        Result = "Sağanak Yağışlı";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/saganak.jpg)';
    }
    else if (HadiseKodu == "KSY") {
        Result = "Kuvvetli Sağanak Yağışlı";
        document.getElementById('pageSondurum0').style.backgroundImage = 'url(Background/saganak.jpg)';
    }
    else if (HadiseKodu == "MSY") {
        Result = "YerYer Sağanak Yağışlı";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/saganak.jpg)';
    }
    else if (HadiseKodu == "DY") {
        Result = "Dolu Yağışı";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/saganak.jpg)';
    }
    else if (HadiseKodu == "GSY") {
        Result = "Gökgürültülü Sağanak Yağış";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/gokgurultulu.jpg)';
    }
    else if (HadiseKodu == "SIS") {
        Result = "Sisli";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/sisli.jpg)';
    }
    else if (HadiseKodu == "DMN") {
        Result = "Dumanlı";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/puslu.jpg)';
    }
    else if (HadiseKodu == "PUS") {
        Result = "Puslu";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/puslu.jpg)';
    }
    else if (HadiseKodu == "KF") {
        Result = "Kum Fırtınası";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/ruzgarli.jpg)';
    }
    else if (HadiseKodu == "R") {
        Result = "Rüzgarlı";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/ruzgarli.jpg)';
    }
    else if (HadiseKodu == "R") {
        Result = "Kuvvetli Rüzgarlı";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/ruzgarli.jpg)';
    }
    else if (HadiseKodu == "SGK") {
        Result = "Soğuk";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/soguk.jpg)';
    }
    else if (HadiseKodu == "Sgk") {
        Result = "Soğuk";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/soguk.jpg)';
    }
    else if (HadiseKodu == "SCK") {
        Result = "Sıcak";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/sicak.jpg)';
    }
    else if (HadiseKodu == "Sck") {
        Result = "Sıcak";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/sicak.jpg)';
    }
    else {
        Result = "//";
        document.getElementById('pageSonDurum0').style.backgroundImage = 'url(Background/default.jpg)';
    }
    return Result;
}
function HadiseAdi_Latest_Merkezler(HadiseKodu, indis) {

    var Result = "";

    if (HadiseKodu == "A") {
        Result = "Açık";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/acik.jpg)';
    }
    else if (HadiseKodu == "AB") {
        Result = "Az Bulutlu";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/az_bulutlu.jpg)';
    }
    else if (HadiseKodu == "PB") {
        Result = "Parçalı Bulutlu";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/az_bulutlu.jpg)';
    }
    else if (HadiseKodu == "CB") {
        Result = "Çok Bulutlu";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/cok_bulutlu.jpg)';
    }
    else if (HadiseKodu == "HY") {
        Result = "Hafif Yağmurlu";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/yagmurlu.jpg)';
    }
    else if (HadiseKodu == "Y") {
        Result = "Yağmurlu";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/yagmurlu.jpg)';
    }
    else if (HadiseKodu == "KY") {
        Result = "Kuvvetli Yağmurlu";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/saganak.jpg)';
    }
    else if (HadiseKodu == "KKY") {
        Result = "Karla Karışık Yağmurlu";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/karli.jpg)';
    }
    else if (HadiseKodu == "HKY") {
        Result = "Hafif Kar Yağışlı";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/karli.jpg)';
    }
    else if (HadiseKodu == "K") {
        Result = "Kar Yağışlı";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/karli.jpg)';
    }
    else if (HadiseKodu == "YKY") {
        Result = "Yoğun Kar Yağışlı";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/karli.jpg)';
    }
    else if (HadiseKodu == "HSY") {
        Result = "Hafif Sağanak Yağışlı";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/saganak.jpg)';
    }
    else if (HadiseKodu == "SY") {
        Result = "Sağanak Yağışlı";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/saganak.jpg)';
    }
    else if (HadiseKodu == "KSY") {
        Result = "Kuvvetli Sağanak Yağışlı";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/saganak.jpg)';
    }
    else if (HadiseKodu == "MSY") {
        Result = "YerYer Sağanak Yağışlı";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/saganak.jpg)';
    }
    else if (HadiseKodu == "DY") {
        Result = "Dolu Yağışı";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/saganak.jpg)';
    }
    else if (HadiseKodu == "GSY") {
        Result = "Gökgürültülü Sağanak Yağış";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/gokgurultulu.jpg)';
    }
    else if (HadiseKodu == "SIS") {
        Result = "Sisli";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/sisli.jpg)';
    }
    else if (HadiseKodu == "DMN") {
        Result = "Dumanlı";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/puslu.jpg)';
    }
    else if (HadiseKodu == "PUS") {
        Result = "Puslu";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/puslu.jpg)';
    }
    else if (HadiseKodu == "KF") {
        Result = "Kum Fırtınası";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/ruzgarli.jpg)';
    }
    else if (HadiseKodu == "R") {
        Result = "Rüzgarlı";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/ruzgarli.jpg)';
    }
    else if (HadiseKodu == "R") {
        Result = "Kuvvetli Rüzgarlı";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/ruzgarli.jpg)';
    }
    else if (HadiseKodu == "SGK") {
        Result = "Soğuk";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/soguk.jpg)';
    }
    else if (HadiseKodu == "Sgk") {
        Result = "Soğuk";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/soguk.jpg)';
    }
    else if (HadiseKodu == "SCK") {
        Result = "Sıcak";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/sicak.jpg)';
    }
    else if (HadiseKodu == "Sck") {
        Result = "Sıcak";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/sicak.jpg)';
    }
    else {
        Result = "//";
        document.getElementById('M' + indis).style.backgroundImage = 'url(Background/default.jpg)';
    }
    return Result;
}

//************************************Rüzgar Yönünü Değiştiren Fonksiyonlar************************************************
function ruzgar_renderer(ruzgar_yonu) {

    var value = parseInt(ruzgar_yonu);

    if (value >= 0 && value <= 360) {

        if (value == 0) {
            $("#RuzgarYon0").attr("src", "Wind/0.png");
        }
        else if (value > 0 && value <= 10) {
            $("#RuzgarYon0").attr("src", "Wind/10.png");
        }
        else if (value > 10 && value <= 20) {
            $("#RuzgarYon0").attr("src", "Wind/20.png");
        }
        else if (value > 20 && value <= 30) {
            $("#RuzgarYon0").attr("src", "Wind/30.png");
        }
        else if (value > 30 && value <= 40) {
            $("#RuzgarYon0").attr("src", "Wind/40.png");
        }
        else if (value > 40 && value <= 50) {
            $("#RuzgarYon0").attr("src", "Wind/50.png");
        }
        else if (value > 50 && value <= 60) {
            $("#RuzgarYon0").attr("src", "Wind/60.png");
        }
        else if (value > 60 && value <= 70) {
            $("#RuzgarYon0").attr("src", "Wind/70.png");
        }
        else if (value > 70 && value <= 80) {
            $("#RuzgarYon0").attr("src", "Wind/80.png");
        }
        else if (value > 80 && value <= 90) {
            $("#RuzgarYon0").attr("src", "Wind/90.png");
        }
        else if (value > 90 && value <= 100) {
            $("#RuzgarYon0").attr("src", "Wind/100.png");
        }
        else if (value > 100 && value <= 110) {
            $("#RuzgarYon0").attr("src", "Wind/110.png");
        }
        else if (value > 110 && value <= 120) {
            $("#RuzgarYon0").attr("src", "Wind/120.png");
        }
        else if (value > 120 && value <= 130) {
            $("#RuzgarYon0").attr("src", "Wind/130.png");
        }
        else if (value > 130 && value <= 140) {
            $("#RuzgarYon0").attr("src", "Wind/140.png");
        }
        else if (value > 140 && value <= 150) {
            $("#RuzgarYon0").attr("src", "Wind/150.png");
        }
        else if (value > 150 && value <= 160) {
            $("#RuzgarYon0").attr("src", "Wind/160.png");
        }
        else if (value > 160 && value <= 170) {
            $("#RuzgarYon0").attr("src", "Wind/170.png");
        }
        else if (value > 170 && value <= 180) {
            $("#RuzgarYon0").attr("src", "Wind/180.png");
        }
        else if (value > 180 && value <= 190) {
            $("#RuzgarYon0").attr("src", "Wind/190.png");
        }
        else if (value > 190 && value <= 200) {
            $("#RuzgarYon0").attr("src", "Wind/200.png");
        }
        else if (value > 200 && value <= 210) {
            $("#RuzgarYon0").attr("src", "Wind/210.png");
        }
        else if (value > 210 && value <= 220) {
            $("#RuzgarYon0").attr("src", "Wind/220.png");
        }
        else if (value > 220 && value <= 230) {
            $("#RuzgarYon0").attr("src", "Wind/230.png");
        }
        else if (value > 230 && value <= 240) {
            $("#RuzgarYon0").attr("src", "Wind/240.png");
        }
        else if (value > 240 && value <= 250) {
            $("#RuzgarYon0").attr("src", "Wind/250.png");
        }
        else if (value > 250 && value <= 260) {
            $("#RuzgarYon0").attr("src", "Wind/260.png");
        }
        else if (value > 260 && value <= 270) {
            $("#RuzgarYon0").attr("src", "Wind/270.png");
        }
        else if (value > 270 && value <= 280) {
            $("#RuzgarYon0").attr("src", "Wind/280.png");
        }
        else if (value > 280 && value <= 290) {
            $("#RuzgarYon0").attr("src", "Wind/290.png");
        }
        else if (value > 290 && value <= 300) {
            $("#RuzgarYon0").attr("src", "Wind/300.png");
        }
        else if (value > 300 && value <= 310) {
            $("#RuzgarYon0").attr("src", "Wind/310.png");
        }
        else if (value > 310 && value <= 320) {
            $("#RuzgarYon0").attr("src", "Wind/320.png");
        }
        else if (value > 320 && value <= 330) {
            $("#RuzgarYon0").attr("src", "Wind/330.png");
        }
        else if (value > 330 && value <= 340) {
            $("#RuzgarYon0").attr("src", "Wind/340.png");
        }
        else if (value > 340 && value <= 350) {
            $("#RuzgarYon0").attr("src", "Wind/350.png");
        }
        else if (value > 350 && value <= 360) {
            $("#RuzgarYon0").attr("src", "Wind/360.png");
        }
        else {
            $("#RuzgarYon0").attr("src", "Wind/null.png");
        }
    }
}
function ruzgar_renderer_Merkezler(ruzgar_yonu, indis) {

    var value = parseInt(ruzgar_yonu);

    if (value >= 0 && value <= 360) {

        if (value == 0) {
            $("#RuzgarYon" + indis).attr("src", "Wind/0.png");
        }
        else if (value > 0 && value <= 10) {
            $("#RuzgarYon" + indis).attr("src", "Wind/10.png");
        }
        else if (value > 10 && value <= 20) {
            $("#RuzgarYon" + indis).attr("src", "Wind/20.png");
        }
        else if (value > 20 && value <= 30) {
            $("#RuzgarYon" + indis).attr("src", "Wind/30.png");
        }
        else if (value > 30 && value <= 40) {
            $("#RuzgarYon" + indis).attr("src", "Wind/40.png");
        }
        else if (value > 40 && value <= 50) {
            $("#RuzgarYon" + indis).attr("src", "Wind/50.png");
        }
        else if (value > 50 && value <= 60) {
            $("#RuzgarYon" + indis).attr("src", "Wind/60.png");
        }
        else if (value > 60 && value <= 70) {
            $("#RuzgarYon" + indis).attr("src", "Wind/70.png");
        }
        else if (value > 70 && value <= 80) {
            $("#RuzgarYon" + indis).attr("src", "Wind/80.png");
        }
        else if (value > 80 && value <= 90) {
            $("#RuzgarYon" + indis).attr("src", "Wind/90.png");
        }
        else if (value > 90 && value <= 100) {
            $("#RuzgarYon" + indis).attr("src", "Wind/100.png");
        }
        else if (value > 100 && value <= 110) {
            $("#RuzgarYon" + indis).attr("src", "Wind/110.png");
        }
        else if (value > 110 && value <= 120) {
            $("#RuzgarYon" + indis).attr("src", "Wind/120.png");
        }
        else if (value > 120 && value <= 130) {
            $("#RuzgarYon" + indis).attr("src", "Wind/130.png");
        }
        else if (value > 130 && value <= 140) {
            $("#RuzgarYon" + indis).attr("src", "Wind/140.png");
        }
        else if (value > 140 && value <= 150) {
            $("#RuzgarYon" + indis).attr("src", "Wind/150.png");
        }
        else if (value > 150 && value <= 160) {
            $("#RuzgarYon" + indis).attr("src", "Wind/160.png");
        }
        else if (value > 160 && value <= 170) {
            $("#RuzgarYon" + indis).attr("src", "Wind/170.png");
        }
        else if (value > 170 && value <= 180) {
            $("#RuzgarYon" + indis).attr("src", "Wind/180.png");
        }
        else if (value > 180 && value <= 190) {
            $("#RuzgarYon" + indis).attr("src", "Wind/190.png");
        }
        else if (value > 190 && value <= 200) {
            $("#RuzgarYon" + indis).attr("src", "Wind/200.png");
        }
        else if (value > 200 && value <= 210) {
            $("#RuzgarYon" + indis).attr("src", "Wind/210.png");
        }
        else if (value > 210 && value <= 220) {
            $("#RuzgarYon" + indis).attr("src", "Wind/220.png");
        }
        else if (value > 220 && value <= 230) {
            $("#RuzgarYon" + indis).attr("src", "Wind/230.png");
        }
        else if (value > 230 && value <= 240) {
            $("#RuzgarYon" + indis).attr("src", "Wind/240.png");
        }
        else if (value > 240 && value <= 250) {
            $("#RuzgarYon" + indis).attr("src", "Wind/250.png");
        }
        else if (value > 250 && value <= 260) {
            $("#RuzgarYon" + indis).attr("src", "Wind/260.png");
        }
        else if (value > 260 && value <= 270) {
            $("#RuzgarYon" + indis).attr("src", "Wind/270.png");
        }
        else if (value > 270 && value <= 280) {
            $("#RuzgarYon" + indis).attr("src", "Wind/280.png");
        }
        else if (value > 280 && value <= 290) {
            $("#RuzgarYon" + indis).attr("src", "Wind/290.png");
        }
        else if (value > 290 && value <= 300) {
            $("#RuzgarYon" + indis).attr("src", "Wind/300.png");
        }
        else if (value > 300 && value <= 310) {
            $("#RuzgarYon" + indis).attr("src", "Wind/310.png");
        }
        else if (value > 310 && value <= 320) {
            $("#RuzgarYon" + indis).attr("src", "Wind/320.png");
        }
        else if (value > 320 && value <= 330) {
            $("#RuzgarYon" + indis).attr("src", "Wind/330.png");
        }
        else if (value > 330 && value <= 340) {
            $("#RuzgarYon" + indis).attr("src", "Wind/340.png");
        }
        else if (value > 340 && value <= 350) {
            $("#RuzgarYon" + indis).attr("src", "Wind/350.png");
        }
        else if (value > 350 && value <= 360) {
            $("#RuzgarYon" + indis).attr("src", "Wind/360.png");
        }
        else {
            $("#RuzgarYon" + indis).attr("src", "Wind/null.png");
        }
    }
}

//************************************Yağış Kovasını Değiştiren Fonksiyonlar************************************************
function yagis_renderer(yagis_miktari) {

    var value = parseFloat(yagis_miktari);

    if (value > 0 && value <= 1) {
        $("#Prec0").attr("src", "IMAGES/Prec/yagis1.png");
    }
    else if (value > 1 && value <= 10) {
        $("#Prec0").attr("src", "IMAGES/Prec/yagis2.png");
    }
    else if (value > 10) {
        $("#Prec0").attr("src", "IMAGES/Prec/yagis3.png");
    }
    else {
        $("#Prec0").attr("src", "IMAGES/Prec/yagis0.png");
    }
}
function yagis_renderer_Merkezler(yagis_miktari, indis) {

    var value = parseFloat(yagis_miktari);

    if (value > 0 && value <= 1) {
        $("#Prec" + indis).attr("src", "IMAGES/Prec/yagis1.png");
    }
    else if (value > 1 && value <= 10) {
        $("#Prec" + indis).attr("src", "IMAGES/Prec/yagis2.png");
    }
    else if (value > 10) {
        $("#Prec" + indis).attr("src", "IMAGES/Prec/yagis3.png");
    }
    else {
        $("#Prec0").attr("src", "IMAGES/Prec/yagis0.png");
    }
}

