import time
import pandas as pd
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from tqdm import tqdm

def crawl_olive_young_reviews(max_products=10):
    """올리브영 상품 리뷰를 크롤링해서 DataFrame으로 반환합니다."""
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=options)
    base_url ="https://www.oliveyoung.co.kr/store/display/getMCategoryList.do?dispCatNo=100000100010013"
    driver.get(base_url)
    time.sleep(2)

    product_links = []
    items = driver.find_elements(By.CSS_SELECTOR, ".prd_info > a")
    for item in items[:max_products]:
        product_links.append(item.get_attribute("href"))

    all_reviews = []

    for link in tqdm(product_links, desc="상품별 리뷰 수집"):
        try:
            driver.get(link)
            time.sleep(1.5)
            soup = BeautifulSoup(driver.page_source, "html.parser")
            product_name_tag = soup.select_one("span.prd_name")
            product_name = product_name_tag.text.strip() if product_name_tag else "Unknown"
            review_elements = soup.select("div.review_cont")
            for review in review_elements:
                content = review.text.strip()
                all_reviews.append({"product": product_name, "review": content})
        except Exception as e:
            print(f"[오류] {link} 처리 중 오류 발생: {e}")

    driver.quit()
    return pd.DataFrame(all_reviews)
