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
    add_text(p, "კლასი, რომელსაც უჭირს მოსმენა", size=18, bold=True, color=MAROON)
    body(doc, "გამრავლების თვისებები, V კლასი. ეს გაკვეთილის სლაიდებში არ შედის. დაფაზე ერთხელ იწერება და იქიდან მიდის.")

    h(doc, "რას ეუბნები პირველ წუთს")
    body(doc, "„სამი დაკეცილი ფურცელი მაქვს. პასუხი შიგნით წერია. გავხსნი მაშინ, როცა წყვილი ორ გზას დაწერს. დაფის კუთხეში ოთხი ალამია. ოთხივე თუ დარჩა, პარასკევს ბოლო 12 წუთი თამაშია: სად დაიმალა ნამრავლი. ერთ ალამს მაშინ მოვხსნი, თუ კითხვაზე ყვირილი დაიწყო ან წყვილში ერთი წერს და მეორე გვერდზეა. ალამი თუ დაიკლო, პარასკევს თამაში აღარ იქნება.“")
    body(doc, "ამას მეორედ არ ხსნი. ალამს ჩუმად ხსნი და გაკვეთილს აგრძელებ.")

    h(doc, "დღეს რა არის საინტერესო")
    body(doc, "სამი დაკეცილი ფურცელი, სამ სხვადასხვა ადგილას. სლაიდზე პასუხი მაინც დახურულია, ფურცელი კი ხელში გიდევს, ამიტომ თვალი იქ არის.")
    bullets(doc, [
        "3–8 წუთი, რვეულები. ფურცელზე წერია 30. იხსნება მას შემდეგ, რაც წყვილი დაწერს 6+6+6+6+6-ს და 5·6-ს.",
        "19–25 წუთი, ყუთები. ფურცელზე წერია 65. იხსნება მას შემდეგ, რაც ერთი გზა მაინც დაემთხვა მეორეს: 5·(9+4) და 5·9+5·4.",
        "25–28 წუთი, საერთო მამრავლი. ფურცელზე წერია 16a. იხსნება მას შემდეგ, რაც წყვილი დაწერს (9+7)a-ს.",
    ])
    body(doc, "ოთხი ალამი ამ ოთხ ადგილას მოწმდება: რვეულების შემდეგ, გადანაცვლებადობის შემდეგ, ყუთების შემდეგ, ასოთი ჩაწერის შემდეგ. ალამი რჩება, თუ კითხვაზე ხელი აწიეს და წყვილში ორივემ დაწერა. ერთი წინადადებაც ჰკითხე მეზობელ წყვილს: „ჩვენთანაც ეს რიცხვი გამოვიდა.“")

    h(doc, "პარასკევი, 12 წუთი. სად დაიმალა ნამრავლი")
    body(doc, "თამაში მხოლოდ მაშინ არის, თუ ოთხივე ალამი დაფაზე დარჩა. კლასი ორ გუნდად იყოფა, მწკრივების მიხედვით. პასუხი იწერება ერთ ფურცელზე, გუნდიდან ერთი კითხულობს. ყვირილით ნათქვამი პასუხი არ ითვლება და სვლა მეორე გუნდზე გადადის. ექვსი კითხვაა, თითო ერთი ქულა.")

    rounds = [
        ("1", "6·5 და 5·6. რომელი ნამრავლია მეტი?", "არც ერთი. ორივე 30-ია. გადანაცვლებადობის თვისება."),
        ("2", "(3·4)·5 და 3·(4·5). რამდენი გამოდის?", "ორივე 60. ჯუფთებადობის თვისება."),
        ("3", "9·1 და 9·0. რას უდრის თითო?", "9 და 0. ერთზე გამრავლება რიცხვს არ ცვლის. ნულზე გამრავლება ნულს იძლევა."),
        ("4", "5 ყუთი, თითოში 9 და 4. ორი გზა.", "5·(9+4)=65 და 5·9+5·4=65. განრიგებადობის თვისება."),
        ("5", "a=3. მაშინ 4a+5a რამდენია?", "9a=27. საერთო მამრავლი ფრჩხილებს გარეთ გადის."),
        ("6", "მაგიდაზე სამი ფურცელია: 8a, 8a=56, 8a>50. ამბობ სიტყვას „ტოლობა“. გუნდიდან ერთი შეეხება ფურცელს.", "8a=56. დანარჩენი ორი არის გამოსახულება და უტოლობა."),
    ]
    table = doc.add_table(rows=1 + len(rounds), cols=3)
    set_table_width(table)
    widths = [Cm(1.4), Cm(8.2), Cm(7.4)]
    for i, text in enumerate(("№", "კითხვა", "პასუხი")):
        cell_para(table.cell(0, i), text, size=11, bold=True, color=WHITE, fill="1C2430")
        table.cell(0, i).width = widths[i]
    no_split(table.rows[0])
    fills = ["FFFFFF", "FBF6EE"]
    for r, row in enumerate(rounds, start=1):
        no_split(table.rows[r])
        for c, text in enumerate(row):
            cell_para(table.cell(r, c), text, size=10.5, bold=(c == 0), fill=fills[r % 2])
            table.cell(r, c).width = widths[c]

    h(doc, "ბოლოს")
    body(doc, "მეტი ქულის მქონე გუნდი ირჩევს, ორშაბათს დაფაზე რომელი მაგალითი დაიწეროს პირველი. ალამი თუ დააკლდა, პარასკევის ეს 12 წუთი რვეულში გადის: გვ. 57, №1–№5, ჩუმად.")

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
