#!/usr/bin/env python3
"""
Generate all Chrome Web Store assets for LinkedIn Post Studio.
Creates promotional images, screenshots, and demo feature images.
"""

from PIL import Image, ImageDraw, ImageFont
import os

# LinkedIn blue palette
LINKEDIN_BLUE = (10, 102, 194)
LINKEDIN_DARK = (0, 65, 130)
LINKEDIN_LIGHT = (232, 240, 254)
WHITE = (255, 255, 255)
DARK_TEXT = (51, 51, 51)
LIGHT_GRAY = (248, 249, 250)
BORDER_GRAY = (224, 224, 224)
ACCENT_GREEN = (67, 160, 71)
ACCENT_ORANGE = (255, 152, 0)

# Use default font (Pillow's built-in)
def get_font(size):
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
    except:
        try:
            return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
        except:
            return ImageFont.load_default()

def get_regular_font(size):
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
    except:
        return ImageFont.load_default()


def draw_rounded_rect(draw, xy, radius, fill=None, outline=None, width=1):
    """Draw a rounded rectangle."""
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def draw_toolbar_mockup(draw, x, y, w, h):
    """Draw a mockup of the LPS toolbar."""
    # Toolbar background
    draw_rounded_rect(draw, (x, y, x+w, y+h), radius=8, fill=LIGHT_GRAY, outline=BORDER_GRAY)

    # Buttons
    buttons = [
        ("B", True, False), ("I", False, True), ("BI", True, True),
        ("|", False, False),
        ("• List", False, False), ("— Sep", False, False),
        ("|", False, False),
        ("Templates", False, False), ("Preview", False, False),
    ]

    bx = x + 10
    btn_h = int(h * 0.55)
    btn_y = y + (h - btn_h) // 2
    font_size = max(11, btn_h - 8)
    btn_font = get_font(font_size)

    for label, bold, italic in buttons:
        if label == "|":
            # Divider
            draw.line([(bx + 4, btn_y + 2), (bx + 4, btn_y + btn_h - 2)], fill=BORDER_GRAY, width=1)
            bx += 10
            continue

        # Estimate text width
        bbox = draw.textbbox((0, 0), label, font=btn_font)
        tw = bbox[2] - bbox[0]
        btn_w = tw + 16

        if label in ("Templates", "Preview"):
            fill_color = LINKEDIN_BLUE if label == "Templates" else WHITE
            text_color = WHITE if label == "Templates" else DARK_TEXT
            outline_color = LINKEDIN_BLUE if label == "Templates" else BORDER_GRAY
        else:
            fill_color = WHITE
            text_color = DARK_TEXT
            outline_color = BORDER_GRAY

        draw_rounded_rect(draw, (bx, btn_y, bx + btn_w, btn_y + btn_h),
                         radius=4, fill=fill_color, outline=outline_color)

        text_x = bx + (btn_w - tw) // 2
        text_y = btn_y + (btn_h - (bbox[3] - bbox[1])) // 2
        draw.text((text_x, text_y), label, fill=text_color, font=btn_font)

        bx += btn_w + 4

    # Stats on the right
    stats_font = get_regular_font(max(10, font_size - 2))
    stats_text = "142 chars | 28 words"
    bbox = draw.textbbox((0, 0), stats_text, font=stats_font)
    stats_w = bbox[2] - bbox[0]
    draw.text((x + w - stats_w - 12, btn_y + (btn_h - (bbox[3] - bbox[1])) // 2),
              stats_text, fill=(102, 102, 102), font=stats_font)


def draw_linkedin_post_mockup(draw, x, y, w, h, show_formatted=True):
    """Draw a mockup of a LinkedIn post editor with content."""
    # Post card background
    draw_rounded_rect(draw, (x, y, x+w, y+h), radius=12, fill=WHITE, outline=BORDER_GRAY, width=2)

    # Profile section
    avatar_size = min(40, h // 10)
    avatar_x = x + 16
    avatar_y = y + 16
    draw.ellipse((avatar_x, avatar_y, avatar_x + avatar_size, avatar_y + avatar_size), fill=LINKEDIN_BLUE)
    draw.text((avatar_x + avatar_size//2 - 5, avatar_y + avatar_size//4), "R", fill=WHITE, font=get_font(avatar_size//2))

    name_font = get_font(max(13, h // 30))
    title_font = get_regular_font(max(11, h // 38))
    draw.text((avatar_x + avatar_size + 10, avatar_y + 2), "Rohit Wadhwa", fill=DARK_TEXT, font=name_font)
    draw.text((avatar_x + avatar_size + 10, avatar_y + avatar_size//2 + 4), "Software Engineer | Tech Enthusiast", fill=(102, 102, 102), font=title_font)

    # Post content
    content_y = avatar_y + avatar_size + 20
    content_font = get_regular_font(max(12, h // 32))
    line_height = max(18, h // 22)

    if show_formatted:
        lines = [
            "5 lessons I learned building Chrome extensions:",
            "",
            "1. Keep it simple",
            "   Focus on one thing and do it well",
            "",
            "2. Respect user privacy",
            "   Minimal permissions = maximum trust",
            "",
            "3. Test on real websites",
            "   DOM changes break things fast",
            "",
            "What's your #1 tip for extension devs?",
            "",
            "#ChromeExtension #WebDev #BuildInPublic",
        ]
    else:
        lines = [
            "Start typing your post here...",
            "",
            "Use the toolbar above to format text,",
            "add bullet lists, separators, and more.",
        ]

    for i, line in enumerate(lines):
        if content_y + line_height > y + h - 10:
            break
        draw.text((x + 20, content_y), line, fill=DARK_TEXT, font=content_font)
        content_y += line_height


def create_promo_small(output_path):
    """Small promotional tile: 440x280"""
    img = Image.new('RGB', (440, 280), LINKEDIN_BLUE)
    draw = ImageDraw.Draw(img)

    # Gradient-like effect with rectangles
    for i in range(140):
        alpha = int(255 * (1 - i / 140))
        color = (
            min(255, LINKEDIN_BLUE[0] + i),
            min(255, LINKEDIN_BLUE[1] + i // 3),
            min(255, LINKEDIN_BLUE[2] + i // 5),
        )
        draw.rectangle([(0, 140 + i), (440, 141 + i)], fill=color)

    # Icon - "L" box
    icon_size = 50
    ix, iy = 195, 30
    draw_rounded_rect(draw, (ix, iy, ix + icon_size, iy + icon_size), radius=10, fill=WHITE)
    draw.text((ix + 14, iy + 8), "L", fill=LINKEDIN_BLUE, font=get_font(30))

    # Title
    title_font = get_font(28)
    title = "LinkedIn Post Studio"
    bbox = draw.textbbox((0, 0), title, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((440 - tw) // 2, 95), title, fill=WHITE, font=title_font)

    # Subtitle
    sub_font = get_regular_font(14)
    subtitle = "Format, template, and preview your LinkedIn posts"
    bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
    tw = bbox[2] - bbox[0]
    draw.text(((440 - tw) // 2, 132), subtitle, fill=(200, 220, 255), font=sub_font)

    # Feature badges
    badge_font = get_regular_font(11)
    badges = ["Bold/Italic", "Templates", "Live Preview", "100% Free"]
    total_w = sum(draw.textbbox((0, 0), b, font=badge_font)[2] - draw.textbbox((0, 0), b, font=badge_font)[0] + 20 for b in badges) + (len(badges) - 1) * 8
    bx = (440 - total_w) // 2
    by = 165

    for badge in badges:
        bbox = draw.textbbox((0, 0), badge, font=badge_font)
        bw = bbox[2] - bbox[0] + 20
        draw_rounded_rect(draw, (bx, by, bx + bw, by + 24), radius=12, fill=(255, 255, 255, 40), outline=WHITE)
        draw.text((bx + 10, by + 5), badge, fill=WHITE, font=badge_font)
        bx += bw + 8

    # Mini toolbar mockup at bottom
    draw_toolbar_mockup(draw, 30, 210, 380, 40)

    img.save(output_path)
    print(f"Created: {output_path}")


def create_promo_large(output_path):
    """Large promotional tile: 920x680"""
    img = Image.new('RGB', (920, 680), WHITE)
    draw = ImageDraw.Draw(img)

    # Top banner area with LinkedIn blue
    draw.rectangle([(0, 0), (920, 280)], fill=LINKEDIN_BLUE)

    # Subtle pattern in banner
    for i in range(0, 920, 60):
        for j in range(0, 280, 60):
            draw.rectangle([(i, j), (i+1, j+1)], fill=(15, 110, 200))

    # Icon
    icon_size = 70
    ix, iy = 425, 40
    draw_rounded_rect(draw, (ix, iy, ix + icon_size, iy + icon_size), radius=14, fill=WHITE)
    draw.text((ix + 18, iy + 10), "L", fill=LINKEDIN_BLUE, font=get_font(42))

    # Title
    title_font = get_font(40)
    title = "LinkedIn Post Studio"
    bbox = draw.textbbox((0, 0), title, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((920 - tw) // 2, 125), title, fill=WHITE, font=title_font)

    # Subtitle
    sub_font = get_regular_font(18)
    subtitle = "Write better LinkedIn posts — directly inside LinkedIn"
    bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
    tw = bbox[2] - bbox[0]
    draw.text(((920 - tw) // 2, 180), subtitle, fill=(200, 220, 255), font=sub_font)

    # Feature badges
    badge_font = get_font(14)
    badges = ["Unicode Bold/Italic", "Reusable Templates", "Live Preview", "100% Free"]
    total_w = sum(draw.textbbox((0, 0), b, font=badge_font)[2] - draw.textbbox((0, 0), b, font=badge_font)[0] + 28 for b in badges) + (len(badges) - 1) * 12
    bx = (920 - total_w) // 2
    by = 225

    for badge in badges:
        bbox = draw.textbbox((0, 0), badge, font=badge_font)
        bw = bbox[2] - bbox[0] + 28
        draw_rounded_rect(draw, (bx, by, bx + bw, by + 30), radius=15, fill=(255, 255, 255, 50), outline=WHITE)
        draw.text((bx + 14, by + 6), badge, fill=WHITE, font=badge_font)
        bx += bw + 12

    # Mockup area - post editor with toolbar
    mockup_x, mockup_y = 80, 310
    mockup_w, mockup_h = 760, 340

    # Shadow
    draw_rounded_rect(draw, (mockup_x + 4, mockup_y + 4, mockup_x + mockup_w + 4, mockup_y + mockup_h + 4),
                     radius=12, fill=(200, 200, 200))

    # Editor card
    draw_rounded_rect(draw, (mockup_x, mockup_y, mockup_x + mockup_w, mockup_y + mockup_h),
                     radius=12, fill=WHITE, outline=BORDER_GRAY, width=2)

    # Toolbar inside card
    draw_toolbar_mockup(draw, mockup_x + 16, mockup_y + 16, mockup_w - 32, 44)

    # Post content
    draw_linkedin_post_mockup(draw, mockup_x + 16, mockup_y + 70, mockup_w - 32, mockup_h - 90)

    img.save(output_path)
    print(f"Created: {output_path}")


def create_promo_marquee(output_path):
    """Marquee promotional tile: 1400x560"""
    img = Image.new('RGB', (1400, 560), WHITE)
    draw = ImageDraw.Draw(img)

    # Left side - blue section
    draw.rectangle([(0, 0), (600, 560)], fill=LINKEDIN_BLUE)

    # Diagonal transition
    draw.polygon([(600, 0), (720, 0), (600, 560), (480, 560)], fill=LINKEDIN_BLUE)

    # Icon on left
    icon_size = 80
    ix, iy = 220, 80
    draw_rounded_rect(draw, (ix, iy, ix + icon_size, iy + icon_size), radius=16, fill=WHITE)
    draw.text((ix + 22, iy + 12), "L", fill=LINKEDIN_BLUE, font=get_font(48))

    # Title on left
    title_font = get_font(42)
    draw.text((120, 190), "LinkedIn", fill=WHITE, font=title_font)
    draw.text((120, 240), "Post Studio", fill=WHITE, font=title_font)

    # Subtitle
    sub_font = get_regular_font(16)
    draw.text((120, 310), "Format, template, and preview", fill=(180, 210, 255), font=sub_font)
    draw.text((120, 332), "your LinkedIn posts for free", fill=(180, 210, 255), font=sub_font)

    # Feature list on left
    feat_font = get_regular_font(14)
    features = ["Unicode Bold & Italic", "Bullet Lists & Separators",
                "8+ Reusable Templates", "Live Desktop/Mobile Preview",
                "Keyboard Shortcuts", "Zero Data Collection"]
    fy = 380
    for feat in features:
        draw.text((140, fy), "✓", fill=ACCENT_GREEN, font=get_font(14))
        draw.text((160, fy), feat, fill=WHITE, font=feat_font)
        fy += 25

    # Right side - mockup
    mockup_x, mockup_y = 680, 40
    mockup_w, mockup_h = 680, 480

    # Shadow
    draw_rounded_rect(draw, (mockup_x + 3, mockup_y + 3, mockup_x + mockup_w + 3, mockup_y + mockup_h + 3),
                     radius=12, fill=(220, 220, 220))

    # Editor card
    draw_rounded_rect(draw, (mockup_x, mockup_y, mockup_x + mockup_w, mockup_y + mockup_h),
                     radius=12, fill=WHITE, outline=BORDER_GRAY, width=2)

    # Toolbar
    draw_toolbar_mockup(draw, mockup_x + 16, mockup_y + 16, mockup_w - 32, 44)

    # Post content
    draw_linkedin_post_mockup(draw, mockup_x + 16, mockup_y + 76, mockup_w - 32, mockup_h - 96)

    img.save(output_path)
    print(f"Created: {output_path}")


def create_screenshot_toolbar(output_path):
    """Screenshot 1: Toolbar in action (1280x800)"""
    img = Image.new('RGB', (1280, 800), (243, 243, 243))
    draw = ImageDraw.Draw(img)

    # LinkedIn-like header bar
    draw.rectangle([(0, 0), (1280, 52)], fill=WHITE)
    draw.line([(0, 52), (1280, 52)], fill=BORDER_GRAY, width=1)

    # LinkedIn logo in header
    logo_font = get_font(22)
    draw.text((40, 14), "LinkedIn", fill=LINKEDIN_BLUE, font=logo_font)

    # Navigation items
    nav_font = get_regular_font(12)
    nav_items = ["Home", "My Network", "Jobs", "Messaging", "Notifications"]
    nx = 400
    for item in nav_items:
        draw.text((nx, 20), item, fill=(102, 102, 102), font=nav_font)
        nx += 100

    # Post creation modal
    modal_x, modal_y = 240, 80
    modal_w, modal_h = 800, 660

    # Modal shadow
    draw_rounded_rect(draw, (modal_x + 5, modal_y + 5, modal_x + modal_w + 5, modal_y + modal_h + 5),
                     radius=12, fill=(180, 180, 180))

    # Modal background
    draw_rounded_rect(draw, (modal_x, modal_y, modal_x + modal_w, modal_y + modal_h),
                     radius=12, fill=WHITE, outline=BORDER_GRAY, width=2)

    # Modal header
    draw_rounded_rect(draw, (modal_x, modal_y, modal_x + modal_w, modal_y + 50),
                     radius=0, fill=WHITE)
    draw.line([(modal_x, modal_y + 50), (modal_x + modal_w, modal_y + 50)], fill=BORDER_GRAY)
    header_font = get_font(16)
    draw.text((modal_x + 20, modal_y + 14), "Create a post", fill=DARK_TEXT, font=header_font)
    draw.text((modal_x + modal_w - 30, modal_y + 12), "X", fill=(102, 102, 102), font=get_font(18))

    # Profile in modal
    py = modal_y + 65
    draw.ellipse((modal_x + 20, py, modal_x + 60, py + 40), fill=LINKEDIN_BLUE)
    draw.text((modal_x + 33, py + 10), "R", fill=WHITE, font=get_font(16))
    draw.text((modal_x + 70, py + 2), "Rohit Wadhwa", fill=DARK_TEXT, font=get_font(14))
    draw.text((modal_x + 70, py + 22), "Post to Anyone", fill=(102, 102, 102), font=get_regular_font(12))

    # LPS Toolbar (highlighted with annotation)
    toolbar_y = py + 55
    draw_toolbar_mockup(draw, modal_x + 16, toolbar_y, modal_w - 32, 44)

    # Annotation arrow and label pointing to toolbar
    ann_font = get_font(14)
    ann_text = "LinkedIn Post Studio Toolbar"
    bbox = draw.textbbox((0, 0), ann_text, font=ann_font)
    ann_w = bbox[2] - bbox[0]

    # Arrow line from annotation to toolbar
    arrow_x = modal_x + modal_w - 60
    draw_rounded_rect(draw, (arrow_x - ann_w - 20, toolbar_y - 35, arrow_x + 10, toolbar_y - 8),
                     radius=4, fill=LINKEDIN_BLUE)
    draw.text((arrow_x - ann_w - 10, toolbar_y - 32), ann_text, fill=WHITE, font=ann_font)

    # Post content area
    content_y = toolbar_y + 56
    content_font = get_regular_font(14)
    line_h = 24

    post_lines = [
        "5 things I wish I knew before my first tech talk:",
        "",
        "1. Nobody notices your mistakes as much as you do",
        "2. Stories > slides every time",
        "3. Practice out loud, not just in your head",
        "4. The audience wants you to succeed",
        "5. Record yourself — you'll improve 10x faster",
        "",
        "The hardest part isn't the talk itself.",
        "It's hitting 'Submit' on that CFP.",
        "",
        "What would you add to this list?",
        "",
        "#PublicSpeaking #TechTalks #CareerGrowth",
    ]

    for line in post_lines:
        if content_y + line_h > modal_y + modal_h - 60:
            break
        draw.text((modal_x + 20, content_y), line, fill=DARK_TEXT, font=content_font)
        content_y += line_h

    # Bottom action bar
    bottom_y = modal_y + modal_h - 50
    draw.line([(modal_x, bottom_y), (modal_x + modal_w, bottom_y)], fill=BORDER_GRAY)

    # Post button
    btn_w, btn_h = 80, 32
    btn_x = modal_x + modal_w - btn_w - 16
    btn_y = bottom_y + 9
    draw_rounded_rect(draw, (btn_x, btn_y, btn_x + btn_w, btn_y + btn_h),
                     radius=16, fill=LINKEDIN_BLUE)
    btn_font = get_font(14)
    draw.text((btn_x + 22, btn_y + 7), "Post", fill=WHITE, font=btn_font)

    img.save(output_path)
    print(f"Created: {output_path}")


def create_screenshot_templates(output_path):
    """Screenshot 2: Template panel open (1280x800)"""
    img = Image.new('RGB', (1280, 800), (243, 243, 243))
    draw = ImageDraw.Draw(img)

    # LinkedIn header
    draw.rectangle([(0, 0), (1280, 52)], fill=WHITE)
    draw.line([(0, 52), (1280, 52)], fill=BORDER_GRAY)
    logo_font = get_font(22)
    draw.text((40, 14), "LinkedIn", fill=LINKEDIN_BLUE, font=logo_font)

    # Post modal
    modal_x, modal_y = 240, 80
    modal_w, modal_h = 800, 660

    draw_rounded_rect(draw, (modal_x + 5, modal_y + 5, modal_x + modal_w + 5, modal_y + modal_h + 5),
                     radius=12, fill=(180, 180, 180))
    draw_rounded_rect(draw, (modal_x, modal_y, modal_x + modal_w, modal_y + modal_h),
                     radius=12, fill=WHITE, outline=BORDER_GRAY, width=2)

    # Modal header
    header_font = get_font(16)
    draw.text((modal_x + 20, modal_y + 14), "Create a post", fill=DARK_TEXT, font=header_font)
    draw.line([(modal_x, modal_y + 50), (modal_x + modal_w, modal_y + 50)], fill=BORDER_GRAY)

    # Toolbar
    toolbar_y = modal_y + 65
    draw_toolbar_mockup(draw, modal_x + 16, toolbar_y, modal_w - 32, 44)

    # Template panel (expanded below toolbar)
    panel_x = modal_x + 16
    panel_y = toolbar_y + 54
    panel_w = modal_w - 32
    panel_h = 400

    # Panel shadow
    draw_rounded_rect(draw, (panel_x + 3, panel_y + 3, panel_x + panel_w + 3, panel_y + panel_h + 3),
                     radius=8, fill=(210, 210, 210))
    draw_rounded_rect(draw, (panel_x, panel_y, panel_x + panel_w, panel_y + panel_h),
                     radius=8, fill=WHITE, outline=BORDER_GRAY, width=2)

    # Panel header
    p_header_y = panel_y
    draw_rounded_rect(draw, (panel_x, p_header_y, panel_x + panel_w, p_header_y + 40),
                     radius=0, fill=LIGHT_GRAY)
    draw.line([(panel_x, p_header_y + 40), (panel_x + panel_w, p_header_y + 40)], fill=BORDER_GRAY)
    draw.text((panel_x + 12, p_header_y + 10), "Templates", fill=DARK_TEXT, font=get_font(14))
    draw.text((panel_x + panel_w - 24, p_header_y + 8), "X", fill=(102, 102, 102), font=get_font(16))

    # Template items
    templates = [
        ("Engagement Hook", "hook", "Start with a bold statement to grab attention..."),
        ("Story Framework", "structure", "Setup -> Conflict -> Resolution -> Lesson..."),
        ("Listicle Post", "structure", "Number your key points for easy reading..."),
        ("Hot Take", "hook", "Share a controversial opinion with evidence..."),
        ("CTA Closer", "cta", "End with a compelling call to action..."),
        ("Hashtag Set - Tech", "hashtag", "#TechLeadership #SoftwareEngineering..."),
        ("Weekly Wins", "structure", "Share your weekly accomplishments..."),
        ("Ask the Audience", "cta", "Pose a thought-provoking question..."),
    ]

    ty = p_header_y + 50
    item_h = 42
    name_font = get_font(13)
    cat_font = get_regular_font(10)
    desc_font = get_regular_font(11)
    btn_small_font = get_regular_font(10)

    for name, category, desc in templates:
        if ty + item_h > panel_y + panel_h - 10:
            break

        # Template name
        draw.text((panel_x + 14, ty + 4), name, fill=DARK_TEXT, font=name_font)

        # Category badge
        cat_colors = {"hook": (232, 240, 254), "structure": (232, 245, 233),
                      "cta": (255, 243, 224), "hashtag": (243, 229, 245)}
        cat_text_colors = {"hook": LINKEDIN_BLUE, "structure": ACCENT_GREEN,
                          "cta": ACCENT_ORANGE, "hashtag": (142, 36, 170)}

        bbox = draw.textbbox((0, 0), category, font=cat_font)
        cw = bbox[2] - bbox[0] + 12
        cx = panel_x + 14
        draw_rounded_rect(draw, (cx, ty + 24, cx + cw, ty + 38),
                         radius=3, fill=cat_colors.get(category, LINKEDIN_LIGHT))
        draw.text((cx + 6, ty + 25), category, fill=cat_text_colors.get(category, LINKEDIN_BLUE), font=cat_font)

        # Description
        draw.text((cx + cw + 10, ty + 25), desc, fill=(153, 153, 153), font=desc_font)

        # Use button
        use_x = panel_x + panel_w - 60
        draw_rounded_rect(draw, (use_x, ty + 6, use_x + 45, ty + 26),
                         radius=4, fill=LINKEDIN_BLUE)
        draw.text((use_x + 10, ty + 9), "Use", fill=WHITE, font=btn_small_font)

        # Separator
        draw.line([(panel_x + 10, ty + item_h), (panel_x + panel_w - 10, ty + item_h)],
                 fill=(240, 240, 240))
        ty += item_h

    # Annotation
    ann_font = get_font(14)
    ann_text = "8 Built-in Templates + Create Your Own"
    bbox = draw.textbbox((0, 0), ann_text, font=ann_font)
    ann_w = bbox[2] - bbox[0]
    ann_x = (1280 - ann_w) // 2 - 10
    ann_y = panel_y + panel_h + 20
    draw_rounded_rect(draw, (ann_x, ann_y, ann_x + ann_w + 20, ann_y + 30),
                     radius=4, fill=LINKEDIN_BLUE)
    draw.text((ann_x + 10, ann_y + 6), ann_text, fill=WHITE, font=ann_font)

    img.save(output_path)
    print(f"Created: {output_path}")


def create_screenshot_preview(output_path):
    """Screenshot 3: Live preview panel (1280x800)"""
    img = Image.new('RGB', (1280, 800), (243, 243, 243))
    draw = ImageDraw.Draw(img)

    # LinkedIn header
    draw.rectangle([(0, 0), (1280, 52)], fill=WHITE)
    draw.line([(0, 52), (1280, 52)], fill=BORDER_GRAY)
    draw.text((40, 14), "LinkedIn", fill=LINKEDIN_BLUE, font=get_font(22))

    # Post modal
    modal_x, modal_y = 240, 80
    modal_w, modal_h = 800, 660

    draw_rounded_rect(draw, (modal_x + 5, modal_y + 5, modal_x + modal_w + 5, modal_y + modal_h + 5),
                     radius=12, fill=(180, 180, 180))
    draw_rounded_rect(draw, (modal_x, modal_y, modal_x + modal_w, modal_y + modal_h),
                     radius=12, fill=WHITE, outline=BORDER_GRAY, width=2)

    # Header
    draw.text((modal_x + 20, modal_y + 14), "Create a post", fill=DARK_TEXT, font=get_font(16))
    draw.line([(modal_x, modal_y + 50), (modal_x + modal_w, modal_y + 50)], fill=BORDER_GRAY)

    # Toolbar
    toolbar_y = modal_y + 65
    draw_toolbar_mockup(draw, modal_x + 16, toolbar_y, modal_w - 32, 44)

    # Preview panel
    panel_x = modal_x + 16
    panel_y = toolbar_y + 54
    panel_w = modal_w - 32
    panel_h = 420

    draw_rounded_rect(draw, (panel_x + 3, panel_y + 3, panel_x + panel_w + 3, panel_y + panel_h + 3),
                     radius=8, fill=(210, 210, 210))
    draw_rounded_rect(draw, (panel_x, panel_y, panel_x + panel_w, panel_y + panel_h),
                     radius=8, fill=WHITE, outline=BORDER_GRAY, width=2)

    # Panel header with toggle
    draw_rounded_rect(draw, (panel_x, panel_y, panel_x + panel_w, panel_y + 40),
                     radius=0, fill=LIGHT_GRAY)
    draw.line([(panel_x, panel_y + 40), (panel_x + panel_w, panel_y + 40)], fill=BORDER_GRAY)
    draw.text((panel_x + 12, panel_y + 10), "Preview", fill=DARK_TEXT, font=get_font(14))

    # Desktop/Mobile toggle
    toggle_font = get_font(11)
    # Desktop button (active)
    draw_rounded_rect(draw, (panel_x + panel_w - 160, panel_y + 8, panel_x + panel_w - 90, panel_y + 32),
                     radius=4, fill=LINKEDIN_BLUE)
    draw.text((panel_x + panel_w - 150, panel_y + 12), "Desktop", fill=WHITE, font=toggle_font)
    # Mobile button
    draw_rounded_rect(draw, (panel_x + panel_w - 85, panel_y + 8, panel_x + panel_w - 20, panel_y + 32),
                     radius=4, fill=WHITE, outline=BORDER_GRAY)
    draw.text((panel_x + panel_w - 75, panel_y + 12), "Mobile", fill=DARK_TEXT, font=toggle_font)

    draw.text((panel_x + panel_w - 14, panel_y + 8), "X", fill=(102, 102, 102), font=get_font(16))

    # Preview content - simulated LinkedIn post
    preview_y = panel_y + 50
    preview_x = panel_x + 20

    # Profile in preview
    draw.ellipse((preview_x, preview_y, preview_x + 44, preview_y + 44), fill=LINKEDIN_BLUE)
    draw.text((preview_x + 14, preview_y + 10), "R", fill=WHITE, font=get_font(18))
    draw.text((preview_x + 54, preview_y + 4), "Rohit Wadhwa", fill=DARK_TEXT, font=get_font(14))
    draw.text((preview_x + 54, preview_y + 24), "Software Engineer", fill=(102, 102, 102), font=get_regular_font(11))

    # Post text in preview (showing formatted content)
    py = preview_y + 60
    content_font = get_regular_font(13)
    bold_font = get_font(13)
    line_h = 22

    preview_lines = [
        ("Here's why side projects matter:", True),
        ("", False),
        ("• They let you explore new technologies", False),
        ("• They build your portfolio", False),
        ("• They teach you project management", False),
        ("• They spark creativity", False),
        ("", False),
        ("━━━━━━━━━━━━━━━━", False),
        ("", False),
        ("My latest side project taught me more about", False),
        ("system design than 2 years of tutorials.", False),
        ("", False),
        ("What's your favorite side project?", True),
        ("", False),
        ("#SideProjects #CodingLife #BuildInPublic", False),
    ]

    for text, is_bold in preview_lines:
        if py + line_h > panel_y + panel_h - 10:
            break
        font = bold_font if is_bold else content_font
        draw.text((preview_x, py), text, fill=DARK_TEXT, font=font)
        py += line_h

    # Annotation
    ann_font = get_font(14)
    ann_text = "Live Preview — See How Your Post Will Look"
    bbox = draw.textbbox((0, 0), ann_text, font=ann_font)
    ann_w = bbox[2] - bbox[0]
    ann_x = (1280 - ann_w) // 2 - 10
    ann_y = panel_y + panel_h + 15
    draw_rounded_rect(draw, (ann_x, ann_y, ann_x + ann_w + 20, ann_y + 30),
                     radius=4, fill=LINKEDIN_BLUE)
    draw.text((ann_x + 10, ann_y + 6), ann_text, fill=WHITE, font=ann_font)

    img.save(output_path)
    print(f"Created: {output_path}")


def create_screenshot_formatting(output_path):
    """Screenshot 4: Formatting features showcase (1280x800)"""
    img = Image.new('RGB', (1280, 800), (243, 243, 243))
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([(0, 0), (1280, 52)], fill=WHITE)
    draw.line([(0, 52), (1280, 52)], fill=BORDER_GRAY)
    draw.text((40, 14), "LinkedIn", fill=LINKEDIN_BLUE, font=get_font(22))

    # Modal
    modal_x, modal_y = 240, 80
    modal_w, modal_h = 800, 660

    draw_rounded_rect(draw, (modal_x + 5, modal_y + 5, modal_x + modal_w + 5, modal_y + modal_h + 5),
                     radius=12, fill=(180, 180, 180))
    draw_rounded_rect(draw, (modal_x, modal_y, modal_x + modal_w, modal_y + modal_h),
                     radius=12, fill=WHITE, outline=BORDER_GRAY, width=2)

    draw.text((modal_x + 20, modal_y + 14), "Create a post", fill=DARK_TEXT, font=get_font(16))
    draw.line([(modal_x, modal_y + 50), (modal_x + modal_w, modal_y + 50)], fill=BORDER_GRAY)

    # Toolbar
    toolbar_y = modal_y + 65
    draw_toolbar_mockup(draw, modal_x + 16, toolbar_y, modal_w - 32, 44)

    # Content showing various formatting
    cy = toolbar_y + 60
    cx = modal_x + 30

    title_font = get_font(16)
    regular_font = get_regular_font(14)
    bold_font = get_font(14)
    small_font = get_regular_font(12)
    line_h = 26

    # Formatted content
    sections = [
        ("Bold text example:", bold_font, DARK_TEXT),
        ("This text appears in 𝗯𝗼𝗹𝗱 Unicode formatting", regular_font, DARK_TEXT),
        ("", regular_font, DARK_TEXT),
        ("Italic text example:", bold_font, DARK_TEXT),
        ("This text appears in 𝘪𝘵𝘢𝘭𝘪𝘤 Unicode formatting", regular_font, DARK_TEXT),
        ("", regular_font, DARK_TEXT),
        ("Bullet lists:", bold_font, DARK_TEXT),
        ("  • First bullet point", regular_font, DARK_TEXT),
        ("  • Second bullet point", regular_font, DARK_TEXT),
        ("  → Arrow style bullet", regular_font, DARK_TEXT),
        ("  ✓ Checkmark style bullet", regular_font, DARK_TEXT),
        ("", regular_font, DARK_TEXT),
        ("Separators:", bold_font, DARK_TEXT),
        ("━━━━━━━━━━━━━━━━━━━━━━━━━", regular_font, (102, 102, 102)),
        ("· · · · · · · · · · · · · · · · · · ·", regular_font, (102, 102, 102)),
        ("✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦", regular_font, (102, 102, 102)),
        ("〰〰〰〰〰〰〰〰〰〰〰〰〰", regular_font, (102, 102, 102)),
    ]

    for text, font, color in sections:
        if cy + line_h > modal_y + modal_h - 60:
            break
        draw.text((cx, cy), text, fill=color, font=font)
        cy += line_h

    # Bottom stats bar
    bottom_y = modal_y + modal_h - 50
    draw.line([(modal_x, bottom_y), (modal_x + modal_w, bottom_y)], fill=BORDER_GRAY)
    stats_font = get_regular_font(12)
    draw.text((modal_x + 20, bottom_y + 16), "386 characters | 52 words", fill=(102, 102, 102), font=stats_font)

    # Post button
    btn_x = modal_x + modal_w - 96
    btn_y = bottom_y + 9
    draw_rounded_rect(draw, (btn_x, btn_y, btn_x + 80, btn_y + 32), radius=16, fill=LINKEDIN_BLUE)
    draw.text((btn_x + 22, btn_y + 7), "Post", fill=WHITE, font=get_font(14))

    # Annotation
    ann_font = get_font(14)
    ann_text = "Bold, Italic, Bullets, Separators & More"
    bbox = draw.textbbox((0, 0), ann_text, font=ann_font)
    ann_w = bbox[2] - bbox[0]
    ann_x = (1280 - ann_w) // 2 - 10
    ann_y = 755
    draw_rounded_rect(draw, (ann_x, ann_y, ann_x + ann_w + 20, ann_y + 30),
                     radius=4, fill=LINKEDIN_BLUE)
    draw.text((ann_x + 10, ann_y + 6), ann_text, fill=WHITE, font=ann_font)

    img.save(output_path)
    print(f"Created: {output_path}")


def create_screenshot_popup(output_path):
    """Screenshot 5: Extension popup settings (1280x800)"""
    img = Image.new('RGB', (1280, 800), (243, 243, 243))
    draw = ImageDraw.Draw(img)

    # Browser chrome
    draw.rectangle([(0, 0), (1280, 52)], fill=WHITE)
    draw.line([(0, 52), (1280, 52)], fill=BORDER_GRAY)
    draw.text((40, 14), "LinkedIn", fill=LINKEDIN_BLUE, font=get_font(22))

    # LinkedIn feed in background
    feed_x, feed_y = 320, 80
    feed_w = 640
    draw_rounded_rect(draw, (feed_x, feed_y, feed_x + feed_w, feed_y + 300),
                     radius=8, fill=WHITE, outline=BORDER_GRAY)
    draw.text((feed_x + 20, feed_y + 20), "Share your thoughts...", fill=(153, 153, 153), font=get_regular_font(14))

    # Extension popup overlay (top right, like a real popup)
    popup_x, popup_y = 880, 60
    popup_w, popup_h = 360, 520

    # Popup shadow
    draw_rounded_rect(draw, (popup_x + 4, popup_y + 4, popup_x + popup_w + 4, popup_y + popup_h + 4),
                     radius=10, fill=(160, 160, 160))
    draw_rounded_rect(draw, (popup_x, popup_y, popup_x + popup_w, popup_y + popup_h),
                     radius=10, fill=WHITE, outline=BORDER_GRAY, width=2)

    # Popup header
    header_h = 60
    draw_rounded_rect(draw, (popup_x, popup_y, popup_x + popup_w, popup_y + header_h),
                     radius=0, fill=LINKEDIN_BLUE)

    # Icon in header
    ix = popup_x + 15
    iy = popup_y + 10
    draw_rounded_rect(draw, (ix, iy, ix + 40, iy + 40), radius=8, fill=WHITE)
    draw.text((ix + 10, iy + 6), "L", fill=LINKEDIN_BLUE, font=get_font(22))

    draw.text((ix + 50, iy + 2), "LinkedIn Post Studio", fill=WHITE, font=get_font(16))
    draw.text((ix + 50, iy + 24), "v1.0.0", fill=(180, 210, 255), font=get_regular_font(11))

    # Settings sections
    sy = popup_y + header_h + 15
    section_font = get_font(13)
    label_font = get_regular_font(12)

    # Stats section
    draw.text((popup_x + 15, sy), "Usage Stats", fill=DARK_TEXT, font=section_font)
    sy += 25

    stats = [("Posts formatted", "47"), ("Templates used", "23"), ("Characters formatted", "12,450")]
    for label, value in stats:
        draw.text((popup_x + 20, sy), label, fill=(102, 102, 102), font=label_font)
        draw.text((popup_x + popup_w - 60, sy), value, fill=LINKEDIN_BLUE, font=get_font(12))
        sy += 22

    sy += 10
    draw.line([(popup_x + 15, sy), (popup_x + popup_w - 15, sy)], fill=BORDER_GRAY)
    sy += 15

    # Settings section
    draw.text((popup_x + 15, sy), "Settings", fill=DARK_TEXT, font=section_font)
    sy += 30

    settings = [
        ("Auto-show toolbar", True),
        ("Keyboard shortcuts", True),
        ("Character counter", True),
        ("Compact mode", False),
    ]

    for label, enabled in settings:
        draw.text((popup_x + 20, sy), label, fill=DARK_TEXT, font=label_font)
        # Toggle switch
        tx = popup_x + popup_w - 55
        toggle_bg = ACCENT_GREEN if enabled else (200, 200, 200)
        draw_rounded_rect(draw, (tx, sy, tx + 40, sy + 20), radius=10, fill=toggle_bg)
        knob_x = tx + 22 if enabled else tx + 2
        draw.ellipse((knob_x, sy + 2, knob_x + 16, sy + 18), fill=WHITE)
        sy += 32

    sy += 5
    draw.line([(popup_x + 15, sy), (popup_x + popup_w - 15, sy)], fill=BORDER_GRAY)
    sy += 15

    # Template management
    draw.text((popup_x + 15, sy), "Templates", fill=DARK_TEXT, font=section_font)
    sy += 30

    # Import/Export buttons
    btn_w2 = (popup_w - 45) // 2
    draw_rounded_rect(draw, (popup_x + 15, sy, popup_x + 15 + btn_w2, sy + 32),
                     radius=4, fill=WHITE, outline=LINKEDIN_BLUE, width=1)
    draw.text((popup_x + 15 + btn_w2//2 - 25, sy + 8), "Import", fill=LINKEDIN_BLUE, font=get_font(12))

    draw_rounded_rect(draw, (popup_x + 25 + btn_w2, sy, popup_x + 25 + btn_w2*2, sy + 32),
                     radius=4, fill=LINKEDIN_BLUE)
    draw.text((popup_x + 25 + btn_w2 + btn_w2//2 - 25, sy + 8), "Export", fill=WHITE, font=get_font(12))

    # Annotation
    ann_font = get_font(14)
    ann_text = "Extension Popup — Settings & Template Management"
    bbox = draw.textbbox((0, 0), ann_text, font=ann_font)
    ann_w = bbox[2] - bbox[0]
    ann_x = popup_x - 40
    ann_y = popup_y + popup_h + 20
    draw_rounded_rect(draw, (ann_x, ann_y, ann_x + ann_w + 20, ann_y + 30),
                     radius=4, fill=LINKEDIN_BLUE)
    draw.text((ann_x + 10, ann_y + 6), ann_text, fill=WHITE, font=ann_font)

    img.save(output_path)
    print(f"Created: {output_path}")


def create_demo_feature(output_path, title, description, feature_items, accent_color=LINKEDIN_BLUE):
    """Create a demo feature image (800x600) for store listing."""
    img = Image.new('RGB', (800, 600), WHITE)
    draw = ImageDraw.Draw(img)

    # Top accent bar
    draw.rectangle([(0, 0), (800, 6)], fill=accent_color)

    # Icon
    icon_size = 50
    ix = 375
    iy = 30
    draw_rounded_rect(draw, (ix, iy, ix + icon_size, iy + icon_size), radius=10, fill=LINKEDIN_BLUE)
    draw.text((ix + 14, iy + 8), "L", fill=WHITE, font=get_font(28))

    # Title
    title_font = get_font(28)
    bbox = draw.textbbox((0, 0), title, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((800 - tw) // 2, 95), title, fill=DARK_TEXT, font=title_font)

    # Description
    desc_font = get_regular_font(14)
    bbox = draw.textbbox((0, 0), description, font=desc_font)
    tw = bbox[2] - bbox[0]
    draw.text(((800 - tw) // 2, 135), description, fill=(102, 102, 102), font=desc_font)

    # Separator
    draw.line([(100, 170), (700, 170)], fill=BORDER_GRAY, width=1)

    # Feature items
    fy = 195
    item_font = get_regular_font(15)
    check_font = get_font(16)

    for item in feature_items:
        draw.text((180, fy), "✓", fill=ACCENT_GREEN, font=check_font)
        draw.text((210, fy), item, fill=DARK_TEXT, font=item_font)
        fy += 36

    # Bottom branding
    draw.line([(100, 540), (700, 540)], fill=BORDER_GRAY)
    brand_font = get_regular_font(12)
    draw.text((280, 560), "LinkedIn Post Studio — Free & Open Source", fill=(153, 153, 153), font=brand_font)

    img.save(output_path)
    print(f"Created: {output_path}")


def create_banner_1280(output_path):
    """Wide banner image: 1280x640"""
    img = Image.new('RGB', (1280, 640), LINKEDIN_BLUE)
    draw = ImageDraw.Draw(img)

    # Gradient effect
    for i in range(640):
        r = int(LINKEDIN_BLUE[0] + (LINKEDIN_DARK[0] - LINKEDIN_BLUE[0]) * i / 640)
        g = int(LINKEDIN_BLUE[1] + (LINKEDIN_DARK[1] - LINKEDIN_BLUE[1]) * i / 640)
        b = int(LINKEDIN_BLUE[2] + (LINKEDIN_DARK[2] - LINKEDIN_BLUE[2]) * i / 640)
        draw.line([(0, i), (1280, i)], fill=(r, g, b))

    # Large icon
    icon_size = 100
    ix = 590
    iy = 60
    draw_rounded_rect(draw, (ix, iy, ix + icon_size, iy + icon_size), radius=20, fill=WHITE)
    draw.text((ix + 28, iy + 16), "L", fill=LINKEDIN_BLUE, font=get_font(56))

    # Title
    title_font = get_font(52)
    title = "LinkedIn Post Studio"
    bbox = draw.textbbox((0, 0), title, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((1280 - tw) // 2, 190), title, fill=WHITE, font=title_font)

    # Subtitle
    sub_font = get_regular_font(22)
    sub = "Write better LinkedIn posts — directly inside LinkedIn"
    bbox = draw.textbbox((0, 0), sub, font=sub_font)
    tw = bbox[2] - bbox[0]
    draw.text(((1280 - tw) // 2, 260), sub, fill=(180, 210, 255), font=sub_font)

    # Feature badges
    badge_font = get_font(16)
    badges = ["Unicode Formatting", "Reusable Templates", "Live Preview", "100% Free"]
    total_w = sum(draw.textbbox((0, 0), b, font=badge_font)[2] - draw.textbbox((0, 0), b, font=badge_font)[0] + 32 for b in badges) + (len(badges) - 1) * 16
    bx = (1280 - total_w) // 2
    by = 320

    for badge in badges:
        bbox = draw.textbbox((0, 0), badge, font=badge_font)
        bw = bbox[2] - bbox[0] + 32
        draw_rounded_rect(draw, (bx, by, bx + bw, by + 36), radius=18, outline=WHITE, width=2)
        draw.text((bx + 16, by + 7), badge, fill=WHITE, font=badge_font)
        bx += bw + 16

    # Mini toolbar at bottom
    toolbar_w = 800
    toolbar_x = (1280 - toolbar_w) // 2
    toolbar_y = 400

    # Toolbar shadow
    draw_rounded_rect(draw, (toolbar_x + 3, toolbar_y + 3, toolbar_x + toolbar_w + 3, toolbar_y + 53),
                     radius=8, fill=(0, 50, 100))
    draw_toolbar_mockup(draw, toolbar_x, toolbar_y, toolbar_w, 50)

    # Bottom tagline
    tag_font = get_regular_font(14)
    tag = "Free Chrome Extension — No data collection — Open source"
    bbox = draw.textbbox((0, 0), tag, font=tag_font)
    tw = bbox[2] - bbox[0]
    draw.text(((1280 - tw) // 2, 580), tag, fill=(150, 190, 240), font=tag_font)

    img.save(output_path)
    print(f"Created: {output_path}")


def create_icon_480(output_path):
    """480px promotional icon."""
    img = Image.new('RGB', (480, 480), LINKEDIN_BLUE)
    draw = ImageDraw.Draw(img)

    # Centered icon
    icon_size = 200
    ix = 140
    iy = 80
    draw_rounded_rect(draw, (ix, iy, ix + icon_size, iy + icon_size), radius=40, fill=WHITE)
    draw.text((ix + 55, iy + 30), "L", fill=LINKEDIN_BLUE, font=get_font(120))

    # Title below
    title_font = get_font(28)
    title = "LinkedIn Post Studio"
    bbox = draw.textbbox((0, 0), title, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((480 - tw) // 2, 310), title, fill=WHITE, font=title_font)

    # Subtitle
    sub_font = get_regular_font(16)
    sub = "Format • Template • Preview"
    bbox = draw.textbbox((0, 0), sub, font=sub_font)
    tw = bbox[2] - bbox[0]
    draw.text(((480 - tw) // 2, 350), sub, fill=(180, 210, 255), font=sub_font)

    # Free badge
    free_font = get_font(14)
    free_text = "FREE"
    bbox = draw.textbbox((0, 0), free_text, font=free_font)
    fw = bbox[2] - bbox[0]
    draw_rounded_rect(draw, ((480-fw)//2 - 12, 395, (480+fw)//2 + 12, 420), radius=4, fill=WHITE)
    draw.text(((480 - fw) // 2, 399), free_text, fill=LINKEDIN_BLUE, font=free_font)

    img.save(output_path)
    print(f"Created: {output_path}")


# Main execution
if __name__ == "__main__":
    base_dir = "/home/user/linkedin-post-studio"
    images_dir = os.path.join(base_dir, "images")
    demo_dir = os.path.join(base_dir, "demo")

    os.makedirs(images_dir, exist_ok=True)
    os.makedirs(demo_dir, exist_ok=True)

    print("=== Generating Chrome Web Store Assets ===\n")

    # 1. Promotional images
    print("--- Promotional Images ---")
    create_promo_small(os.path.join(images_dir, "promo-small-440x280.png"))
    create_promo_large(os.path.join(images_dir, "promo-large-920x680.png"))
    create_promo_marquee(os.path.join(images_dir, "promo-marquee-1400x560.png"))
    create_banner_1280(os.path.join(images_dir, "banner1280.png"))
    create_icon_480(os.path.join(images_dir, "icon-480.png"))

    # 2. Screenshots (1280x800)
    print("\n--- Screenshots ---")
    create_screenshot_toolbar(os.path.join(images_dir, "screenshot-1-toolbar.png"))
    create_screenshot_templates(os.path.join(images_dir, "screenshot-2-templates.png"))
    create_screenshot_preview(os.path.join(images_dir, "screenshot-3-preview.png"))
    create_screenshot_formatting(os.path.join(images_dir, "screenshot-4-formatting.png"))
    create_screenshot_popup(os.path.join(images_dir, "screenshot-5-popup.png"))

    # 3. Demo feature images
    print("\n--- Demo Feature Images ---")
    create_demo_feature(
        os.path.join(demo_dir, "formatting-tools.png"),
        "Formatting Tools",
        "Format your LinkedIn posts with Unicode bold, italic, and more",
        [
            "Bold text using Unicode Mathematical Symbols",
            "Italic and Bold-Italic formatting",
            "Four styles of bullet lists (•, →, —, ✓)",
            "Four separator styles (line, dots, stars, wave)",
            "Character and word counter",
            "Keyboard shortcuts (Ctrl+B, Ctrl+I)",
        ]
    )

    create_demo_feature(
        os.path.join(demo_dir, "template-system.png"),
        "Template System",
        "Save time with reusable templates for every post type",
        [
            "8 built-in templates ready to use",
            "Hooks, CTAs, hashtags, and structures",
            "Create your own custom templates",
            "Organize by category",
            "Import and export templates (JSON)",
            "One-click insert into editor",
        ],
        accent_color=ACCENT_GREEN
    )

    create_demo_feature(
        os.path.join(demo_dir, "live-preview.png"),
        "Live Preview",
        "See exactly how your post will appear before publishing",
        [
            "Real-time preview as you type",
            "Desktop and mobile view toggle",
            "See the 'fold' line for mobile",
            "Test formatting before posting",
            "No surprises after you hit Post",
        ],
        accent_color=ACCENT_ORANGE
    )

    create_demo_feature(
        os.path.join(demo_dir, "privacy-first.png"),
        "Privacy First",
        "Your data stays on your device — always",
        [
            "Zero data collection or tracking",
            "Only 2 permissions: storage + activeTab",
            "All templates stored locally",
            "No external servers or APIs",
            "No cookies or analytics",
            "Open source — fully auditable",
        ],
        accent_color=(76, 175, 80)
    )

    create_demo_feature(
        os.path.join(demo_dir, "free-forever.png"),
        "100% Free — Forever",
        "Competitors charge $20-65/month. We don't.",
        [
            "No subscription fees",
            "No premium tier or feature gates",
            "No hidden costs or upsells",
            "Full feature set for everyone",
            "Open source on GitHub",
            "Community-driven development",
        ],
        accent_color=(156, 39, 176)
    )

    print("\n=== All assets generated successfully! ===")
    print(f"\nImages directory: {images_dir}")
    print(f"Demo directory: {demo_dir}")
