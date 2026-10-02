# Prepares site images: crops photos out of Tilda collages and compresses everything to JPEG.
# Keep this file ASCII-only: Windows PowerShell 5 reads BOM-less UTF-8 as ANSI.
# Run: powershell -ExecutionPolicy Bypass -File _source\build-images.ps1

Add-Type -AssemblyName System.Drawing

$src = Join-Path $PSScriptRoot 'img'
$dst = Join-Path $PSScriptRoot '..\site\assets\img'
New-Item -ItemType Directory -Force $dst | Out-Null

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }

function Save-Jpeg($bitmap, $path, $quality) {
    $params = New-Object System.Drawing.Imaging.EncoderParameters 1
    $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$quality)
    $bitmap.Save($path, $codec, $params)
}

# $masks: black rectangles (crop coordinates) painted over leftover collage text
function Export-Image($name, $outName, $maxW, $crop = $null, $quality = 80, $masks = @()) {
    $img = [System.Drawing.Image]::FromFile((Join-Path $src $name))
    if ($crop) { $rect = New-Object System.Drawing.Rectangle $crop[0], $crop[1], $crop[2], $crop[3] }
    else { $rect = New-Object System.Drawing.Rectangle 0, 0, $img.Width, $img.Height }
    $w = [Math]::Min($maxW, $rect.Width)
    $h = [int][Math]::Round($rect.Height * $w / $rect.Width)
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Black)
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $k = $w / $rect.Width
    foreach ($m in $masks) {
        $g.FillRectangle([System.Drawing.Brushes]::Black, [float]($m[0] * $k), [float]($m[1] * $k), [float]($m[2] * $k), [float]($m[3] * $k))
    }
    Save-Jpeg $bmp (Join-Path $dst $outName) $quality
    $g.Dispose(); $bmp.Dispose(); $img.Dispose()
}

# Photos cropped from collages (source pixels: x, y, width, height)
Export-Image 'hero.jpg'    'portrait-hero.jpg'  900  @(578, 330, 502, 612) 86 @(@(0, 0, 75, 48), @(0, 95, 17, 235))
Export-Image 'info-2a.png' 'portrait-neon.jpg'  900  @(476, 96, 576, 760)
Export-Image 'info-2a.png' 'about-process.jpg'  900  @(486, 1136, 386, 516)
Export-Image 'info-2b.png' 'convention.jpg'     900  @(70, 58, 388, 512)
Export-Image 'info-2b.png' 'convention-2.jpg'   900  @(70, 970, 388, 516)
Export-Image 'info-2b.png' 'glow-mirror.jpg'    900  @(517, 424, 388, 512)
Export-Image 'why-1.jpg'   'why-experience.jpg' 900  @(733, 73, 471, 571)
Export-Image 'why-1.jpg'   'why-sketch.jpg'     900  @(733, 704, 471, 570)
Export-Image 'why-1.jpg'   'why-safety.jpg'     900  @(733, 1335, 471, 570)
Export-Image 'why-2.jpg'   'why-honest.jpg'     900  @(733, 73, 471, 571)
Export-Image 'why-2.jpg'   'why-education.jpg'  900  @(733, 704, 471, 570)
Export-Image 'why-2.jpg'   'why-consult.jpg'    900  @(733, 1335, 471, 570)
Export-Image 'why-3.jpg'   'why-fast.jpg'       900  @(733, 73, 471, 571)
Export-Image 'why-3.jpg'   'why-universal.jpg'  900  @(733, 704, 471, 570)

# Galleries
Get-ChildItem $src -File | Where-Object { $_.BaseName -match '^(work|piercing)-\d+$' } | ForEach-Object {
    Export-Image $_.Name ($_.BaseName + '.jpg') 1000
}
Get-ChildItem $src -File | Where-Object { $_.BaseName -match '^studio-\d+$' } | ForEach-Object {
    Export-Image $_.Name ($_.BaseName + '.jpg') 1400
}
Get-ChildItem $src -File | Where-Object { $_.BaseName -match '^review-\d+$' } | ForEach-Object {
    Export-Image $_.Name ($_.BaseName + '.jpg') 720 $null 78
}

$total = (Get-ChildItem $dst | Measure-Object Length -Sum).Sum / 1MB
"Done: {0} files, {1:N1} MB" -f (Get-ChildItem $dst).Count, $total
