$content = [System.IO.File]::ReadAllText("c:\emart-everyday\index.html")
$pattern = '(?m)^(\s+)<div class="unit-info">\s+<span class="strike">(.*?)</span>\s+<span class="unit-highlight">(.*?)</span>'
$replacement = '$1<div class="unit-info">' + "`n" + '$1    <div class="price-wrap">' + "`n" + '$1        <span class="strike">$2</span>' + "`n" + '$1        <span class="unit-highlight">$3</span>' + "`n" + '$1    </div>'
$newContent = [Regex]::Replace($content, $pattern, $replacement)
[System.IO.File]::WriteAllText("c:\emart-everyday\index.html", $newContent, [System.Text.Encoding]::UTF8)
