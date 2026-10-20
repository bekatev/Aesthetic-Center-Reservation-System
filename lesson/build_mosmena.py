#!/usr/bin/env python3
"""Hook for a restless grade-5 class, plus Friday's game if they listen."""

from build_plan import (
    FONT,
    INK,
    MAROON,
    MUTED,
    WHITE,
    Document,
    Cm,
    Pt,
    WD_ALIGN_PARAGRAPH,
    OxmlElement,
    qn,
    add_text,
    body,
    bullets,
    cell_para,
    h,
    no_split,
    set_space,
    set_table_width,
)


def build():
    doc = Document()
    sec = doc.sections[0]
    sec.page_width = Cm(21.0)
    sec.page_height = Cm(29.7)
    sec.left_margin = Cm(1.6)
    sec.right_margin = Cm(1.6)
    sec.top_margin = Cm(1.4)
    sec.bottom_margin = Cm(1.4)
    style = doc.styles["Normal"]
    style.font.name = FONT
    style.font.size = Pt(12)
    style.font.color.rgb = INK
    rPr = style.element.get_or_add_rPr()
    rf = rPr.find(qn("w:rFonts"))
    if rf is None:
        rf = OxmlElement("w:rFonts")
        rPr.append(rf)
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rf.set(qn(attr), FONT)

    p = doc.add_paragraph()
    set_space(p, 0, 2)
    add_text(p, "მარტივი ვარიანტი ამ კლასისთვის", size=18, bold=True, color=MAROON)
    body(doc, "გამრავლების თვისებები, V კლასი. არაფერი მზადდება წინასწარ. დაფაზე ერთი წინადადება იწერება.")

    h(doc, "რას ეუბნები პირველ წუთს")
    body(doc, "„დღეს თუ კითხვაზე ხელი აწიეთ და არ იყვირეთ, პარასკევს ბოლო ათი წუთი ვითამაშებთ: იგივეა თუ არა.“")
    body(doc, "გაკვეთილის ბოლოს ერთხელ წყვეტ. მოუსმინეს თუ არა. მოუსმინეს, პარასკევს თამაშია. აყრილობა იყო, პარასკევს ეს ათი წუთი რვეულშია, გვ. 57.")

    h(doc, "დღეს რა არის საინტერესო")
    body(doc, "ხუთი მოსწავლე დგება. თითოეულს 6 თითი აქვს აწეული. კლასი ხედავს და ამბობს, სულ რამდენი თითია. ჯერ ითვლიან თითებს, მერე წერენ 5·6. ორივე 30-ია. ამით იწყება გაკვეთილი, სლაიდამდე.")

    h(doc, "პარასკევი, 10 წუთი. იგივეა თუ არა")
    body(doc, "დაფაზე ორ რიცხვს წერ. კლასი ერთად პასუხობს ხელით: ორი ხელი აწეული ნიშნავს იგივეა, ერთი ხელი ნიშნავს სხვაა. მერე ერთი მოსწავლე ამბობს რიცხვს. ხუთი წყვილია, თითო წუთი საკმარისია.")
    rounds = [
        ("1", "6·5 და 5·6", "იგივეა, 30"),
        ("2", "7·1 და 7", "იგივეა, 7"),
        ("3", "7·0 და 7", "სხვაა, 0 და 7"),
        ("4", "(3·4)·5 და 3·(4·5)", "იგივეა, 60"),
        ("5", "5·(9+4) და 5·9+5·4", "იგივეა, 65"),
    ]
    table = doc.add_table(rows=1 + len(rounds), cols=3)
    set_table_width(table)
    widths = [Cm(1.4), Cm(8.6), Cm(7.0)]
    for i, text in enumerate(("№", "დაფაზე", "პასუხი")):
        cell_para(table.cell(0, i), text, size=11, bold=True, color=WHITE, fill="1C2430")
        table.cell(0, i).width = widths[i]
    no_split(table.rows[0])
    fills = ["FFFFFF", "FBF6EE"]
    for r, row in enumerate(rounds, start=1):
        no_split(table.rows[r])
        for c, text in enumerate(row):
            cell_para(table.cell(r, c), text, size=11, bold=(c == 0), fill=fills[r % 2])
            table.cell(r, c).width = widths[c]
    body(doc, "ბოლოს ჰკითხე: 9a+7a და 16a იგივეა თუ არა. იგივეა. ვინც იტყვის, პარასკევი ამით მთავრდება.")

    footer = sec.footer
    footer.is_linked_to_previous = False
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_space(fp, 0, 0)
    add_text(fp, "ბექა თევდორაშვილი  ·  V კლასი  ·  ერთი კლასისთვის", size=9, color=MUTED)

    out = "/workspace/lesson/mosmena.docx"
    doc.save(out)
    print(out)


if __name__ == "__main__":
    build()
