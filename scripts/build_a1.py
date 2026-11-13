#!/usr/bin/env python3
"""Build a small A1 starter set: Kapitel 0.1, 0.2, 0.3."""
import json
import re
from collections import Counter
from pathlib import Path

RAW: list[tuple] = []


def add(topic, cat, pairs):
    for item in pairs:
        if len(item) == 2:
            w, e = item
            RAW.append((w, e, cat, topic, None))
        else:
            w, e, x = item
            RAW.append((w, e, cat, topic, x))


# Kapitel 0.1 — greetings, people, family
add("a1-k0-1", "other", [
    ("Hallo", "hello", "Hallo, wie geht es dir?"),
    ("Guten Morgen", "good morning", "Guten Morgen! Hast du gut geschlafen?"),
    ("Guten Tag", "good day", "Guten Tag, mein Name ist Anna."),
    ("Guten Abend", "good evening", "Guten Abend, willkommen im Restaurant."),
    ("Gute Nacht", "good night", "Gute Nacht und schlaf gut!"),
    ("Tschüss", "bye", "Tschüss, bis morgen!"),
    ("Auf Wiedersehen", "goodbye", "Auf Wiedersehen und vielen Dank!"),
    ("Bitte", "please / you're welcome", "Einen Kaffee, bitte."),
    ("Danke", "thank you", "Danke für deine Hilfe."),
    ("Entschuldigung", "excuse me / sorry", "Entschuldigung, wo ist der Bahnhof?"),
    ("Ja", "yes", "Ja, ich komme aus Berlin."),
    ("Nein", "no", "Nein, ich habe keine Zeit."),
    ("Wie geht's?", "how are you?", "Hallo Lisa, wie geht's?"),
    ("Freut mich", "nice to meet you", "Freut mich, dich kennenzulernen."),
    ("Willkommen", "welcome", "Willkommen in Deutschland!"),
    ("Ich heiße", "my name is", "Ich heiße Omar und lerne Deutsch."),
])

add("a1-k0-1", "noun", [
    ("der Name", "name", "Mein Name steht auf der Liste."),
    ("der Mann", "man", "Der Mann liest eine Zeitung."),
    ("die Frau", "woman", "Die Frau trinkt Kaffee."),
    ("das Kind", "child", "Das Kind spielt im Garten."),
    ("der Freund", "friend (m)", "Mein Freund kommt aus Spanien."),
    ("die Freundin", "friend (f)", "Meine Freundin wohnt in Hamburg."),
    ("die Familie", "family", "Meine Familie wohnt in München."),
    ("der Vater", "father", "Mein Vater kocht am Wochenende."),
    ("die Mutter", "mother", "Meine Mutter arbeitet im Büro."),
    ("die Eltern", "parents", "Meine Eltern kommen am Sonntag."),
    ("der Bruder", "brother", "Mein Bruder spielt Fußball."),
    ("die Schwester", "sister", "Meine Schwester studiert in Berlin."),
    ("Deutschland", "Germany", "Ich wohne in Deutschland."),
    ("die Sprache", "language", "Welche Sprache sprichst du?"),
])

add("a1-k0-1", "adjective", [
    ("deutsch", "German", "Ich lerne die deutsche Sprache."),
])

add("a1-k0-1", "other", [
    ("woher", "where from", "Woher kommst du?"),
])

# Kapitel 0.2 — numbers, time, food, home, city
add("a1-k0-2", "other", [
    ("null", "zero", "Die Hausnummer ist null eins."),
    ("eins", "one", "Ich habe nur eins."),
    ("zwei", "two", "Wir sind zwei Geschwister."),
    ("drei", "three", "Der Kurs dauert drei Monate."),
    ("vier", "four", "Der Tisch hat vier Beine."),
    ("fünf", "five", "Ich arbeite fünf Tage die Woche."),
    ("sechs", "six", "Um sechs Uhr stehe ich auf."),
    ("sieben", "seven", "Die Woche hat sieben Tage."),
    ("acht", "eight", "Das Kind ist acht Jahre alt."),
    ("neun", "nine", "Der Zug fährt um neun."),
    ("zehn", "ten", "Zehn Euro, bitte."),
    ("zwanzig", "twenty", "Ich habe zwanzig Euro."),
    ("hundert", "hundred", "Das Buch hat hundert Seiten."),
    ("heute", "today", "Heute lerne ich Vokabeln."),
    ("gestern", "yesterday", "Gestern war ich im Kino."),
    ("morgen", "tomorrow", "Morgen habe ich einen Termin."),
    ("jetzt", "now", "Ich bin jetzt zu Hause."),
])

