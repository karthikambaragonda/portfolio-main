function countCharacters()
    {
        var char = document.getElementById("char").value;
        var count = char.length;
        document.getElementById("result").innerHTML = "Number of characters: " + count;
    }
