var n = prompt("Enter Your Name").toUpperCase();
if (n === null || n === "") {
    n = "player";
};
function pName() {
    if (n === null || n === "") {
        document.getElementById("name").innerHTML = "Player";
    } else {
        document.getElementById("name").innerHTML = n;
    }
}
pName();
function rollDice() {
    var random =Math.floor(Math.random() * 6) + 1;
    var img = "dice" + random + ".png";
    var imgsrc = "/images/dice/" + img;
    var img1 = document.querySelectorAll("img")[0];
    img1.setAttribute("src", imgsrc);
    var random1 =Math.floor(Math.random() * 6) + 1;
    var img1 = "dice" + random1 + ".png";
    var imgsrc1 = "/images/dice/" + img1;
    var img2 = document.querySelectorAll("img")[1];
    img2.setAttribute("src", imgsrc1);
    if (random > random1) {
        document.getElementById("result").innerHTML = n +" wins 🏆!";
    }
    else if (random1 > random){
         document.getElementById("result").innerHTML = "COMPUTER wins 🏆!";
    }
    else {
        document.getElementById("result").innerHTML = "Draw!";
    }
}
document.getElementById("press").addEventListener("click", function () {
    this.classList.add("pressed");
    setTimeout(() => {
        this.classList.remove("pressed");
    }, 100);
});
