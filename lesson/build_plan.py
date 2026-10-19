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
    add_text(p3, "გამრავლების თვისებები  ·  40 წუთი", size=12, color=RGBColor(0xFF, 0xE4, 0xC4))


def meta_table(doc):
    rows = [
        ("თემა", "ნატურალური რიცხვების გამრავლება. გამრავლების თვისებები"),
        ("სახელმძღვანელო", "გვ. 56–57"),
        ("დრო", "40 წუთი"),
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


def body(doc, text, size=12, after=6):
    p = doc.add_paragraph()
    set_space(p, 0, after, 1.12)
    add_text(p, text, size=size)
    return p


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

    h(doc, "მიზანი")
    body(doc, "მოსწავლემ ამოიცნოს გამრავლების სამი თვისება — გადანაცვლებადობა, ჯუფთებადობა და განრიგებადობა — ჩაწეროს ისინი ასოთი და გაარჩიოს გამოსახულება, ტოლობა და უტოლობა. ერთზე და ნულზე გამრავლება ცალკე დგას, სამ თვისებაში არ შედის.")

    h(doc, "როგორ მიდის")
    body(doc, "თვისებას ჯერ წყვილი ხედავს ორი ანგარიშის შედარებით და თავისი სიტყვით ამბობს, რა არ შეიცვალა. სახელი დაფაზე მერე ჩნდება. სლაიდზე პასუხი და თვისების სახელი დახურულია, სანამ წყვილი არ იტყვის. ქულა არ იწერება. უკუკავშირი საქმეზეა: რა გამოუვიდა და სად აერია.")

    h(doc, "წინარე ცოდნა")
    body(doc, "დაფაზე ორი ჩანაწერია: 4+4+4 და 3·4. ჰეტეროგენული წყვილი ეუბნება ერთმანეთს, რომელი უფრო მოკლეა და რატომ. ვინც ჩერდება, სამჯერ ოთხ თითს ითვლის. აქ ჩანს, ვინ ხედავს გამრავლებას განმეორებით შეკრებად.")

    h(doc, "ამოცანა")
    body(doc, "კითხვა დაფაზე: „ხუთი მოსწავლიდან თითოეულს 6 რვეული აქვს. სულ რამდენი რვეულია?“ წყვილები ორ გზას ეძებენ. ერთი კრებს 6+6+6+6+6, მეორე წერს 5·6. ორივე 30-ია. ერთი მოსწავლე ხმამაღლა კითხულობს 5·6=30-ს და ასახელებს მამრავლსა და ნამრავლს. ეს ტოლობა დაფაზე რჩება.")

    h(doc, "გადანაცვლებადობის თვისება")
    body(doc, "მეზობელი წყვილები იყოფიან: ერთი ითვლის 6·5-ს, მეორე 5·6-ს. ნამრავლი იგივეა, 30. წყვილი ამბობს, რა არ შეიცვალა. მერე ერქმევა სახელი — გადანაცვლებადობის თვისება — და იწერება a·b=b·a. სურვილისამებრ ორი მოსწავლე ადგილსაც იცვლის, ნამრავლი ისევ 30 რჩება.")

    h(doc, "ერთი და ნული")
    body(doc, "ეს კერძო შემთხვევაა, სამი თვისებიდან არც ერთი. ჯერ გამოიცნონ, მერე შეამოწმონ: 7·1=7, 8·1=8; 7·0=0, 9·0=0. კლასი ერთად ამბობს სრულ წინადადებას: ერთზე გამრავლება რიცხვს არ ცვლის. ნულზე გამრავლება ნულს იძლევა, ამიტომ 0·a=0, რაც არ უნდა იყოს a.")

    h(doc, "ჯუფთებადობის თვისება")
    body(doc, "კლასი ორ ნაწილად იყოფა. ერთი მხარე ითვლის (3·4)·5=12·5=60, მეორე 3·(4·5)=3·20=60. მოსწავლეები ამბობენ, რომ ფრჩხილის ადგილმა ნამრავლი არ შეცვალა. სახელი: ჯუფთებადობის თვისება. ჩანაწერი: (a·b)·c=a·(b·c). ერთი მაგალითი საკმარისია.")

    h(doc, "განრიგებადობის თვისება")
    body(doc, "ახალი ამოცანა: ხუთ ყუთში თითოში 9 წითელი და 4 ლურჯი რვეული დევს. სულ რამდენია? წყვილი თავად ირჩევს გზას. ზოგი წერს 5·(9+4)=5·13=65, ზოგი 5·9+5·4=45+20=65. ფურცლებს უცვლიან და ამოწმებენ, ერთი რიცხვი გამოვიდა თუ არა. აქედან ჩნდება სახელი — განრიგებადობის თვისება ჯამის მიმართ — და ჩანაწერი a(b+c)=ab+ac. გადანაცვლებადობით იგივეა მარჯვნიდანაც: (b+c)·a=ba+ca. სამ შესაკრებზე ერთი მაგალითი: 6·(2+3+5)=6·2+6·3+6·5=60. გამოკლებაზე: 5·(9−4)=5·9−5·4, ანუ a(b−c)=ab−ac.")

    h(doc, "საერთო მამრავლი")
    body(doc, "9a+7a ახალი კანონი არ არის. დაფაზე გვერდიგვერდ დგას უკვე ნანახი 5·9+5·4=5·(9+4) და კითხვა: „მაშინ 9a+7a რას უდრის?“ წყვილი ხედავს, რომ a ორივე შესაკრებში დგას, და წერს (9+7)a=16a. ეს განრიგებადობაა უკან წაკითხული: საერთო მამრავლი ფრჩხილებს გარეთ გადის. მეორე წყვილი ამოწმებს 4a+5a=9a.")

    h(doc, "ასოთი და სამი სახის ჩანაწერი")
    body(doc, "წყვილი სიტყვიდან ჩანაწერზე გადადის. „a გამრავლებული 8-ზე“ არის 8a და a·8; გადანაცვლებადობით ერთი და იგივეა, 8a კი 8·a-ს ნიშნავს. „a-სა და c-ს ჯამი, გამრავლებული 7-ზე“ ორნაირად იწერება: 7(a+c) და (a+c)·7. „9a-სა და 7a-ს ჯამი“ არის 9a+7a.")
    body(doc, "მერე სამ სვეტად ალაგებენ. 8a გამოსახულებაა: მოქმედება წერია და ტოლობის ნიშანი არ აქვს. 8a=56 ტოლობაა. 8a>50 უტოლობაა, აქ > ან < დგას. იგივე სვეტში მეორე რიგია 9a+7a, 9a+7a=16a და 16a>10a.")

    h(doc, "გვ. 57")
    body(doc, "პირველ კითხვას წყვილი ერთად ხსნის და ხმამაღლა ამბობს მიზეზს. დანარჩენ ოთხს ცალ-ცალკე წერენ, რომ ჩანდეს, ვის რა გამოუვიდა. მიზეზი აუცილებელია: ნულის თვისებაა, ხუთი ერთნაირი შესაკრებია თუ განრიგებადობა. კითხვები: თუ a ნებისმიერი რიცხვია, რას უდრის 0·a; 27+27+27+27+27 როგორ დაიწეროს გამრავლებით; თუ a=7, რას უდრის 8a; თუ a=0, რას უდრის 11a; 7(a+c) როგორ გაიხსნას. იგივეა (a+c)·7.")
    body(doc, "სამი მოსწავლე ბოლოს თითო წინადადებას ამბობს თავისი სიტყვით. ერთი — გადანაცვლებადობას, მეორე — იმას, რომ ერთზე გამრავლება რიცხვს არ ცვლის, მესამე — 8a გამოსახულებაა, 8a=56 ტოლობაა, 8a>50 უტოლობაა.")

    h(doc, "თუ აერია")
    bullets(doc, [
        "0·a-ზე თუ a თქვა, შეადაროს 1-ზე გამრავლებას და უთხრან: ნულს a რამდენჯერ ემატება? თუ კიდევ ჩერდება, რვეულში წერს 0+0+0.",
        "7(a+c) თუ გახსნა როგორც 7a+c, მეორე შესაკრებზეც უნდა გამრავლდეს: 7·c. ჯერ რიცხვით, 7·(2+3)=14+21, მერე ასოთი.",
        "გამოსახულებას თუ = დაუწერა, ჰკითხონ, სად არის მეორე მხარე. სანამ მეორე მხარე არ არის, ჩანაწერი გამოსახულებად რჩება.",
    ])

    h(doc, "ვინ როგორ მუშაობს")
    body(doc, "მიზანი ყველასთვის ერთია. იცვლება გზა და ის, რასაც ბოლოს აბარებს. აღმოჩენა ჰეტეროგენულ წყვილშია, სახელის დარქმევა მთელ კლასთან, გვ. 57-ის ბოლო ოთხი კითხვა ცალ-ცალკე. ვისაც უჭირს, ბარათზე შეკრება უკვე გახსნილი ხვდება და 5·9+5·4-ზე რჩება; ასოზე მაშინ გადადის, როცა ორი გზა უკვე ერთ რიცხვს იძლევა. პროდუქტი მოკლეა: ორი გზა და 4a+5a. ვისაც ადვილად გამოსდის, იმავე ამოცანის შემდეგ თავად წერს ერთ უტოლობას a-თი და ხსნის a(b−c)-ს.")

    h(doc, "საშინაო")
    bullets(doc, [
        "გვ. 57, №1–№5 რვეულში. კლასში ნანახიც მოკლედ ჩაიწერონ, მიზეზით.",
        "ასო a-თი სამი ჩანაწერი: ერთი გამოსახულება, ერთი ტოლობა და ერთი უტოლობა. მაგალითად 8a, 8a=56, 8a>50.",
    ])

    h(doc, "პასუხები")
    answers = [
        ("№1", "0 · a = 0"),
        ("№2", "27 + 27 + 27 + 27 + 27 = 5 · 27"),
        ("№3", "თუ a = 7, მაშინ 8a = 56"),
        ("№4", "თუ a = 0, მაშინ 11a = 0"),
        ("№5", "7(a + c) = 7a + 7c. იგივეა (a + c) · 7"),
    ]
    table = doc.add_table(rows=len(answers), cols=2)
    set_table_width(table)
    for i, (k, v) in enumerate(answers):
        no_split(table.rows[i])
        cell_para(table.cell(i, 0), k, size=11, bold=True, fill="FBF6EE")
        cell_para(table.cell(i, 1), v, size=11)
        table.cell(i, 0).width = Cm(3.2)
        table.cell(i, 1).width = Cm(14.4)

    footer = sec.footer
    footer.is_linked_to_previous = False
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_space(fp, 0, 0)
    add_text(fp, "მათემატიკა, V კლასი. გამრავლების თვისებები", size=9, color=MUTED)

    doc.core_properties.title = "საგაკვეთილო გეგმა — გამრავლების თვისებები"
    doc.core_properties.subject = "V კლასი, მათემატიკა, 40 წუთი"
    out = "/workspace/lesson/sagakvetilo-gegma.docx"
    doc.save(out)
    print(out)


if __name__ == "__main__":
    build()
