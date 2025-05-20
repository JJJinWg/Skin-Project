# 파일명: crawl_reviews_bulk.py
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

# 1. 제품 리스트 수집 (uce74테고리 페이지)
def crawl_product_list(page_limit=2):
    url = "https://www.oliveyoung.co.kr/store/display/getMCategoryList.do?dispCatNo=1000001000100130001"  # 토너
    all_products = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        for page_num in range(1, page_limit + 1):
            full_url = f"{url}&pageIdx={page_num}"
            page.goto(full_url)
            time.sleep(3)
            html = page.content()
            soup = BeautifulSoup(html, "lxml")
            items = soup.select(".prd_info")

            for item in items:
                brand_tag = item.select_one(".tx_brand")
                brand = brand_tag.get_text(strip=True) if brand_tag else "배너 없음"

                name_tag = item.select_one(".tx_name")
                name = name_tag.get_text(strip=True) if name_tag else "제품명 없음"

                link = item.select_one("a")["href"]
                if link.startswith("https://www.oliveyoung.co.kr"):
                    link = link.replace("https://www.oliveyoung.co.kr", "")
                full_link = "https://www.oliveyoung.co.kr" + link

                img_tag = item.select_one("img")
                img_url = img_tag["src"] if img_tag else ""

                price_tag = item.select_one(".price-1 strong") or item.select_one(".price-2 strong")
                price = price_tag.get_text(strip=True) if price_tag else ""

                all_products.append({
                    "brand": brand,
                    "name": name,
                    "link": full_link,
                    "image_url": img_url,
                    "price": price
                })

        browser.close()

    os.makedirs("./crawler/data", exist_ok=True)
    with open("./crawler/data/product_list.csv", "w", newline='', encoding="utf-8") as fw:
        writer = csv.DictWriter(fw, fieldnames=["brand", "name", "link", "image_url", "price"])
        writer.writeheader()
        for row in all_products:
            writer.writerow(row)
    print("✅ 제품 리스트 저장 완료")

# 2. 리뷰 수집

def crawl_reviews():
    with open("./crawler/data/product_list.csv", encoding="utf-8") as fr:
        reader = csv.DictReader(fr)
        product_list = list(reader)

    os.makedirs("./crawler/data", exist_ok=True)
    output_path = "./crawler/data/reviews_bulk.csv"
    file_exists = os.path.isfile(output_path)

    with open(output_path, "a", newline='', encoding='utf-8') as fw:
        writer = csv.DictWriter(fw, fieldnames=["page", "product_name", "star", "title", "review", "skin_type"])
        if not file_exists:
            writer.writeheader()

        for i, product in enumerate(product_list):
            url = product["link"]
            print(f"[{i+1}/{len(product_list)}] 수집 중: {product['name']}")
            try:
                data = crawl_single_product_reviews(url, product['name'])
                for row in data:
                    writer.writerow(row)
            except Exception as e:
                print(f"❌ 실패 - {product['name']}: {e}")
                continue

# 3. 단일 제품 리뷰 파싱

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
    for page_num in range(1, 13):
        soup = BeautifulSoup(driver.page_source, "lxml")
        users = soup.select("div.user.clrfix")
        reviews = soup.select("div.txt_inner")
        titles = soup.select("div.poll_sample")
        stars = soup.select("div.score_area")

        for u, r, t, s in zip_longest(users, reviews, titles, stars):
            review = r.text.strip() if r else ""
            title = [tag.text.strip() for tag in t.find_all("span")[1::2]] if t else []
            skin = [span.text.strip() for span in u.find_all("span")[1:]] if u else []
            star = s.select_one("span.num").text.strip() if s and s.select_one("span.num") else ""

            collected.append({
                "page": page_num,
                "product_name": product_name,
                "star": star,
                "title": title,
                "review": review,
                "skin_type": skin
            })

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
    crawl_product_list()
    crawl_reviews()
