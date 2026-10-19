#!/usr/bin/env python3
"""40-minute Georgian math lesson plan."""

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

FONT = "Sylfaen"
INK = RGBColor(0x1C, 0x24, 0x30)
MUTED = RGBColor(0x5E, 0x68, 0x72)
MAROON = RGBColor(0x8E, 0x2F, 0x3C)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
TEAL = RGBColor(0x0F, 0x7A, 0x6E)


def rfonts(run, name):
    rPr = run._element.get_or_add_rPr()
    el = rPr.find(qn("w:rFonts"))
    if el is None:
        el = OxmlElement("w:rFonts")
        rPr.append(el)
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        el.set(qn(attr), name)


def add_text(p, text, size=12, bold=False, color=INK, font=FONT, italic=False):
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.size = Pt(size)
    run.font.color.rgb = color
    run.font.name = font
    rfonts(run, font)
    return run


def set_space(p, before=0, after=6, line=1.08):
    pf = p.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    pf.line_spacing = line


def shade(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:fill"), hex_color)
    tcPr.append(shd)


def borders(cell, color="E7DCCB", sz="4"):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), sz)
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), color)
        tcBorders.append(el)
    tcPr.append(tcBorders)


def margins(cell, t=60, b=60, l=80, r=80):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement("w:tcMar")
    for m, val in (("top", t), ("left", l), ("bottom", b), ("right", r)):
        node = OxmlElement(f"w:{m}")
        node.set(qn("w:w"), str(val))
        node.set(qn("w:type"), "dxa")
        tcMar.append(node)
    tcPr.append(tcMar)


def valign(cell, val="center"):
    tcPr = cell._tc.get_or_add_tcPr()
    v = OxmlElement("w:vAlign")
    v.set(qn("w:val"), val)
    tcPr.append(v)


def no_split(row):
    trPr = row._tr.get_or_add_trPr()
    cant = OxmlElement("w:cantSplit")
    trPr.append(cant)


def set_table_width(table):
    tblPr = table._tbl.tblPr
    tblW = tblPr.find(qn("w:tblW"))
    if tblW is None:
        tblW = OxmlElement("w:tblW")
        tblPr.append(tblW)
    tblW.set(qn("w:w"), "5000")
    tblW.set(qn("w:type"), "pct")
    borders_el = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "nil")
        borders_el.append(el)
    tblPr.append(borders_el)


def cell_para(cell, text, size=11, bold=False, color=INK, align="left", fill=None):
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = {
        "left": WD_ALIGN_PARAGRAPH.LEFT,
        "center": WD_ALIGN_PARAGRAPH.CENTER,
    }[align]
    set_space(p, 0, 0, 1.05)
    add_text(p, text, size=size, bold=bold, color=color)
    if fill:
        shade(cell, fill)
    borders(cell)
    margins(cell)
    valign(cell)
    return p


def add_more(cell, text, size=11, bold=False, color=INK):
    p = cell.add_paragraph()
    set_space(p, 2, 0, 1.05)
    add_text(p, text, size=size, bold=bold, color=color)
    return p


def heading_band(doc):
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
    add_text(p3, "40 წუთი  ·  გამრავლების თვისებები და ნულების ხრიკი", size=12, color=RGBColor(0xFF, 0xE4, 0xC4))


def meta_table(doc):
    rows = [
        ("თემა ჟურნალისთვის", "ნატურალურ რიცხვათა გამრავლება — თვისებები, ნულებით დამთავრებული რიცხვები და ნამრავლის შეფასება"),
        ("სახელმძღვანელო", "გვ. 56–57 (თვისებები) და გვ. 64–65 (შეფასება, ნულები)"),
        ("პრეზენტაცია", "prezentacia.html — 15 სლაიდი, იხსნება ბრაუზერში ორჯერ დაწკაპუნებით"),
        ("შევსება", "სკოლა ____________________    მასწავლებელი ____________________    თარიღი __________"),
    ]
    table = doc.add_table(rows=len(rows), cols=2)
    set_table_width(table)
    table.autofit = False
    table.columns[0].width = Cm(4.2)
    table.columns[1].width = Cm(13.4)
    for i, (k, v) in enumerate(rows):
        no_split(table.rows[i])
        cell_para(table.cell(i, 0), k, size=11, bold=True, color=MAROON, fill="FBF6EE")
        cell_para(table.cell(i, 1), v, size=11, fill="FFFFFF")
        table.cell(i, 0).width = Cm(4.2)
        table.cell(i, 1).width = Cm(13.4)


