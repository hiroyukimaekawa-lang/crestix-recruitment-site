#!/usr/bin/env python3
"""
Mega menu cleanup:
- Corporate: 3 links only (会社概要, トップメッセージ, Vision/Mission/Value)
- Service: 4 links only (事業一覧, 第1営業部, HD事業部, AI・Sales Enablement)
- Members: remove mega drop → plain link
- Crestory: remove mega drop → plain link
"""
import glob, os, re

# ── New HTML blocks ────────────────────────────────────────

CORP_NAV = """<div class="cx-mega-trigger" data-mega="mega-corporate">
      <a href="corporate.html" class="cx-nav-link" data-page="corporate">Corporate</a>
      <div class="cx-mega-menu" id="mega-corporate">
        <div class="cx-mega-container">
          <div class="cx-mega-header">
            <h3 class="cx-mega-title">CORPORATE</h3>
            <p class="cx-mega-subtitle">会社を知る</p>
          </div>
          <div class="cx-mega-grid">
            <a href="corporate.html#profile" class="cx-mega-item"><span>会社概要</span><i class="fa-solid fa-arrow-right cx-mega-arrow"></i></a>
            <a href="message.html" class="cx-mega-item"><span>トップメッセージ</span><i class="fa-solid fa-arrow-right cx-mega-arrow"></i></a>
            <a href="mvv.html" class="cx-mega-item"><span>Vision / Mission / Value</span><i class="fa-solid fa-arrow-right cx-mega-arrow"></i></a>
          </div>
        </div>
      </div>
    </div>"""

SERVICE_NAV = """<div class="cx-mega-trigger" data-mega="mega-service">
      <a href="business.html" class="cx-nav-link" data-page="business">Service</a>
      <div class="cx-mega-menu" id="mega-service">
        <div class="cx-mega-container">
          <div class="cx-mega-header">
            <h3 class="cx-mega-title">SERVICE</h3>
            <p class="cx-mega-subtitle">事業を知る</p>
          </div>
          <div class="cx-mega-grid">
            <a href="business.html" class="cx-mega-item"><span>事業一覧</span><i class="fa-solid fa-arrow-right cx-mega-arrow"></i></a>
            <a href="service-division1.html" class="cx-mega-item"><span>第1営業部</span><i class="fa-solid fa-arrow-right cx-mega-arrow"></i></a>
            <a href="service-hd.html" class="cx-mega-item"><span>HD事業部</span><i class="fa-solid fa-arrow-right cx-mega-arrow"></i></a>
            <a href="ai-sales.html" class="cx-mega-item"><span>AI・Sales Enablement（営業代行 / 営業支援事業）</span><i class="fa-solid fa-arrow-right cx-mega-arrow"></i></a>
          </div>
        </div>
      </div>
    </div>"""

MEMBERS_LINK = '<a href="members.html" class="cx-nav-link" data-page="members">Members</a>'

CRESTORY_LINK = '<a href="https://crestory.crestix.jp/" class="cx-nav-link" data-page="news">Crestory</a>'


def find_div_end(text, start_pos):
    """Return position right after the </div> matching the <div at start_pos."""
    depth = 0
    i = start_pos
    while i < len(text):
        if text[i:i+4] == '<div':
            depth += 1
            i += 4
        elif text[i:i+6] == '</div>':
            depth -= 1
            i += 6
            if depth == 0:
                return i
        else:
            i += 1
    return -1


def replace_mega_trigger(content, mega_attr, replacement):
    """Find <div … data-mega="mega_attr" …> and replace the whole block."""
    marker = f'data-mega="{mega_attr}"'
    pos = content.find(marker)
    if pos == -1:
        return content, False

    # Walk back to the opening <div
    div_start = content.rfind('<div', 0, pos)
    if div_start == -1:
        return content, False

    div_end = find_div_end(content, div_start)
    if div_end == -1:
        return content, False

    new_content = content[:div_start] + replacement + content[div_end:]
    return new_content, True


html_files = sorted(glob.glob('/Users/maekawahiroyuki/crestix-recruitment-site/*.html'))
updated = 0

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content

    content, _ = replace_mega_trigger(content, 'mega-corporate', CORP_NAV)
    content, _ = replace_mega_trigger(content, 'mega-service', SERVICE_NAV)
    content, _ = replace_mega_trigger(content, 'mega-members', MEMBERS_LINK)
    content, _ = replace_mega_trigger(content, 'mega-crestory', CRESTORY_LINK)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        updated += 1
        print(f'Updated: {os.path.basename(filepath)}')

print(f'\nTotal updated: {updated} / {len(html_files)} files')
