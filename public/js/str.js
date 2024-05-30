function convertfirsttoUpper() {
    // window.scrollTo(0, 500);
    var str = document.getElementById("char").value;
    var str2 = str.length;
    var str3 = str.slice(1,str2);
    var str4 = str3.toLowerCase();
    var str5 = str.slice(0, 1);
    var str6 = str5.toUpperCase();
    var str7 = str6+str4
    document.getElementById("result").innerHTML = "\n" + str7;
}
function convertlower() {
//    window.scrollTo(0, 500);
    var str = document.getElementById("char").value;
    var str2 = str.length;
    var str3 = str.toLowerCase();
    document.getElementById("result").innerHTML = "\n" + str3;
}
function convertUpper() {
//    window.scrollTo(2, 500);
    var str = document.getElementById("char").value;
    var str2 = str.length;
    var str3 = str.toUpperCase();
 document.getElementById("result").innerHTML = "\n" + str3;

}
function convertfirsttoLower() {
//    window.scrollTo(0, 500);
    var str = document.getElementById("char").value;
    var str2 = str.length;
    var str3 = str.slice(1,str2);
    var str4 = str3.toUpperCase();
    var str5 = str.slice(0, 1);
    var str6 = str5.toLowerCase();
    var str7 = str6+str4
  document.getElementById("result").innerHTML = "\n" + str7;
}
function calclength() {
    var str = document.getElementById("char").value;
    var length = str.length;
    document.getElementById("length").innerHTML = length+"  ";
}
function eraseText() {
    location.reload();
}
function copy() {
    var result1 = document.getElementById("result").value;
    navigator.clipboard.writeText(result1);
    document.getElementById("msg").innerHTML = "Copied to Clipboard!";
}