def callout(doc, title, body, fill="F3FAF7", bar="0F7A6E"):
    table = doc.add_table(rows=1, cols=1)
    set_table_width(table)
    cell = table.cell(0, 0)
    cell.text = ""
    shade(cell, fill)
    borders(cell, bar, "12")
    margins(cell, 80, 80, 120, 120)
    p = cell.paragraphs[0]
    set_space(p, 0, 2)
    add_text(p, title, size=12, bold=True, color=TEAL if bar == "0F7A6E" else MAROON)
    p2 = cell.add_paragraph()
    set_space(p2, 0, 0, 1.08)
    add_text(p2, body, size=11)


def bullets(doc, items):
    for text in items:
        p = doc.add_paragraph()
        set_space(p, 0, 2, 1.08)
        p.paragraph_format.left_indent = Cm(0.6)
        add_text(p, "•  " + text, size=11)


def h(doc, text):
    p = doc.add_paragraph()
    set_space(p, 12, 4)
    add_text(p, text, size=14, bold=True, color=MAROON)


def flow(doc):
    headers = ["დრო", "ეტაპი", "სლაიდი", "რა ხდება კლასში"]
    data = [
        ("4 წთ", "გახსნა", "1–2",
         "ხუთ მოსწავლეს თითო 6 ფანქარი აქვს. ჯერ კლასმა თქვას, როგორ დათვლიდა. მერე გაიხსნას ორივე გზა: შეკრებაც და 5·6-იც 30-ია."),
        ("3 წთ", "სიტყვები", "3",
         "დაფაზე დარჩეს სამი სიტყვა: მამრავლი, მამრავლი, ნამრავლი. ერთმა მოსწავლემ 5·6 ასე წაიკითხოს."),
        ("11 წთ", "თვისებები", "4–8",
         "თითო სლაიდი ერთი აღმოჩენაა. გადანაცვლებაზე ორი მოსწავლე ადგილს იცვლის. ერთსა და ნულზე — პასუხი ხელის აწევით. განაწილება დღის მთავარია: 5·(9+4) ორივე გზით, მერე 9a+7a. ჯგუფების თვისება, თუ დრო იწურება, ერთ მაგალითად დატოვეთ."),
        ("8 წთ", "ნულების ხრიკი", "9–11",
         "კიბე: 8·10, 8·100… ნული ბოლოში გადმოდის. მერე 50·30 — ჯერ 5·3=15, მერე ორი ნული. სლაიდ 11-ის პასუხი დახურულია, სანამ კლასი არ იტყვის ნულების რაოდენობას."),
        ("8 წთ", "სწორი კარი", "12",
         "ოთხი კითხვა სახელმძღვანელოდან. სწორი კარი მწვანდება. ქულა არ იწერება — გვაინტერესებს, ვინ ხსნის, რატომ დაამატა სწორედ ამდენი ნული."),
        ("4 წთ", "ქარხანა", "13",
         "წვენის ქარხანა, გვ. 64: 18·26 700 მეტია 626 000-ზე თუ ნაკლები? ჯერ კლასი ამრგვალებს, მერე იხსნება 20·30 000=600 000. ორივე რიცხვი ავწიეთ, ამიტომ ნამდვილი ნამრავლი კიდევ უფრო მცირეა."),
        ("2 წთ", "დახურვა", "14–15",
         "სამი სიტყვა ერთად: თვისება, ნული, დაახლოებით. ერთი წინადადება „დღეს ვისწავლე…“. საშინაო სლაიდზე რჩება ზარამდე."),
    ]
    table = doc.add_table(rows=1 + len(data), cols=4)
    set_table_width(table)
    widths = [Cm(2.1), Cm(3.1), Cm(2.2), Cm(10.2)]
    for i, text in enumerate(headers):
        cell_para(table.cell(0, i), text, size=10, bold=True, color=WHITE, fill="1C2430")
        table.cell(0, i).width = widths[i]
    no_split(table.rows[0])
    fills = ["FFFFFF", "FBF6EE"]
    for r, row in enumerate(data, start=1):
        no_split(table.rows[r])
        for c, text in enumerate(row):
            bold = c < 3
            cell_para(table.cell(r, c), text, size=10.5, bold=bold, fill=fills[r % 2])
            table.cell(r, c).width = widths[c]


