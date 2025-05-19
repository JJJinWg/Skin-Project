// src/utils/mockApi.ts

// ————————————————————————————————————————————————————————————————————————
// 1) 데이터 타입 정의
// Product: 상품 한 건의 정보를 담는 인터페이스
export interface Product {
    id: string;           // 고유 식별자
    name: string;         // 상품 이름
    description: string;  // 상세 설명
    price: number;        // 가격 (원 단위)
  }
  
  // ————————————————————————————————————————————————————————————————————————
  // 2) 더미 데이터: 실제 서버 대신 사용할 테스트용 배열
  const mockProducts: Product[] = [
    { id: '1', name: '스킨케어 세트', description: '기초 영양 케어', price: 25000 },
    { id: '2', name: '로션',      description: '촉촉한 보습',   price: 15000 },
    { id: '3', name: '크림',      description: '풍부한 영양감', price: 30000 },
  ];
  
  // ————————————————————————————————————————————————————————————————————————
  // 3) Mock API 함수 모음
  export const mockApi = {
    /**
     * 상품 목록을 가져옵니다.
     * @returns Promise<Product[]>
     */
    getProducts: (): Promise<Product[]> =>
      new Promise(resolve =>
        // 네트워크 지연을 흉내 내기 위해 500ms 후에 resolve
        setTimeout(() => resolve(mockProducts), 500),
      ),
  
    /**
     * ID에 해당하는 단일 상품을 가져옵니다.
     * @param id 조회할 상품 ID
     * @returns Promise<Product | undefined>
     */
    getProductById: (id: string): Promise<Product | undefined> =>
      new Promise(resolve =>
        setTimeout(() => resolve(mockProducts.find(p => p.id === id)), 500),
      ),
  
    /**
     * 로그인 시뮬레이션 (항상 성공).
     * @param username 아이디
     * @param password 비밀번호
     * @returns Promise<{ token: string }>
     */
    login: (username: string, password: string): Promise<{ token: string }> =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (username && password) {
            // 실제 API라면 서버에서 발급된 JWT 토큰을 받겠지만,
            // 여기서는 고정 문자열을 리턴
            resolve({ token: 'mock-jwt-token' });
          } else {
            reject(new Error('아이디와 비밀번호를 모두 입력해주세요.'));
          }
        }, 500);
      }),
  };
  