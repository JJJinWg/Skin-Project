# 파일명: crawl_reviews_by_category.py
# 위치: skin_project/crawler/

from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import csv
import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from itertools import zip_longest

MAX_REVIEWS = 30  # 제품당 최대 리뷰 수

CATEGORY_URLS = {
    "toner":   "https://www.oliveyoung.co.kr/store/display/getMCategoryList.do?dispCatNo=1000001000100130001",
    "ampoule": "https://www.oliveyoung.co.kr/store/display/getMCategoryList.do?dispCatNo=1000001000100140001",
    "cream":   "https://www.oliveyoung.co.kr/store/display/getMCategoryList.do?dispCatNo=1000001000100150001"
}

def extract_price_discounted(item):
    price_discounted = "가격 정보 없음"
    price_tag = (
        item.select_one(".price-2 strong")
        or item.select_one("#totalPrctxt")
        or item.select_one(".price-2 span")
        or item.select_one("span.tx_num")
    )
    if price_tag:
        price_discounted = price_tag.get_text(strip=True)
    return price_discounted

def crawl_product_list(category):
    url = CATEGORY_URLS[category]
    all_products = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)
        time.sleep(3)
        soup = BeautifulSoup(page.content(), "lxml")
        items = soup.select(".prd_info")
        # 🔥 한 페이지 전체 순회 (이 부분만 수정!)
        for item in items:
            brand_tag = item.select_one(".tx_brand")
            brand = brand_tag.get_text(strip=True) if brand_tag else "브랜드 없음"
            name_tag = item.select_one(".tx_name")
            name = name_tag.get_text(strip=True) if name_tag else "제품명 없음"
            link_tag = item.select_one("a")
            link = link_tag.get("href") if link_tag else ""
            if link.startswith("http"):
                full_link = link
            else:
                full_link = "https://www.oliveyoung.co.kr" + link
            img_tag = item.select_one("img")
            img_url = ""
            if img_tag:
                img_url = img_tag.get("data-original") or img_tag.get("src") or ""
            price_discounted = extract_price_discounted(item)
            all_products.append({
                "brand": brand,
                "name": name,
                "link": full_link,
                "image_url": img_url,
                "price_discounted": price_discounted
            })
        browser.close()
    os.makedirs("./crawler/data", exist_ok=True)
    file_path = f"./crawler/data/product_list_{category}.csv"
    with open(file_path, "w", newline='', encoding="utf-8") as fw:
        writer = csv.DictWriter(fw, fieldnames=["brand", "name", "link", "image_url", "price_discounted"])
        writer.writeheader()
        for row in all_products:
            writer.writerow(row)
    print(f"✅ [{category}] 한 페이지 전체 제품 저장 완료 ({len(all_products)}개)")

def crawl_reviews(category):
    product_file = f"./crawler/data/product_list_{category}.csv"
    review_file = f"./crawler/data/reviews_bulk_{category}.csv"
    with open(product_file, encoding="utf-8") as fr:
        reader = csv.DictReader(fr)
        product_list = list(reader)
    os.makedirs("./crawler/data", exist_ok=True)
    with open(review_file, "w", newline='', encoding='utf-8') as fw:
        writer = csv.DictWriter(fw, fieldnames=["page", "product_name", "star", "title", "review", "skin_type"])
        writer.writeheader()
        # 🔥 한 페이지 전체 제품 리뷰 크롤링!
        for i, product in enumerate(product_list):
            url = product["link"]
            print(f"[{category}] ({i+1}/{len(product_list)}) 리뷰 수집: {product['name']}")
            try:
                data = crawl_single_product_reviews(url, product['name'])
                for row in data:
                    writer.writerow(row)
            except Exception as e:
                print(f"❌ 실패 - {product['name']}: {e}")
                continue

def crawl_single_product_reviews(url, product_name):
    driver = webdriver.Chrome()
    driver.get(url)
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a.goods_reputation')))
    try:
        driver.find_element(By.CSS_SELECTOR, 'a.goods_reputation').click()
        time.sleep(3)
    except:
        print("❌ 리뷰 탭 클릭 실패")
    collected = []
    seen_reviews = set()
    for page_num in range(1, 13):
        soup = BeautifulSoup(driver.page_source, "lxml")
        users = soup.select("div.user.clrfix")
        reviews = soup.select("div.txt_inner")
        titles = soup.select("div.poll_sample")
        stars = soup.select("div.score_area")
        for u, r, t, s in zip_longest(users, reviews, titles, stars):
            if len(collected) >= MAX_REVIEWS:
                break
            review_text = r.text.strip() if r else ""
            if len(review_text) < 20 or review_text in seen_reviews:
                continue
            title = [tag.text.strip() for tag in t.find_all("span")[1::2]] if t else []
            skin = [span.text.strip() for span in u.find_all("span")[1:]] if u else []
            # ⭐ 별점 파싱
            star = ''
            if s:
                point = s.select_one("span.point")
                if point and point.has_attr('style'):
                    style = point['style']
                    if 'width:' in style:
                        try:
                            percent = float(style.split('width:')[1].replace('%', '').replace(';', '').strip())
                            star = round(percent / 20, 1)
                        except:
                            star = ''
                elif s.select_one("span.num"):
                    star = s.select_one("span.num").text.strip()
            seen_reviews.add(review_text)
            collected.append({
                "page": page_num,
                "product_name": product_name,
                "star": star,
                "title": title,
                "review": review_text,
                "skin_type": skin
            })
        if len(collected) >= MAX_REVIEWS:
            break
        try:
            next_btn = driver.find_element(By.XPATH, f"//a[@data-page-no='{page_num + 1}']")
            driver.execute_script("arguments[0].click();", next_btn)
            time.sleep(2)
        except NoSuchElementException:
            print("마지막 페이지")
            break
    driver.quit()
    return collected

if __name__ == '__main__':
    categories = ["toner", "ampoule", "cream"]
    for category in categories:
        print(f"\n### [{category}] 카테고리 한 페이지 전체 크롤링 시작 ###\n")
        crawl_product_list(category)
        crawl_reviews(category)
    print("\n✅ 모든 카테고리 한 페이지씩 크롤링 완료")
