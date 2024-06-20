import html2text

def html_to_text(html_content):
    h = html2text.HTML2Text()
    h.ignore_links = True
    h.ignore_images = True
    return h.handle(html_content)

html_content = """
     With quick-drying DRY technology, suitable for leisure, sports, and everyday wear. <br>
     Collar looks great buttoned-up or undone. <br>
     Ribbed cuffs for a classic look. <br>
     Versatile, basic design and cut for easy styling.
"""

plain_text = html_to_text(html_content)
print(plain_text)
