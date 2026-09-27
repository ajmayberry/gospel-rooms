# The Gospel in Twenty-Five Rooms

The life of Jesus as twenty-five isometric risograph dioramas on one printed sheet, from the
Annunciation to the upper room after the Ascension. Every caption is the King James text,
verbatim. Every drawn detail answers to a verse, and where scripture is silent the scene shows
plain period background that makes no claim.

- **One file:** `index.html`, 156423 bytes, one network request. Canvas 2D only: no images, fonts or libraries.
- **Build:** `node build.mjs` inlines `src/*.js` and `src/head.html` into `index.html`.
- **Controls:** drag (with inertia), scroll or pinch to zoom, double-click or double-tap a room to fly to it, ← → ↑ ↓ to move between rooms, + − to zoom, 0 for the whole sheet, C to hide the card, space to pause the tour. The tour resumes 20 s after the last input.
- **Query params:** `?instant` skips the print-in, `?scene=n` starts at room n, `?notour` turns the tour off, `?t=` offsets scene time, `?debug` shows fps and cache sizes.

## The scenes

| # | Room | Verse | Card text (KJV) |
|---|---|---|---|
| 1 | The Annunciation | Luke 1:28 | “And the angel came in unto her, and said, Hail, thou that art highly favoured, the Lord is with thee: blessed art thou among women.” |
| 2 | The Visitation | Luke 1:42 | “And she spake out with a loud voice, and said, Blessed art thou among women, and blessed is the fruit of thy womb.” |
| 3 | The Nativity | Luke 2:7 | “And she brought forth her firstborn son, and wrapped him in swaddling clothes, and laid him in a manger; because there was no room for them in the inn.” |
| 4 | The Shepherds | Luke 2:9 | “And, lo, the angel of the Lord came upon them, and the glory of the Lord shone round about them: and they were sore afraid.” |
| 5 | The Presentation | Luke 2:35 | “(Yea, a sword shall pierce through thy own soul also,) that the thoughts of many hearts may be revealed.” |
| 6 | The Wise Men | Matthew 2:11 | “And when they were come into the house, they saw the young child with Mary his mother, and fell down, and worshipped him: and when they had opened their treasures, they presented unto him gifts; gold, and frankincense and myrrh.” |
| 7 | The Flight into Egypt | Matthew 2:14 | “When he arose, he took the young child and his mother by night, and departed into Egypt:” |
| 8 | Nazareth | Luke 2:40 | “And the child grew, and waxed strong in spirit, filled with wisdom: and the grace of God was upon him.” |
| 9 | The Search | Luke 2:44 | “But they, supposing him to have been in the company, went a day’s journey; and they sought him among their kinsfolk and acquaintance.” |
| 10 | Among the Doctors | Luke 2:46 | “And it came to pass, that after three days they found him in the temple, sitting in the midst of the doctors, both hearing them, and asking them questions.” |
| 11 | The Carpenter’s Son | Luke 2:52 | “And Jesus increased in wisdom and stature, and in favour with God and man.” |
| 12 | The Baptism | Matthew 3:16 | “And Jesus, when he was baptized, went up straightway out of the water: and, lo, the heavens were opened unto him, and he saw the Spirit of God descending like a dove, and lighting upon him:” |
| 13 | The Wedding at Cana | John 2:5 | “His mother saith unto the servants, Whatsoever he saith unto you, do it.” |
| 14 | The Great Catch | Luke 5:10 | “And so was also James, and John, the sons of Zebedee, which were partners with Simon. And Jesus said unto Simon, Fear not; from henceforth thou shalt catch men.” |
| 15 | The Sermon on the Mount | Matthew 6:28 | “And why take ye thought for raiment? Consider the lilies of the field, how they grow; they toil not, neither do they spin:” |
| 16 | The Five Thousand | John 6:9 | “There is a lad here, which hath five barley loaves, and two small fishes: but what are they among so many?” |
| 17 | Lazarus | John 11:43 | “And when he thus had spoken, he cried with a loud voice, Lazarus, come forth.” |
| 18 | The Entry into Jerusalem | Matthew 21:9 | “And the multitudes that went before, and that followed, cried, saying, Hosanna to the son of David: Blessed is he that cometh in the name of the Lord; Hosanna in the highest.” |
| 19 | The Last Supper | Luke 22:19 | “And he took bread, and gave thanks, and brake it, and gave unto them, saying, This is my body which is given for you: this do in remembrance of me.” |
| 20 | Gethsemane | Luke 22:42 | “Saying, Father, if thou be willing, remove this cup from me: nevertheless not my will, but thine, be done.” |
| 21 | Behold the Man | John 19:5 | “Then came Jesus forth, wearing the crown of thorns, and the purple robe. And Pilate saith unto them, Behold the man!” |
| 22 | The Cross | John 19:26 | “When Jesus therefore saw his mother, and the disciple standing by, whom he loved, he saith unto his mother, Woman, behold thy son!” |
| 23 | The Garden Tomb | John 20:16 | “Jesus saith unto her, Mary. She turned herself, and saith unto him, Rabboni; which is to say, Master.” |
| 24 | The Ascension | Acts 1:9 | “And when he had spoken these things, while they beheld, he was taken up; and a cloud received him out of their sight.” |
| 25 | The Upper Room | Acts 1:14 | “These all continued with one accord in prayer and supplication, with the women, and Mary the mother of Jesus, and with his brethren.” |

## The inks

