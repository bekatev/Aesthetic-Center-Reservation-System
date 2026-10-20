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
    add_text(p, "ამ კლასისთვის", size=18, bold=True, color=MAROON)
    body(doc, "გამრავლების თვისებები, V კლასი. დაფაზე სამი ცარიელი უჯრა იხატება. სლაიდში ეს არ შედის.")

    h(doc, "პირველი წუთი")
    body(doc, "„ახლა ერთ შეცდომას დავუშვებ. ვინც დაიჭერს და მეორე გზასაც დაწერს, პირველ უჯრას ვავსებთ. დღეს სამი უჯრა თუ შეივსო, პარასკევს ათი წუთი თამაშია: მეორე გზა. ყვირილზე უჯრას ვშლი.“")

    h(doc, "დღეს")
    body(doc, "შეცდომა ასე ჟღერს: „ხუთ მოსწავლეს თითო 6 რვეული აქვს, ეს 6·6-ია, სულ 36.“ კლასმა უნდა თქვას, რომ მოსწავლე ხუთია, ამიტომ 5·6=30, და მეორე გზაც დაწეროს: 6+6+6+6+6. ორივე 30-ია. ამის მერე პირველი უჯრა ივსება.")
    body(doc, "მეორე უჯრა ივსება, როცა წყვილი თვითონ იტყვის, რომ 6·5 და 5·6 ერთი და იგივე ნამრავლია. სახელს, გადანაცვლებადობას, ამის შემდეგ ეუბნები.")
    body(doc, "მესამე უჯრა ივსება, როცა დაფაზე ჩნდება 7(a+c) და ვიღაც იტყვის მეორე ჩანაწერსაც, (a+c)·7. სამივე უჯრა ბოლომდე თუ გაჩერდა, პარასკევს თამაშია.")

    h(doc, "პარასკევი, 10 წუთი. მეორე გზა")
    body(doc, "კლასი შუაზე იყოფა, როგორც სხედან. დაფაზე ერთ ჩანაწერს წერ. თითო მხარეს ერთი წუთი აქვს, რომ მეორე გზა დაწეროს. ხელაწეული კითხულობს. ყვირილი არ ითვლება. სწორ მეორე გზაზე მხარე ერთ ხაზს იღებს დაფაზე. ხუთი რაუნდია.")
    rounds = [
        ("1", "6+6+6+6+6", "5·6=30"),
        ("2", "6·5", "5·6=30"),
        ("3", "(3·4)·5", "3·(4·5)=60"),
        ("4", "5·(9+4)", "5·9+5·4=65"),
        ("5", "9a+7a", "16a"),
    ]
    table = doc.add_table(rows=1 + len(rounds), cols=3)
    set_table_width(table)
    widths = [Cm(1.4), Cm(7.2), Cm(8.4)]
    for i, text in enumerate(("№", "დაფაზე წერ", "მეორე გზა")):
        cell_para(table.cell(0, i), text, size=11, bold=True, color=WHITE, fill="1C2430")
        table.cell(0, i).width = widths[i]
    no_split(table.rows[0])
    fills = ["FFFFFF", "FBF6EE"]
    for r, row in enumerate(rounds, start=1):
        no_split(table.rows[r])
        for c, text in enumerate(row):
            cell_para(table.cell(r, c), text, size=11, bold=(c == 0), fill=fills[r % 2])
            table.cell(r, c).width = widths[c]
    body(doc, "მეტი ხაზის მხარე ირჩევს, ორშაბათს დაფაზე რა დაიწეროს პირველი. უჯრა თუ დაიშალა, ეს ათი წუთი რვეულშია: გვ. 57, №1–№5.")

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