add("a1-k0-2", "noun", [
    ("die Zeit", "time", "Ich habe heute keine Zeit."),
    ("die Uhr", "clock / watch", "Die Uhr hängt an der Wand."),
    ("der Tag", "day", "Heute ist ein schöner Tag."),
    ("die Woche", "week", "Nächste Woche habe ich Urlaub."),
    ("der Monat", "month", "Der Monat hat dreißig Tage."),
    ("das Jahr", "year", "Ich lerne seit einem Jahr Deutsch."),
    ("der Montag", "Monday", "Am Montag beginnt die Arbeit."),
    ("der Freitag", "Friday", "Freitagabend treffen wir uns."),
    ("der Sonntag", "Sunday", "Sonntag essen wir mit der Familie."),
    ("das Wasser", "water", "Ich trinke jeden Tag Wasser."),
    ("der Kaffee", "coffee", "Morgens trinke ich Kaffee."),
    ("das Brot", "bread", "Zum Frühstück esse ich Brot."),
    ("die Wohnung", "apartment", "Meine Wohnung ist klein, aber hell."),
    ("das Haus", "house", "Das Haus hat einen Garten."),
    ("das Zimmer", "room", "Mein Zimmer ist oben."),
    ("die Küche", "kitchen", "In der Küche kochen wir."),
    ("die Tür", "door", "Die Tür ist offen."),
    ("die Stadt", "city", "Berlin ist eine große Stadt."),
    ("der Bahnhof", "train station", "Der Zug fährt vom Bahnhof ab."),
    ("der Bus", "bus", "Der Bus kommt in fünf Minuten."),
    ("das Auto", "car", "Das Auto steht vor dem Haus."),
    ("der Supermarkt", "supermarket", "Im Supermarkt kaufe ich Brot."),
])

add("a1-k0-2", "verb", [
    ("essen", "to eat", "Wir essen um zwölf Uhr."),
    ("trinken", "to drink", "Ich trinke gern Wasser."),
    ("kaufen", "to buy", "Ich kaufe Brot im Supermarkt."),
])

# Kapitel 0.3 — verbs, questions, small words, common adjectives
add("a1-k0-3", "verb", [
    ("sein", "to be", "Ich bin müde."),
    ("haben", "to have", "Ich habe ein Buch."),
    ("kommen", "to come", "Kommst du um acht?"),
    ("gehen", "to go / walk", "Ich gehe zu Fuß zur Schule."),
    ("fahren", "to drive / go (by vehicle)", "Wir fahren mit dem Bus."),
    ("machen", "to make / do", "Was machst du am Wochenende?"),
    ("lernen", "to learn / study", "Jeden Abend lerne ich Deutsch."),
    ("sprechen", "to speak", "Sprichst du Deutsch?"),
    ("verstehen", "to understand", "Ich verstehe die Frage."),
    ("wohnen", "to live", "Ich wohne in Köln."),
    ("arbeiten", "to work", "Sie arbeitet in einem Büro."),
    ("sehen", "to see", "Ich sehe den Bus."),
    ("hören", "to hear", "Hörst du die Musik?"),
    ("lesen", "to read", "Ich lese ein Buch."),
    ("schreiben", "to write", "Schreib bitte deinen Namen."),
    ("können", "can / to be able to", "Ich kann ein bisschen Deutsch."),
    ("müssen", "must / to have to", "Ich muss um acht da sein."),
    ("wollen", "to want", "Ich will nach Hause."),
    ("möchten", "would like", "Ich möchte einen Kaffee, bitte."),
])

add("a1-k0-3", "other", [
    ("ich", "I", "Ich lerne Deutsch."),
    ("du", "you (informal)", "Kommst du mit?"),
    ("er", "he", "Er ist mein Bruder."),
    ("sie", "she / they", "Sie wohnt in Berlin."),
    ("wir", "we", "Wir gehen ins Kino."),
    ("was", "what", "Was machst du?"),
    ("wer", "who", "Wer ist das?"),
    ("wo", "where", "Wo ist der Bahnhof?"),
    ("wann", "when", "Wann beginnt der Kurs?"),
    ("wie", "how", "Wie heißt du?"),
    ("warum", "why", "Warum lernst du Deutsch?"),
    ("und", "and", "Brot und Käse, bitte."),
    ("oder", "or", "Tee oder Kaffee?"),
    ("aber", "but", "Ich bin müde, aber ich lerne noch."),
    ("nicht", "not", "Ich verstehe das nicht."),
    ("auch", "also", "Ich lerne auch Deutsch."),
    ("sehr", "very", "Das ist sehr gut."),
    ("hier", "here", "Ich warte hier auf dich."),
])

add("a1-k0-3", "adjective", [
    ("gut", "good", "Das Essen ist gut."),
    ("schlecht", "bad", "Das Wetter ist schlecht."),
    ("groß", "big", "Berlin ist eine große Stadt."),
    ("klein", "small", "Meine Wohnung ist klein."),
    ("neu", "new", "Das ist ein neues Buch."),
    ("alt", "old", "Das Haus ist alt."),
    ("schön", "beautiful / nice", "Das ist ein schönes Foto."),
])


def slug(w):
    return re.sub(r"[^a-z0-9äöüß]+", "-", w.lower()).strip("-")[:50]


seen = set()
items = []
skipped = 0
for w, e, c, t, x in RAW:
    key = w.lower().strip()
    if key in seen:
        skipped += 1
        continue
    seen.add(key)
    items.append({
        "id": f"a1-{t}-{slug(w)}",
        "w": w,
        "e": e,
        "c": c,
        "l": "A1",
        "t": t,
        "x": x,
    })

out = Path("/Users/siyabarshad/Desktop/personal/German/germanpak/src/data/a1.json")
out.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"A1 words: {len(items)} skipped_dupes: {skipped}")
print(Counter(i["t"] for i in items))
print(Counter(i["c"] for i in items))
