import time
import pandas as pd
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def crawl_olive_young_reviews(max_products=10):
    """올리브영 상품 리뷰를 크롤링해서 DataFrame으로 반환합니다 (최신 셀렉터 + JS 렌더링 대기)."""
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=options)
    base_url = "https://www.oliveyoung.co.kr/store/display/getMCategoryList.do?dispCatNo=100000100010013"

    print("[1] 상품 리스트 페이지 접속 중...")
    driver.get(base_url)

    
    # ✅ 렌더링 기다리기 (셀렉터가 보일 때까지)
    wait = WebDriverWait(driver, 10)
    items = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a.name")))
    print(f"[DEBUG] 상품 요소 수: {len(items)}")

    print("[1] 상품 리스트 페이지 접속 중...")
    driver.get(base_url)
    time.sleep(3)

    # 👇 스크롤로 로딩 유도
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(3)

    wait = WebDriverWait(driver, 10)
    items = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a.name")))


    print("[2] 상품 URL 수집 중...")
    product_links = []
    for item in items[:max_products]:
        url = item.get_attribute("href")
        if url:
            if not url.startswith("http"):
                url = "https://www.oliveyoung.co.kr" + url
            print(f"[DEBUG] 상품 URL: {url}")
            product_links.append(url)

    if not product_links:
        print("[ERROR] 상품 URL을 하나도 가져오지 못함.")
        driver.quit()
        return pd.DataFrame()

    all_reviews = []

    for link in product_links:
        try:
            print(f"[3] 리뷰 수집 중: {link}")
            driver.get(link)
            time.sleep(3)
            soup = BeautifulSoup(driver.page_source, "html.parser")

            product_name_tag = soup.select_one("span.prd_name")
            product_name = product_name_tag.text.strip() if product_name_tag else "Unknown"

            review_elements = soup.select("div.review_cont")
            print(f"[DEBUG] 리뷰 개수: {len(review_elements)}")
            for review in review_elements:
                content = review.text.strip()
                all_reviews.append({"product": product_name, "review": content})

        except Exception as e:
            print(f"[오류] {link} 처리 중 오류 발생: {e}")

    driver.quit()
    print(f"[완료] 총 리뷰 수: {len(all_reviews)}")
    return pd.DataFrame(all_reviews)

if __name__ == "__main__":
    df = crawl_olive_young_reviews()
    print(df.head())