def two_col(doc, left_title, left_body, right_title, right_body):
    table = doc.add_table(rows=1, cols=2)
    set_table_width(table)
    left, right = table.cell(0, 0), table.cell(0, 1)
    for cell, title, body, fill in (
        (left, left_title, left_body, "FFF8E8"),
        (right, right_title, right_body, "F3FAF7"),
    ):
        cell.text = ""
        shade(cell, fill)
        borders(cell, "E7DCCB")
        margins(cell, 80, 80, 100, 100)
        valign(cell, "top")
        p = cell.paragraphs[0]
        set_space(p, 0, 2)
        add_text(p, title, size=12, bold=True, color=MAROON)
        for line in body:
            bp = cell.add_paragraph()
            set_space(bp, 1, 1, 1.05)
            add_text(bp, line, size=11)


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

    heading_band(doc)
    spacer = doc.add_paragraph()
    set_space(spacer, 0, 6)

    meta_table(doc)

    h(doc, "რაზეა ეს 40 წუთი")
    p = doc.add_paragraph()
    set_space(p, 0, 4, 1.08)
    add_text(p, "თვისებებს ცალ-ცალკე ზეპირს არ ვაძლევთ. ერთ ხრიკამდე მივყავართ: ჯერ ციფრები მრავლდება, ნულები ბოლოს ემატება. ბოლოს ერთი შეფასება — მეტია თუ ნაკლები, ზუსტი გამრავლების გარეშე.", size=12)

    callout(
        doc,
        "მიზანი",
        "მოსწავლემ თვისება ამოიცნოს, ნულით დამთავრებული რიცხვი სწრაფად გაამრავლოს და ნამრავლი დაახლოებით შეაფასოს.",
    )

    h(doc, "გაკვეთილის ბოლოს მოსწავლე")
    bullets(doc, [
        "მაგალითზე ამოიცნობს გადანაცვლების, ერთის, ნულის, ჯგუფებისა და განაწილების თვისებას;",
        "50·30-ის ტიპის ნამრავლს ასე ხსნის: ჯერ ციფრები, მერე ყველა ნული;",
        "ორ რიცხვს უმაღლეს თანრიგამდე ამრგვალებს და ამბობს, ნამრავლი მეტია თუ ნაკლები მოცემულ რიცხვზე.",
    ])

    p = doc.add_paragraph()
    set_space(p, 4, 2, 1.05)
    add_text(p, "დღეს არ შედის. ", size=11, bold=True, color=MAROON)
    add_text(p, "სვეტად გამრავლება (4 707 × 465, გვ. 65) ცალკე სავარჯიშოა. ამ 40 წუთში მხოლოდ ვახსენებთ, თუ კლასი თვითონ მოითხოვს.", size=11)

    h(doc, "მსვლელობა")
    flow(doc)

    p = doc.add_paragraph()
    set_space(p, 8, 2, 1.05)
    add_text(p, "თუ დრო იწურება: ", size=11, bold=True)
    add_text(p, "გამოტოვეთ სლაიდი 6 (ჯგუფების თვისება). ქარხანა დატოვეთ — ის არის დღის დასამახსოვრებელი ბოლო.", size=11)
    p = doc.add_paragraph()
    set_space(p, 0, 2, 1.05)
    add_text(p, "თუ დრო დარჩა: ", size=11, bold=True)
    add_text(p, "სლაიდ 13-ის მეორე ღილაკი — 238·41 ≈ 200·40 = 8 000. ორივე რიცხვი დაკლებულია, ამიტომ ნამდვილი ნამრავლი მეტია.", size=11)

    h(doc, "ორი ტემპი")
    two_col(
        doc,
        "მეტი მხარდაჭერა",
        [
            "ნულებს ფანქრით შემოხაზავენ და მხოლოდ დარჩენილ ციფრებს ამრავლებენ.",
            "50·30-ს წყვილში შლიან: 5·3, მერე ნულები.",
            "სლაიდ 11-ზე საკმარისია პირველი მაგალითი.",
        ],
        "მეტი გამოწვევა",
        [
            "9 000·7 000 დამოუკიდებლად, ახსნით.",
            "გვ. 65, №4: 2 430·97 ≈ 2 000·100 = 200 000.",
            "თვითონ შეადგინონ ერთი მაგალითი, სადაც ნამრავლი „დაახლოებით“ მილიონს გადაცილდება.",
        ],
    )

    h(doc, "შეფასება")
    p = doc.add_paragraph()
    set_space(p, 0, 4, 1.08)
    add_text(p, "ქულა არ იწერება. „სწორ კარზე“ უყურებთ ახსნას, პასუხის სისწრაფეს კი არა. გაკვეთილი შედგა, თუ უმეტესობა 400·70-ს 28 000-ად ხსნის და 5·(9+4)-ს ორ გზად ხედავს.", size=12)

    h(doc, "საშინაო")
    bullets(doc, [
        "გვ. 57, „კლასში“ — №1, №3, №4.",
        "გვ. 65 — 50·300, 50·3 000, 50·30 000.",
        "სურვილისამებრ: გვ. 65, №4 — 2 430·97 უმაღლეს თანრიგამდე და მიახლოებითი ნამრავლი.",
    ])

    h(doc, "პასუხები მასწავლებლისთვის")
    answers = [
        ("სლაიდი 12, სწორი კარი", "5·27  ·  0  ·  7a+7c  ·  28 000"),
        ("სლაიდი 11", "15 000  ·  1 600 000  ·  63 000 000"),
        ("სლაიდი 13", "18·26 700 < 626 000, რადგან 20·30 000 = 600 000 და ორივე მამრავლი გაზრდილია. თუ დროა: 238·41 > 8 000"),
        ("საშინაო 1", "0·a = 0  ·  8·7 = 56  ·  11·0 = 0"),
        ("საშინაო 2", "15 000  ·  150 000  ·  1 500 000"),
        ("სურვილისამებრ", "2 000·100 = 200 000"),
    ]
    table = doc.add_table(rows=len(answers), cols=2)
    set_table_width(table)
    for i, (k, v) in enumerate(answers):
        no_split(table.rows[i])
        cell_para(table.cell(i, 0), k, size=10.5, bold=True, fill="FBF6EE")
        cell_para(table.cell(i, 1), v, size=10.5)
        table.cell(i, 0).width = Cm(5.2)
        table.cell(i, 1).width = Cm(12.4)

    h(doc, "სლაიდები და მართვა")
    p = doc.add_paragraph()
    set_space(p, 0, 4, 1.08)
    add_text(p, "1 სათაური · 2 ფანქრები · 3 სიტყვები · 4 გადანაცვლება · 5 ერთი და ნული · 6 ჯგუფები · 7 განაწილება · 8 მსგავსი წევრები · 9 ნულების კიბე · 10 ორივე მხარეს · 11 სცადე შენ · 12 სწორი კარი · 13 შეფასება · 14 სამი სიტყვა · 15 საშინაო.", size=11)
    p = doc.add_paragraph()
    set_space(p, 0, 2, 1.08)
    add_text(p, "ისრები ან ეკრანის გვერდითა ღილაკები — გადასვლა. პასუხი იხსნება ღილაკით და კლასს წინასწარ არ უჩანს. T — მოკლე შენიშვნა მხოლოდ თქვენთვის. F — მთელი ეკრანი. ფაილი prezentacia.html და საქაღალდე fonts ერთად უნდა იყოს.", size=11)

    footer = sec.footer
    footer.is_linked_to_previous = False
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_space(fp, 0, 0)
    add_text(fp, "მათემატიკა  ·  V კლასი  ·  40 წუთი  ·  პრეზენტაცია: prezentacia.html", size=9, color=MUTED)

    doc.core_properties.title = "საგაკვეთილო გეგმა — გამრავლების თვისებები"
    doc.core_properties.subject = "V კლასი, მათემატიკა, 40 წუთი"
    out = "/workspace/lesson/sagakvetilo-gegma.docx"
    doc.save(out)
    print(out)


if __name__ == "__main__":
    build()
