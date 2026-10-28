# Direct Verkocht — brandbook (samenvatting)

DJ-duo. Foute hits, goede feestjes, net over de top. Naam is een knipoog naar
Marktplaats, kringloop en koopjesjagers.

**Stijl:** Classy Trashy — panterprint, glitter, discoballen, kitsch mét smaak.
**Persoonlijkheid:** speels, brutaal, gezellig, kleurrijk, uitgesproken.

## Kleuren

| Token | Hex | Gebruik |
|---|---|---|
| `--rood` | `#FF3131` | accent |
| `--roze` | `#FF3CA6` | accent |
| `--geel` | `#FFEC00` | accent / tape / stickers |
| `--blauw` | `#1769FF` | accent |
| `--zwart` | `#111111` | tekst, logo |
| `--creme` | `#F7F2E9` | achtergrond |

Plus drie texturen in `assets/img/textures/`:

- **panterprint** en **discoprint** — uit het brandbook geknipt
- **rail** en **sliert1-3** — uit de foto van de folieslinger geknipt.
  De rail hangt bovenaan de hero, de slierten zijn losse linten die bij
  het openen naar beneden vallen, over de wordmark hangen en voor de
  cursor wijken.

## Typografie

- **Display:** Chunko Bold — vet, rond, scheef gezet. ⚠️ Zie licentie hieronder.
- **Labels:** handgeschreven marker (brandbook gebruikt dit voor kopjes op tape).
- **Body:** schreefloze geometrische sans.

> ⚠️ **Licentie.** De meegeleverde `Chunko Bold Demo` is gratis voor
> **persoonlijk gebruik only — expliciet geen commercieel gebruik**. Een
> boekingssite van een DJ-duo is commercieel. Volledige versie kopen bij
> zarmatype.com/font/chunko-bold/ voordat de site live gaat.

## Elementen (`assets/img/elements/`)

| # | Element | # | Element |
|---|---|---|---|
| 1 | geel tape / markerstreep | 13 | kraftpapier strook |
| 2 | hand houdt discobal vast | 14 | panterprint ster |
| 3 | discobal met haakje | 15 | winkelwagen (tekening) |
| 4 | discobal met roze sterren | 16 | winkelwagen met cadeau |
| 5 | €11,11 knalster geel/rood | 17 | verkreukelde kassabon |
| 6 | €0,00 geel prijskaartje | 18 | 5 papieren sterretjes |
| 7 | €0,00 snipper + smiley | 19 | 3 zwarte flits-snippers |
| 8 | barcode geel/roze, scheef | 20 | roze ster, getekend |
| 9 | barcode zwart op wit | 21 | euroteken blauw |
| 10 | barcode geel | 22 | euroteken roze |
| 11 | panterprint verfvlek | 23 | euroteken rood |
| 12 | panterprint strook | – | krant: gescheurde krantensnipper |

## Foto's (`assets/img/foto/`)

Uit de shoot, teruggebracht tot webp (samen ~0,6 MB).

| Bestand | Waar |
| --- | --- |
| `duo.webp` | de grote foto bij "Dat zijn wij" |
| `selfie.webp`, `boven.webp` | kiekjes in de hero |
| `sokkel.webp`, `kar.webp` | kiekjes bij de video |
| `zit.webp` | kiekje bij "Dat zijn wij" |
| `bril.webp` | kiekje bij contact |
| `knip-hotdog.webp` | vrijstaand geknipt, rechtsonder in de hero |

Een kiekje is een `<figure class="snap">` in de deco-laag van een sectie: witte
rand, plakband, harde slagschaduw, en met `data-drift` drijft het mee met de
scroll. De positie staat per modifier in de CSS (`.snap--hero-l` enzovoort).

Het knipsel is met de hand vrijgemaakt: de witte studio-achtergrond is vanaf de
randen weggevuld en de rand is twee keer zacht gemaakt. Foto's met
bewegingsonscherpte of een klatergoud-achtergrond laten zich zo niet knippen —
die staan als kiekje op de pagina.