Four spot inks, each a halftone screen at its own angle, each misregistered by a fraction of a
unit, overprinted by multiplication. Every colour on the sheet is one of these or a mix of them.

| Ink | RGB | Screen angle |
|---|---|---|
| Sunflower | 248 200 46 | 0° |
| Teal | 18 148 132 | 45° |
| Coral | 238 86 112 | 75° |
| Federal | 38 60 136 | 15° |

The purple robe at Pilate's is the one true overprint of coral over federal (John 19:2).

## How the print simulation works

1. Each room is built as flat primitives (fills, tapered strokes, light rings) in paper units, projected isometrically. The slab is 10 m and 1 m is 20 units in every room, so a person is 1.75 m everywhere.
2. The primitives are painted into four ink-density plates plus a mask. Fills knock out the plates under them, and light removes dark ink and adds sunflower in stepped rings. There are never gradients.
3. The press walks the pixels in time-sliced rows. For each plate it samples density at that plate's misregistered offset, then turns it into a dot on that plate's rotated grid. The dots carry jitter, starved dots, and speckled dropout in solids. The result is overprinted onto the paper colour.
4. Each room is baked three times with different seeds for the wobble. Cycling them at 3 Hz gives the boiling line.
5. Rooms bake in a background layer and a foreground layer, and people are drawn between the two. That puts a figure behind a table or inside a boat.
6. People are sprites that share a single skeleton. A sprite is keyed by look, clip, frame, facing and boil seed, so a crowd costs a handful of bakes.
7. Resolution levels (1×, 2.25×, 4.5×) are baked on demand as you zoom, held in an LRU cache, and fall back to the nearest level while the next one prints.

## The verse behind each detail

- **No halos, no wings.** Angels appear as men in shining white (Luke 24:4, Acts 1:10). God is shown only as light and cloud (Luke 2:9, Acts 1:9).
- **Jesus' clothes.** He wears undyed cloth with blue tassels at the corners (Num 15:38, Matt 9:20). The purple robe and the crown of thorns appear only at Pilate's (John 19:2, 19:5).
- **Mary.** She is dressed like the other women. She is present at the birth, the Presentation, the Magi, the flight, Nazareth, the search, the Temple, Cana, the Cross and the upper room (Luke 2, Matt 2, John 2:1, John 19:25, Acts 1:14).
- **The Nativity.** It shows a manger, swaddling clothes and "no room" (Luke 2:7). There is no ox, donkey or cave, because no verse puts them there. The star appears later, over a *house* (Matt 2:9–11), so here it is hidden on a jar.
- **The Wise Men.** They come into the house and find the young child with Mary his mother (Matt 2:11). They bring three gifts. No crowns and no camels are named.
- **The flight into Egypt.** It happens by night (Matt 2:14). No donkey is named.
- **Among the doctors.** Jesus is twelve and "sitting in the midst" (Luke 2:42, 2:46). The teachers have broad borders and phylacteries (Matt 23:5). Mary and Joseph arrive looking for him (Luke 2:48).
- **The carpenter's son.** It shows his brothers James, Joses, Juda and Simon, and his sisters (Mark 6:3). Joseph is not shown after the Temple.
- **The Baptism.** John wears camel's hair with a leather girdle (Matt 3:4), the heavens open and the dove descends (Matt 3:16).
- **Cana.** There are six waterpots of stone, filled to the brim (John 2:6–7).
- **The great catch.** Two boats and a breaking net (Luke 5:6–7). Simon falls at Jesus' knees (5:8).
- **The five thousand.** They sit in ranks on much grass (Mark 6:40, John 6:10). A lad has five loaves and two fishes (6:9), and twelve baskets are left over (6:13).
- **Lazarus.** A cave, the stone taken away, and the graveclothes with a napkin about his face (John 11:38–44).
- **The entry into Jerusalem.** Both the ass and the colt are there (Matt 21:7). Garments and branches are spread (21:8), and palm branches waved (John 12:13).
- **The Last Supper.** A large upper room (Luke 22:12). They recline, and John leans on Jesus (John 13:23). Judas goes out into the night (13:30).
- **Gethsemane.** An angel strengthens him (Luke 22:43) while the disciples sleep (22:45). The band comes with lanterns and torches (John 18:3).
- **Pilate.** Behold the Man is set on the Pavement, Gabbatha, before the judgment seat (John 19:13).
- **The Cross.** Three crosses (John 19:18), with the title board (19:19) and darkness over the land (Matt 27:45). The four women and the beloved disciple stand by (John 19:25–26), and soldiers cast lots (19:24).
- **The garden tomb.** A garden (John 19:41) and the stone taken away. Two angels sit, one at the head and one at the feet (20:12), and Mary Magdalene supposes him the gardener (20:15).
- **The Ascension.** He lifts up his hands (Luke 24:50) and a cloud receives him (Acts 1:9). Two men in white stand by (Acts 1:10).
- **The motif.** A small eight-pointed gold star, "the bright and morning star" (Rev 22:16), is hidden in every room. It stands openly only over the house of the Wise Men (Matt 2:9).

## Set dressing

Where scripture is silent, rooms carry plain period household goods that make no claim: shelves of
jars, hanging cloths, grain sacks, benches, woodpiles, field walls, potted plants, woven rugs. A few
are scriptural in their own right: the dove sellers' cages (John 2:14), the basin and towel in the
upper room (John 13:5), Pilate's water (Matt 27:24), the women's spices (Luke 24:1). The unnamed
crowd wears ordinary period dyes; named figures keep the colours set for them.
