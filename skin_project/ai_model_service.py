import torch
import torch.nn as nn

# TensorFlow optional import with type ignores
try:
    import tensorflow as tf  # type: ignore
    from tensorflow import keras  # type: ignore
    from tensorflow.keras.layers import Layer  # type: ignore
    TF_AVAILABLE = True
    print("✅ TensorFlow 사용 가능")
except ImportError as e:
    print(f"⚠️ TensorFlow를 import할 수 없습니다: {e}")
    tf = None  # type: ignore
    keras = None  # type: ignore
    Layer = object  # Fallback to object as base class
    TF_AVAILABLE = False

from ultralytics import YOLO  # type: ignore
import cv2  # type: ignore
import numpy as np
from PIL import Image
import io
import base64
from typing import Dict, List, Tuple, Optional
import os
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cast 레이어 호환성을 위한 커스텀 레이어 정의 (TensorFlow 사용 가능할 때만)
if TF_AVAILABLE and tf is not None:
    @tf.keras.utils.register_keras_serializable()
    class Cast(Layer):
        def __init__(self, dtype='float32', name=None, **kwargs):
            super(Cast, self).__init__(name=name, **kwargs)
            self.target_dtype = dtype
            
        def call(self, inputs):
            return tf.cast(inputs, self.target_dtype)
            
        def get_config(self):
            config = super(Cast, self).get_config()
            config.update({"dtype": self.target_dtype})
            return config
        
        @classmethod
        def from_config(cls, config):
            return cls(**config)

    # Keras preprocess_input 함수 정의
    @tf.keras.utils.register_keras_serializable()
    def preprocess_input(x):
        """기본 전처리 함수"""
        return x / 255.0

    # 추가 호환성 함수들
    @tf.keras.utils.register_keras_serializable()
    def identity_function(x):
        return x

    @tf.keras.utils.register_keras_serializable()
    def normalization_function(x):
        return (x - 127.5) / 127.5
else:
    # TensorFlow 미사용 시 더미 클래스
    class Cast(Layer):
        def __init__(self, dtype='float32', name=None, **kwargs):
            self.target_dtype = dtype
        
        def call(self, inputs):
            return inputs
        
        def get_config(self):
            return {"dtype": self.target_dtype}
        
        @classmethod
        def from_config(cls, config):
            return cls(**config)
    
    def preprocess_input(x):
        return x / 255.0
    
    def identity_function(x):
        return x
    
    def normalization_function(x):
        return (x - 127.5) / 127.5

