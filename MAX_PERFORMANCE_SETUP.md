# Max performance setup

Use `index_max_performance.html` from the ChatGPT deliverable as the new `index.html`.

## Required folders
- `images/thumbs/`
- `images/previews/`

## Generate assets locally
### Windows CMD
```cmd
mkdir images\thumbs
mkdir images\previews
for %i in (images\*.jpg images\*.jpeg images\*.png images\*.avif) do magick "%i" -resize 600x600^ -gravity center -extent 600x600 -quality 82 "images\thumbs\%~ni.webp"
for %i in (images\*.jpg images\*.jpeg images\*.png images\*.avif) do magick "%i" -resize 1600x1600\> -quality 84 "images\previews\%~ni.webp"
```

### PowerShell
```powershell
New-Item -ItemType Directory -Force images/thumbs | Out-Null
New-Item -ItemType Directory -Force images/previews | Out-Null
Get-ChildItem images -File | Where-Object {$_.Extension -match '\.(jpg|jpeg|png|avif)$'} | ForEach-Object {
  magick $_.FullName -resize 600x600^ -gravity center -extent 600x600 -quality 82 ("images/thumbs/{0}.webp" -f $_.BaseName)
  magick $_.FullName -resize 1600x1600\> -quality 84 ("images/previews/{0}.webp" -f $_.BaseName)
}
```

## Then push
Commit the generated `images/thumbs/` and `images/previews/` folders together with the optimized `index.html`.
