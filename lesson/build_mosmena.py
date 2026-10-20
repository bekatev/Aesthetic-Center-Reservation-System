#!/usr/bin/env python3
"""How this restless grade-5 class runs the lesson: slides, examples, three games."""

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
    body(doc, "გამრავლების თვისებები, V კლასი. გაკვეთილი მთელ კლასთან მიდის: ჯერ სლაიდზე ახსნა, მერე მაგალითები, ბოლოს სამი თამაში.")

    h(doc, "პირველი წუთი")
    body(doc, "„ახლა ერთ შეცდომას დავუშვებ. ვინც დაიჭერს და მეორე გზასაც იტყვის, სლაიდზე პასუხს ვხსნით.“")

    h(doc, "დღეს")
    body(doc, "შეცდომა ასე ჟღერს: „ხუთ მოსწავლეს თითო 6 რვეული აქვს, ეს 6·6-ია, სულ 36.“ კლასმა უნდა თქვას, რომ მოსწავლე ხუთია, ამიტომ 5·6=30, და მეორე გზაც: 6+6+6+6+6. ორივე 30-ია.")
    body(doc, "მერე კლასი თვითონ ამბობს, რომ 6·5 და 5·6 ერთი და იგივე ნამრავლია. სახელს, გადანაცვლებადობის თვისებას, ამის შემდეგ ეუბნები.")
    body(doc, "7(a+c)-ის გვერდით ვიღაც იტყვის მეორე ჩანაწერსაც, (a+c)·7. გვ. 57 სლაიდზე კეთდება. ბოლო წუთები სამი თამაშია: ბაყაყი სხივზე, საიდუმლო რიცხვი, ორი ჩანაწერი.")

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