class SkinAnalysisService:
    def __init__(self):
        self.skin_disease_model = None
        self.skin_state_model = None  
        self.skin_type_model = None
        self.models_loaded = False
        
        # 모델 파일 경로 - 절대 경로로 변경
        self.base_path = os.path.dirname(os.path.abspath(__file__))
        self.models_path = os.path.join(self.base_path, "AI tool")
        self.disease_model_path = os.path.join(self.models_path, "SkinDisease.pt")
        self.state_model_path = os.path.join(self.models_path, "SkinState.pt")
        self.type_model_path = os.path.join(self.models_path, "skintype.h5")
        
        # 모델 파일 존재 여부 확인
        logger.info(f"🔍 모델 파일 경로 확인:")
        logger.info(f"   Base path: {self.base_path}")
        logger.info(f"   Models path: {self.models_path}")
        logger.info(f"   Disease model: {self.disease_model_path} - {'✅존재' if os.path.exists(self.disease_model_path) else '❌없음'}")
        logger.info(f"   State model: {self.state_model_path} - {'✅존재' if os.path.exists(self.state_model_path) else '❌없음'}")
        logger.info(f"   Type model: {self.type_model_path} - {'✅존재' if os.path.exists(self.type_model_path) else '❌없음'}")
        
        # 피부 타입 라벨
        self.skin_types = [
            "건성", "지성", "복합성", "민감성", "정상"
        ]
        
        # 피부 질환 라벨 (일반적인 피부 질환들)
        self.skin_diseases = [
            "정상", "여드름", "아토피", "습진", "건선", "주사", "색소침착", "기타"
        ]
        
        # 피부 상태 라벨
        self.skin_states = [
            "양호", "건조", "유분과다", "트러블", "색소침착", "민감", "노화"
        ]
        
        # 영어-한국어 매핑 테이블
        self.translation_map = {
            # 피부 타입
            "oily": "지성",
            "dry": "건성", 
            "combination": "복합성",
            "sensitive": "민감성",
            "normal": "정상",
            
            # 피부 질환
            "acne": "여드름",
            "eczema": "습진",
            "dermatitis": "아토피",
            "psoriasis": "건선",
            "rosacea": "주사",
            "pigmentation": "색소침착",
            "melasma": "기미",
            "spots": "반점",
            "inflammation": "염증",
            "inflammatory": "염증성",
            "normal": "정상",
            
            # 피부 상태
            "wrinkle": "주름",
            "wrinkles": "주름",
            "fine_lines": "잔주름",
            "aging": "노화",
            "dryness": "건조",
            "oiliness": "유분과다",
            "acne": "트러블",
            "pores": "모공",
            "blackheads": "블랙헤드",
            "whiteheads": "화이트헤드",
            "dark_spots": "색소침착",
            "hyperpigmentation": "색소침착",
            "redness": "홍조",
            "irritation": "자극",
            "good": "양호",
            "excellent": "매우 좋음",
            "poor": "나쁨"
        }
        
    def translate_to_korean(self, english_text: str) -> str:
        """영어 텍스트를 한국어로 번역합니다."""
        if not english_text:
            return "알 수 없음"
            
        # 소문자로 변환하여 매핑 확인
        english_lower = english_text.lower().strip()
        
        # 직접 매핑이 있는 경우
        if english_lower in self.translation_map:
            return self.translation_map[english_lower]
            
        # 부분 매칭 시도
        for eng_key, kor_value in self.translation_map.items():
            if eng_key in english_lower or english_lower in eng_key:
                return kor_value
                
        # 매핑이 없는 경우 원본 반환 (한국어일 수도 있음)
        return english_text
        
    def load_models(self):
        """AI 모델들을 로드합니다."""
        try:
            logger.info("AI 모델 로딩 시작...")
            
            loaded_models = 0
            total_models = 3
            
            # PyTorch 모델 로드 (피부 질환)
            if os.path.exists(self.disease_model_path):
                logger.info("피부 질환 모델 로딩 중...")
                try:
                    self.skin_disease_model = YOLO(self.disease_model_path)
                    logger.info(f"✅ 피부 질환 모델 로드 성공 - 클래스: {self.skin_disease_model.names}")
                    # 실제 클래스 정보로 업데이트
                    self.skin_diseases = list(self.skin_disease_model.names.values())
                    loaded_models += 1
                except Exception as e:
                    logger.error(f"❌ 피부 질환 모델 로드 실패: {e}")
                    self.skin_disease_model = None
            else:
                logger.error(f"❌ 피부 질환 모델 파일을 찾을 수 없습니다: {self.disease_model_path}")
                self.skin_disease_model = None
                    
            # PyTorch 모델 로드 (피부 상태)  
            if os.path.exists(self.state_model_path):
                logger.info("피부 상태 모델 로딩 중...")
                try:
                    self.skin_state_model = YOLO(self.state_model_path)
                    logger.info(f"✅ 피부 상태 모델 로드 성공 - 클래스: {self.skin_state_model.names}")
                    # 실제 클래스 정보로 업데이트
                    self.skin_states = list(self.skin_state_model.names.values())
                    loaded_models += 1
                except Exception as e:
                    logger.error(f"❌ 피부 상태 모델 로드 실패: {e}")
                    self.skin_state_model = None
            else:
                logger.error(f"❌ 피부 상태 모델 파일을 찾을 수 없습니다: {self.state_model_path}")
                self.skin_state_model = None
                    
            # Keras 모델 로드 (피부 타입) - 분류 모델
            if os.path.exists(self.type_model_path):
                logger.info("피부 타입 모델 로딩 중... (분류 모델)")
                
                # 모든 커스텀 객체 등록
                custom_objects = {
                    'Cast': Cast,
                    'preprocess_input': preprocess_input,
                    'identity_function': identity_function,
                    'normalization_function': normalization_function,
                }
                
                # TensorFlow 글로벌 커스텀 객체에 등록
                for name, obj in custom_objects.items():
                    tf.keras.utils.get_custom_objects()[name] = obj
                
                success = False
                
                # 방법 1: safe_mode=False + compile=False
                try:
                    logger.info("방법 1: safe_mode=False + compile=False 시도...")
                    self.skin_type_model = keras.models.load_model(
                        self.type_model_path, 
                        compile=False,
                        safe_mode=False
                    )
                    logger.info("✅ 피부 타입 모델 로드 성공 (방법 1)")
                    success = True
                    loaded_models += 1
                except Exception as e1:
                    logger.error(f"방법 1 실패: {e1}")
                
                # 방법 2: custom_objects + compile=False
                if not success:
                    try:
                        logger.info("방법 2: custom_objects + compile=False 시도...")
                        self.skin_type_model = keras.models.load_model(
                            self.type_model_path,
                            custom_objects=custom_objects,
                            compile=False
                        )
                        logger.info("✅ 피부 타입 모델 로드 성공 (방법 2)")
                        success = True
                        loaded_models += 1
                    except Exception as e2:
                        logger.error(f"방법 2 실패: {e2}")
                
                # 방법 3: TF 직접 로드
                if not success:
                    try:
                        logger.info("방법 3: tf.keras.models.load_model 직접 시도...")
                        self.skin_type_model = tf.keras.models.load_model(
                            self.type_model_path,
                            compile=False
                        )
                        logger.info("✅ 피부 타입 모델 로드 성공 (방법 3)")
                        success = True
                        loaded_models += 1
                    except Exception as e3:
                        logger.error(f"방법 3 실패: {e3}")
                
                if not success:
                    logger.error("❌ 피부 타입 모델 로드 최종 실패")
                    self.skin_type_model = None
            else:
                logger.error(f"❌ 피부 타입 모델 파일을 찾을 수 없습니다: {self.type_model_path}")
                self.skin_type_model = None
            
            # 실제 로딩된 모델 수 확인
            if loaded_models == total_models:
                self.models_loaded = True
                logger.info(f"🎯 모든 AI 모델 로딩 완료! ({loaded_models}/{total_models})")
            else:
                self.models_loaded = False
                logger.warning(f"⚠️ 일부 모델만 로드됨: {loaded_models}/{total_models}")
                logger.warning(f"   피부 질환 모델: {'✅' if self.skin_disease_model else '❌'}")
                logger.warning(f"   피부 상태 모델: {'✅' if self.skin_state_model else '❌'}")
                logger.warning(f"   피부 타입 모델: {'✅' if self.skin_type_model else '❌'}")
            
        except Exception as e:
            logger.error(f"❌ AI 모델 로딩 중 오류 발생: {e}")
            self.models_loaded = False
            
    def preprocess_image(self, image_data: bytes, target_size: Tuple[int, int] = (224, 224)) -> np.ndarray:
        """이미지 전처리를 수행합니다."""
        try:
            # bytes를 PIL Image로 변환
            image = Image.open(io.BytesIO(image_data))
            
            # RGB로 변환 (PNG의 경우 RGBA일 수 있음)
            if image.mode != 'RGB':
                image = image.convert('RGB')
                
            # 크기 조정
            image = image.resize(target_size)
            
            # numpy 배열로 변환
            img_array = np.array(image)
            
            # 정규화 (0-1 범위)
            img_array = img_array.astype(np.float32) / 255.0
            
            return img_array
            
        except Exception as e:
            logger.error(f"❌ 이미지 전처리 실패: {e}")
            raise
            
    def predict_skin_type(self, image_array: np.ndarray) -> Dict[str, any]:
        """피부 타입을 예측합니다."""
        try:
            if self.skin_type_model is None:
                return {"type": "알 수 없음", "confidence": 0.0, "error": "모델이 로드되지 않았습니다"}
                
            # 배치 차원 추가
            input_array = np.expand_dims(image_array, axis=0)
            
            # 예측 수행
            predictions = self.skin_type_model.predict(input_array, verbose=0)
            
            # 가장 높은 확률의 클래스 선택
            predicted_class = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class])
            
            # 원본 결과를 한국어로 번역
            raw_skin_type = self.skin_types[predicted_class] if predicted_class < len(self.skin_types) else "알 수 없음"
            skin_type = self.translate_to_korean(raw_skin_type)
            
            # 모든 확률을 한국어로 변환
            korean_probabilities = {}
            for i in range(min(len(self.skin_types), len(predictions[0]))):
                raw_type = self.skin_types[i]
                korean_type = self.translate_to_korean(raw_type)
                korean_probabilities[korean_type] = float(predictions[0][i])
            
            return {
                "type": skin_type,
                "confidence": confidence,
                "all_probabilities": korean_probabilities
            }
            
        except Exception as e:
            logger.error(f"❌ 피부 타입 예측 실패: {e}")
            return {"type": "알 수 없음", "confidence": 0.0, "error": str(e)}
            
    def predict_skin_disease(self, image_array: np.ndarray) -> Dict[str, any]:
        """피부 질환을 예측합니다."""
        try:
            if self.skin_disease_model is None:
                return {"disease": "알 수 없음", "confidence": 0.0, "error": "모델이 로드되지 않았습니다"}
                
            # PIL Image로 변환 (YOLO는 PIL Image나 numpy array를 받음)
            image_pil = Image.fromarray((image_array * 255).astype(np.uint8))
            
            # YOLO 예측 수행 (detection 모델)
            results = self.skin_disease_model(image_pil)
            
            if len(results) > 0 and len(results[0].boxes) > 0:
                # 탐지된 객체들 중 가장 높은 신뢰도 선택
                boxes = results[0].boxes
                confidences = boxes.conf.cpu().numpy()
                classes = boxes.cls.cpu().numpy().astype(int)
                
                # 가장 높은 신뢰도의 탐지 결과 선택
                max_conf_idx = np.argmax(confidences)
                predicted_class = classes[max_conf_idx]
                confidence = float(confidences[max_conf_idx])
                
                # 원본 결과를 한국어로 번역
                raw_disease = self.skin_diseases[predicted_class] if predicted_class < len(self.skin_diseases) else "알 수 없음"
                disease = self.translate_to_korean(raw_disease)
                
                # 모든 탐지 결과의 통계를 한국어로 변환
                class_counts = {}
                for cls in classes:
                    raw_class_name = self.skin_diseases[cls] if cls < len(self.skin_diseases) else f"class_{cls}"
                    korean_class_name = self.translate_to_korean(raw_class_name)
                    class_counts[korean_class_name] = class_counts.get(korean_class_name, 0) + 1
                
                return {
                    "disease": disease,
                    "confidence": confidence,
                    "detections_count": len(boxes),
                    "all_detections": class_counts
                }
            else:
                # 탐지된 객체가 없으면 정상으로 분류
                return {"disease": "정상", "confidence": 0.8, "detections_count": 0}
            
        except Exception as e:
            logger.error(f"❌ 피부 질환 예측 실패: {e}")
            return {"disease": "알 수 없음", "confidence": 0.0, "error": str(e)}
            
    def predict_skin_state(self, image_array: np.ndarray) -> Dict[str, any]:
        """피부 상태를 예측합니다."""
        try:
            if self.skin_state_model is None:
                return {"state": "알 수 없음", "confidence": 0.0, "error": "모델이 로드되지 않았습니다"}
                
            # PIL Image로 변환 (YOLO는 PIL Image나 numpy array를 받음)
            image_pil = Image.fromarray((image_array * 255).astype(np.uint8))
            
            # YOLO 예측 수행 (detection 모델)
            results = self.skin_state_model(image_pil)
            
            if len(results) > 0 and len(results[0].boxes) > 0:
                # 탐지된 객체들 중 가장 높은 신뢰도 선택
                boxes = results[0].boxes
                confidences = boxes.conf.cpu().numpy()
                classes = boxes.cls.cpu().numpy().astype(int)
                
                # 가장 높은 신뢰도의 탐지 결과 선택
                max_conf_idx = np.argmax(confidences)
                predicted_class = classes[max_conf_idx]
                confidence = float(confidences[max_conf_idx])
                
                # 원본 결과를 한국어로 번역
                raw_state = self.skin_states[predicted_class] if predicted_class < len(self.skin_states) else "알 수 없음"
                state = self.translate_to_korean(raw_state)
                
                # 모든 탐지 결과의 통계를 한국어로 변환
                class_counts = {}
                for cls in classes:
                    raw_class_name = self.skin_states[cls] if cls < len(self.skin_states) else f"class_{cls}"
                    korean_class_name = self.translate_to_korean(raw_class_name)
                    class_counts[korean_class_name] = class_counts.get(korean_class_name, 0) + 1
                
                return {
                    "state": state,
                    "confidence": confidence,
                    "detections_count": len(boxes),
                    "all_detections": class_counts
                }
            else:
                # 탐지된 객체가 없으면 양호한 상태로 분류
                return {"state": "양호", "confidence": 0.8, "detections_count": 0}
            
        except Exception as e:
            logger.error(f"❌ 피부 상태 예측 실패: {e}")
            return {"state": "알 수 없음", "confidence": 0.0, "error": str(e)}
            
    def generate_recommendations(self, skin_type: str, skin_disease: str, skin_state: str) -> List[str]:
        """분석 결과를 바탕으로 추천사항을 생성합니다."""
        recommendations = []
        
        # 피부 타입별 추천
        if skin_type == "건성":
            recommendations.extend([
                "보습제를 충분히 사용하세요",
                "세안 후 즉시 보습 관리를 하세요",
                "수분 공급이 풍부한 제품을 선택하세요"
            ])
        elif skin_type == "지성":
            recommendations.extend([
                "유분 제거에 도움이 되는 클렌저를 사용하세요",
                "모공 관리에 집중하세요",
                "논코메도제닉 제품을 선택하세요"
            ])
        elif skin_type == "복합성":
            recommendations.extend([
                "T존과 U존을 구분하여 관리하세요",
                "부위별로 다른 제품을 사용하는 것을 고려하세요"
            ])
        elif skin_type == "민감성":
            recommendations.extend([
                "자극이 적은 순한 제품을 사용하세요",
                "패치 테스트를 진행한 후 제품을 사용하세요",
                "향료나 알코올이 들어간 제품은 피하세요"
            ])
            
        # 피부 질환별 추천
        if skin_disease == "여드름":
            recommendations.extend([
                "피부과 전문의 상담을 받으시기 바랍니다",
                "트러블 케어 제품 사용을 고려하세요",
                "손으로 만지지 마세요"
            ])
        elif skin_disease == "아토피":
            recommendations.extend([
                "즉시 피부과 진료를 받으시기 바랍니다",
                "보습 관리를 철저히 하세요",
                "자극적인 성분을 피하세요"
            ])
        elif skin_disease != "정상":
            recommendations.append("피부과 전문의 상담을 받으시기 바랍니다")
            
        # 피부 상태별 추천
        if skin_state == "건조":
            recommendations.append("수분 공급을 늘리세요")
        elif skin_state == "유분과다":
            recommendations.append("유분 조절 제품을 사용하세요")
        elif skin_state == "색소침착":
            recommendations.extend([
                "자외선 차단제를 꼭 사용하세요",
                "비타민C 제품 사용을 고려하세요"
            ])
            
        # 기본 추천사항
        if not recommendations:
            recommendations = [
                "현재 피부 상태가 양호합니다",
                "꾸준한 기초 관리를 유지하세요",
                "자외선 차단제 사용을 잊지 마세요"
            ]
            
        return list(set(recommendations))  # 중복 제거
        
    async def analyze_skin_comprehensive(self, image_data: bytes) -> Dict[str, any]:
        """종합적인 피부 분석을 수행합니다."""
        try:
            logger.info("🔬 종합 피부 분석 시작...")
            
            if not self.models_loaded:
                logger.info("모델이 로드되지 않았습니다. 로딩을 시도합니다...")
                self.load_models()
                
            if not self.models_loaded:
                return {
                    "success": False,
                    "error": "AI 모델을 로드할 수 없습니다"
                }
                
            # 이미지 전처리
            logger.info("이미지 전처리 중...")
            processed_image = self.preprocess_image(image_data)
            
            # 세 가지 모델로 예측 수행
            logger.info("AI 모델 예측 수행 중...")
            
            skin_type_result = self.predict_skin_type(processed_image)
            skin_disease_result = self.predict_skin_disease(processed_image)
            skin_state_result = self.predict_skin_state(processed_image)
            
            # 추천사항 생성
            recommendations = self.generate_recommendations(
                skin_type_result.get("type", "알 수 없음"),
                skin_disease_result.get("disease", "알 수 없음"), 
                skin_state_result.get("state", "알 수 없음")
            )
            
            result = {
                "success": True,
                "skin_type": skin_type_result,
                "skin_disease": skin_disease_result,
                "skin_state": skin_state_result,
                "recommendations": recommendations,
                "analysis_summary": {
                    "type": skin_type_result.get("type", "알 수 없음"),
                    "disease": skin_disease_result.get("disease", "알 수 없음"),
                    "state": skin_state_result.get("state", "알 수 없음"),
                    "needs_medical_attention": skin_disease_result.get("disease") not in ["정상", "알 수 없음"]
                }
            }
            
            logger.info("✅ 종합 피부 분석 완료!")
            return result
            
        except Exception as e:
            logger.error(f"❌ 종합 피부 분석 실패: {e}")
            return {
                "success": False,
                "error": f"분석 중 오류 발생: {str(e)}"
            }

# 전역 인스턴스
skin_analysis_service = SkinAnalysisService() 