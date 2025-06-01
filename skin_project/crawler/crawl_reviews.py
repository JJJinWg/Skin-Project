from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import time

def setup_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--start-maximized')
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

def crawl_product_and_reviews(url):
    driver = setup_driver()
    driver.get(url)
    wait = WebDriverWait(driver, 10)
    time.sleep(2)

    # 상품명
    try:
        product_name = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'p.prd_name'))).text.strip()
    except:
        product_name = '상품명 없음'

    # 가격
    try:
        price_discounted = driver.find_element(By.CSS_SELECTOR, 'span.price-2 > strong').text.strip()
    except:
        price_discounted = '없음'

    try:
        price_original = driver.find_element(By.CSS_SELECTOR, 'span.price-1 > strike').text.strip()
    except:
        price_original = '없음'

    # 상품 설명
    try:
        btn = driver.find_element(By.ID, 'btn_toggle_detail_image')
        driver.execute_script("arguments[0].click();", btn)
        time.sleep(1)
        description = '이미지로 구성된 상품 설명'
    except:
        description = '설명 없음'

    print(f"✅ 상품명: {product_name}")
    print(f"💰 정상가: {price_original}")
    print(f"💰 할인가: {price_discounted}")
    print(f"📃 설명: {description}")

    # 리뷰 탭 클릭
    try:
        review_tab = driver.find_element(By.CSS_SELECTOR, 'a.goods_reputation')
        review_tab.click()
        time.sleep(2)
    except Exception as e:
        print(f"❌ 리뷰 탭 클릭 실패: {e}")

    # 크롤링
    usernames, reviews, dates, skintypes, concerns, sensitivities, ratings = [], [], [], [], [], [], []

    for page in range(1, 3):  # 원하는 만큼 조절
        print(f"📄 {page}페이지 수집 중...")
        time.sleep(2)

        review_items = driver.find_elements(By.CSS_SELECTOR, 'ul#gdasList > li')
        for item in review_items:
            try:
                username = item.find_element(By.CSS_SELECTOR, 'div.user.clrfix').text.strip()
            except:
                username = '없음'

            try:
                review_text = item.find_element(By.CSS_SELECTOR, 'div.txt_inner').text.strip()
            except:
                review_text = '없음'

            try:
                date = item.find_element(By.CSS_SELECTOR, 'span.date').text.strip()
            except:
                date = '없음'

            try:
                skin = item.find_element(By.XPATH, ".//dl[@class='poll_type1'][1]/dd").text.strip()
            except:
                skin = '없음'

            try:
                concern = item.find_element(By.XPATH, ".//dl[@class='poll_type1'][2]/dd").text.strip()
            except:
                concern = '없음'

            try:
                sensitivity = item.find_element(By.XPATH, ".//dl[@class='poll_type1'][3]/dd").text.strip()
            except:
                sensitivity = '없음'

            try:
                rating = item.find_element(By.CSS_SELECTOR, 'span.point').get_attribute("style")
                score = rating.split("width:")[1].replace("%", "").replace(";", "").strip()
                star = round(float(score) / 20, 1)  # 100% -> 5점
            except:
                star = '없음'

            usernames.append(username)
            reviews.append(review_text)
            dates.append(date)
            skintypes.append(skin)
            concerns.append(concern)
            sensitivities.append(sensitivity)
            ratings.append(star)

        # 다음 페이지 클릭
        try:
            next_btn = driver.find_element(By.LINK_TEXT, str(page + 1))
            driver.execute_script("arguments[0].click();", next_btn)
        except:
            print("❌ 다음 페이지 없음")
            break

    driver.quit()

    df = pd.DataFrame({
        '상품명': product_name,
        '정상가': price_original,
        '할인가': price_discounted,
        '설명': description,
        '작성자': usernames,
        '작성일자': dates,
        '피부타입': skintypes,
        '피부고민': concerns,
        '자극도': sensitivities,
        '별점': ratings,
        '리뷰내용': reviews
    })

    # 엑셀로 저장
    df.to_excel('oliveyoung_reviews_final.xlsx', index=False)
    print("✅ 리뷰 저장 완료: oliveyoung_reviews_final.xlsx")

# 실행
product_url = "https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000202893&dispCatNo=90000010001&trackingCd=Home_Curation1_1&curation=like&egcode=a016_a016&rccode=pc_main_01_c&egrankcode=6&t_page=%ED%99%88&t_click=%ED%81%90%EB%A0%88%EC%9D%B4%EC%85%981_%EC%83%81%ED%92%88%EC%83%81%EC%84%B8&t_number=1"
crawl_product_and_reviews(product_url)
