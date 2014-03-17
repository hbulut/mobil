function shouldRotateToOrientation(interfaceOrientation) {
    return false;//(1 === interfaceOrientation);
}

function btnAyarlar() {
    //A: °C
    if (document.getElementById('A').checked) {
        window.localStorage.setItem("SicaklikBirim", "1");       
    }
    //B: °F
    else if (document.getElementById('B').checked) {
        window.localStorage.setItem("SicaklikBirim", "2");     
    }
    //C: °K
    else {
        window.localStorage.setItem("SicaklikBirim", "3");
    }

    if (document.getElementById('D').checked) {
        window.localStorage.setItem("RuzgarBirim", "9");


    }
    else if (document.getElementById('E').checked) {
        window.localStorage.setItem("RuzgarBirim", "8");


    }
    else {
        window.localStorage.setItem("RuzgarBirim", "7");


    }

    if (document.getElementById('J').checked) {
        window.localStorage.setItem("BasincBirim", "4");


    }
    else if (document.getElementById('K').checked) {
        window.localStorage.setItem("BasincBirim", "5");
    }
    else {
        window.localStorage.setItem("BasincBirim", "6");
    }



    sicaklikBirim = window.localStorage.getItem("SicaklikBirim") == null ? '1' : window.localStorage.getItem("SicaklikBirim");
    ruzgarBirim = window.localStorage.getItem("RuzgarBirim") == null ? '9' : window.localStorage.getItem("RuzgarBirim");
    basincBirim = window.localStorage.getItem("BasincBirim") == null ? '4' : window.localStorage.getItem("BasincBirim");

    Verileri_Doldur(ISTASYONVERILERI[indis].No);

    ILLER();

    var test = window.localStorage.getItem("favM");

    if (test != null)
        MERKEZLER = test.split(',');
    Ekle();
    document.location.href = '#wrap';

}
$(document).ready(function () {

    var Sicaklik = window.localStorage.getItem("SicaklikBirim");
    var Ruzgar = window.localStorage.getItem("RuzgarBirim");
    var Basinc = window.localStorage.getItem("BasincBirim");

    if (Sicaklik == "2") {
        document.getElementById('B').checked = true;
    }
    else if (Sicaklik == "3") {
        document.getElementById('C').checked = true;
    }
    else {
        document.getElementById('A').checked = true;
    }

    if (Ruzgar == "8") {
        document.getElementById('E').checked = true;
    }
    else if (Ruzgar == "7") {
        document.getElementById('F').checked = true;
    }
    else {
        document.getElementById('D').checked = true;
    }
    if (Basinc == "5") {
        document.getElementById('K').checked = true;
    }
    else if (Basinc == "6") {
        document.getElementById('L').checked = true;
    }
    else {
        document.getElementById('J').checked = true;
    }
    //alert('a1');
    //$.mobile.orientationChangeEnabled = false
    //alert('a');
    //screen.msLockOrientation("portrait-primary", "portrait-secondary");

});

