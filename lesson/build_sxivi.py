#!/usr/bin/env python3
"""40-minute lesson plan: number ray, grade 5."""

from build_plan import (
    INK,
    MAROON,
    MUTED,
    WHITE,
    Document,
    Cm,
    Pt,
    RGBColor,
    WD_ALIGN_PARAGRAPH,
    OxmlElement,
    qn,
    add_text,
    borders,
    bullets,
    cell_para,
    h,
    margins,
    no_split,
    set_space,
    set_table_width,
    shade,
)


def build():
    doc = Document()
    sec = doc.sections[0]
    sec.page_width = Cm(21.0)
    sec.page_height = Cm(29.7)
    sec.left_margin = Cm(1.5)
    sec.right_margin = Cm(1.5)
    sec.top_margin = Cm(1.4)
    sec.bottom_margin = Cm(1.4)

    style = doc.styles["Normal"]
    style.font.name = "Sylfaen"
    style.font.size = Pt(12)
    style.font.color.rgb = INK

    table = doc.add_table(rows=1, cols=1)
    set_table_width(table)
    cell = table.cell(0, 0)
    cell.text = ""
    shade(cell, "8E2F3C")
    borders(cell, "8E2F3C", "2")
    margins(cell, 120, 120, 140, 140)
    p = cell.paragraphs[0]
    set_space(p, 0, 0)
    add_text(p, "მათემატიკა  ·  V კლასი", size=11, bold=True, color=WHITE)
    p2 = cell.add_paragraph()
    set_space(p2, 2, 0)
    add_text(p2, "საგაკვეთილო გეგმა", size=22, bold=True, color=WHITE)
    p3 = cell.add_paragraph()
    set_space(p3, 2, 0)
    add_text(p3, "რიცხვითი სხივი  ·  40 წუთი", size=12, color=RGBColor(0xFF, 0xE4, 0xC4))

    spacer = doc.add_paragraph()
    set_space(spacer, 0, 6)

    rows = [
        ("თემა", "რიცხვითი სხივი"),
        ("სახელმძღვანელო", "გვ. 49"),
        ("პრეზენტაცია", "prezentacia-ricxviti-sxivi.html — fonts-ის საქაღალდე თან უნდა იყოს"),
        ("შევსება", "მასწავლებელი ____________________    თარიღი __________"),
    ]
    meta = doc.add_table(rows=len(rows), cols=2)
    set_table_width(meta)
    for i, (k, v) in enumerate(rows):
        no_split(meta.rows[i])
        cell_para(meta.cell(i, 0), k, size=11, bold=True, color=MAROON, fill="FBF6EE")
        cell_para(meta.cell(i, 1), v, size=11, fill="FFFFFF")

    h(doc, "მიზანი")
    p = doc.add_paragraph()
    set_space(p, 0, 4, 1.08)
    add_text(p, "მოსწავლემ რიცხვით სხივზე წერტილს რიცხვი შეუსაბამოს და ჩანაწერი M(5) წაიკითხოს.", size=12)

    h(doc, "მსვლელობა")
    p = doc.add_paragraph()
    set_space(p, 0, 6, 1.12)
    add_text(p, "ჯერ საწყისი და ერთეული. O საწყისია, OU ერთეულოვანი მონაკვეთია. წერტილის რიცხვი იმაზეა, რამდენი ასეთი ნაბიჯია O-დან იქამდე.", size=12)
    p = doc.add_paragraph()
    set_space(p, 0, 6, 1.12)
    add_text(p, "სახელმძღვანელოს სხივზე A 3-ია, B 5. B-ზე ორჯერ შორს 10-ია. AB-ს შუა 4-ია. OA-ს შუა მთელ რიცხვზე არ დგას, 1,5-ია.", size=12)
    p = doc.add_paragraph()
    set_space(p, 0, 6, 1.12)
    add_text(p, "სახაზავი: მარცხენა ბოლო საწყისზეა, მთელი სახაზავი 5-ია, ამიტომ M(5). C ოთხჯერ შორსაა, ეს 4 კი არ არის, არამედ 4·5=20. ფრჩხილში წერტილის რიცხვი იწერება.", size=12)
    p = doc.add_paragraph()
    set_space(p, 0, 6, 1.12)
    add_text(p, "ბოლოს რუკის სხივი. ერთეული ერთი მილიონია. E 3 ნაბიჯია, G 4, B 10. ანუ 3 000 000, 4 000 000 და 10 000 000.", size=12)

    h(doc, "საშინაო")
    bullets(doc, [
        "გვ. 49-ის კითხვები რვეულში.",
        "საკუთარ სხივზე მონიშნონ 0, 1, 4 და 7.",
    ])

    h(doc, "პასუხები")
    answers = [
        ("A და B", "A = 3,  B = 5"),
        ("შუა და ორჯერ", "10 ;  AB-ს შუა 4 ;  OA-ს შუა 1,5"),
        ("სახაზავი", "M(5),  C(20)"),
        ("მილიონი", "E = 3 000 000,  G = 4 000 000,  B = 10 000 000"),
    ]
    ans = doc.add_table(rows=len(answers), cols=2)
    set_table_width(ans)
    for i, (k, v) in enumerate(answers):
        no_split(ans.rows[i])
        cell_para(ans.cell(i, 0), k, size=11, bold=True, fill="FBF6EE")
        cell_para(ans.cell(i, 1), v, size=11)

    h(doc, "სლაიდები")
    p = doc.add_paragraph()
    set_space(p, 0, 4, 1.08)
    add_text(p, "1 სათაური, 2 საწყისი, 3 A და B, 4 შუა წერტილი, 5 სახაზავი, 6 მილიონი, 7 შეჯამება, 8 საშინაო.", size=12)
    p = doc.add_paragraph()
    set_space(p, 0, 2, 1.08)
    add_text(p, "ისრით ან გვერდითა ღილაკით გადადის. პასუხი ღილაკზე იხსნება. T — შენიშვნა, F — მთელი ეკრანი.", size=12)

    footer = sec.footer
    footer.is_linked_to_previous = False
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_space(fp, 0, 0)
    add_text(fp, "მათემატიკა, V კლასი. რიცხვითი სხივი", size=9, color=MUTED)

    doc.core_properties.title = "საგაკვეთილო გეგმა — რიცხვითი სხივი"
    doc.save("/workspace/lesson/sagakvetilo-gegma-ricxviti-sxivi.docx")
    print("ok")


if __name__ == "__main__":
    build()
